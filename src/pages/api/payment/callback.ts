export const runtime = 'nodejs';

/**
 * /api/payment/callback
 * iyzipay npm paketi KULLANILMIYOR — pure fetch() + Node.js crypto.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { generateIyzwsV1Headers, generatePKIString } from '@/lib/iyzipay';

interface IyzicoRetrieveResponse {
  status:         string;
  paymentStatus?: string;
  errorMessage?:  string;
  conversationId?: string; // venueId|userId|creditAmount
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://muzikors.com.tr';

  try {
    const token = (req.body?.token || req.query?.token) as string | undefined;

    if (!token) {
      console.error('[iyzico callback] Token yok.');
      return res.redirect(302, `${baseUrl}/?payment=error`);
    }

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const iyzicoBaseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      console.error('[iyzico] IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik!');
      return res.redirect(302, `${baseUrl}/?payment=error`);
    }
    
    const randomKey = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

    const retrieveBody: Record<string, any> = {
      locale:         'tr',
      conversationId: randomKey,
      token,
    };

    const pkiString = generatePKIString(retrieveBody);
    const headers = generateIyzwsV1Headers(
      { apiKey, secretKey, baseUrl: iyzicoBaseUrl },
      pkiString
    );

    const response = await fetch(`${iyzicoBaseUrl}/payment/iyzipos/checkoutform/auth/ecom/detail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': headers.Authorization,
        'x-iyzi-rnd': headers['x-iyzi-rnd'],
      },
      body: JSON.stringify(retrieveBody),
    });

    const responseText = await response.text();
    let result: IyzicoRetrieveResponse;
    try {
      result = JSON.parse(responseText);
    } catch {
      console.error('[iyzico callback] parse hatası:', responseText);
      return res.redirect(302, `${baseUrl}/?payment=error`);
    }

    console.log('[iyzico callback] result status:', result.status, 'paymentStatus:', result.paymentStatus);

    // conversationId parse (venueId|userId|creditAmount)
    let venueId = '';
    let userId = '';
    let creditAmount = 0;
    
    if (result.conversationId && result.conversationId.includes('|')) {
      const parts = result.conversationId.split('|');
      venueId = parts[0] || '';
      userId = parts[1] || '';
      creditAmount = parseInt(parts[2] || '0', 10);
    }

    const venueParam = venueId ? `?v=${venueId}` : '';
    const successUrl = (amount: number) => `${baseUrl}/${venueParam}&payment=success&amount=${amount}`;
    const errorUrl   = `${baseUrl}/${venueParam}&payment=error`;

    if (result.status !== 'success' || result.paymentStatus !== 'SUCCESS') {
      console.error('[iyzico callback] Ödeme doğrulanamadı:', result.errorMessage);
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
    return res.redirect(302, `${process.env.NEXT_PUBLIC_BASE_URL || 'https://muzikors.com.tr'}/?payment=error`);
  }
}
