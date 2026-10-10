import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\\r/g, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) {
    buffer[i] = raw.charCodeAt(i);
  }
  return buffer.buffer;
}

function base64UrlEncode(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getGoogleAccessToken(serviceAccount: any): Promise<string> {
  const privateKey = serviceAccount.private_key;
  const clientEmail = serviceAccount.client_email;
  const tokenUri = serviceAccount.token_uri || 'https://oauth2.googleapis.com/token';

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: tokenUri,
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedClaim = base64UrlEncode(JSON.stringify(claim));
  const dataToSign = new TextEncoder().encode(`${encodedHeader}.${encodedClaim}`);

  const keyBuffer = pemToArrayBuffer(privateKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, dataToSign);
  const encodedSignature = arrayBufferToBase64Url(signature);
  const jwt = `${encodedHeader}.${encodedClaim}.${encodedSignature}`;

  const res = await fetch(tokenUri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google OAuth error: ${errText}`);
  }

  const tokenData = await res.json();
  return tokenData.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 0. Yalnızca geçerli admin oturumu (veya service_role) bildirim gönderebilir.
    //    Önceki sürümde kontrol yoktu: internetteki herkes tüm kullanıcılara push atabiliyordu.
    const adminToken = req.headers.get('x-admin-token') || '';
    const bearer = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    let authorized = !!supabaseServiceKey && bearer === supabaseServiceKey;
    if (!authorized && adminToken) {
      const { data: session } = await supabaseAdmin
        .from('admin_sessions')
        .select('token')
        .eq('token', adminToken)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();
      authorized = !!session;
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Yetkisiz erişim.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 1. Fetch Firebase Service Account from DB
    const { data: saRow, error: saErr } = await supabaseAdmin
      .from('app_settings')
      .select('value')
      .eq('key', 'firebase_service_account')
      .single();

    if (saErr || !saRow?.value) {
      throw new Error(`Firebase Service Account not found: ${saErr?.message}`);
    }
    const serviceAccount = saRow.value;
    const projectId = serviceAccount.project_id || 'muzikors-1313';

    // 2. Parse request
    const body = await req.json();
    const { title, body: messageBody, target_type, target_user_id, target_fcm_token, data = {}, sent_by } = body;

    if (!title || !messageBody) {
      return new Response(JSON.stringify({ error: 'Title and body are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // 3. Obtain Google Access Token
    const accessToken = await getGoogleAccessToken(serviceAccount);

    // 4. Resolve Target FCM Tokens
    let tokens: string[] = [];

    if (target_fcm_token) {
      tokens = [target_fcm_token];
    } else if (target_type === 'single_user' && target_user_id) {
      const { data: devRows } = await supabaseAdmin
        .from('user_devices')
        .select('fcm_token')
        .eq('user_id', target_user_id);
      tokens = (devRows || []).map((r: any) => r.fcm_token);
    } else if (target_type === 'vip') {
      const { data: vipProfiles } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('is_premium', true);
      const vipIds = (vipProfiles || []).map((p: any) => p.id);
      if (vipIds.length > 0) {
        const { data: devRows } = await supabaseAdmin
          .from('user_devices')
          .select('fcm_token')
          .in('user_id', vipIds);
        tokens = (devRows || []).map((r: any) => r.fcm_token);
      }
    } else {
      // Default: 'all'
      const { data: devRows } = await supabaseAdmin
        .from('user_devices')
        .select('fcm_token');
      tokens = (devRows || []).map((r: any) => r.fcm_token);
    }

    tokens = Array.from(new Set(tokens.filter(t => !!t)));

    if (tokens.length === 0) {
      await supabaseAdmin.from('push_notifications_log').insert({
        title,
        body: messageBody,
        target_type: target_type || 'all',
        target_count: 0,
        success_count: 0,
        failed_count: 0,
        data,
        sent_by: sent_by || 'Admin',
      });

      return new Response(JSON.stringify({ success: true, count: 0, message: 'Kayıtlı aktif cihaz bulunamadı' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // 5. Send FCM HTTP v1 notifications
    let successCount = 0;
    let failedCount = 0;
    const tokensToRemove: string[] = [];

    const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

    const batchSize = 25;
    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (fcmToken) => {
          try {
            const messagePayload = {
              message: {
                token: fcmToken,
                notification: {
                  title,
                  body: messageBody,
                },
                data: {
                  click_action: 'FLUTTER_NOTIFICATION_CLICK',
                  url: data.url || '/',
                  ...Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                  ),
                },
                android: {
                  priority: 'HIGH',
                  notification: {
                    sound: 'default',
                    color: '#D4AF37',
                    channel_id: 'muzikors_default_channel',
                  },
                },
              },
            };

            const fcmRes = await fetch(fcmEndpoint, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(messagePayload),
            });

            if (fcmRes.ok) {
              successCount++;
            } else {
              failedCount++;
              const fcmErr = await fcmRes.json();
              const errorCode = fcmErr?.error?.details?.[0]?.errorCode || fcmErr?.error?.status;
              if (errorCode === 'UNREGISTERED' || fcmRes.status === 404) {
                tokensToRemove.push(fcmToken);
              }
            }
          } catch (e) {
            failedCount++;
          }
        })
      );
    }

    if (tokensToRemove.length > 0) {
      await supabaseAdmin
        .from('user_devices')
        .delete()
        .in('fcm_token', tokensToRemove);
    }

    await supabaseAdmin.from('push_notifications_log').insert({
      title,
      body: messageBody,
      target_type: target_type || 'all',
      target_count: tokens.length,
      success_count: successCount,
      failed_count: failedCount,
      data,
      sent_by: sent_by || 'Admin',
    });

    return new Response(
      JSON.stringify({
        success: true,
        target_count: tokens.length,
        success_count: successCount,
        failed_count: failedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (err: any) {
    console.error('[send-fcm-push] Error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
