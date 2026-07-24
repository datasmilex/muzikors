import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const redirectUri = `${baseUrl}/api/spotify/user-callback`;

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/?spotify_error=${encodeURIComponent(error || 'denied')}`);
  }

  try {
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('[Spotify User Callback Error]', errData);
      return NextResponse.redirect(`${baseUrl}/?spotify_error=token_failed`);
    }

    const data = await response.json();
    const accessToken = data.access_token;
    const refreshToken = data.refresh_token;

    // Redirect user back with cookies set
    const redirectRes = NextResponse.redirect(`${baseUrl}/?spotify_connected=true`);
    redirectRes.cookies.set('spotify_user_token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/',
    });
    if (refreshToken) {
      redirectRes.cookies.set('spotify_refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 3600,
        path: '/',
      });
    }

    return redirectRes;
  } catch (err) {
    console.error('[Spotify Auth Callback Exception]', err);
    return NextResponse.redirect(`${baseUrl}/?spotify_error=server_error`);
  }
}
