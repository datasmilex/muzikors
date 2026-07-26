export const runtime = 'nodejs';

/**
 * /api/spotify/callback
 * OAuth Authorization Code callback için.
 * Kafeci admin panelinde "Spotify'a Bağlan" dediğinde Spotify bu URL'ye yönlendirir.
 * - state parametresi = venueId
 * - code parametresi = auth code
 * Bu route, auth code'u access+refresh token ile değiştirir ve refresh_token'ı Supabase'e kaydeder.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state, error: spotifyError, error_description } = req.query;

  const adminPanelBase = process.env.ADMIN_PANEL_URL || 'https://admin.muzikors.com.tr';

  // Spotify auth hatası (kullanıcı reddetti vb.)
  if (spotifyError) {
    console.error('[Spotify Callback] Spotify error:', spotifyError, error_description);
    return res.redirect(302, `${adminPanelBase}/kafeler?spotify_error=${encodeURIComponent(String(error_description || spotifyError))}`);
  }

  if (!code || !state) {
    return res.redirect(302, `${adminPanelBase}/kafeler?spotify_error=Eksik+parametreler`);
  }

  const venueId = String(state);

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.redirect(302, `${adminPanelBase}/kafeler?spotify_error=Sunucu+yapilandirma+hatasi`);
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Fetch venue's client_id and client_secret
    const { data: venue, error: venueErr } = await supabaseAdmin
      .from('venues')
      .select('spotify_client_id, spotify_client_secret, venue_name')
      .eq('id', venueId)
      .single();

    if (venueErr || !venue) {
      console.error('[Spotify Callback] Venue not found:', venueId, venueErr?.message);
      return res.redirect(302, `${adminPanelBase}/kafeler?spotify_error=Mekan+bulunamadi`);
    }

    const { spotify_client_id, spotify_client_secret } = venue;

    if (!spotify_client_id || !spotify_client_secret) {
      return res.redirect(
        302,
        `${adminPanelBase}/kafeler/${venueId}?spotify_error=Client+ID+ve+Secret+girilmemis`
      );
    }

    const CALLBACK_URL = 'https://muzikors.com.tr/api/spotify/callback';

    // Exchange auth code for tokens
    const authHeader = Buffer.from(`${spotify_client_id}:${spotify_client_secret}`).toString('base64');

    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type:   'authorization_code',
        code:         String(code),
        redirect_uri: CALLBACK_URL,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || !tokenData.refresh_token) {
      console.error('[Spotify Callback] Token exchange failed:', tokenData);
      const errMsg = tokenData.error_description || tokenData.error || 'Token alinamadi';
      return res.redirect(
        302,
        `${adminPanelBase}/kafeler/${venueId}?spotify_error=${encodeURIComponent(errMsg)}`
      );
    }

    // Save refresh_token to Supabase
    const { error: updateErr } = await supabaseAdmin
      .from('venues')
      .update({ spotify_refresh_token: tokenData.refresh_token })
      .eq('id', venueId);

    if (updateErr) {
      console.error('[Spotify Callback] DB update failed:', updateErr.message);
      return res.redirect(
        302,
        `${adminPanelBase}/kafeler/${venueId}?spotify_error=${encodeURIComponent('Veritabani guncelleme hatasi: ' + updateErr.message)}`
      );
    }

    console.log(`[Spotify Callback] ✅ Venue ${venueId} (${venue.venue_name}) Spotify'a başarıyla bağlandı.`);

    return res.redirect(
      302,
      `${adminPanelBase}/kafeler/${venueId}?spotify_success=1`
    );

  } catch (err: any) {
    console.error('[Spotify Callback] Exception:', err);
    return res.redirect(
      302,
      `${adminPanelBase}/kafeler?spotify_error=${encodeURIComponent(err.message || 'Bilinmeyen hata')}`
    );
  }
}
