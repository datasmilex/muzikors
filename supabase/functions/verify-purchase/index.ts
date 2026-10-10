import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// VIP aboneliğini Google Play / App Store sunucularından doğrulayıp profile işler.
//
// Gerekli Supabase secret'ları (Dashboard > Edge Functions > Secrets):
//   GOOGLE_PLAY_SERVICE_ACCOUNT_JSON  Play Console'da "Finansal verileri görüntüle" izni verilmiş servis hesabının JSON anahtarı
//   APPLE_IAP_KEY_ID                  App Store Connect > Users and Access > Integrations > In-App Purchase anahtar kimliği
//   APPLE_IAP_ISSUER_ID               Aynı sayfadaki Issuer ID
//   APPLE_IAP_PRIVATE_KEY             İndirilen .p8 dosyasının içeriği
// İsteğe bağlı: ANDROID_PACKAGE_NAME / IOS_BUNDLE_ID (varsayılan com.muzikors.app)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PREMIUM_PRODUCT_ID = 'muzikors_premium';
const ANDROID_PACKAGE = Deno.env.get('ANDROID_PACKAGE_NAME') ?? 'com.muzikors.app';
const IOS_BUNDLE_ID = Deno.env.get('IOS_BUNDLE_ID') ?? 'com.muzikors.app';

type Platform = 'google_play' | 'app_store';

interface Entitlement {
  purchaseKey: string;
  orderId: string | null;
  expiresAt: Date | null;
  active: boolean;
  raw: unknown;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function b64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlJson(value: unknown): string {
  return b64url(new TextEncoder().encode(JSON.stringify(value)));
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\\n/g, '')
    .replace(/\s+/g, '');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out.buffer;
}

function decodeJwsPayload(jws: string): any {
  const part = jws.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(atob(part + '='.repeat((4 - (part.length % 4)) % 4)));
}

// ── Google Play ──────────────────────────────────────────────────────────────
async function googleAccessToken(): Promise<string> {
  const sa = JSON.parse(Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON')!);
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64urlJson({ alg: 'RS256', typ: 'JWT' })}.${b64urlJson({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/androidpublisher',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToDer(sa.private_key), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned)));

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${unsigned}.${b64url(sig)}`,
    }),
  });
  if (!res.ok) throw new Error(`Google OAuth hatası: ${await res.text()}`);
  return (await res.json()).access_token;
}

async function verifyGooglePlay(purchaseToken: string): Promise<Entitlement> {
  const token = await googleAccessToken();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${ANDROID_PACKAGE}` +
    `/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Google Play doğrulama hatası (${res.status})`);
  const sub = await res.json();

  const items: any[] = (sub.lineItems || []).filter((li: any) => li.productId === PREMIUM_PRODUCT_ID);
  const expiries = items.map((li) => Date.parse(li.expiryTime)).filter((t) => !Number.isNaN(t));
  const expiresAt = expiries.length ? new Date(Math.max(...expiries)) : null;
  const stateOk = ['SUBSCRIPTION_STATE_ACTIVE', 'SUBSCRIPTION_STATE_IN_GRACE_PERIOD', 'SUBSCRIPTION_STATE_CANCELED']
    .includes(sub.subscriptionState);

  return {
    purchaseKey: purchaseToken,
    orderId: sub.latestOrderId ?? null,
    expiresAt,
    // İptal edilmiş (CANCELED) abonelik dönem sonuna kadar geçerlidir.
    active: items.length > 0 && stateOk && !!expiresAt && expiresAt.getTime() > Date.now(),
    raw: sub,
  };
}

// ── App Store ────────────────────────────────────────────────────────────────
async function appleJwt(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64urlJson({ alg: 'ES256', kid: Deno.env.get('APPLE_IAP_KEY_ID'), typ: 'JWT' })}.${b64urlJson({
    iss: Deno.env.get('APPLE_IAP_ISSUER_ID'),
    iat: now,
    exp: now + 1200,
    aud: 'appstoreconnect-v1',
    bid: IOS_BUNDLE_ID,
  })}`;
  const key = await crypto.subtle.importKey(
    'pkcs8', pemToDer(Deno.env.get('APPLE_IAP_PRIVATE_KEY')!), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign'],
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(unsigned)),
  );
  return `${unsigned}.${b64url(sig)}`;
}

async function verifyAppStore(transactionId: string): Promise<Entitlement> {
  const jwt = await appleJwt();
  let res: Response | null = null;
  // "Get All Subscription Statuses": herhangi bir işlem kimliğiyle aboneliğin EN SON durumunu verir.
  for (const host of ['https://api.storekit.itunes.apple.com', 'https://api.storekit-sandbox.itunes.apple.com']) {
    res = await fetch(`${host}/inApps/v1/subscriptions/${encodeURIComponent(transactionId)}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (res.status !== 404) break;
  }
  if (!res || !res.ok) throw new Error(`App Store doğrulama hatası (${res?.status})`);

  // Yanıt doğrudan Apple sunucusundan TLS üzerinden geldiği için içerik güvenilirdir.
  const statuses = await res.json();
  const last = (statuses.data || [])
    .flatMap((group: any) => group.lastTransactions || [])
    .map((lt: any) => ({ status: lt.status, tx: decodeJwsPayload(lt.signedTransactionInfo) }))
    .find((lt: any) => lt.tx.productId === PREMIUM_PRODUCT_ID);
  if (!last) throw new Error('App Store: VIP aboneliği bulunamadı');

  const tx = last.tx;
  const expiresAt = tx.expiresDate ? new Date(Number(tx.expiresDate)) : null;

  return {
    purchaseKey: String(tx.originalTransactionId),
    orderId: String(tx.transactionId),
    expiresAt,
    // status: 1 aktif, 3 ödeme yeniden deneniyor, 4 ek süre; 2 süresi dolmuş, 5 iade edilmiş.
    active: statuses.bundleId === IOS_BUNDLE_ID &&
      [1, 3, 4].includes(last.status) &&
      !tx.revocationDate &&
      !!expiresAt && expiresAt.getTime() > Date.now(),
    raw: { status: last.status, transaction: tx },
  };
}

function platformConfigured(platform: Platform): boolean {
  if (platform === 'google_play') return !!Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  return !!(Deno.env.get('APPLE_IAP_KEY_ID') && Deno.env.get('APPLE_IAP_ISSUER_ID') && Deno.env.get('APPLE_IAP_PRIVATE_KEY'));
}

async function verify(platform: Platform, key: string): Promise<Entitlement> {
  return platform === 'google_play' ? verifyGooglePlay(key) : verifyAppStore(key);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  const jwt = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const { data: { user } } = await admin.auth.getUser(jwt);
  if (!user) return json({ success: false, error: 'Oturum açılmalıdır.' }, 401);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ success: false, error: 'Geçersiz istek.' }, 400);
  }

  try {
    // Uygulama açılışında: kayıtlı aboneliklerin güncel bitiş tarihini mağazadan tazele.
    if (body.action === 'refresh') {
      const { data: rows } = await admin
        .from('iap_purchases')
        .select('platform, purchase_key, expires_at')
        .eq('user_id', user.id);

      let latest: Date | null = null;
      let checked = 0;
      for (const row of rows || []) {
        if (!platformConfigured(row.platform)) continue;
        const ent = await verify(row.platform, row.purchase_key).catch(() => null);
        if (!ent) continue;
        checked++;
        await admin.from('iap_purchases')
          .update({ expires_at: ent.expiresAt?.toISOString() ?? null, raw: ent.raw, updated_at: new Date().toISOString() })
          .eq('purchase_key', row.purchase_key);
        if (ent.active && ent.expiresAt && (!latest || ent.expiresAt > latest)) latest = ent.expiresAt;
      }

      // Mağazaya ulaşılamadıysa (geçici hata) mevcut VIP durumuna dokunma.
      // Admin panelinden elle verilmiş daha uzun bir VIP süresi de korunur.
      if (checked > 0) {
        const { data: profile } = await admin
          .from('profiles')
          .select('premium_until')
          .eq('id', user.id)
          .maybeSingle();
        const manualUntil = profile?.premium_until ? new Date(profile.premium_until) : null;

        if (latest && (!manualUntil || latest > manualUntil)) {
          await admin.from('profiles').update({ is_premium: true, premium_until: latest.toISOString() }).eq('id', user.id);
        } else if (!latest && (!manualUntil || manualUntil.getTime() <= Date.now())) {
          await admin.from('profiles').update({ is_premium: false }).eq('id', user.id);
        }
      }
      return json({ success: true, is_premium: !!latest, premium_until: latest?.toISOString() ?? null });
    }

    const platform: Platform = body.platform === 'app_store' ? 'app_store' : 'google_play';
    if (body.productId && body.productId !== PREMIUM_PRODUCT_ID) {
      return json({ success: false, error: 'Bilinmeyen ürün.' }, 400);
    }
    if (!platformConfigured(platform)) {
      return json({ success: false, error: 'Satın alma doğrulaması henüz yapılandırılmadı.' }, 503);
    }

    const key = platform === 'google_play' ? body.purchaseToken : body.transactionId;
    if (!key || typeof key !== 'string') {
      return json({ success: false, error: 'Satın alma bilgisi eksik.' }, 400);
    }

    const ent = await verify(platform, key);
    if (!ent.active) {
      return json({ success: false, error: 'Aktif bir abonelik bulunamadı.' }, 402);
    }

    // Aynı satın alma başka bir hesaba bağlanamaz.
    const { data: existing } = await admin
      .from('iap_purchases')
      .select('user_id')
      .eq('purchase_key', ent.purchaseKey)
      .maybeSingle();
    if (existing && existing.user_id !== user.id) {
      return json({ success: false, error: 'Bu satın alma başka bir hesaba bağlı.' }, 409);
    }

    await admin.from('iap_purchases').upsert({
      user_id: user.id,
      platform,
      product_id: PREMIUM_PRODUCT_ID,
      purchase_key: ent.purchaseKey,
      order_id: ent.orderId,
      expires_at: ent.expiresAt?.toISOString() ?? null,
      raw: ent.raw,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'purchase_key' });

    const { data: profile } = await admin
      .from('profiles')
      .select('premium_activated_at')
      .eq('id', user.id)
      .maybeSingle();

    await admin.from('profiles').update({
      is_premium: true,
      premium_until: ent.expiresAt!.toISOString(),
      premium_activated_at: profile?.premium_activated_at ?? new Date().toISOString(),
    }).eq('id', user.id);

    return json({ success: true, is_premium: true, premium_until: ent.expiresAt!.toISOString() });
  } catch (err: any) {
    console.error('[verify-purchase]', err);
    return json({ success: false, error: 'Ödeme doğrulanamadı. Lütfen daha sonra tekrar deneyin.' }, 502);
  }
});
