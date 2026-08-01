import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Kullanıcı Hizmet Sözleşmesi',
  description: 'Muzikors Kullanıcı Hizmet Sözleşmesi ve Kullanım Şartları.',
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#120C08] text-white flex flex-col items-center p-6 sm:p-12 pt-24 sm:pt-12 font-sans overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-[#120C08]/5 to-transparent pointer-events-none" />

      <div className="absolute top-6 left-6 sm:left-12 z-20">
        <Link href="/" className="flex items-center gap-2 text-[#D4AF37] active:text-white transition-all text-sm font-black bg-white/5 px-4 py-2.5 rounded-[1rem] border border-white/10 active:border-[#D4AF37]/50 active:bg-white/10 backdrop-blur-md shadow-lg active:scale-95 group">
          <ArrowLeft className="w-4 h-4 group-active:-translate-x-1 transition-transform" /> Geri Dön
        </Link>
      </div>

      <div className="w-full max-w-4xl glass-panel-gold rounded-[2.5rem] p-8 sm:p-12 shadow-[0_20px_50px_rgba(212,175,55,0.15)] space-y-12 relative z-10">
        <div className="text-center border-b border-[#D4AF37]/20 pb-8 relative">
          <h1 className="text-3xl sm:text-4xl font-black gold-gradient-text tracking-tight mb-3 drop-shadow-md">
            Kullanıcı Hizmet Sözleşmesi
          </h1>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          <section className="space-y-4">
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-8 border border-[#D4AF37]/20 shadow-inner">
              <p>Muzikors; bir müzik yayıncısı, internet radyosu veya ses oynatıcısı DEĞİLDİR. Muzikors, yalnızca Mekan ile Müşteri arasında müzik tercihlerinin iletilmesini sağlayan dijital bir istek panosu ve oylama arayüzüdür. 5846 sayılı FSEK uyarınca, mekanda çalınan müziklerin umuma iletim hakkı, lisanslanması (MESAM, MSG vb.) ve kullanılan üçüncü taraf müzik platformlarının (Spotify vb.) ticari kullanım şartlarına uyum sorumluluğu TAMAMEN MEKAN SAHİBİNE AİTTİR. Kullanıcı, her Mekan'ın 'Vibe Guard' (Tarz Koruması) çerçevesinde şarkıları atlama (skip) yetkisi bulunduğunu bilir. Bu durumda harcanan Krediler tükenmiş sayılır ve KESİNLİKLE İADE YAPILMAZ.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
