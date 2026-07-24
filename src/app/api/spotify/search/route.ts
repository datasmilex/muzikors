import { NextRequest, NextResponse } from 'next/server';

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing Spotify env variables' },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();

  if (!q) {
    return NextResponse.json({ tracks: [] }, { status: 200 });
  }

  let accessToken = cachedToken;
  if (!accessToken || Date.now() >= tokenExpiresAt) {
    try {
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
        cache: 'no-store',
      });

      if (!tokenRes.ok) {
        const errorText = await tokenRes.text();
        console.error('[Token Fetch Failed]', tokenRes.status, errorText);
        cachedToken = null;
        tokenExpiresAt = 0;
        return NextResponse.json(
          { error: 'Token Fetch Failed', details: errorText },
          { status: 400 }
        );
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return NextResponse.json(
          { error: 'Token Fetch Failed', details: 'No access_token returned' },
          { status: 400 }
        );
      }

      accessToken = tokenData.access_token;
      cachedToken = accessToken;
      tokenExpiresAt = Date.now() + ((tokenData.expires_in ?? 3600) - 60) * 1000;
    } catch (err) {
      console.error('[Token Fetch Exception]', err);
      return NextResponse.json(
        { error: 'Token Fetch Failed', details: String(err) },
        { status: 400 }
      );
    }
  }

  try {
    const spotifyParams = new URLSearchParams({
      q: q.trim(),
      type: 'track',
      limit: '10',
    });
    const searchUrl = 'https://api.spotify.com/v1/search?' + spotifyParams.toString();

    const searchRes = await fetch(searchUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!searchRes.ok) {
      let spotifyErrorPayload: any;
      try {
        spotifyErrorPayload = await searchRes.json();
      } catch {
        spotifyErrorPayload = await searchRes.text();
      }
      console.error('[Spotify Search Failed]', searchRes.status, spotifyErrorPayload);

      if (searchRes.status === 401) {
        cachedToken = null;
        tokenExpiresAt = 0;
      }

      return NextResponse.json(
        { error: 'Spotify Search Failed', details: spotifyErrorPayload },
        { status: searchRes.status }
      );
    }

    const data = await searchRes.json();
    const items: any[] = data.tracks?.items ?? [];

    const tracks = items.map((item: any) => {
      const images: any[] = item.album?.images ?? [];
      const cover = images[1]?.url ?? images[0]?.url ?? images[2]?.url ?? '';
      const durMs = item.duration_ms ?? 180000;
      return {
        id: item.id,
        title: item.name,
        name: item.name,
        artist: (item.artists ?? []).map((a: any) => a.name).join(', ') || 'Bilinmeyen Sanatçı',
        album: item.album?.name ?? '',
        albumCover: cover,
        album_cover: cover,
        coverUrl: cover,
        album_art: cover,
        spotifyUri: item.uri ?? `spotify:track:${item.id}`,
        uri: item.uri ?? `spotify:track:${item.id}`,
        duration_ms: durMs,
        durationMs: durMs,
        duration: Math.round(durMs / 1000),
        creditCost: 10,
        votes: 1,
        requestedBy: '',
        requestedAt: '',
        spotifyUrl: item.external_urls?.spotify ?? '',
      };
    });

    return NextResponse.json({ tracks, total: data.tracks?.total ?? tracks.length });
  } catch (err) {
    console.error('[Spotify Search Exception]', err);
    return NextResponse.json(
      { error: 'Spotify Search Failed', details: String(err) },
      { status: 500 }
    );
  }
}
