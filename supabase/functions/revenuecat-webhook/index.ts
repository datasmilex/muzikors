import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Authorization for webhook (optional but recommended: checking Authorization header)
  // RevenueCat lets you send a Bearer token or custom Auth header
  const authHeader = req.headers.get('Authorization');
  const expectedAuth = Deno.env.get('REVENUECAT_WEBHOOK_SECRET');
  
  if (expectedAuth && authHeader !== `Bearer ${expectedAuth}` && authHeader !== expectedAuth) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const payload = await req.json();
    const event = payload.event;

    if (!event) {
      return new Response('No event payload', { status: 400 });
    }

    const eventType = event.type;
    const userId = event.app_user_id;
    const productId = event.product_id;

    // We only process purchase and subscription events
    if (eventType === 'INITIAL_PURCHASE' || eventType === 'NON_RENEWING_PURCHASE' || eventType === 'RENEWAL') {
      if (productId === 'Baslangic') {
        creditsToAdd = 50;
      } else if (productId === 'Orta') {
        creditsToAdd = 100;
      } else if (productId === 'Yuksek') {
        creditsToAdd = 200;
      } else if (productId === 'Muzikors_premium') {
        // 100 credits per month/purchase for premium
        creditsToAdd = 100;
        isPremiumUpdate = true;
        isPremiumValue = true;
      } else {
        console.warn(`[RevenueCat Webhook] Unknown product_id: ${productId}`);
        return new Response('Unknown product', { status: 400 });
      }
    } else if (eventType === 'CANCELLATION' || eventType === 'EXPIRATION') {
      if (productId === 'Muzikors_premium') {
        isPremiumUpdate = true;
        isPremiumValue = false;
      }
    } else {
      return new Response('Ignored event type', { status: 200 });
    }

    if (creditsToAdd === 0 && !isPremiumUpdate) {
      return new Response('Success (No changes)', { status: 200 });
    }

    if (!userId || !productId) {
      return new Response('Missing user_id or product_id', { status: 400 });
    }

    // Connect to Supabase as Admin to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('credits, lifetime_credits')
      .eq('id', userId)
      .single();

    if (fetchErr || !profile) {
      console.error('[RevenueCat Webhook] User not found:', userId);
      return new Response('User not found', { status: 404 });
    }

    const updates: any = {};
    if (creditsToAdd > 0) {
      updates.credits = (profile.credits || 0) + creditsToAdd;
      updates.lifetime_credits = (profile.lifetime_credits || 0) + creditsToAdd;
    }
    
    if (isPremiumUpdate) {
      updates.is_premium = isPremiumValue;
    }

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (updateErr) {
      console.error('[RevenueCat Webhook] Failed to update credits:', updateErr);
      return new Response('Failed to update credits', { status: 500 });
    }

    console.log(`[RevenueCat Webhook] Processed ${eventType} for user ${userId}`);
    return new Response('Success', { status: 200 });

  } catch (error) {
    console.error('[RevenueCat Webhook Error]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
