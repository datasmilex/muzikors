import React from 'react';

export const metadata = {
  title: 'Muzikors - Hesap ve Veri Silme Talebi',
  description: 'Muzikors uygulamasındaki hesabınızı ve tüm verilerinizi nasıl sileceğinize dair bilgilendirme.',
};

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-[#0A0604] text-white flex flex-col items-center p-6 sm:p-12 font-sans">
      <div className="w-full max-w-3xl bg-[#120C08] border-2 border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-[#D4AF37]/20 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold gold-gradient-text tracking-tight mb-2">
            Muzikors - Hesap ve Veri Silme Talebi
          </h1>
          <p className="text-amber-200/70 text-sm">
            Kişisel verileriniz ve hesap güvenliğiniz bizim için önemlidir.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          <p>
            Muzikors uygulamasındaki hesabınızı ve tüm verilerinizi iki farklı yöntemle silebilirsiniz:
          </p>

          <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full gold-gradient-bg"></div>
            <h2 className="text-lg font-bold text-[#E5A93C] mb-3">Yöntem 1 (Uygulama İçi - Anında)</h2>
            <p>
              Muzikors mobil uygulaması veya web arayüzü içerisinden <strong>Profil -&gt; Ayarlar -&gt; Hesabı Sil</strong> adımlarını takip ederek hesabınızı, bakiye geçmişinizi ve tüm verilerinizi Supabase veritabanımızdan kalıcı olarak ve anında silebilirsiniz.
            </p>
          </div>

          <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
            <h2 className="text-lg font-bold text-blue-400 mb-3">Yöntem 2 (E-posta ile Talep)</h2>
            <p>
              Uygulama cihazınızda yüklü değilse, kayıtlı e-posta adresiniz üzerinden 
              <a href="mailto:destek@muzikors.com.tr" className="text-[#D4AF37] font-semibold mx-1 active:underline">destek@muzikors.com.tr</a> 
              adresine <strong>"Hesabımın Silinmesi"</strong> konu başlığıyla e-posta göndererek veri silme talebinde bulunabilirsiniz. Talebiniz en geç 24 saat içerisinde işleme alınacaktır.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#D4AF37]/20 text-[11px] text-amber-200/40">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
        </div>

      </div>
    </div>
  );
}
