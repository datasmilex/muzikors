import React from 'react';

export const metadata = {
  title: 'Muzikors - Gizlilik Politikası ve Şartlar',
  description: 'Muzikors KVKK, Açık Rıza, Çerez Politikası ve Hizmet Koşulları metinleri.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0604] text-white flex flex-col items-center p-6 sm:p-12 font-sans">
      <div className="w-full max-w-4xl bg-[#120C08] border-2 border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-12">
        
        {/* Header */}
        <div className="text-center border-b border-[#D4AF37]/20 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold gold-gradient-text tracking-tight mb-3">
            Muzikors Gizlilik Politikası ve Şartlar
          </h1>
          <p className="text-amber-200/70 text-sm">
            Hizmetlerimizi kullanmadan önce lütfen aşağıdaki yasal metinleri dikkatlice okuyunuz.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          
          {/* KVKK */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">KVKK Aydınlatma Metni</h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <ul className="space-y-4">
                <li><strong className="text-white">Veri Sorumlusu:</strong> Muzikors B2B SaaS Platformu.</li>
                <li><strong className="text-white">İşlenen Veriler:</strong> IP adresi, cihaz bilgisi, Spotify hesabı kamuya açık kullanıcı kimliği, mekân içi şarkı istek geçmişi.</li>
                <li><strong className="text-white">Veri İşleme Amacı:</strong> İnteraktif müzik kuyruğu yönetimi, güvenli oturum doğrulama ve mekân içi sıralama hizmeti sunulması.</li>
                <li><strong className="text-white">Haklar (KVKK Madde 11):</strong> Kullanıcı profili ayarlarından "Hesabı Sil" özelliğini kullanarak tüm verilerini dilediği an silme hakkına sahiptir.</li>
              </ul>
            </div>
          </section>

          {/* Consent */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">Açık Rıza Metni</h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p>
                Kullanıcı, Muzikors platformunda hesabını oluştururken ve hizmeti kullanırken; kişisel verilerinin ve oturum bilgilerinin yüksek güvenlik standartlarına sahip bulut veritabanı altyapısında (Supabase) saklanmasına, işlenmesine ve yurt dışı sunucu aktarımlarına özgür iradesiyle açık rıza göstermektedir.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">Çerez Politikası</h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p className="mb-4">
                Muzikors, oturum durumunun korunması, Spotify API erişim jetonlarının (tokens) güvenliği ve kullanıcı tercihlerinin hatırlanması amacıyla zorunlu teknik çerezler ve localStorage (yerel depolama) teknolojileri kullanmaktadır.
              </p>
              <p>
                Bu çerezler reklam/pazarlama amacıyla kullanılmaz ve üçüncü şahıslara satılmaz.
              </p>
            </div>
          </section>

          {/* Terms */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">Hizmet Koşulları & İade Politikası</h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p className="mb-4">
                Yüklenen krediler telifli içerik satın alma ücreti değil, mekân içi müzik kuyruğundaki "Sıralama Önceliği Yazılım Bedeli"dir.
              </p>
              <p>
                Dijital hizmet anında ifa edildiğinden bakiye ve kredi harcamaları iade edilemez.
              </p>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center pt-10 border-t border-[#D4AF37]/20 text-[11px] text-amber-200/40">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
        </div>

      </div>
    </div>
  );
}
