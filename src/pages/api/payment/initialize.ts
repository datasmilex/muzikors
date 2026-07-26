/**
 * /api/payment/initialize
 * ─────────────────────────────────────────────────────────────────────────────
 * iyzico Checkout Form başlatma endpointi.
 * iyzipay npm paketi KULLANILMIYOR — pure fetch() + Node.js crypto ile REST API.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { iyzicoPost } from '@/lib/iyzipay';

interface IyzicoInitResponse {
  status:               string;
  errorCode?:           string;
  errorMessage?:        string;
  paymentPageUrl?:      string;
  checkoutFormContent?: string;
  token?:               string;
  tokenExpireTime?:     number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { venueId, packageId, amount, creditAmount, userId } = req.body;
    console.log('IYZICO INIT REQUEST:', req.body);

    // ── Validasyon ────────────────────────────────────────────────────────────
    if (!amount || !packageId || !creditAmount || !venueId) {
      return res.status(400).json({
        error: 'Eksik parametreler: amount, packageId, creditAmount, venueId zorunludur.',
      });
    }

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY) {
      console.error('[iyzico] IYZICO_API_KEY veya IYZICO_SECRET_KEY eksik!');
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası.' });
    }

    // ── Fiyat formatlaması (iyzico: 2 basamaklı string zorunlu) ───────────────
    const formattedPrice = Number(amount).toFixed(2); // "50.00"

    const baseUrl        = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const conversationId = 'mzk_' + crypto.randomBytes(8).toString('hex');

    const callbackUrl = new URL('/api/payment/callback', baseUrl);
    callbackUrl.searchParams.set('venueId',      venueId);
    callbackUrl.searchParams.set('creditAmount', String(creditAmount));
    if (userId) callbackUrl.searchParams.set('userId', userId);

    const now     = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const clientIp = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || '85.34.78.112';

    // ── iyzico CheckoutForm request body ──────────────────────────────────────
    const requestBody: Record<string, unknown> = {
      locale:              'tr',
      conversationId,
      price:               formattedPrice,
      paidPrice:           formattedPrice,
      currency:            'TRY',
      basketId:            'B_' + conversationId,
      paymentGroup:        'PRODUCT',
      callbackUrl:         callbackUrl.toString(),
      enabledInstallments: [1],
      buyer: {
        id:                  userId || 'GUEST',
        name:                'Muzikors',
        surname:             'Kullanicisi',
        gsmNumber:           '+905555555555',
        email:               'info@muzikors.com.tr',
        identityNumber:      '11111111111',
        lastLoginDate:       dateStr,
        registrationDate:    dateStr,
        registrationAddress: 'Istanbul',
        ip:                  clientIp,
        city:                'Istanbul',
        country:             'Turkey',
        zipCode:             '34000',
      },
      shippingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city:        'Istanbul',
        country:     'Turkey',
        address:     'Istanbul',
        zipCode:     '34000',
      },
      billingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city:        'Istanbul',
        country:     'Turkey',
        address:     'Istanbul',
        zipCode:     '34000',
      },
      basketItems: [
        {
          id:        packageId,
          name:      `Muzikors Kredi Paketi (+${creditAmount} Kredi)`,
          category1: 'Digital',
          category2: 'Credits',
          itemType:  'VIRTUAL',
          price:     formattedPrice,
        },
      ],
    };

    console.log('[iyzico] conversationId:', conversationId);
    console.log('[iyzico] formattedPrice:', formattedPrice);

    const result = await iyzicoPost<IyzicoInitResponse>(
      '/payment/iyzipos/checkoutform/initialize/auth/ecom',
      requestBody
    );

    console.log('[iyzico] Init result status:', result.status);

    // iyzicoPost zaten failure'ı throw eder; bu sadece ek güvence
    if (result.status !== 'success') {
      return res.status(400).json({
        error:     result.errorMessage || 'iyzico ödeme başlatılamadı',
        errorCode: result.errorCode,
      });
    }

    return res.status(200).json({
      paymentPageUrl:      result.paymentPageUrl,
      checkoutFormContent: result.checkoutFormContent,
      token:               result.token,
    });

  } catch (error: any) {
    console.error('[iyzico exception]', error);
    // iyzico'dan gelen errorMessage'ı frontend'e birebir ilet
    return res.status(500).json({ error: error.message || 'Ödeme başlatılamadı' });
  }
}
