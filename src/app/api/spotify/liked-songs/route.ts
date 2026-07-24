import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/spotify/liked-songs
 *
 * Fetches user's liked songs fetch from Spotify using their profile's access token.
 */
export async function GET(request: NextRequest) {
  let token = request.cookies.get('spotify_user_token')?.value;
  const tokenFromHeader = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (tokenFromHeader) token = tokenFromHeader;

  // Try to read unified profile token if Supabase auth exists
  const authCookie = request.cookies.get('sb-pjcepgehqhuunnzqpmxf-auth-token')?.value;
  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      const supabaseAccessToken = Array.isArray(parsed) ? parsed[0] : parsed;
      const { data: { user } } = await supabaseAdmin.auth.getUser(supabaseAccessToken);
      if (user) {
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('spotify_access_token')
          .eq('id', user.id)
          .single();
        if (profile?.spotify_access_token) {
          token = profile.spotify_access_token;
        }
      }
    } catch (e) {
      console.warn('[Liked Songs] Could not resolve Supabase user token');
    }
  }

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
