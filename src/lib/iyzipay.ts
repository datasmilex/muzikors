import crypto from 'crypto';

export interface IyzicoConfig {
  apiKey: string;
  secretKey: string;
  baseUrl: string;
}

/**
 * iyzico resmi kütüphanesindeki özyinelemeli PKI String üretim algoritması
 */
export function generatePKIString(data: Record<string, any>): string {
  let pkiString = '[';

  for (const key of Object.keys(data)) {
    const value = data[key];

    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        pkiString += `${key}=[`;
        for (let i = 0; i < value.length; i++) {
          pkiString +=
            typeof value[i] === 'object' && value[i] !== null
              ? generatePKIString(value[i])
              : value[i];
          if (i < value.length - 1) {
            pkiString += ',';
          }
        }
        pkiString += '],';
      } else if (typeof value === 'object') {
        pkiString += `${key}=${generatePKIString(value)},`;
      } else {
        pkiString += `${key}=${value},`;
      }
    }
  }

  if (pkiString.endsWith(',')) {
    pkiString = pkiString.slice(0, -1);
  }

  pkiString += ']';
  return pkiString;
}

/**
 * IYZWS v1 İmzası ve HTTP Başlıklarını Oluşturur
 */
export function generateIyzwsV1Headers(
  config: IyzicoConfig,
  pkiString: string
): { Authorization: string; 'x-iyzi-rnd': string } {
  const apiKey = config.apiKey.trim();
  const secretKey = config.secretKey.trim();

  const randomKey = Date.now().toString() + Math.floor(Math.random() * 1000000).toString();
  const dataToHash = apiKey + randomKey + secretKey + pkiString;

  const signature = crypto
    .createHash('sha1')
    .update(Buffer.from(dataToHash, 'utf-8'))
    .digest('base64');

  return {
    Authorization: `IYZWS ${apiKey}:${signature}`,
    'x-iyzi-rnd': randomKey,
  };
}
