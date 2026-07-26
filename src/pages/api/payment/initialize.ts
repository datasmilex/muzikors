export const runtime = 'nodejs';

/**
 * /api/payment/initialize
 * iyzipay npm paketi KULLANILMIYOR — pure fetch() + Node.js crypto.
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { generateIyzwsV1Headers, generatePKIString } from '@/lib/iyzipay';

interface IyzicoInitResponse {
  status:               string;
  errorCode?:           string;
  errorMessage?:        string;
  paymentPageUrl?:      string;
  checkoutFormContent?: string;
  token?:               string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { venueId, packageId, amount, creditAmount, userId } = req.body;
    console.log('IYZICO INIT REQUEST:', req.body);

    if (!amount || !packageId || !creditAmount || !venueId) {
      return res.status(400).json({ error: 'Eksik parametreler: amount, packageId, creditAmount, venueId zorunludur.' });
    }

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const iyzicoBaseUrl = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      return res.status(500).json({ error: 'Sunucu yapılandırma hatası: iyzico env eksik.' });
    }

    const formattedPrice = Number(amount).toFixed(2);
    const baseUrl        = process.env.NEXT_PUBLIC_BASE_URL || 'https://muzikors.com.tr';

    const callbackUrl = new URL('/api/payment/callback', baseUrl);
    callbackUrl.searchParams.set('venueId',      venueId);
    callbackUrl.searchParams.set('creditAmount', String(creditAmount));
    if (userId) callbackUrl.searchParams.set('userId', userId);

    const clientIp = ((req.headers['x-forwarded-for'] as string) || '').split(',')[0]?.trim() || '85.34.78.112';
    const now      = new Date();
    const dateStr  = now.toISOString().replace('T', ' ').substring(0, 19);
    
    const randomKey = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();

    const requestBody: Record<string, any> = {
      locale:              'tr',
      conversationId:      randomKey,
      price:               formattedPrice,
      paidPrice:           formattedPrice,
      currency:            'TRY',
      basketId:            'B_' + randomKey,
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
          id:        'BI_1',
          name:      `Muzikors Kredi Paketi (+${creditAmount} Kredi)`,
          category1: 'Kredi',
          category2: 'Digital',
          itemType:  'VIRTUAL',
          price:     formattedPrice,
        },
      ],
    };

    const pkiString = generatePKIString(requestBody);
    const headers = generateIyzwsV1Headers(
      { apiKey, secretKey, baseUrl: iyzicoBaseUrl },
      pkiString
    );

    console.log("=== IYZICO DEBUG START ===");
    console.log("API_KEY Exists:", !!apiKey, "Length:", apiKey?.length, "Prefix:", apiKey?.substring(0, 10));
    console.log("SECRET_KEY Exists:", !!secretKey, "Length:", secretKey?.length);
    console.log("BASE_URL:", iyzicoBaseUrl);
    console.log("PKI_STRING:", pkiString);
    console.log("AUTH_HEADER:", headers.Authorization);
    console.log("X-IYZI-RND:", headers['x-iyzi-rnd']);
    console.log("=== IYZICO DEBUG END ===");

    console.log('[iyzico] POST →', `${iyzicoBaseUrl}/payment/iyzipay-checkoutform/initialize`);

    const response = await fetch(`${iyzicoBaseUrl}/payment/iyzipay-checkoutform/initialize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': headers.Authorization,
        'x-iyzi-rnd': headers['x-iyzi-rnd'],
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    let result: IyzicoInitResponse;
    try {
      result = JSON.parse(responseText);
    } catch {
      return res.status(500).json({ error: `iyzico yanıt parse hatası: ${responseText.substring(0, 200)}` });
    }

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
    return res.status(500).json({ error: error.message || 'Ödeme başlatılamadı' });
  }
}
