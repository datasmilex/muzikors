import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - VIP Abonelik Mesafeli Satış Sözleşmesi',
  description: 'Muzikors VIP Abonelik Mesafeli Satış Sözleşmesi ve Abonelik Koşulları.',
};

export default function SalesPage() {
  return (
    <div className="relative min-h-screen bg-[#120C08] text-white flex flex-col items-center p-6 sm:p-12 pt-24 sm:pt-12 font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-[#120C08]/5 to-transparent pointer-events-none" />

      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-all text-sm font-black bg-white/5 px-4 py-2.5 rounded-[1rem] border border-white/10 hover:border-[#D4AF37]/50 active:scale-95 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </Link>
      </div>

      <div className="w-full max-w-4xl glass-panel-gold rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(212,175,55,0.15)] space-y-10 relative z-10">
        <div className="text-center border-b border-[#D4AF37]/20 pb-8 relative">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black gold-gradient-text tracking-tight mb-3 drop-shadow-md">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
            Muzikors VIP / Premium Dijital Abonelik Hizmetine İlişkin Mesafeli Satış Sözleşmesi
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>

        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          <section className="space-y-4">
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-8 border border-[#D4AF37]/20 shadow-inner space-y-6 text-sm text-gray-300">
              
              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">1. TARAFLAR</h2>
                <p>
                  <strong>SATICI / SAAS SAĞLAYICI:</strong><br />
                  Unvan: Muzikors B2B SaaS Platformu<br />
                  E-posta: destek@muzikors.com<br />
                  Web: https://muzikors.com.tr
                </p>
                <p className="mt-2">
                  <strong>ALICI (KULLANICI):</strong><br />
                  Muzikors mobil uygulamasını veya web platformunu kullanan, Google Play In-App Billing aracılığıyla VIP / Premium abonelik başlatan son kullanıcıdır.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">2. SÖZLEŞMENİN KONUSU VE MODELİ</h2>
                <p>
                  İşbu sözleşmenin konusu; ALICI'nın Google Play Store aracılığıyla elektronik ortamda siparişini verdiği Muzikors VIP / Premium Abonelik paketinin satışı, özellikleri ve kullanımı ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin tespitidir.
                </p>
                <p className="mt-2 p-3 rounded-xl bg-black/50 border border-amber-500/20 text-xs text-neutral-300">
                  <strong className="text-white">Abonelik Modeli Bildirimi:</strong> Muzikors platformunda kredi, jeton veya bakiye satışı yapılmamaktadır. Hizmet yalnızca belirli periyotlarla yenilenen VIP Abonelik hakkını kapsar.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">3. HİZMETİN TESLİMİ VE KULLANIMI</h2>
                <p>
                  VIP Abonelik; Google Play In-App Billing üzerinden ödeme onayının alınmasının hemen ardından ALICI'nın kullanıcı hesabına anlık olarak tanımlanır. Abonelik; bekleme süresiz şarkı isteği, öncelikli sıralama ve zenginleştirilmiş kişiselleştirme özelliklerini kapsar.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">4. CAYMA HAKKI VE İSTİSNALAR</h2>
                <p>
                  Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde <strong>CAYMA HAKKI KULLANILAMAZ</strong>. ALICI, satın aldığı VIP aboneliğin anında ifa edilen dijital bir hizmet olduğunu peşinen kabul eder. Aboneliğin iptal edilmesi durumunda dönem sonuna kadar haklar geçerliliğini korur.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">5. GENEL HÜKÜMLER</h2>
                <p>
                  5.1. ALICI, platformda belirtilen VIP abonelik şartlarını ve Google Play faturalandırma koşullarını okuyup teyit ettiğini kabul eder.<br />
                  5.2. SATICI, hizmetin eksiksiz ve taahhüt edilen niteliklere uygun olarak sunulmasından sorumludur.<br />
                  5.3. 5846 sayılı FSEK uyarınca mekanda çalınan müziklerin umuma iletim lisanslama sorumluluğu mekan işletmecisine ait olup Muzikors istek iletim yazılımıdır.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">6. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
                <p>
                  İşbu sözleşmeden doğan uyuşmazlıklarda Türk Hukuku uygulanır ve ALICI'nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-neutral-400">
                Resmi Destek ve İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong>
              </div>

            </div>
          </section>
        </div>

        <div className="text-center pt-6 border-t border-[#D4AF37]/20 text-xs text-amber-200/50 space-y-1">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  );
}
