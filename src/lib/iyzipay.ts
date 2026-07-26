import Iyzipay from 'iyzipay';

export function getIyzipayClient() {
  const apiKey = process.env.IYZICO_API_KEY || '';
  const secretKey = process.env.IYZICO_SECRET_KEY || '';
  const uri = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    console.error('IYZICO_API_KEY or IYZICO_SECRET_KEY environment variable is missing!');
    throw new Error('IYZICO_API_KEY or IYZICO_SECRET_KEY environment variable is missing!');
  }

  return new Iyzipay({
    apiKey,
    secretKey,
    uri,
  });
}
