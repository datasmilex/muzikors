/**
 * /api/payment/callback
 * ─────────────────────────────────────────────────────────────────────────────
 * iyzico Checkout Form ödeme geri dönüş endpointi.
 * iyzipay npm paketi KULLANILMIYOR — pure fetch() + Node.js crypto ile REST API.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { iyzicoPost } from '@/lib/iyzipay';

interface IyzicoRetrieveResponse {
  status:        string;
  paymentStatus: string;
  errorMessage?: string;
  price?:        string;
  paidPrice?:    string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // iyzico hem POST hem GET ile callback yapabilir
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // token: POST body'den (form-urlencoded) ya da query'den alınır
    const token = (req.body?.token || req.query?.token) as string | undefined;

    const venueId      = req.query.venueId      as string | undefined;
    const creditAmount = parseInt((req.query.creditAmount as string) || '0', 10);
    const userId       = req.query.userId        as string | undefined;

    console.log('[iyzico callback] token:', token, 'venueId:', venueId, 'creditAmount:', creditAmount, 'userId:', userId);

    if (!token) {
      console.error('[iyzico callback] token yok, ödeme başarısız.');
      return res.redirect(302, '/?payment=failed');
    }

    // ── Token'ı doğrula ────────────────────────────────────────────────────────
    const retrieveBody = {
      locale:         'tr',
      conversationId: `retrieve_${Date.now()}`,
      token,
    };

    const result = await iyzicoPost<IyzicoRetrieveResponse>(
      '/payment/iyzipos/checkoutform/auth/ecom/detail',
      retrieveBody
    );

    console.log('[iyzico callback] retrieve result:', result);

    if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      console.error('[iyzico callback] Ödeme doğrulanamadı:', result);
      return res.redirect(302, '/?payment=failed');
    }

    // ── Kredi bakiyesi güncelle ────────────────────────────────────────────────
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
        // Ödeme başarılı ama db hatası: yine de success'e yönlendir ve logla
        return res.redirect(302, `/?payment=success&amount=${creditAmount}&db_warn=1`);
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
        return res.redirect(302, `/?payment=success&amount=${creditAmount}&db_warn=1`);
      }

      console.log(`[iyzico callback] ✅ ${creditAmount} kredi kullanıcı ${userId}'e eklendi.`);
    }

    return res.redirect(302, `/?payment=success&amount=${creditAmount}`);

  } catch (error: any) {
    console.error('[iyzico callback exception]', error);
    return res.redirect(302, '/?payment=failed');
  }
}
