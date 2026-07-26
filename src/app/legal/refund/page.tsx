import React from 'react';

export const metadata = {
  title: 'Muzikors - İptal ve İade Koşulları',
  description: 'Muzikors İptal ve İade Koşulları.',
};

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-[#0A0604] text-white flex flex-col items-center p-6 sm:p-12 font-sans">
      <div className="w-full max-w-4xl bg-[#120C08] border-2 border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-12">
        <div className="text-center border-b border-[#D4AF37]/20 pb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold gold-gradient-text tracking-tight mb-3">
            İptal ve İade Koşulları
          </h1>
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          <section className="space-y-4">
            <div className="bg-[#1C130D] rounded-2xl p-6 border border-[#D4AF37]/10">
              <p>
                6502 Sayılı Tüketicinin Korunması Hakkında Kanun uyarınca, elektronik ortamda anında ifa edilen hizmetler
                ve tüketiciye anında teslim edilen gayrimaddi mallar (dijital içerikler ve krediler) cayma hakkının istisnaları kapsamındadır.
                Bu nedenle satın alınan krediler ve şarkı istekleri için iptal/iade hakkı bulunmamaktadır.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
