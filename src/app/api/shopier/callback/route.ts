import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Supabase Admin Client (Service Role required to bypass RLS and add credits)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    // Shopier sends data as application/x-www-form-urlencoded
    const formData = await req.formData();
    
    const status = formData.get('status')?.toString();
    const platform_order_id = formData.get('platform_order_id')?.toString();
    const random_nr = formData.get('random_nr')?.toString();
    const signature = formData.get('signature')?.toString();
    const total_order_value = formData.get('total_order_value')?.toString() || '';
    const currency = formData.get('currency')?.toString() || '';

    const API_SECRET = process.env.SHOPIER_CLIENT_SECRET;

    if (!API_SECRET || !platform_order_id || !random_nr || !signature) {
      return NextResponse.json({ error: 'Eksik parametre' }, { status: 400 });
    }

    // İMZA (HASH) DOĞRULAMASI (GÜVENLİK ZAFİYETİNİ ÖNLER)
    const dataString = random_nr + platform_order_id + total_order_value + currency;
    const expectedSignature = crypto.createHmac('sha256', API_SECRET).update(dataString).digest('base64');

    if (signature !== expectedSignature) {
      console.error('[Shopier Callback] Geçersiz imza:', { signature, expectedSignature });
      return NextResponse.json({ error: 'Geçersiz imza (Invalid Signature)' }, { status: 403 });
    }

    // İmza geçerli, durumu kontrol et
    if (status !== 'success') {
      console.log('[Shopier Callback] Ödeme başarısız veya iptal edildi:', platform_order_id);
      return NextResponse.json({ status: 'failed' });
    }

    // İşlem başarılı! platform_order_id'den userId ve creditAmount'u ayrıştır.
    // Pay route'unda formatı `${userId}_${creditAmount}` yapmıştık.
    const [userId, creditAmountStr] = platform_order_id.split('_');
    const creditAmount = parseInt(creditAmountStr, 10);

    if (!userId || isNaN(creditAmount)) {
      console.error('[Shopier Callback] Hatalı Sipariş ID Formatı:', platform_order_id);
      return NextResponse.json({ error: 'Geçersiz platform_order_id formatı' }, { status: 400 });
    }

    // Müşterinin mevcut kredisini çek ve yeni krediyi ekle (Atomic işlem için RPC de kullanılabilir)
    // Supabase Service Role yetkisiyle profiles tablosuna doğrudan ekleme:
    const { data: profile, error: fetchErr } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single();

    if (fetchErr) {
      console.error('[Shopier Callback] Profil bulunamadı:', fetchErr);
      return NextResponse.json({ error: 'Profil bulunamadı' }, { status: 404 });
    }

    const currentCredits = profile.credits || 0;
    const newCredits = currentCredits + creditAmount;

    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({ credits: newCredits })
      .eq('id', userId);

    if (updateErr) {
      console.error('[Shopier Callback] Bakiye güncellenemedi:', updateErr);
      return NextResponse.json({ error: 'Bakiye güncellenemedi' }, { status: 500 });
    }

    console.log(`[Shopier Callback] Başarılı! Kullanıcı: ${userId}, Yüklenen: ${creditAmount}, Yeni Bakiye: ${newCredits}`);

    // Başarılı ödeme sonrası yönlendirme URL'si (İsteğe bağlı - Shopier callback'ten HTTP 200 bekler)
    // Fakat bazı durumlarda Shopier müşteriyi bu linke redirect edebilir. 
    // NextResponse.redirect kullanırsak müşteri bizim uygulamamıza geri döner.
    const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://muzikors.com';
    return NextResponse.redirect(`${appUrl}?payment=success`);
    
  } catch (error: any) {
    console.error('[Shopier Callback Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
