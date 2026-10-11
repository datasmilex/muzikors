// Kafe paneli için Vibe Guard işlemleri (mekân oturum tokenı gerekir):
//   playlists → mekânın Spotify hesabındaki listeler
//   add       → listeyi mekânın müzik kütüphanesine ekler ve içe aktarır
//   sync      → eklenmiş listeyi Spotify'dan yeniden okur
//   artists   → sanatçı arama (izin / engel kuralı eklemek için)
//   template  → hazır şablonun sanatçılarını "hep izin ver" olarak ekler
//   enrich    → kütüphanedeki sanatçıların türlerini tamamlar

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  adminClient,
  aiTagArtists,
  CatalogArtist,
  CatalogTrack,
  corsHeaders,
  enrichArtistGenres,
  getVenueAccessToken,
  HttpError,
  ingest,
  json,
  mapLimit,
  pickImage,
  runInBackground,
  SPOTIFY_ID,
  spotifyGet,
  toCatalogTrack,
  vibeNorm,
} from '../_shared/vibe.ts';

const MAX_SOURCES = 10;
const MAX_PAGES = 40; // 50 × 40 = en fazla 2.000 şarkı / liste

const NOT_OWNER =
  "Bu liste mekânın Spotify hesabına ait değil. Spotify bugün yalnızca kendi oluşturduğun ya da ortak olduğun listelerin içeriğini veriyor. Listeyi Spotify'da kendi hesabındaki yeni bir listeye kopyalayıp tekrar dene.";

function nextPath(next: unknown): string | null {
  return typeof next === 'string' && next.startsWith('https://api.spotify.com/v1/') ? next : null;
}

async function importSource(admin: SupabaseClient, token: string, venueId: number, sourceId: string, playlistId: string) {
  const items: { track_id: string; artist_ids: string[]; position: number }[] = [];
  const tracks: CatalogTrack[] = [];
  const artists = new Map<string, CatalogArtist>();

  let url: string | null = `/playlists/${playlistId}/items?limit=50&market=TR&additional_types=track`;
  let position = 0;
  for (let page = 0; url && page < MAX_PAGES; page++) {
    const res = await spotifyGet(token, url);
    if (res.status === 403 || res.status === 404) {
      await admin.rpc('vibe_library_replace', { p_source_id: sourceId, p_items: [], p_error: res.status === 403 ? 'not_owner' : 'not_found' });
      throw new HttpError(res.status === 403 ? NOT_OWNER : 'Liste bulunamadı. Silinmiş ya da gizli olabilir.', 400);
    }
    if (!res.ok) {
      await admin.rpc('vibe_library_replace', { p_source_id: sourceId, p_items: [], p_error: `spotify_${res.status}` });
      throw new HttpError(`Spotify listesi okunamadı (${res.status}). Biraz sonra tekrar deneyin.`, 502);
    }
    const data = await res.json();
    for (const it of data?.items ?? []) {
      const raw = it?.item ?? it?.track;
      if (!raw || it?.is_local || (raw.type && raw.type !== 'track')) continue;
      const t = toCatalogTrack(raw);
      if (!t) continue;
      tracks.push(t);
      items.push({ track_id: t.id, artist_ids: t.artist_ids, position: position++ });
      // deno-lint-ignore no-explicit-any
      for (const a of raw.artists ?? []) if (a?.id && SPOTIFY_ID.test(a.id) && a?.name && !artists.has(a.id)) artists.set(a.id, { id: a.id, name: String(a.name) });
    }
    url = nextPath(data?.next);
  }

  await ingest(admin, tracks, Array.from(artists.values()));
  const { data: count, error } = await admin.rpc('vibe_library_replace', { p_source_id: sourceId, p_items: items });
  if (error) throw new HttpError(`Kütüphane kaydedilemedi: ${error.message}`, 500);

  // Sanatçı türleri arka planda tamamlanır; mekân beklemez
  runInBackground(enrichVenue(admin, token, venueId));
  return { tracks: (count as number) ?? items.length, artists: artists.size };
}

async function enrichVenue(admin: SupabaseClient, token: string, venueId: number) {
  await enrichArtistGenres(admin, token, { venueId, limit: 150, concurrency: 4 });
  await aiTagArtists(admin, { venueId, limit: 100 });
  await admin.rpc('vibe_refresh_profile', { p_venue_id: venueId });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: 'Geçersiz istek' }, 400);
  }

  const admin = adminClient();
  const sessionToken = req.headers.get('x-venue-token') || (typeof body?.token === 'string' ? body.token : '');
  const { data: venueId } = await admin.rpc('vibe_session_venue', { p_token: sessionToken });
  if (!venueId) return json({ success: false, error: 'Oturum geçersiz. Lütfen yeniden giriş yapın.' }, 401);

  try {
    const token = await getVenueAccessToken(admin, venueId);

    switch (body?.action) {
      case 'playlists': {
        const meRes = await spotifyGet(token, '/me');
        const me = meRes.ok ? await meRes.json() : null;
        // deno-lint-ignore no-explicit-any
        const lists: any[] = [];
        let url: string | null = '/me/playlists?limit=50';
        for (let page = 0; url && page < 4; page++) {
          const res = await spotifyGet(token, url);
          if (!res.ok) throw new HttpError(`Spotify listeleri alınamadı (${res.status}).`, 502);
          const data = await res.json();
          lists.push(...(data?.items ?? []).filter(Boolean));
          url = nextPath(data?.next);
        }
        const { data: existing } = await admin.from('venue_vibe_sources').select('playlist_id').eq('venue_id', venueId);
        const added = new Set((existing ?? []).map((s) => s.playlist_id));
        return json({
          success: true,
          account: me?.display_name ?? null,
          playlists: lists
            .filter((p) => p?.id && SPOTIFY_ID.test(p.id))
            .map((p) => ({
              id: p.id,
              name: String(p.name ?? 'Adsız liste'),
              image: pickImage(p.images),
              total: p.items?.total ?? p.tracks?.total ?? null,
              owned: Boolean(me?.id && p.owner?.id === me.id),
              collaborative: Boolean(p.collaborative),
              added: added.has(p.id),
            })),
        });
      }

      case 'add': {
        const playlistId = String(body?.playlist_id ?? '').replace(/^spotify:playlist:/, '').trim();
        if (!SPOTIFY_ID.test(playlistId)) throw new HttpError('Geçersiz liste.', 400);

        const { count } = await admin.from('venue_vibe_sources').select('id', { count: 'exact', head: true }).eq('venue_id', venueId);
        const { data: already } = await admin.from('venue_vibe_sources').select('id').eq('venue_id', venueId).eq('playlist_id', playlistId).maybeSingle();
        if (!already && (count ?? 0) >= MAX_SOURCES) throw new HttpError(`En fazla ${MAX_SOURCES} liste ekleyebilirsiniz.`, 400);

        const metaRes = await spotifyGet(token, `/playlists/${playlistId}?market=TR&fields=id,name,images`);
        if (!metaRes.ok) throw new HttpError(metaRes.status === 404 ? 'Liste bulunamadı.' : `Liste okunamadı (${metaRes.status}).`, 400);
        const meta = await metaRes.json();

        const { data: source, error } = await admin
          .from('venue_vibe_sources')
          .upsert(
            { venue_id: venueId, playlist_id: playlistId, name: String(meta?.name ?? 'Liste').slice(0, 120), image_url: pickImage(meta?.images) },
            { onConflict: 'venue_id,playlist_id' },
          )
          .select('id')
          .single();
        if (error || !source) throw new HttpError(`Liste kaydedilemedi: ${error?.message ?? ''}`, 500);

        try {
          const result = await importSource(admin, token, venueId, source.id, playlistId);
          return json({ success: true, source_id: source.id, ...result });
        } catch (importErr) {
          // İlk eklemede okunamayan liste kütüphanede bozuk bir satır olarak kalmasın
          if (!already) await admin.from('venue_vibe_sources').delete().eq('id', source.id);
          throw importErr;
        }
      }

      case 'sync': {
        const { data: source } = await admin
          .from('venue_vibe_sources')
          .select('id, playlist_id')
          .eq('id', String(body?.source_id ?? ''))
          .eq('venue_id', venueId)
          .maybeSingle();
        if (!source) throw new HttpError('Liste bulunamadı.', 404);
        const result = await importSource(admin, token, venueId, source.id, source.playlist_id);
        return json({ success: true, source_id: source.id, ...result });
      }

      case 'artists': {
        const q = String(body?.q ?? '').trim().slice(0, 80);
        if (q.length < 2) return json({ success: true, artists: [] });
        const params = new URLSearchParams({ q, type: 'artist', market: 'TR', limit: '8' });
        const res = await spotifyGet(token, `/search?${params.toString()}`);
        if (!res.ok) throw new HttpError(`Sanatçı araması başarısız (${res.status}).`, 502);
        const data = await res.json();
        // deno-lint-ignore no-explicit-any
        const found = (data?.artists?.items ?? []).filter((a: any) => a?.id && SPOTIFY_ID.test(a.id) && a?.name);
        // deno-lint-ignore no-explicit-any
        const artists: CatalogArtist[] = found.map((a: any) => ({
          id: a.id,
          name: String(a.name),
          image: pickImage(a.images),
          // Arama sonucunda tür doluysa sakla; boşsa tekli sorgu için işaretsiz bırak
          ...(Array.isArray(a.genres) && a.genres.length > 0 ? { genres: a.genres.map(String) } : {}),
        }));
        await ingest(admin, [], artists);
        return json({ success: true, artists: artists.map((a) => ({ id: a.id, name: a.name, image: a.image ?? null })) });
      }

      case 'template': {
        const key = String(body?.key ?? '');
        const { data: tpl } = await admin.from('vibe_templates').select('key, artists').eq('key', key).maybeSingle();
        if (!tpl) throw new HttpError('Şablon bulunamadı.', 404);

        const resolved = await mapLimit(tpl.artists as string[], 4, async (name) => {
          try {
            const params = new URLSearchParams({ q: name, type: 'artist', market: 'TR', limit: '5' });
            const res = await spotifyGet(token, `/search?${params.toString()}`);
            if (!res.ok) return null;
            const data = await res.json();
            const want = vibeNorm(name);
            // deno-lint-ignore no-explicit-any
            const hit = (data?.artists?.items ?? []).find((a: any) => a?.id && vibeNorm(String(a.name ?? '')) === want);
            return hit ? ({ id: hit.id, name: String(hit.name), image: pickImage(hit.images) } as CatalogArtist) : null;
          } catch {
            return null;
          }
        });

        const artists = resolved.filter((a): a is CatalogArtist => a !== null);
        const missing = (tpl.artists as string[]).filter((_, i) => resolved[i] === null);
        await ingest(admin, [], artists);
        if (artists.length > 0) {
          // Mekânın daha önce koyduğu kurallar (ör. engel) korunur
          const { error } = await admin.from('venue_vibe_rules').upsert(
            artists.map((a) => ({
              venue_id: venueId,
              kind: 'artist',
              ref_id: a.id,
              label: a.name,
              image_url: a.image ?? null,
              effect: 'allow',
              origin: `template:${tpl.key}`,
            })),
            { onConflict: 'venue_id,kind,ref_id', ignoreDuplicates: true },
          );
          if (error) throw new HttpError(`Şablon uygulanamadı: ${error.message}`, 500);
        }
        runInBackground(enrichVenue(admin, token, venueId));
        await admin.rpc('vibe_refresh_profile', { p_venue_id: venueId });
        return json({ success: true, added: artists.length, missing });
      }

      case 'enrich': {
        runInBackground(enrichVenue(admin, token, venueId));
        return json({ success: true });
      }

      default:
        return json({ success: false, error: 'Bilinmeyen işlem' }, 400);
    }
  } catch (err) {
    const e = err as HttpError;
    console.warn('[vibe-library]', body?.action, e?.message);
    return json({ success: false, error: e?.message || 'İşlem başarısız' }, e?.status && e.status >= 400 ? e.status : 500);
  }
});
