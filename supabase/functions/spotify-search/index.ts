import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Per-venue token cache: venueId -> { token, expiresAt }
// This stays warm while the Edge Function isolate is alive
const tokenCache = new Map<string, { token: string; expiresAt: number }>();

async function getAccessTokenForVenue(venueId: string, supabaseAdmin: any): Promise<string> {
  const cached = tokenCache.get(venueId);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.token;
  }

  const { data: venue, error } = await supabaseAdmin
    .from('venues')
    .select('spotify_client_id, spotify_client_secret, spotify_refresh_token')
    .eq('id', venueId)
    .single();

  if (error || !venue) {
    throw new Error(`Mekan bulunamadı veya Supabase hatası: ${error?.message}`);
  }

  const { spotify_client_id, spotify_client_secret, spotify_refresh_token } = venue;

  if (!spotify_client_id || !spotify_client_secret || !spotify_refresh_token) {
    const err = new Error('Mekan Spotify bağlantısını henüz kurmamış');
    (err as any).status = 400;
    throw err;
  }

  // Exchange refresh_token for access_token
  const authHeader = btoa(`${spotify_client_id}:${spotify_client_secret}`);

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authHeader}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: spotify_refresh_token,
    }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    // If token is invalid, clear the refresh_token from DB so venue shows as disconnected
    if (tokenRes.status === 400 || tokenRes.status === 401) {
      await supabaseAdmin
        .from('venues')
        .update({ spotify_refresh_token: null })
        .eq('id', venueId);
    }
    throw new Error(`Spotify token yenilenemedi (${tokenRes.status}): ${errText}`);
  }

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error('Spotify token yanıtında access_token yok');
  }

  // Update cache
  const expiresIn = (tokenData.expires_in ?? 3600) - 60;
  const accessToken = tokenData.access_token;
  tokenCache.set(venueId, { token: accessToken, expiresAt: Date.now() + expiresIn * 1000 });

  // If Spotify returned a new refresh_token, persist it
  if (tokenData.refresh_token) {
    await supabaseAdmin
      .from('venues')
      .update({ spotify_refresh_token: tokenData.refresh_token })
      .eq('id', venueId);
  }

  return accessToken;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    const body = await req.json();
    const q = body.q?.trim();
    const venueId = body.venueId?.trim();

    if (!q) {
      return new Response(JSON.stringify({ tracks: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (!venueId) {
      return new Response(JSON.stringify({ error: 'venueId parametresi zorunludur' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let accessToken: string;
    try {
      accessToken = await getAccessTokenForVenue(venueId, supabaseAdmin);
    } catch (err: any) {
      console.error('[Spotify Search] Token hatası:', err.message);
      return new Response(JSON.stringify({ error: err.message || 'Spotify bağlantısı kurulamadı' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.status || 400,
      });
    }

    const spotifyParams = new URLSearchParams();
    spotifyParams.append('q', q);
    spotifyParams.append('type', 'track');
    spotifyParams.append('market', 'TR');
    spotifyParams.append('limit', '10');
    
    const searchUrl = 'https://api.spotify.com/v1/search?' + spotifyParams.toString();

    const searchRes = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken.trim()}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });

    if (!searchRes.ok) {
      let spotifyErrorPayload: any;
      try { spotifyErrorPayload = await searchRes.json(); }
      catch { spotifyErrorPayload = await searchRes.text(); }
      console.error('[Spotify Search Failed]', searchRes.status, spotifyErrorPayload);

      if (searchRes.status === 401 || searchRes.status === 400) {
        tokenCache.delete(venueId);
      }

      return new Response(JSON.stringify({ error: 'Spotify arama başarısız', details: spotifyErrorPayload }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: searchRes.status,
      });
    }

    const data = await searchRes.json();
    const items: any[] = data.tracks?.items ?? [];

    // --- VIBE GUARD: Fetch artist genres ---
    const artistIds = new Set<string>();
    items.forEach((item: any) => {
      item.artists?.forEach((a: any) => artistIds.add(a.id));
    });
    
    const artistGenresMap: Record<string, string[]> = {};
    const artistIdArray = Array.from(artistIds).slice(0, 50);

    if (artistIdArray.length > 0) {
      try {
        const artistsRes = await fetch(
          `https://api.spotify.com/v1/artists?ids=${artistIdArray.join(',')}`,
          {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/json' }
          }
        );
        if (artistsRes.ok) {
          const artistsData = await artistsRes.json();
          artistsData.artists?.forEach((artist: any) => {
            if (artist?.id) artistGenresMap[artist.id] = artist.genres || [];
          });
        }
      } catch (err) {
        console.warn('[Vibe Guard] Genre fetch failed:', err);
      }
    }

    const tracks = items.map((item: any) => {
      const images: any[] = item.album?.images ?? [];
      const cover = images[1]?.url ?? images[0]?.url ?? images[2]?.url ?? '';
      const durMs = item.duration_ms ?? 180000;

      const trackGenres = new Set<string>();
      (item.artists ?? []).forEach((a: any) => {
        if (a.id && artistGenresMap[a.id]) {
          artistGenresMap[a.id].forEach(g => trackGenres.add(g.toLowerCase()));
        }
      });

      return {
        id:           item.id,
        title:        item.name,
        name:         item.name,
        artist:       (item.artists ?? []).map((a: any) => a.name).join(', ') || 'Bilinmeyen Sanatçı',
        album:        item.album?.name ?? '',
        albumCover:   cover,
        album_cover:  cover,
        coverUrl:     cover,
        album_art:    cover,
        spotifyUri:   item.uri ?? `spotify:track:${item.id}`,
        uri:          item.uri ?? `spotify:track:${item.id}`,
        duration_ms:  durMs,
        durationMs:   durMs,
        duration:     Math.round(durMs / 1000),
        creditCost:   10,
        votes:        1,
        requestedBy:  '',
        requestedAt:  '',
        spotifyUrl:   item.external_urls?.spotify ?? '',
        genres:       Array.from(trackGenres),
        explicit:     item.explicit ?? false,
      };
    });

    const finalTracks = tracks.slice(0, 10);

    return new Response(JSON.stringify({ tracks: finalTracks, total: data.tracks?.total ?? finalTracks.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
