/**
 * /api/payment/callback
 * iyzipay npm paketi KULLANILMIYOR — pure fetch() + Node.js crypto.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { iyzicoPost } from '@/lib/iyzipay';

interface IyzicoRetrieveResponse {
  status:         string;
  paymentStatus?: string;
  errorMessage?:  string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl    = process.env.NEXT_PUBLIC_BASE_URL || 'https://muzikors.com.tr';

  try {
    const token        = (req.body?.token || req.query?.token) as string | undefined;
    const venueId      = req.query.venueId      as string | undefined;
    const creditAmount = parseInt((req.query.creditAmount as string) || '0', 10);
    const userId       = req.query.userId        as string | undefined;

    // venueId varsa mekan bağlamını koru: /?v=2&...
    const venueParam = venueId ? `?v=${venueId}` : '';
    const successUrl = (amount: number) => `${baseUrl}/${venueParam}&payment=success&amount=${amount}`;
    const errorUrl   = `${baseUrl}/${venueParam}&payment=error`;

    console.log('[iyzico callback] token:', token, '| venueId:', venueId, '| credit:', creditAmount);

    if (!token) {
      return res.redirect(302, errorUrl);
    }

    const retrieveBody: Record<string, unknown> = {
      locale:         'tr',
      conversationId: 'retrieve_' + Date.now(),
      token,
    };

    const result = await iyzicoPost<IyzicoRetrieveResponse>(
      '/payment/iyzipos/checkoutform/auth/ecom/detail',
      retrieveBody
    );

    console.log('[iyzico callback] result:', result);

    if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      console.error('[iyzico callback] Ödeme doğrulanamadı:', result);
      return res.redirect(302, errorUrl);
    }

    // Kredi bakiyesi güncelle
    if (userId && creditAmount > 0) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: profile, error: profileErr } = await supabaseAdmin
        .from('profiles')
        .select('credits, lifetime_credits')
        .eq('id', userId)
        .single();

      if (profileErr || !profile) {
        console.error('[iyzico callback] Profil bulunamadı:', profileErr);
        return res.redirect(302, successUrl(creditAmount));
      }

      const { error: updateErr } = await supabaseAdmin
        .from('profiles')
        .update({
          credits:          (profile.credits          || 0) + creditAmount,
          lifetime_credits: (profile.lifetime_credits || profile.credits || 0) + creditAmount,
        })
        .eq('id', userId);

      if (updateErr) {
        console.error('[iyzico callback] Kredi güncelleme hatası:', updateErr);
        return res.redirect(302, successUrl(creditAmount));
      }

      console.log(`[iyzico callback] ✅ ${creditAmount} kredi kullanıcı ${userId}'e eklendi.`);
    }

    return res.redirect(302, successUrl(creditAmount));

  } catch (error: any) {
    console.error('[iyzico callback exception]', error);
    return res.redirect(302, `${baseUrl}/?payment=error`);
  }
}
