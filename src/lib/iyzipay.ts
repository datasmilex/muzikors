/**
 * iyzico Pure REST API Helper
 * ─────────────────────────────────────────────────────────────────────────────
 * Vercel Serverless ortamında `iyzipay` npm paketinin kırılgan bağımlılıkları
 * (postman-request, extend, fs.readdirSync) yerine Node.js built-in `crypto`
 * ve yerleşik `fetch()` kullanarak IYZWS imzasını hesaplar ve iyzico REST API'ını
 * doğrudan çağırır. Herhangi bir 3rd-party pakete bağımlılık yoktur.
 *
 * İmza algoritması (iyzico docs):
 *   authorizationString = base64( sha1( apiKey + randomKey + HMAC-SHA256(requestBody, secretKey) ) )
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from 'crypto';

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing env variable: ${key}`);
  return val;
}

/**
 * Verilen JSON request body için iyzico IYZWS Authorization başlığı üretir.
 */
export function generateIyzicoAuthHeader(requestBody: object): string {
  const apiKey    = getEnv('IYZICO_API_KEY');
  const secretKey = getEnv('IYZICO_SECRET_KEY');

  const randomKey  = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const bodyString = JSON.stringify(requestBody);

  // HMAC-SHA256 imzası
  const hmacHash = crypto
    .createHmac('sha256', secretKey)
    .update(bodyString)
    .digest('hex');

  // SHA-1 → base64
  const authStr = crypto
    .createHash('sha1')
    .update(apiKey + randomKey + hmacHash)
    .digest('base64');

  return `IYZWS ${apiKey}:${randomKey}:${authStr}`;
}

/**
 * iyzico REST API'ına authenticated JSON POST isteği atar.
 */
export async function iyzicoPost<T = unknown>(
  path: string,
  body: object
): Promise<T> {
  const baseUrl      = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
  const authorization = generateIyzicoAuthHeader(body);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`iyzico HTTP ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
