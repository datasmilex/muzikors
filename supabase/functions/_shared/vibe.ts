// Vibe Guard için ortak yardımcılar: mekânın Spotify tokenı, Spotify istekleri,
// şarkı/sanatçı bilgisinin kataloğa yazılması ve tür zenginleştirme.
//
// Sanatçılar önceden yüklenmez. Bir sanatçı aramada ya da mekân listesinde ilk
// görüldüğünde Spotify'a sorulur ve cevap vibe_artists tablosunda saklanır;
// 30 günden eski bilgi bir sonraki görüşte yeniden sorulur.

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-venue-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

export function adminClient(): SupabaseClient {
  return createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', {
    auth: { persistSession: false },
  });
}

export const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const API = 'https://api.spotify.com/v1';

/** Yanıt beklenirken işi sürdürür; çalışma ortamı desteklemiyorsa sessizce bırakır. */
export function runInBackground(promise: Promise<unknown>) {
  const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime;
  const guarded = promise.catch((err) => console.warn('[vibe] arka plan işi:', err?.message ?? err));
  if (runtime?.waitUntil) runtime.waitUntil(guarded);
}

export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

// ── Spotify tokenı (mekânın kendi uygulaması) ───────────────────────────────

const tokenCache = new Map<number, { token: string; expiresAt: number }>();

export class HttpError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function forgetVenueToken(venueId: number) {
  tokenCache.delete(venueId);
}

export async function getVenueAccessToken(admin: SupabaseClient, venueId: number): Promise<string> {
  const cached = tokenCache.get(venueId);
  if (cached && Date.now() < cached.expiresAt) return cached.token;

  const { data: sec } = await admin
    .from('venue_secrets')
    .select('spotify_client_id, spotify_client_secret, spotify_refresh_token')
    .eq('venue_id', venueId)
    .maybeSingle();

  let clientId = sec?.spotify_client_id ?? null;
  let clientSecret = sec?.spotify_client_secret ?? null;
  let refreshToken = sec?.spotify_refresh_token ?? null;

  if (!clientId || !clientSecret || !refreshToken) {
    const { data: venue } = await admin
      .from('venues')
      .select('spotify_client_id, spotify_client_secret, spotify_refresh_token')
      .eq('id', venueId)
      .maybeSingle();
    clientId = clientId || venue?.spotify_client_id || null;
    clientSecret = clientSecret || venue?.spotify_client_secret || null;
    refreshToken = refreshToken || venue?.spotify_refresh_token || null;
  }

  if (!clientId || !clientSecret || !refreshToken) {
    throw new HttpError('Mekan Spotify bağlantısını henüz kurmamış', 400);
  }

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
  });

  if (!res.ok) {
    const text = await res.text();
    // Geçersiz yenileme tokenı: mekân panelde "bağlı değil" görünsün
    if (res.status === 400 || res.status === 401) {
      await admin.from('venues').update({ spotify_refresh_token: null, has_spotify: false }).eq('id', venueId);
      await admin.from('venue_secrets').update({ spotify_refresh_token: null }).eq('venue_id', venueId);
    }
    throw new HttpError(`Spotify token yenilenemedi (${res.status}): ${text.slice(0, 200)}`, 400);
  }

  const data = await res.json();
  if (!data.access_token) throw new HttpError('Spotify token yanıtında access_token yok', 502);

  tokenCache.set(venueId, { token: data.access_token, expiresAt: Date.now() + ((data.expires_in ?? 3600) - 60) * 1000 });
  if (data.refresh_token) {
    await admin.from('venue_secrets').update({ spotify_refresh_token: data.refresh_token }).eq('venue_id', venueId);
  }
  return data.access_token;
}

/** Spotify GET; 429 gelirse Retry-After kadar (en fazla 3 sn) bekleyip bir kez dener. */
export async function spotifyGet(token: string, pathOrUrl: string): Promise<Response> {
  const url = pathOrUrl.startsWith('https://') ? pathOrUrl : `${API}${pathOrUrl}`;
  if (!url.startsWith(`${API}/`)) throw new HttpError('Geçersiz Spotify adresi', 400);
  const init = { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } };
  let res = await fetch(url, init);
  if (res.status === 429) {
    const wait = Math.min(Number(res.headers.get('Retry-After') ?? '1') || 1, 3) * 1000;
    await new Promise((r) => setTimeout(r, wait));
    res = await fetch(url, init);
  }
  return res;
}

// ── Katalog ──────────────────────────────────────────────────────────────────

export interface CatalogTrack {
  id: string;
  name: string;
  artist_ids: string[];
  artist_names: string[];
  album: string | null;
  cover: string | null;
  duration_ms: number | null;
  explicit: boolean;
  year: string | null;
}

export interface CatalogArtist {
  id: string;
  name: string;
  image?: string | null;
  genres?: string[];
}

// deno-lint-ignore no-explicit-any
export function pickImage(images: any[] | null | undefined): string | null {
  if (!Array.isArray(images) || images.length === 0) return null;
  return images[1]?.url ?? images[0]?.url ?? images[2]?.url ?? null;
}

// deno-lint-ignore no-explicit-any
export function toCatalogTrack(item: any): CatalogTrack | null {
  if (!item?.id || !SPOTIFY_ID.test(item.id) || !item.name) return null;
  // deno-lint-ignore no-explicit-any
  const artists = (item.artists ?? []).filter((a: any) => a?.id && a?.name);
  return {
    id: item.id,
    name: String(item.name),
    // deno-lint-ignore no-explicit-any
    artist_ids: artists.map((a: any) => a.id),
    // deno-lint-ignore no-explicit-any
    artist_names: artists.map((a: any) => String(a.name)),
    album: item.album?.name ?? null,
    cover: pickImage(item.album?.images),
    duration_ms: typeof item.duration_ms === 'number' ? item.duration_ms : null,
    explicit: Boolean(item.explicit),
    year: /^\d{4}/.test(item.album?.release_date ?? '') ? String(item.album.release_date).slice(0, 4) : null,
  };
}

// deno-lint-ignore no-explicit-any
export function trackArtists(items: any[]): CatalogArtist[] {
  const map = new Map<string, CatalogArtist>();
  for (const item of items) {
    for (const a of item?.artists ?? []) {
      if (a?.id && SPOTIFY_ID.test(a.id) && a?.name && !map.has(a.id)) map.set(a.id, { id: a.id, name: String(a.name) });
    }
  }
  return Array.from(map.values());
}

export async function ingest(admin: SupabaseClient, tracks: CatalogTrack[], artists: CatalogArtist[]) {
  for (let i = 0; i < Math.max(tracks.length, artists.length); i += 400) {
    const { error } = await admin.rpc('vibe_ingest', {
      p_tracks: tracks.slice(i, i + 400),
      p_artists: artists.slice(i, i + 400),
    });
    if (error) console.warn('[vibe] katalog yazılamadı:', error.message);
  }
}

// ── Tür zenginleştirme ──────────────────────────────────────────────────────

interface PendingArtist {
  artist_id: string;
  name: string;
  sample_track: string | null;
}

async function pendingArtists(
  admin: SupabaseClient,
  kind: 'genres' | 'ai',
  opts: { venueId?: number; ids?: string[]; limit: number },
): Promise<PendingArtist[]> {
  const { data, error } = await admin.rpc('vibe_artists_pending', {
    p_kind: kind,
    p_venue_id: opts.venueId ?? null,
    p_ids: opts.ids ?? null,
    p_limit: opts.limit,
  });
  if (error) {
    console.warn('[vibe] bekleyen sanatçılar okunamadı:', error.message);
    return [];
  }
  return (data ?? []) as PendingArtist[];
}

/**
 * Türü hiç sorulmamış ya da 30 günden eski sanatçıları Spotify'a tek tek sorar
 * (toplu sanatçı uç noktası geliştirici modunda kaldırıldı).
 */
export async function enrichArtistGenres(
  admin: SupabaseClient,
  token: string,
  opts: { venueId?: number; ids?: string[]; limit: number; concurrency?: number },
): Promise<number> {
  const pending = await pendingArtists(admin, 'genres', opts);
  if (pending.length === 0) return 0;

  const fetched = await mapLimit(pending, opts.concurrency ?? 4, async (p) => {
    try {
      const res = await spotifyGet(token, `/artists/${p.artist_id}`);
      if (!res.ok) return null;
      const a = await res.json();
      return {
        id: p.artist_id,
        name: String(a?.name ?? p.name),
        image: pickImage(a?.images),
        genres: Array.isArray(a?.genres) ? a.genres.map((g: unknown) => String(g)).slice(0, 20) : [],
      } as CatalogArtist;
    } catch {
      return null;
    }
  });

  const ok = fetched.filter((a): a is CatalogArtist => a !== null);
  if (ok.length > 0) await ingest(admin, [], ok);
  return ok.length;
}

const AI_CATEGORIES = ['pop', 'rap', 'rnb', 'rock', 'indie', 'metal', 'electronic', 'jazz', 'acoustic', 'chill', 'classical', 'arabesk', 'turku', 'sanat', 'latin'];

const AI_SYSTEM = [
  'You label music artists for a café music filter in Turkey.',
  `Use ONLY these category keys: ${AI_CATEGORIES.join(', ')}.`,
  'Meanings: rnb = R&B/soul/funk; indie = alternative/indie; metal = metal/hardcore/aggressive; electronic = electronic/dance/house;',
  'jazz = jazz/blues; acoustic = acoustic/folk/singer-songwriter; chill = lo-fi/ambient/downtempo/lounge; arabesk = Turkish arabesk/fantezi;',
  'turku = Turkish folk (türkü, halk, özgün); sanat = Turkish classical/art music, fasıl; latin = latin/reggaeton/afrobeats.',
  "Also give up to 4 'styles': lowercase genre names in the style of Spotify genres (e.g. 'turkish pop', 'anatolian rock', 'turkish indie', 'vocal jazz').",
  'If you do not know the artist with confidence, set known=false and leave both lists empty. Never guess from the name alone.',
  'Reply with a JSON array only: [{"id":"...","known":true,"categories":["..."],"styles":["..."]}]',
].join('\n');

/**
 * İsteğe bağlı: ANTHROPIC_API_KEY tanımlıysa, Spotify'dan da sözlükten de türü
 * bulunamayan sanatçıları yapay zekâya sorar. Anahtar yoksa hiçbir şey yapmaz.
 */
export async function aiTagArtists(
  admin: SupabaseClient,
  opts: { venueId?: number; ids?: string[]; limit: number },
): Promise<number> {
  const key = Deno.env.get('ANTHROPIC_API_KEY');
  if (!key) return 0;

  const pending = await pendingArtists(admin, 'ai', opts);
  let tagged = 0;

  for (let i = 0; i < pending.length; i += 25) {
    const batch = pending.slice(i, i + 25);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: Deno.env.get('VIBE_AI_MODEL') || 'claude-haiku-5-5',
          max_tokens: 2000,
          temperature: 0,
          system: AI_SYSTEM,
          messages: [
            {
              role: 'user',
              content: JSON.stringify(batch.map((a) => ({ id: a.artist_id, name: a.name, sample_track: a.sample_track }))),
            },
          ],
        }),
      });
      if (!res.ok) {
        console.warn('[vibe] yapay zekâ etiketleme başarısız:', res.status, (await res.text()).slice(0, 200));
        break;
      }
      const data = await res.json();
      // deno-lint-ignore no-explicit-any
      const text: string = (data?.content ?? []).map((c: any) => c?.text ?? '').join('');
      const start = text.indexOf('[');
      const end = text.lastIndexOf(']');
      if (start < 0 || end <= start) continue;

      // deno-lint-ignore no-explicit-any
      const parsed: any[] = JSON.parse(text.slice(start, end + 1));
      const byId = new Map(parsed.filter((x) => x && typeof x.id === 'string').map((x) => [x.id, x]));
      const items = batch.map((a) => {
        const x = byId.get(a.artist_id);
        const known = x?.known === true;
        return {
          id: a.artist_id,
          categories: known && Array.isArray(x.categories) ? x.categories.filter((c: unknown) => AI_CATEGORIES.includes(String(c))) : [],
          styles: known && Array.isArray(x.styles) ? x.styles.map((s: unknown) => String(s).toLowerCase().slice(0, 40)).slice(0, 4) : [],
        };
      });
      const { error } = await admin.rpc('vibe_apply_ai_tags', { p_items: items });
      if (error) console.warn('[vibe] yapay zekâ etiketleri yazılamadı:', error.message);
      else tagged += items.filter((x) => x.categories.length > 0).length;
    } catch (err) {
      console.warn('[vibe] yapay zekâ etiketleme hatası:', (err as Error)?.message);
      break;
    }
  }
  return tagged;
}

/** Tür eşleştirme için kullanılan normalleştirme (SQL'deki vibe_norm ile aynı). */
export function vibeNorm(value: string): string {
  const map: Record<string, string> = {
    Ç: 'C', Ğ: 'G', İ: 'I', I: 'I', Ö: 'O', Ş: 'S', Ü: 'U', Â: 'A', Î: 'I', Û: 'U',
    ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u',
  };
  return value
    .replace(/[ÇĞİIÖŞÜÂÎÛçğıöşüâîû]/g, (c) => map[c] ?? c)
    .toLowerCase()
    .replace(/['’`´]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
