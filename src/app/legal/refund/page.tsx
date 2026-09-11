import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - VIP Abonelik İptal ve İade Koşulları',
  description: 'Muzikors VIP / Premium Abonelik İptal, Yenileme ve İade Şartları.',
};

export default function RefundPage() {
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
            VIP Abonelik İptal ve İade Koşulları
          </h1>
          <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
            Google Play Faturalandırma Sistemi ve Dijital Abonelik Şartları
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>

        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          <section className="space-y-4">
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-8 border border-[#D4AF37]/20 shadow-inner space-y-6 text-sm text-gray-300">
              
              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">1. ABONELİK MODELİ VE KREDİ SATIŞI BULUNMAMASI</h2>
                <p>
                  Muzikors son kullanıcı tarafında münferit kredi, jeton veya bakiye satışı <strong className="text-white">KESİNLİKLE YAPILMAMAKTADIR</strong>. Kullanıcılara yalnızca dijital ayrıcalıklar sağlayan "Muzikors VIP / Premium Abonelik" modeli sunulmaktadır.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">2. GOOGLE PLAY IN-APP BILLING VE ABONELİK İPTALİ</h2>
                <p>
                  Tüm VIP Abonelik alımları, tahsilatları ve yenileme işlemleri doğrudan resmi <strong className="text-white">Google Play In-App Billing</strong> altyapısı üzerinden yürütülür. Aboneliğinizi geçerli fatura döneminizin bitiminden en az 24 saat önce Google Play Abonelik Yöneticisi üzerinden dilediğiniz an iptal edebilirsiniz. İptal işlemi yapıldığında mevcut fatura döneminin sonuna kadar VIP haklarınız korunur ve dönem bitiminde kartınızdan yeni bir çekim yapılmaz.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">3. CAYMA HAKKI İSTİSNASI VE İADE ŞARTLARI</h2>
                <p>
                  6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, "Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler" cayma hakkının istisnaları arasındadır. VIP Abonelik anında hesaba tanımlanarak kullanıma açıldığından cayma hakkı kapsamında iade talep edilemez. Dönem içi tahsilat itirazları ve istisnai iade talepleri Google Play Store’un global iade politikalarına tabidir.
                </p>
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#D4AF37] mb-2">4. MEKAN YETKİSİ VE VIBE GUARD SORUMLULUK REDDİ</h2>
                <p>
                  Mekan kurallarına uymayan, Vibe Guard mekanizması tarafından engellenen veya mekan yetkilisinin takdiri doğrultusunda uygun görülmeyerek atlanan/reddedilen şarkılar sebebiyle abonelik bedeli iadesi yapılamaz.
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-neutral-400">
                Resmi Destek ve Yardım Talepleri: <strong className="text-[#D4AF37]">destek@muzikors.com</strong>
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
