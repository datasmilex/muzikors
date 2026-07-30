import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, creditAmount, amount } = body;

    if (!userId || !creditAmount || !amount) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const API_KEY = process.env.SHOPIER_CLIENT_ID;
    const API_SECRET = process.env.SHOPIER_CLIENT_SECRET;

    if (!API_KEY || !API_SECRET) {
      return NextResponse.json({ error: 'Shopier keys missing' }, { status: 500 });
    }

    // Platform Order ID (Max 50 chars). 
    // Format: userId_creditAmount (e.g. "uuid_100") -> Length: 36 + 1 + 3 = 40 chars max
    const platform_order_id = `${userId}_${creditAmount}`;
    const random_nr = Math.floor(Math.random() * 1000000).toString();
    const total_order_value = parseFloat(amount).toFixed(2);
    const currency = '0'; // 0 = TRY

    // Create Signature
    // Format: random_nr + platform_order_id + total_order_value + currency
    const dataString = random_nr + platform_order_id + total_order_value + currency;
    const signature = crypto.createHmac('sha256', API_SECRET).update(dataString).digest('base64');

    // Müşteri zorunlu bilgileri (Dijital ürün olduğu için sahte/anonimleştirilmiş bilgiler yeterlidir)
    const buyer_name = 'Muzikors';
    const buyer_surname = 'Kullanicisi';
    const buyer_email = 'customer@muzikors.com';
    const buyer_phone = '05000000000';
    
    // HTML form to return to frontend
    const formHtml = `
      <form id="shopier_payment_form" method="post" action="https://shopier.com/ShowProduct/api_pay4.php">
        <input type="hidden" name="API_key" value="${API_KEY}">
        <input type="hidden" name="website_index" value="1">
        <input type="hidden" name="platform_order_id" value="${platform_order_id}">
        <input type="hidden" name="product_name" value="${creditAmount} Muzikors Kredisi">
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
