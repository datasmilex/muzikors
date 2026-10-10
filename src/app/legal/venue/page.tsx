import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Mekan Hizmet Sözleşmesi',
  description: 'Muzikors mekan (kafe, restoran, bar) hizmet koşulları: kurulum ve abonelik ücretleri, müzik yayın lisansı yükümlülükleri ve fesih şartları.',
};

const SETUP_FEE_PER_TABLE = 125;
const TRIAL_MONTHS = 6;
const ANNUAL_FEE = 5000;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-[#E5A93C] flex items-center gap-2">
      <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
      {title}
    </h2>
    <div className="bg-[#1C130D]/80 backdrop-blur-md rounded-[1.5rem] p-6 border border-[#D4AF37]/20 space-y-3">
      {children}
    </div>
  </section>
);

export default function VenueTermsPage() {
  return (
    <div className="relative min-h-screen bg-[#120C08] text-white flex flex-col items-center p-6 sm:p-12 pt-24 sm:pt-12 font-sans overflow-hidden">
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
            Mekan Hizmet Sözleşmesi
          </h1>
          <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
            Kafe, restoran, bar ve benzeri işletmeler için Muzikors kurulum, abonelik ve müzik yayın lisansı koşulları
          </p>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-50" />
        </div>

        <div className="space-y-8 text-amber-200/80 leading-relaxed text-sm sm:text-base font-medium">

          <Section title="1. Taraflar ve Sözleşmenin Konusu">
            <p>
              İşbu sözleşme; Muzikors (&ldquo;Muzikors&rdquo;) ile Muzikors mekan sistemini (masa QR kodları, şarkı istek ve oylama ekranı, Kafe Paneli) işletmesinde kullanan işletmeci (&ldquo;Mekan&rdquo;) arasındaki hizmet ilişkisini düzenler.
            </p>
            <p>
              Mekan, başvuru formunda veya Kafe Panelinde bu sözleşmeyi onay kutusunu işaretleyerek kabul eder. Bu sözleşme ticari (işletmeler arası) bir sözleşmedir.
            </p>
          </Section>

          <Section title="2. Hizmetin Kapsamı">
            <p>
              Muzikors; müşterilerin masadaki QR kod üzerinden şarkı istemesini ve oylamasını, Mekanın ise bu istekleri Kafe Panelinden yönetmesini (Vibe Guard tür filtresi, şarkı atlama, menü ve Wi-Fi ekranı) sağlayan bir yazılım hizmetidir.
            </p>
            <p>
              <strong className="text-white">Muzikors bir müzik yayıncısı veya müzik akış (streaming) servisi değildir.</strong> Müzik, Mekanın kendi ses sisteminde ve Mekanın bağladığı müzik hesabı üzerinden çalınır.
            </p>
          </Section>

          <Section title="3. Ücretler ve Ödeme">
            <p>
              <strong className="text-white">Kurulum:</strong> Masa başı {SETUP_FEE_PER_TABLE} TL (KDV dahil), tek seferliktir. Masa sayısı kadar akrilik QR stant bu ücrete dahildir. Sonradan eklenen masalar için de masa başı aynı ücret uygulanır.
            </p>
            <p>
              <strong className="text-white">Ücretsiz dönem:</strong> Kurulum ödemesinin alınıp hizmetin açıldığı tarihten itibaren ilk {TRIAL_MONTHS} ay abonelik ücreti alınmaz.
            </p>
            <p>
              <strong className="text-white">Yıllık abonelik:</strong> Ücretsiz dönemin bitiminden itibaren abonelik bedeli yıllık {ANNUAL_FEE.toLocaleString('tr-TR')} TL&apos;dir ve her yıl peşin ödenir. Aylık aidat yoktur. Muzikors, yeni fiyatları en az 30 gün önceden bildirmek kaydıyla bir sonraki yenileme döneminden itibaren güncelleyebilir.
            </p>
            <p>
              Ödemeler havale/EFT ile alınır. Abonelik bitiş tarihinden sonra 3 günlük tolerans süresi tanınır; bu sürede yenileme yapılmazsa şarkı istekleri durdurulur.
            </p>
            <p className="text-xs text-neutral-400">
              Kurulum ücreti, Mekana özel QR stantların üretimine başlanmasından sonra iade edilmez.
            </p>
          </Section>

          <Section title="4. Müzik Yayın Lisansı ve Telif Sorumluluğu">
            <p>
              5846 sayılı Fikir ve Sanat Eserleri Kanunu uyarınca, işletmede halka açık müzik yayını için ilgili meslek birliklerinden lisans alınması zorunludur. Bu lisanslar başlıca <strong className="text-white">MESAM ve MSG</strong> (eser sahipleri), <strong className="text-white">MÜ-YAP</strong> (fonogram yapımcıları) ve <strong className="text-white">MÜYORBİR</strong> (icracı sanatçılar) tarafından verilir.
            </p>
            <p>
              Mekan, sözleşme süresi boyunca geçerli müzik yayın lisanslarına sahip olmayı, lisans belgelerini başvuruda ve her yenilemede Muzikors&apos;a iletmeyi kabul eder. <strong className="text-white">Muzikors, lisansı olmayan veya lisansının süresi dolmuş mekanlara hizmet vermez</strong>; lisansın sona ermesi halinde hizmeti askıya alabilir ve aboneliği yenilemez.
            </p>
            <p>
              Mekanda çalınan müziklerin umuma iletim lisansları ile Mekanın kullandığı üçüncü taraf müzik servislerinin (örneğin Spotify) kullanım koşullarına uyum sorumluluğu Mekana aittir. Bu yükümlülüklere aykırılık nedeniyle Muzikors&apos;a yöneltilecek talepler Mekana rücu edilir.
            </p>
          </Section>

          <Section title="5. Mekanın Yükümlülükleri">
            <p>
              Mekan; başvuruda verdiği bilgilerin doğru olduğunu, Kafe Paneli giriş bilgilerini üçüncü kişilerle paylaşmayacağını ve sistemi hukuka ve genel ahlaka uygun şekilde kullanacağını kabul eder. Uygunsuz içerikli istekleri Vibe Guard ve şarkı atlama araçlarıyla yönetmek Mekanın takdirindedir.
            </p>
          </Section>

          <Section title="6. Askıya Alma, Fesih ve Hizmet Değişiklikleri">
            <p>
              Taraflardan her biri, abonelik döneminin sonunda yenilememek suretiyle sözleşmeyi sona erdirebilir. Muzikors; ödeme yapılmaması, lisansın sona ermesi veya sistemin kötüye kullanılması halinde hizmeti askıya alabilir.
            </p>
            <p>
              Muzikors&apos;un çalışması, Mekanın bağladığı üçüncü taraf müzik servislerinin teknik erişimine bağlıdır. Bu servislerin erişimi kalıcı olarak kısıtlaması ve Muzikors&apos;un makul sürede alternatif sunamaması halinde, Muzikors peşin ödenmiş yıllık ücretin kullanılmayan süreye isabet eden kısmını iade eder veya süreyi uzatır.
            </p>
          </Section>

          <Section title="7. Kişisel Veriler">
            <p>
              Mekan yetkilisine ait iletişim bilgileri, hizmetin kurulması, faturalandırma ve destek amaçlarıyla 6698 sayılı KVKK&apos;ya uygun olarak işlenir. Ayrıntılar için{' '}
              <Link href="/privacy" className="text-[#D4AF37] underline underline-offset-2">KVKK ve Gizlilik Politikası</Link>&apos;na bakınız.
            </p>
          </Section>

          <Section title="8. Uygulanacak Hukuk ve Yetkili Mahkeme">
            <p>
              İşbu sözleşme Türk Hukuku&apos;na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
            </p>
            <p className="text-xs text-neutral-400">
              Resmi Destek ve İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong> · Son güncelleme: 10.10.2026
            </p>
          </Section>

        </div>

        <div className="text-center pt-6 border-t border-[#D4AF37]/20 text-xs text-amber-200/50 space-y-1">
          <p>© {new Date().getFullYear()} Muzikors. Tüm hakları saklıdır.</p>
          <p>Yasal Bildirim &amp; İletişim: <strong className="text-[#D4AF37]">destek@muzikors.com</strong></p>
        </div>
      </div>
    </div>
  );
}
