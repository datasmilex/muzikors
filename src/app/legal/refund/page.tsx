import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - İptal ve İade Koşulları',
  description: 'Muzikors İptal ve İade Koşulları.',
};

export default function RefundPage() {
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
            İptal ve İade Koşulları
          </h1>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          <section className="space-y-4">
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-8 border border-[#D4AF37]/20 shadow-inner space-y-6 text-sm text-gray-300">
              <h2 className="text-xl font-bold text-[#D4AF37] mb-2">1. İPTAL KOŞULLARI</h2>
              <p>
                Kullanıcılar (ALICI), satın alma işlemini onaylamadan önce sepetlerindeki kredi paketlerini istedikleri zaman iptal edebilirler. Ancak, ödeme işlemi tamamlandıktan ve kredi paketi dijital ortamda hesaba tanımlandıktan sonra siparişin iptali mümkün değildir.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">2. İADE KOŞULLARI VE CAYMA HAKKI İSTİSNASI</h2>
              <p>
                Muzikors altyapısı üzerinden satın alınan "Krediler", tamamen dijital ortamda üretilen, hesaba anında tanımlanan ve anında ifa edilen gayrimaddi varlıklardır.
                <br /><br />
                <strong>Cayma Hakkı:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, "Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler" cayma hakkının istisnaları arasındadır. Bu nedenle satın alınan dijital kredi paketlerinde iade veya değişim yapılamaz.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">3. HİZMETİN KULLANILAMAMASI DURUMUNDA İADE</h2>
              <p>
                Kullanıcının satın aldığı krediler hesabına teknik bir aksaklık sebebiyle yansımazsa veya platformdan kaynaklı sistemsel bir hata nedeniyle tamamen kullanılamaz hale gelirse, kullanıcı 14 gün içerisinde <strong>destek@muzikors.com</strong> adresi üzerinden inceleme talep edebilir. Yapılan inceleme sonucunda teknik bir kusur tespit edilirse, harcanamayan tutarın iadesi, işlemin yapıldığı kredi kartına 7-14 iş günü içerisinde yapılır.
              </p>
              
              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">4. KULLANICI HATALARI</h2>
              <p>
                Mekan kurallarına uymayan, Vibe Guard mekanizması tarafından reddedilen veya mekan yetkilisinin takdiri doğrultusunda uygun görülmeyerek atlanan/silinen şarkılar için harcanan Krediler kesinlikle iade edilmez. Bu risk ve sorumluluk tamamen ALICI'ya aittir.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
