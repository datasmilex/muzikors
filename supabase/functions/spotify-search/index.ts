// Şarkı arama + Vibe Guard kararı.
//
// { q, venueId }      → Spotify araması (en fazla 10 sonuç)
// { ids, venueId }    → Bilinen şarkı kimlikleri (geçmiş / favoriler listeleri için)
//
// Her sonuç kataloğa yazılır, yeni ya da bilgisi eskimiş sanatçıların türü
// Spotify'dan sorulur ve mekânın kararı (`vibe`) sonuçla birlikte döner.
// Şarkı isteğinde aynı karar request_track_acid içinde yeniden verilir.

import {
  adminClient,
  aiTagArtists,
  CatalogTrack,
  corsHeaders,
  enrichArtistGenres,
  forgetVenueToken,
  getVenueAccessToken,
  HttpError,
  ingest,
  json,
  runInBackground,
  SPOTIFY_ID,
  spotifyGet,
  toCatalogTrack,
  trackArtists,
} from '../_shared/vibe.ts';

interface OutTrack extends CatalogTrack {
  preview_url: string | null;
  spotify_url: string;
}

function present(t: OutTrack, vibe: unknown) {
  const artist = t.artist_names.join(', ') || 'Bilinmeyen Sanatçı';
  const cover = t.cover ?? '';
  const durMs = t.duration_ms ?? 180000;
  return {
    id: t.id,
    title: t.name,
    name: t.name,
    artist,
    artistIds: t.artist_ids,
    album: t.album ?? '',
    albumCover: cover,
    album_cover: cover,
    coverUrl: cover,
    album_art: cover,
    spotifyUri: `spotify:track:${t.id}`,
    uri: `spotify:track:${t.id}`,
    duration_ms: durMs,
    durationMs: durMs,
    duration: Math.round(durMs / 1000),
    votes: 1,
    requestedBy: '',
    requestedAt: '',
    spotifyUrl: t.spotify_url,
    year: t.year,
    explicit: t.explicit,
    preview_url: t.preview_url,
    previewUrl: t.preview_url,
    vibe: vibe ?? null,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // deno-lint-ignore no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Geçersiz istek' }, 400);
  }

  const venueId = Number(body?.venueId);
  if (!Number.isInteger(venueId) || venueId <= 0) return json({ error: 'venueId parametresi zorunludur' }, 400);

  const q = typeof body?.q === 'string' ? body.q.trim().slice(0, 120) : '';
  const ids: string[] = Array.isArray(body?.ids)
    ? Array.from(new Set<string>(body.ids.map((x: unknown) => String(x).replace('spotify:track:', '')).filter((x: string) => SPOTIFY_ID.test(x)))).slice(0, 20)
    : [];
  if (!q && ids.length === 0) return json({ tracks: [] });

  const admin = adminClient();

  let token: string;
  try {
    token = await getVenueAccessToken(admin, venueId);
  } catch (err) {
    const e = err as HttpError;
    console.error('[Spotify Search] Token hatası:', e.message);
    return json({ error: e.message || 'Spotify bağlantısı kurulamadı' }, e.status || 400);
  }

  try {
    // deno-lint-ignore no-explicit-any
    let items: any[] = [];
    const fromCatalog: OutTrack[] = [];

    if (q) {
      const params = new URLSearchParams({ q, type: 'track', market: 'TR', limit: '10' });
      const res = await spotifyGet(token, `/search?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 400) forgetVenueToken(venueId);
        let details: unknown;
        try {
          details = await res.json();
        } catch {
          details = await res.text();
        }
        console.error('[Spotify Search Failed]', res.status, details);
        return json({ error: 'Spotify arama başarısız', details }, res.status);
      }
      const data = await res.json();
      items = data?.tracks?.items ?? [];
    } else {
      // Önce katalog; bilinmeyenler Spotify'dan tek tek alınır
      const { data: known } = await admin
        .from('vibe_tracks')
        .select('track_id, name, artist_ids, artist_names, album_name, album_cover, duration_ms, explicit, release_year')
        .in('track_id', ids);
      const knownIds = new Set<string>();
      for (const row of known ?? []) {
        knownIds.add(row.track_id);
        fromCatalog.push({
          id: row.track_id,
          name: row.name,
          artist_ids: row.artist_ids ?? [],
          artist_names: row.artist_names ?? [],
          album: row.album_name,
          cover: row.album_cover,
          duration_ms: row.duration_ms,
          explicit: row.explicit,
          year: row.release_year ? String(row.release_year) : null,
          preview_url: null,
          spotify_url: `https://open.spotify.com/track/${row.track_id}`,
        });
      }
      const missing = ids.filter((id) => !knownIds.has(id));
      const fetched = await Promise.all(
        missing.map(async (id) => {
          try {
            const res = await spotifyGet(token, `/tracks/${id}?market=TR`);
            return res.ok ? await res.json() : null;
          } catch {
            return null;
          }
        }),
      );
      items = fetched.filter(Boolean);
    }

    const fresh: OutTrack[] = [];
    for (const item of items) {
      const t = toCatalogTrack(item);
      if (!t) continue;
      fresh.push({ ...t, preview_url: item.preview_url ?? null, spotify_url: item.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}` });
    }

    // Kataloğa yaz. Yeni sanatçıların türü arka planda sorulur: Spotify geliştirici
    // modunda tür listesi çoğunlukla boş döndüğü için aramayı bekletmeye değmez;
    // kararda küratörlü sözlük ve (varsa) yapay zekâ etiketleri kullanılır.
    const artists = trackArtists(items);
    await ingest(admin, fresh, artists);
    const artistIds = Array.from(new Set([...fresh, ...fromCatalog].flatMap((t) => t.artist_ids)));
    if (artistIds.length > 0) {
      runInBackground(enrichArtistGenres(admin, token, { ids: artistIds, limit: 10 }));
    }

    // Sıralama: aramada Spotify'ın sırası, kimlik modunda istenen sıra
    const all = [...fresh, ...fromCatalog];
    const ordered = q ? all : (ids.map((id) => all.find((t) => t.id === id)).filter(Boolean) as OutTrack[]);

    const { data: verdicts, error: evalErr } = await admin.rpc('vibe_evaluate_many', {
      p_venue_id: venueId,
      p_track_ids: ordered.map((t) => t.id),
    });
    if (evalErr) console.warn('[vibe] karar alınamadı:', evalErr.message);

    // Tür bazlı engel ya da "benzer tarz" kullanan mekânlarda, türü bulunamayan
    // sanatçılar arka planda (anahtar tanımlıysa) yapay zekâya sorulur
    const { data: cfg } = await admin
      .from('venue_vibe')
      .select('enabled, similar_enabled, blocked_categories')
      .eq('venue_id', venueId)
      .maybeSingle();
    if (cfg?.enabled && (cfg.similar_enabled || (cfg.blocked_categories ?? []).length > 0) && artistIds.length > 0) {
      runInBackground(aiTagArtists(admin, { ids: artistIds, limit: 25 }));
    }

    const tracks = ordered.slice(0, q ? 10 : 20).map((t) => present(t, verdicts?.[t.id]));
    return json({ tracks, total: tracks.length });
  } catch (error) {
    console.error('[Spotify Search] Beklenmeyen hata:', (error as Error)?.message);
    return json({ error: (error as Error)?.message || 'Arama başarısız' }, 500);
  }
});
