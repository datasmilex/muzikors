/**
 * iyzico Pure REST API Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * iyzipay npm paketi KULLANILMIYOR.
 * Node.js built-in `crypto` + `fetch()` ile doğrudan REST API çağrısı.
 *
 * Resmi IYZWS İmza Algoritması (iyzipay SDK kaynak kodundan birebir):
 *   1. pkiString  = request body'nin [key=value] formatına dönüştürülmesi (özyinelemeli)
 *   2. signature  = hex( HMAC-SHA256( pkiString, secretKey ) )
 *   3. authHash   = base64( SHA1( apiKey + randomKey + signature ) )
 *   4. header     = "IYZWS {apiKey}:{randomKey}:{authHash}"
 *   5. x-iyzi-rnd: randomKey  (zorunlu ek header)
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from 'crypto';

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Eksik env değişkeni: ${key}`);
  return val;
}

/** İstek başına benzersiz rastgele string üretir */
export function generateRandomKey(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 10);
}

/**
 * Request body'sini iyzico'nun PKI formatına çevirir.
 * Format: [key=value][key=value]... (iç içe objeler ve diziler özyinelemeli işlenir)
 *
 * iyzipay SDK kaynak: lib/utils/PKI.js#generatePKIString
 */
function generatePKIString(obj: Record<string, unknown>): string {
  let str = '';
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val === null || val === undefined) continue;

    if (Array.isArray(val)) {
      let inner = '';
      for (const item of val) {
        if (item !== null && typeof item === 'object') {
          inner += generatePKIString(item as Record<string, unknown>);
        } else {
          inner += String(item);
        }
      }
      str += `[${key}=${inner}]`;
    } else if (typeof val === 'object') {
      str += `[${key}=${generatePKIString(val as Record<string, unknown>)}]`;
    } else {
      str += `[${key}=${val}]`;
    }
  }
  return str;
}

/**
 * Verilen request body ve randomKey için IYZWS Authorization header'ı üretir.
 * randomKey dışarıdan geçilmeli — hem header'a hem x-iyzi-rnd'ye aynı değer girmeli.
 */
export function generateIyzicoAuthHeader(
  requestBody: Record<string, unknown>,
  randomKey: string
): string {
  const apiKey    = getEnv('IYZICO_API_KEY');
  const secretKey = getEnv('IYZICO_SECRET_KEY');

  // Adım 1: [key=value] PKI string
  const pkiString = generatePKIString(requestBody);

  // Adım 2: HMAC-SHA256(pkiString, secretKey) → hex
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(pkiString)
    .digest('hex');

  // Adım 3: base64(SHA1(apiKey + randomKey + signature))
  const authHash = crypto
    .createHash('sha1')
    .update(apiKey + randomKey + signature)
    .digest('base64');

  console.log('[iyzico auth] randomKey     :', randomKey);
  console.log('[iyzico auth] pkiString     :', pkiString.substring(0, 120) + '...');
  console.log('[iyzico auth] signature(hex):', signature.substring(0, 30) + '...');
  console.log('[iyzico auth] authHash      :', authHash);

  return `IYZWS ${apiKey}:${randomKey}:${authHash}`;
}

/**
 * iyzico REST API'ına authenticated JSON POST isteği atar.
 * Body olduğu gibi JSON'a çevrilir; PKI string sadece imza için kullanılır.
 */
export async function iyzicoPost<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const baseUrl   = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
  const randomKey = generateRandomKey();

  const authorization = generateIyzicoAuthHeader(body, randomKey);

  console.log('[iyzico] POST', `${baseUrl}${path}`);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type'          : 'application/json',
      'Accept'                : 'application/json',
      Authorization           : authorization,
      'x-iyzi-rnd'            : randomKey,           // iyzico bu header'ı zorunlu kılar
      'x-iyzi-client-version' : 'iyzipay-node-2.0.50',
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  console.log('[iyzico] HTTP Status:', response.status);
  console.log('[iyzico] Response   :', responseText.substring(0, 600));

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`iyzico yanıt parse hatası: ${responseText.substring(0, 200)}`);
  }

  // iyzico 200 döndürse bile status:'failure' gelebilir
  if (parsed.status === 'failure') {
    throw new Error(
      (parsed.errorMessage as string) ||
      (parsed.errorCode    as string) ||
      `iyzico failure (HTTP ${response.status})`
    );
  }

  if (!response.ok) {
    throw new Error(
      (parsed.errorMessage as string) ||
      `iyzico HTTP ${response.status}`
    );
  }

  return parsed as T;
}
