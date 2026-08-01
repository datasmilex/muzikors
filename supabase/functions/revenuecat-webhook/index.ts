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

    // We only process purchase events
    if (eventType !== 'INITIAL_PURCHASE' && eventType !== 'NON_RENEWING_PURCHASE') {
      return new Response('Ignored event type', { status: 200 });
    }

    if (!userId || !productId) {
      return new Response('Missing user_id or product_id', { status: 400 });
    }

    // Connect to Supabase as Admin to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Map Product ID to Credits
    // Replace these product IDs with the actual ones used in RevenueCat/Play Console
    let creditsToAdd = 0;
    
    // Example mapping - you should adjust these based on your exact product identifiers
    if (productId === 'muzikors_credits_15') {
      creditsToAdd = 15;
    } else if (productId === 'muzikors_credits_30') {
      creditsToAdd = 30; // e.g. 25 + 5 bonus
    } else if (productId === 'muzikors_credits_60') {
      creditsToAdd = 60; // e.g. 50 + 10 bonus
    } else if (productId === 'muzikors_credits_120') {
      creditsToAdd = 120; // e.g. 100 + 20 bonus
    } else if (productId === 'muzikors_credits_250') {
      creditsToAdd = 250; // e.g. 200 + 50 bonus
    } else {
      console.warn(`[RevenueCat Webhook] Unknown product_id: ${productId}`);
      // Fallback or ignore
      return new Response('Unknown product', { status: 400 });
    }

    // Since we need to increment, we can use the 'increment_credits' if it exists,
    // or just fetch and update. 
    // BUT fetching and updating is subject to race conditions. 
    // It's safer to use an RPC. If no RPC exists, we fetch, calculate, update.
    
    const { data: profile, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('credits, lifetime_credits')
      .eq('id', userId)
      .single();

    if (fetchErr || !profile) {
      console.error('[RevenueCat Webhook] User not found:', userId);
      return new Response('User not found', { status: 404 });
    }

    const newCredits = (profile.credits || 0) + creditsToAdd;
    const newLifetime = (profile.lifetime_credits || 0) + creditsToAdd;

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        credits: newCredits,
        lifetime_credits: newLifetime,
      })
      .eq('id', userId);

    if (updateErr) {
      console.error('[RevenueCat Webhook] Failed to update credits:', updateErr);
      return new Response('Failed to update credits', { status: 500 });
    }

    console.log(`[RevenueCat Webhook] Added ${creditsToAdd} credits to user ${userId}`);
    return new Response('Success', { status: 200 });

  } catch (error) {
    console.error('[RevenueCat Webhook Error]', error);
    return new Response('Internal Server Error', { status: 500 });
  }
});
