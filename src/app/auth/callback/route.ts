import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role for server-side DB writes that bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  // Fall back to anon key if service role is not configured —
  // the UPDATE will still work because the user's own row matches the RLS policy.
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('[Auth Callback] Received code:', !!code);

  if (!code) {
    console.warn('[Auth Callback] No code param — redirecting without exchange');
    return NextResponse.redirect(requestUrl.origin);
  }

  // ─ Exchange the PKCE code for a session ──────────────────────────────────
  const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

  if (error || !data.session) {
    console.error('[Auth Callback] exchangeCodeForSession failed:', error?.message);
    return NextResponse.redirect(`${requestUrl.origin}/?auth_error=exchange_failed`);
  }

  const session = data.session;
  const userId = session.user.id;
  const provider = session.user.app_metadata?.provider ?? 'google';
  // ─ Fetch Spotify Profile if token exists ───────────────────────────────────
  let spotifyId = null;
  let spotifyEmail = null;
  let spotifyName = null;
  let spotifyAvatar = null;
  const isSpotify = provider === 'spotify';
  const hasSpotifyToken = !!session.provider_token;

  if (hasSpotifyToken) {
    try {
      const spRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${session.provider_token}` },
      });
      if (spRes.ok) {
        const spData = await spRes.json();
        spotifyId = spData.id;
        spotifyEmail = spData.email;
        spotifyName = spData.display_name;
        const spImages = spData.images || [];
        if (spImages.length > 0) {
          spotifyAvatar = spImages[0].url;
        }
      }
    } catch (err) {
      console.warn('[Auth Callback] Could not fetch Spotify profile:', err);
    }
  }

  // ─ Upsert profile row (creates on first login, updates on subsequent) ────
  const fullName =
    spotifyName ||
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email?.split('@')[0] ||
    'Kullanıcı';

  const avatarUrl =
    spotifyAvatar ||
    session.user.user_metadata?.avatar_url ||
    session.user.user_metadata?.picture ||
    '';

  const { error: upsertErr } = await supabaseAdmin
    .from('profiles')
    .upsert(
      {
        id: userId,
        full_name: fullName,
        avatar_url: avatarUrl,
        email: session.user.email || spotifyEmail || '',
        // Mark Spotify connected if login was Spotify OR if we got a Spotify token
        ...(isSpotify || hasSpotifyToken ? { is_spotify_connected: true } : {}),
        ...(hasSpotifyToken ? {
          spotify_id: spotifyId,
          spotify_email: spotifyEmail,
          spotify_access_token: session.provider_token,
          spotify_refresh_token: session.provider_refresh_token,
        } : {}),
      },
      { onConflict: 'id' }
    );

  if (upsertErr) {
    // Non-fatal — user still gets logged in, just log the issue
    console.error('[Auth Callback] Profile upsert error:', upsertErr.message);
  } else {
    console.log('[Auth Callback] Profile upserted successfully. isSpotify:', isSpotify);
  }

  // ─ Redirect back to app root ─────────────────────────────────────────────
  return NextResponse.redirect(requestUrl.origin);
}
