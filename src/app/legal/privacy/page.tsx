import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Gizlilik ve KVKK Politikası',
  description: 'Muzikors 6698 Sayılı KVKK Aydınlatma Metni, Açık Rıza ve Gizlilik İlkeleri.',
};

export default function PrivacyPage() {
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
            Gizlilik ve KVKK Politikası
          </h1>
          <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
            Muzikors B2B SaaS Platformu 6698 Sayılı Kanun Uyarınca Kişisel Verilerin İşlenmesi ve Korunması Bildirimi
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>

        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              1. Veri Sorumlusu ve Kapsam
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                Muzikors B2B SaaS Platformu (“Muzikors”) olarak; kullanıcılarımızın kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ikincil mevzuata tam uyumla işlemekteyiz.
              </p>
              <p className="text-xs text-neutral-400">
                Resmi İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong> | Web: https://muzikors.com.tr
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              2. İşlenen Veriler ve Finansal Güvenlik
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
              <ul className="list-disc list-inside space-y-1.5 text-neutral-300">
                <li><strong className="text-white">Kimlik/Oturum:</strong> Google ile oturum açma kapsamında ad, soyad, e-posta adresi ve profil resmi URI'si.</li>
                <li><strong className="text-white">Cihaz/Ağ:</strong> IP adresi, cihaz modeli, OS sürümü ve Firebase bildirim belirteci (FCM token).</li>
                <li><strong className="text-white">Mekan &amp; İstek Geçmişi:</strong> Bağlanılan mekan (check-in), şarkı arama ve istek geçmişi, oylama tercihleri.</li>
                <li><strong className="text-white">Anlık Konum:</strong> Yalnızca kullanıcının kafede olup olmadığını doğrulamak (Vibe Guard) ve yakındaki kafeleri listelemek için anlık sorgulanır. Sürekli arka plan takibi yapılmaz.</li>
                <li><strong className="text-white">Abonelik Durumu:</strong> Muzikors VIP / Premium abonelik statüsü ve Google Play Sipariş Numarası.</li>
              </ul>
              <div className="p-3.5 rounded-xl bg-black/60 border border-amber-500/20 text-xs sm:text-sm text-neutral-300">
                <strong className="text-[#E5A93C] block mb-1">Abonelik &amp; Ödeme Güvencesi:</strong>
                Muzikors platformunda kesinlikle kredi veya jeton satışı yapılmamaktadır. Kredi kartı ve hassas banka bilgileri Muzikors tarafından hiçbir biçimde toplanmaz ve barındırılmaz. Tüm ödemeler ve abonelikler doğrudan Google Play In-App Billing güvencesiyle işlenir.
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              3. Açık Rıza ve Bulut Veri Güvenliği
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
              <p>
                Kullanıcı; verilerinin global ölçekte yüksek güvenlik standartlarına (SOC2, ISO 27001) sahip Supabase (AWS) bulut altyapısında saklanmasına, işlenmesine ve yurt dışı sunucu aktarımlarına özgür iradesiyle açık rıza göstermektedir.
              </p>
              <p>
                Şarkı sırası ve mekan duyuruları Google Firebase Cloud Messaging (FCM) üzerinden anlık bildirim olarak ulaştırılır. Kişisel veriler hiçbir surette ticari amaçlarla üçüncü şahıslara veya reklamcılara satılmaz.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              4. Donanım İzinleri ve Çerezler
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                Kamera erişimi sadece kafedeki masada bulunan Muzikors QR kodunu okutmak için anlık kullanılır; görüntü kaydı tutulmaz. LocalStorage teknolojisi yalnızca teknik oturum devamlılığı ve tema tercihlerini hatırlamak için zorunlu olarak kullanılır.
              </p>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              5. Haklarınız (KVKK Madde 11) ve Hesap Silme
            </h2>
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-2">
              <p>
                Kullanıcılar, uygulama içerisindeki <strong className="text-white">Profil &gt; Profili Düzenle &gt; Hesabımı Sil</strong> butonunu kullanarak veya <strong className="text-[#D4AF37]">destek@muzikors.com</strong> adresine talep ileterek hesaplarını ve tüm verilerini derhal ve kalıcı olarak sildirebilirler.
              </p>
            </div>
          </section>

        </div>

        <div className="text-center pt-6 border-t border-[#D4AF37]/20 text-xs text-amber-200/50 space-y-1">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
          <p>Yasal Başvuru &amp; Destek: <strong className="text-[#D4AF37]">destek@muzikors.com</strong></p>
        </div>
      </div>
    </div>
  );
}
