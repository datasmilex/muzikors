/**
 * iyzico Pure REST API Helper — SIFIR 3rd-party bağımlılık
 * ─────────────────────────────────────────────────────────────────────────────
 * Node.js built-in `crypto` + `fetch()` kullanır.
 * `iyzipay` npm paketi HİÇBİR YERDE import edilmez.
 *
 * IYZWS İmza Algoritması (iyzico Resmi):
 *   1. randomKey   = timestamp + random
 *   2. pkiString   = [key=val,key=val,...] formatında body
 *   3. dataToHash  = apiKey + randomKey + secretKey + pkiString
 *   4. signature   = base64( SHA1( dataToHash ) )
 *   5. header      = "IYZWS {apiKey}:{randomKey}:{signature}"
 * ─────────────────────────────────────────────────────────────────────────────
 */
import crypto from 'crypto';

function getEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Eksik ortam değişkeni: ${key}`);
  return val;
}

/** İstek başına benzersiz rastgele string üretir */
function generateRandomKey(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 10);
}

/**
 * iyzico resmi PKI String formatı: [key=val,key=val,...]
 * Diziler ve iç içe objeler özyinelemeli işlenir.
 */
function generatePkiString(request: Record<string, unknown>): string {
  let pki = '[';
  const parts: string[] = [];

  for (const key of Object.keys(request)) {
    const val = request[key];
    if (val === undefined || val === null) continue;

    if (Array.isArray(val)) {
      const inner = val
        .map((item) =>
          typeof item === 'object' && item !== null
            ? generatePkiString(item as Record<string, unknown>)
            : String(item)
        )
        .join(',');
      parts.push(`${key}=[${inner}]`);
    } else if (typeof val === 'object') {
      parts.push(`${key}=${generatePkiString(val as Record<string, unknown>)}`);
    } else {
      parts.push(`${key}=${val}`);
    }
  }

  pki += parts.join(',');
  pki += ']';
  return pki;
}

/**
 * IYZWS Authorization header'ı üretir.
 */
function generateAuthHeader(
  requestBody: Record<string, unknown>,
  randomKey: string
): string {
  const apiKey    = getEnv('IYZICO_API_KEY');
  const secretKey = getEnv('IYZICO_SECRET_KEY');

  const pkiString  = generatePkiString(requestBody);
  const dataToHash = apiKey + randomKey + secretKey + pkiString;

  const signature = crypto
    .createHash('sha1')
    .update(dataToHash, 'utf8')
    .digest('base64');

  console.log('[iyzico] randomKey :', randomKey);
  console.log('[iyzico] pkiString :', pkiString.substring(0, 150));
  console.log('[iyzico] signature :', signature);

  return `IYZWS ${apiKey}:${randomKey}:${signature}`;
}

/**
 * iyzico REST API'ına authenticated POST isteği atar.
 * Hata durumunda iyzico'nun errorMessage'ını fırlatır.
 */
export async function iyzicoPost<T = unknown>(
  path: string,
  body: Record<string, unknown>
): Promise<T> {
  const baseUrl   = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';
  const randomKey = generateRandomKey();

  // conversationId olarak randomKey kullan (iyzico bunu body'de de bekler)
  const enrichedBody = { ...body, conversationId: body.conversationId ?? randomKey };
  const authorization = generateAuthHeader(enrichedBody, randomKey);

  console.log('[iyzico] POST →', `${baseUrl}${path}`);

  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept'      : 'application/json',
      Authorization : authorization,
    },
    body: JSON.stringify(enrichedBody),
  });

  const responseText = await response.text();
  console.log('[iyzico] HTTP Status :', response.status);
  console.log('[iyzico] Response    :', responseText.substring(0, 600));

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    throw new Error(`iyzico yanıt parse hatası: ${responseText.substring(0, 200)}`);
  }

  // iyzico 200 döndürse bile status:'failure' içerebilir
  if (parsed['status'] === 'failure' || !response.ok) {
    const msg =
      (parsed['errorMessage'] as string) ||
      (parsed['errorCode']    as string) ||
      `iyzico HTTP ${response.status}`;
    throw new Error(msg);
  }

  return parsed as T;
}
