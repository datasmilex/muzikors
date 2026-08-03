import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Mesafeli Satış Sözleşmesi',
  description: 'Muzikors Mesafeli Satış Sözleşmesi.',
};

export default function SalesPage() {
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
            Mesafeli Satış Sözleşmesi
          </h1>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>
        <div className="space-y-10 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">
          <section className="space-y-4">
            <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-8 border border-[#D4AF37]/20 shadow-inner space-y-6 text-sm text-gray-300">
              <h2 className="text-xl font-bold text-[#D4AF37] mb-2">1. TARAFLAR</h2>
              <p>
                <strong>SATICI:</strong><br />
                Unvan: Muzikors Bilişim Teknolojileri<br />
                E-posta: destek@muzikors.com<br />
              </p>
              <p>
                <strong>ALICI:</strong><br />
                Muzikors uygulamasını veya web sitesini kullanan, uygulama üzerinden kredi paketi satın alan son kullanıcıdır.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">2. SÖZLEŞMENİN KONUSU</h2>
              <p>
                İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait Muzikors platformu üzerinden elektronik ortamda siparişini yaptığı, özellikleri ve satış fiyatı platformda belirtilen dijital kredi paketinin satışı ve teslimi ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanmasıdır.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">3. HİZMETİN TESLİMİ VE KULLANIMI</h2>
              <p>
                Satın alınan kredi paketleri (tamamen dijital bir ürün olup) ödeme işleminin başarıyla gerçekleşmesinin hemen ardından ALICI'nın Muzikors platformundaki hesabına anlık olarak tanımlanır. Krediler yalnızca Muzikors platformuna dahil olan anlaşmalı mekanlarda şarkı isteğinde bulunmak amacıyla kullanılabilir.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">4. CAYMA HAKKI VE İSTİSNALAR</h2>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde <strong>CAYMA HAKKI KULLANILAMAZ</strong>. ALICI, satın aldığı kredi paketinin dijital bir içerik olduğunu, hesabına tanımlandığı anda ifanın gerçekleştiğini ve bu nedenle cayma ve iade hakkı bulunmadığını peşinen kabul eder.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">5. GENEL HÜKÜMLER</h2>
              <p>
                5.1. ALICI, platformda belirtilen temel özellikleri, satış fiyatı, ödeme şekli ile teslimata ilişkin ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini kabul eder.<br />
                5.2. SATICI, hizmetin eksiksiz ve siparişte belirtilen niteliklere uygun olarak sunulmasından sorumludur.<br />
                5.3. Sistemsel hatalardan dolayı meydana gelen fiyat yanlışlıklarından SATICI sorumlu değildir.
              </p>

              <h2 className="text-xl font-bold text-[#D4AF37] mt-6 mb-2">6. UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
              <p>
                İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl ilan edilen parasal sınırlar dâhilinde ALICI'nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri veya Tüketici Mahkemeleri yetkilidir.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
