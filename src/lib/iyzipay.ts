/**
 * iyzico Pure REST API Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Serverless ortamında `iyzipay` npm paketinin kırılgan bağımlılıkları
 * (postman-request, extend, fs.readdirSync) yerine Node.js built-in `crypto`
 * ve yerleşik `fetch()` kullanarak IYZWS imzasını hesaplar ve iyzico REST API'ını
 * doğrudan çağırır. Herhangi bir 3rd-party pakete bağımlılık yoktur.
 *
 * Resmi iyzico IYZWS İmza Algoritması:
 *   pki    = apiKey + randomKey + requestBodyJsonString
 *   hash   = base64( HMAC-SHA256( pki, secretKey ) )
 *   header = "IYZWS {apiKey}:{randomKey}:{hash}"
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from 'crypto';

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env variable: ${key}`);
  return val;
}

/**
 * Garanti rastgele string üretir — crypto.randomBytes ile.
 */
export function generateRandomKey(): string {
  return crypto.randomBytes(16).toString('hex') + Date.now();
}

/**
 * Verilen JSON request body ve randomKey için IYZWS Authorization başlığı üretir.
 *
 * @param requestBody  - iyzico'ya gönderilecek JSON objesi (henüz stringify edilmemiş)
 * @param randomKey    - Dışarıdan üretilip hem header'a hem body'ye eklenen random string
 */
export function generateIyzicoAuthHeader(requestBody: object, randomKey: string): string {
  const apiKey    = getEnv('IYZICO_API_KEY');
  const secretKey = getEnv('IYZICO_SECRET_KEY');

  const bodyString = JSON.stringify(requestBody);

  // pki = apiKey + randomKey + bodyJsonString
  const pki = apiKey + randomKey + bodyString;

  // base64( HMAC-SHA256(pki, secretKey) )
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(pki)
    .digest('base64');

  console.log('[iyzico auth] randomKey:', randomKey);
  console.log('[iyzico auth] pki length:', pki.length);
  console.log('[iyzico auth] hash:', hash);

  return `IYZWS ${apiKey}:${randomKey}:${hash}`;
}

/**
 * iyzico REST API'ına authenticated JSON POST isteği atar.
 * randomKey hem Authorization header'a hem de body'e eklenerek gönderilir.
 */
export async function iyzicoPost<T = unknown>(
  path: string,
  body: object
): Promise<T> {
  const baseUrl  = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  // randomKey burada üretilir ve hem imzaya hem body'ye eklenir
  const randomKey = generateRandomKey();

  // Body'ye randomKey'i ekle (iyzico bunu zorunlu kılar)
  const enrichedBody = { ...body, randomString: randomKey };

  const authorization = generateIyzicoAuthHeader(enrichedBody, randomKey);

  console.log('[iyzico] POST', `${baseUrl}${path}`);
  console.log('[iyzico] Authorization header prefix:', authorization.substring(0, 40) + '...');

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(enrichedBody),
  });

  const responseText = await response.text();
  console.log('[iyzico] HTTP status:', response.status);
  console.log('[iyzico] Response body:', responseText.substring(0, 500));

  if (!response.ok) {
    // 400'lerde iyzico errorMessage içeriyor, onu fırlat
    let errorMessage = `iyzico HTTP ${response.status}`;
    try {
      const parsed = JSON.parse(responseText);
      errorMessage = parsed.errorMessage || parsed.errorCode || errorMessage;
    } catch {
      errorMessage = responseText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  let parsed: T;
  try {
    parsed = JSON.parse(responseText) as T;
  } catch {
    throw new Error(`iyzico response parse error: ${responseText}`);
  }

  return parsed;
}
