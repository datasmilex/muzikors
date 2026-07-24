import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = 'https://muzikors.com.tr/auth/callback';

  if (!clientId) {
    return NextResponse.json({ error: 'SPOTIFY_CLIENT_ID is not configured' }, { status: 500 });
  }

  const scope = 'user-read-private user-read-email streaming user-read-playback-state user-modify-playback-state user-read-currently-playing user-library-read';
  const state = Math.random().toString(36).substring(7);

  const authUrl = new URL('https://accounts.spotify.com/authorize');
  authUrl.searchParams.append('response_type', 'code');
  authUrl.searchParams.append('client_id', clientId);
  authUrl.searchParams.append('scope', scope);
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);

  return NextResponse.redirect(authUrl.toString());
}
