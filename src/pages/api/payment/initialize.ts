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

    const customData = `${venueId}|${userId}|${creditAmount}`;

    const requestBody: Record<string, any> = {
      locale:              'tr',
      conversationId:      customData,
      price:               Number(amount).toFixed(2),
      paidPrice:           Number(amount).toFixed(2),
      currency:            'TRY',
      basketId:            customData,
      paymentGroup:        'PRODUCT',
      callbackUrl:         'https://muzikors.com.tr/api/payment/callback',
      buyer: {
        id:                  userId || 'GUEST',
        name:                'Muzikors',
        surname:             'Kullanicisi',
        gsmNumber:           '+905555555555',
        email:               'info@muzikors.com.tr',
        identityNumber:      '11111111111',
        lastLoginDate:       '2026-07-26 16:07:03',
        registrationDate:    '2026-07-26 16:07:03',
        registrationAddress: 'Muzikors Istanbul Merkezi No 1',
        ip:                  '78.163.170.64',
        city:                'Istanbul',
        country:             'Turkey',
        zipCode:             '34000',
      },
      shippingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city:        'Istanbul',
        country:     'Turkey',
        address:     'Muzikors Istanbul Merkezi No 1',
        zipCode:     '34000',
      },
      billingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city:        'Istanbul',
        country:     'Turkey',
        address:     'Muzikors Istanbul Merkezi No 1',
        zipCode:     '34000',
      },
      basketItems: [
        {
          id:        packageId,
          name:      'Muzikors Kredi Paketi',
          category1: 'Kredi',
          category2: 'Digital',
          itemType:  'VIRTUAL',
          price:     Number(amount).toFixed(2),
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

    console.log('[iyzico] POST →', `${iyzicoBaseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`);

    const response = await fetch(`${iyzicoBaseUrl}/payment/iyzipos/checkoutform/initialize/auth/ecom`, {
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
      console.error("🔥 IYZICO HATA DETAYI:", result.errorMessage);
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
