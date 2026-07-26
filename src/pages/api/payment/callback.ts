import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import iyzipay from '@/lib/iyzipay';
import Iyzipay from 'iyzipay';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const token = req.body.token;
    
    // We appended query params to callbackUrl in initialize
    const venueId = req.query.venueId as string;
    const creditAmount = parseInt((req.query.creditAmount as string) || '0', 10);
    const userId = req.query.userId as string;

    if (!token) {
      return res.redirect(302, '/?payment=failed');
    }

    const request = {
      locale: Iyzipay.LOCALE.TR,
      token: token as string,
    };

    iyzipay.checkoutForm.retrieve(request, async (err: any, result: any) => {
      if (err || result.status === 'failure' || result.paymentStatus !== 'SUCCESS') {
        console.error('[iyzico callback failure]', err || result);
        return res.redirect(302, '/?payment=failed');
      }

      try {
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY! 
        );

        if (userId && creditAmount > 0) {
           const { data: profile } = await supabaseAdmin.from('profiles').select('credits, lifetime_credits').eq('id', userId).single();
           if (profile) {
             await supabaseAdmin.from('profiles').update({ 
               credits: (profile.credits || 0) + creditAmount,
               lifetime_credits: (profile.lifetime_credits || profile.credits || 0) + creditAmount
             }).eq('id', userId);
           }
        }
        
        return res.redirect(302, `/?payment=success&amount=${creditAmount}`);

      } catch (dbError) {
        console.error('[iyzico db error]', dbError);
        return res.redirect(302, '/?payment=failed');
      }
    });

  } catch (error) {
    console.error('[iyzico callback exception]', error);
    return res.redirect(302, '/?payment=failed');
  }
}
