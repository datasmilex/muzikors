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
  const isSpotify = provider === 'spotify';

  console.log(`[Auth Callback] ✅ Session exchanged for user ${userId} via provider "${provider}"`);

  // ─ Upsert profile row (creates on first login, updates on subsequent) ────
  const fullName =
    session.user.user_metadata?.full_name ||
    session.user.user_metadata?.name ||
    session.user.email?.split('@')[0] ||
    'Kullanıcı';

  const avatarUrl =
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
        email: session.user.email ?? '',
        // Mark Spotify connected only when that is the login provider
        ...(isSpotify ? { is_spotify_connected: true } : {}),
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
