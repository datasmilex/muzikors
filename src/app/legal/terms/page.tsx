import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Kullanıcı Hizmet Sözleşmesi ve VIP Abonelik Koşulları',
  description: 'Muzikors Kullanıcı Hizmet Sözleşmesi, FSEK Telif Hakları Sorumluluk Reddi ve VIP Abonelik Şartları.',
};

export default function TermsPage() {
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
            Kullanıcı Hizmet Sözleşmesi
          </h1>
          <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
            Muzikors Platformu Kullanım Şartları, FSEK Telif Hakları Sorumluluk Reddi ve VIP Abonelik Koşulları
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>

        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              1. Taraflar ve Sözleşmenin Konusu
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                İşbu sözleşme; Muzikors B2B SaaS Platformu (“Muzikors”) ile Muzikors mobil uygulamasını veya web platformunu kullanan son kullanıcı (“Kullanıcı”) arasında elektronik ortamda akdedilmiştir. Kullanıcı, uygulamaya giriş yaparak bu sözleşmedeki şartları peşinen kabul etmiş sayılır.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              2. Hizmetin Tanımı ve Hukuki Statüsü
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                <strong className="text-white">Muzikors Bir Müzik Yayımcısı Değildir:</strong> Muzikors; bir radyo, ses dosyası barındırıcısı, müzik yapımcısı veya ses akış (streaming) sağlayıcısı DEĞİLDİR. Muzikors, yalnızca anlaşmalı mekan müşterisi ile mekanın ses yürütücüsü arasında şarkı tercihlerinin, oylarının ve sıralamasının iletilmesini sağlayan bir dijital B2B SaaS istek panosu yazılımıdır.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              3. 5846 Sayılı FSEK Telif Hakları Sorumluluk Reddi
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
              <p>
                5846 sayılı Fikir ve Sanat Eserleri Kanunu (“FSEK”) ve ilgili telif mevzuatı uyarınca; mekanda halka açık olarak icra edilen ve çalınan müziklerin umuma iletim hakkı, lisanslanması (MESAM, MSG, MÜ-YAP, MÜYOBİR vb. meslek birlikleri izinleri) ve kullanılan üçüncü taraf müzik platformlarının (Spotify vb.) ticari koşullarına uyum sağlama yükümlülüğü <strong className="text-white">TAMAMEN VE MÜNHASIRAN MEKAN İŞLETMECİSİNE AİTTİR</strong>.
              </p>
              <p className="text-xs text-neutral-400">
                Muzikors yazılımı, mekanın yasal izin ve telif sorumluluklarına taraf veya kefil değildir.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              4. Mekanın Yetkisi ve "Vibe Guard" (Tarz Koruması)
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                Her mekan işletmecisi; mekan konseptini, akustik dengesini ve müşteri profilini korumak adına kuyruğa eklenen şarkı isteklerini kabul etme, reddetme veya çalmakta olan bir şarkıyı atlama (skip) mutlak yetkisine sahiptir. Kullanıcı, gönderdiği şarkının mekan yetkilisi tarafından reddedilebileceğini veya atlanabileceğini bilerek sisteme istek gönderir.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              5. VIP Abonelik Modeli (Kredi Satışı Bulunmamaktadır)
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
              <p>
                Muzikors son kullanıcı uygulamasında tekil şarkı kredisi, jeton veya bakiye satışı <strong className="text-white">KESİNLİKLE YAPILMAMAKTADIR</strong>.
              </p>
              <p>
                Kullanıcılara sunulan tek ücretli model <strong className="text-white">"Muzikors VIP / Premium Abonelik"</strong> modelidir. VIP Abonelik; kullanıcılara bekleme süresiz şarkı isteği gönderme, öncelikli sıra hakkı, özel profil amblemleri ve zenginleştirilmiş kişiselleştirme gibi dijital yazılım avantajları sunar.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              6. Google Play Faturalandırma, Otomatik Yenileme ve Cayma Hakkı
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
              <p>
                <strong className="text-white">Google Play In-App Billing:</strong> Tüm VIP Abonelik tahsilatları, faturalandırma ve otomatik yenileme süreçleri doğrudan Google Play Store altyapısı üzerinden yürütülür. Muzikors finansal kart verilerinize hiçbir surette erişemez.
              </p>
              <p>
                <strong className="text-white">Cayma Hakkı ve İade:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca elektronik ortamda anında ifa edilen hizmetlerde tüketici cayma hakkını kullanamaz. VIP Aboneliğinizi geçerli dönemin bitiminden önce Google Play Abonelik Yöneticisi'nden iptal etmeniz halinde aboneliğiniz dönem sonunda yenilenmeyecektir; tahsil edilmiş bedellerin iadesi Google Play Store genel iade kurallarına tabidir.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              7. Yürürlük ve Yetkili Mahkeme
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                İşbu sözleşme Türk Hukuku'na tabidir. Sözleşmenin uygulanmasından doğabilecek her türlü ihtilafta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
              </p>
              <p className="text-xs text-neutral-400">
                Resmi Destek ve İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong>
              </p>
            </div>
          </section>

        </div>

        <div className="text-center pt-6 border-t border-[#D4AF37]/20 text-xs text-amber-200/50 space-y-1">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
          <p>Yasal Bildirim &amp; İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong></p>
        </div>
      </div>
    </div>
  );
}
