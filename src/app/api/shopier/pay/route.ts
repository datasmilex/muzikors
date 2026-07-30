import { NextResponse } from 'next/server';
import crypto from 'crypto';

// GÜVENLİK SÖZLÜĞÜ: Tüm fiyat ve kredi paketleri Backend'de tanımlanır.
// Frontend'den gelen fiyat/kredi bilgisine KESİNLİKLE GÜVENİLMEZ!
const PACKAGES: Record<string, { price: number; credits: number }> = {
  'pack-50': { price: 50, credits: 50 },
  'pack-120': { price: 100, credits: 120 },
  'pack-250': { price: 200, credits: 250 }
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, packageId } = body;

    if (!userId || !packageId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Backend fiyat kontrolü
    const selectedPackage = PACKAGES[packageId];
    if (!selectedPackage) {
      return NextResponse.json({ error: 'Geçersiz paket seçimi' }, { status: 400 });
    }

    const API_KEY = process.env.SHOPIER_CLIENT_ID;
    const API_SECRET = process.env.SHOPIER_CLIENT_SECRET;

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json({ error: 'Shopier keys missing' }, { status: 500 });
    }

    // Platform Order ID (Max 50 chars). 
    // Format: userId_packageId (e.g. "uuid_pack-120")
    const platform_order_id = `${userId}_${packageId}`;
    const random_nr = Math.floor(Math.random() * 1000000).toString();
    const total_order_value = parseFloat(selectedPackage.price.toString()).toFixed(2);
    const currency = '0'; // 0 = TRY

    // İMZA (HASH) OLUŞTURMA
    const dataString = random_nr + platform_order_id + total_order_value + currency;
    const signature = crypto.createHmac('sha256', API_SECRET).update(dataString).digest('base64');

    // Müşteri bilgileri (Dijital ürün olduğu için anonimleştirilmiş bilgiler)
    const buyer_name = 'Muzikors';
    const buyer_surname = 'Kullanicisi';
    const buyer_email = 'customer@muzikors.com';
    const buyer_phone = '05000000000';
    
    // Yönlendirme formu (Frontend bunu işleyip kullanıcıyı Shopier sayfasına atacak)
    const formHtml = `
      <form id="shopier_payment_form" method="post" action="https://shopier.com/ShowProduct/api_pay4.php">
        <input type="hidden" name="API_key" value="${API_KEY}">
        <input type="hidden" name="website_index" value="1">
        <input type="hidden" name="platform_order_id" value="${platform_order_id}">
        <input type="hidden" name="product_name" value="${selectedPackage.credits} Muzikors Kredisi">
        <input type="hidden" name="product_type" value="2"> <!-- 2 = Digital -->
        
        <input type="hidden" name="buyer_name" value="${buyer_name}">
        <input type="hidden" name="buyer_surname" value="${buyer_surname}">
        <input type="hidden" name="buyer_email" value="${buyer_email}">
        <input type="hidden" name="buyer_account_age" value="0">
        <input type="hidden" name="buyer_id_nr" value="0">
        <input type="hidden" name="buyer_phone" value="${buyer_phone}">
        
        <input type="hidden" name="billing_address" value="Istanbul">
        <input type="hidden" name="billing_city" value="Istanbul">
        <input type="hidden" name="billing_country" value="Turkey">
        <input type="hidden" name="billing_postcode" value="34000">
        
        <input type="hidden" name="shipping_address" value="Istanbul">
        <input type="hidden" name="shipping_city" value="Istanbul">
        <input type="hidden" name="shipping_country" value="Turkey">
        <input type="hidden" name="shipping_postcode" value="34000">
        
        <input type="hidden" name="total_order_value" value="${total_order_value}">
        <input type="hidden" name="currency" value="${currency}">
        <input type="hidden" name="platform" value="0">
        <input type="hidden" name="is_in_frame" value="0">
        <input type="hidden" name="current_language" value="0">
        <input type="hidden" name="modul_version" value="1.0.4">
        
        <input type="hidden" name="random_nr" value="${random_nr}">
        <input type="hidden" name="signature" value="${signature}">
      </form>
    `;

    return NextResponse.json({ formHtml });
  } catch (error: any) {
    console.error('Shopier Pay Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
