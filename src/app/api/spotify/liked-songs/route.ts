import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/spotify/liked-songs
 *
 * Soft-handles user's liked songs fetch from Spotify without throwing 401 status.
 */
export async function GET(request: NextRequest) {
  const tokenFromCookie = request.cookies.get('spotify_user_token')?.value;
  const tokenFromHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
  const token = tokenFromCookie || tokenFromHeader;

  if (!token) {
    return NextResponse.json(
      { tracks: [], isConnected: false, message: 'Spotify hesabı bağlı değil' },
      { status: 200 }
    );
  }

  try {
    const res = await fetch('https://api.spotify.com/v1/me/tracks?limit=50&market=TR', {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.warn('[Liked Songs] Spotify token invalid or expired:', res.status);
      return NextResponse.json(
        { tracks: [], isConnected: false, message: 'Spotify hesabı bağlı değil' },
        { status: 200 }
      );
    }

    const data = await res.json();
    const items: any[] = data.items ?? [];

    const tracks = items
      .filter((item) => item?.track && item.track.id)
      .map((item) => {
        const t = item.track;
        const images: any[] = t.album?.images ?? [];
        const cover = images[1]?.url ?? images[0]?.url ?? images[2]?.url ?? '';
        return {
          id: t.id,
          title: t.name,
          artist: (t.artists ?? []).map((a: any) => a.name).join(', '),
          album: t.album?.name ?? '',
          albumCover: cover,
          coverUrl: cover,
          album_art: cover,
          spotifyUri: t.uri ?? `spotify:track:${t.id}`,
          durationMs: t.duration_ms ?? 180000,
          duration: Math.round((t.duration_ms ?? 180000) / 1000),
          creditCost: 10,
          votes: 1,
          requestedBy: '',
          requestedAt: '',
          spotifyUrl: t.external_urls?.spotify ?? '',
        };
      });

    return NextResponse.json(
      { tracks, isConnected: true, total: data.total ?? tracks.length },
      { status: 200 }
    );
  } catch (err) {
    console.error('[Liked Songs] Exception:', err);
    return NextResponse.json(
      { tracks: [], isConnected: false, message: 'Spotify hesabı bağlı değil' },
      { status: 200 }
    );
  }
}
