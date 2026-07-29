import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Kullanıcı Hizmet Sözleşmesi',
  description: 'Muzikors Kullanıcı Hizmet Sözleşmesi ve Kullanım Şartları.',
};

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#0A0604] text-white flex flex-col items-center p-6 sm:p-12 pt-24 sm:pt-12 font-sans">
      <div className="absolute top-6 left-6 sm:left-12">
        <Link href="/" className="flex items-center gap-2 text-[#D4AF37] hover:text-white transition-colors text-sm font-bold bg-[#1C130D] px-4 py-2 rounded-xl border border-[#D4AF37]/20 hover:border-[#D4AF37]">
          <ArrowLeft className="w-4 h-4" /> Geri
        </Link>
      </div>
      <div className="w-full max-w-4xl bg-[#120C08] border-2 border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-12">
        <div className="text-center border-b border-[#D4AF37]/20 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold gold-gradient-text tracking-tight mb-3">
            Kullanıcı Hizmet Sözleşmesi
          </h1>
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p>Muzikors; bir müzik yayıncısı, internet radyosu veya ses oynatıcısı DEĞİLDİR. Muzikors, yalnızca Mekan ile Müşteri arasında müzik tercihlerinin iletilmesini sağlayan dijital bir istek panosu ve oylama arayüzüdür. 5846 sayılı FSEK uyarınca, mekanda çalınan müziklerin umuma iletim hakkı, lisanslanması (MESAM, MSG vb.) ve kullanılan üçüncü taraf müzik platformlarının (Spotify vb.) ticari kullanım şartlarına uyum sorumluluğu TAMAMEN MEKAN SAHİBİNE AİTTİR. Kullanıcı, her Mekan'ın 'Vibe Guard' (Tarz Koruması) çerçevesinde şarkıları atlama (skip) yetkisi bulunduğunu bilir. Bu durumda harcanan Krediler tükenmiş sayılır ve KESİNLİKLE İADE YAPILMAZ.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
