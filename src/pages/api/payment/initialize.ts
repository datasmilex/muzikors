import type { NextApiRequest, NextApiResponse } from 'next';
import iyzipay from '@/lib/iyzipay';
import Iyzipay from 'iyzipay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { venueId, packageId, amount, creditAmount, userId } = req.body;

    if (!amount || !packageId || !creditAmount || !venueId) {
      console.error('[iyzico init error] Missing parameters:', { amount, packageId, creditAmount, venueId });
      return res.status(400).json({ error: 'Missing parameters' });
    }

    if (!process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('[iyzico init error] Missing environment variables. Please check .env.local');
    }

    // Ensure price is a string with 2 decimal places (e.g. "25.00")
    const formattedPrice = Number(amount).toFixed(2);

    const conversationId = `muzikors_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    const callbackUrl = new URL('/api/payment/callback', baseUrl);
    callbackUrl.searchParams.set('venueId', venueId);
    callbackUrl.searchParams.set('creditAmount', creditAmount.toString());
    if (userId) {
      callbackUrl.searchParams.set('userId', userId);
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId,
      price: formattedPrice,
      paidPrice: formattedPrice,
      currency: Iyzipay.CURRENCY.TRY,
      basketId: packageId,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: callbackUrl.toString(),
      enabledInstallments: [1],
      buyer: {
        id: userId || 'GUEST',
        name: 'Muzikors',
        surname: 'Kullanicisi',
        gsmNumber: '+905555555555',
        email: 'info@muzikors.com.tr',
        identityNumber: '11111111111',
        lastLoginDate: '2026-07-26 12:00:00',
        registrationDate: '2026-07-26 12:00:00',
        registrationAddress: 'Istanbul',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Istanbul',
        zipCode: '34000',
      },
      billingAddress: {
        contactName: 'Muzikors Kullanicisi',
        city: 'Istanbul',
        country: 'Turkey',
        address: 'Istanbul',
        zipCode: '34000',
      },
      basketItems: [
        {
          id: packageId,
          name: `Muzikors Kredi Paketi (+${creditAmount} Kredi)`,
          category1: 'Digital',
          category2: 'Credits',
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: formattedPrice,
        },
      ],
    };

    console.log('[iyzico init request payload]:', JSON.stringify(request, null, 2));

    iyzipay.checkoutFormInitialize.create(request, (err: any, result: any) => {
      if (err) {
        console.error('[iyzico init err]', err);
        return res.status(500).json({ error: 'Payment initialization failed', details: err });
      } else if (result.status === 'failure') {
        console.error('[iyzico init failure]', result);
        return res.status(400).json({ error: result.errorMessage || 'Payment failed' });
      } else {
        return res.status(200).json({ paymentPageUrl: result.paymentPageUrl, token: result.token });
      }
    });

  } catch (error: any) {
    console.error('[iyzico exception]', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
