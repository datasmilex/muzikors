import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - İptal ve İade Koşulları',
  description: 'Muzikors İptal ve İade Koşulları.',
};

export default function RefundPage() {
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
            İptal ve İade Koşulları
          </h1>
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p>Muzikors altyapısı üzerinden satın alınan 'Krediler', tamamen dijital ortamda üretilen ve anında tüketilebilen gayrimaddi varlıklardır. 6502 sayılı Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca elektronik ortamda anında ifa edilen hizmetlerde tüketici cayma hakkını kullanamaz. Vibe Guard mekanizması veya Mekan yetkilisinin takdiri doğrultusunda reddedilen, silinen veya atlanan şarkılar için harcanan Krediler kesinlikle iade edilmez.</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
