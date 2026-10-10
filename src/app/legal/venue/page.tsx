import React from 'react';
import Link from 'next/link';
import { LegalLayout, LegalSection, B } from '../../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - Mekan Hizmet Sözleşmesi',
  description: 'Muzikors mekan (kafe, restoran, bar) hizmet koşulları: kurulum ve abonelik ücretleri, müzik yayın lisansı yükümlülükleri ve fesih şartları.',
};

const SETUP_FEE_PER_TABLE = 125;
const TRIAL_MONTHS = 6;
const ANNUAL_FEE = 5000;

export default function VenueTermsPage() {
  return (
    <LegalLayout
      title="Mekan Hizmet Sözleşmesi"
      subtitle="Kafe, restoran, bar ve benzeri işletmeler için Muzikors kurulum, abonelik ve müzik yayın lisansı koşulları"
      updated="10.10.2026"
    >
      <LegalSection title="1. Taraflar ve Sözleşmenin Konusu">
        <p>
          İşbu sözleşme; Muzikors (&ldquo;Muzikors&rdquo;) ile Muzikors mekan sistemini (masa QR kodları, şarkı istek ve oylama ekranı, Kafe Paneli) işletmesinde kullanan işletmeci (&ldquo;Mekan&rdquo;) arasındaki hizmet ilişkisini düzenler.
        </p>
        <p>
          Mekan, başvuru formunda veya Kafe Panelinde bu sözleşmeyi onay kutusunu işaretleyerek kabul eder. Bu sözleşme ticari (işletmeler arası) bir sözleşmedir.
        </p>
      </LegalSection>

      <LegalSection title="2. Hizmetin Kapsamı">
        <p>
          Muzikors; müşterilerin masadaki QR kod üzerinden şarkı istemesini ve oylamasını, Mekanın ise bu istekleri Kafe Panelinden yönetmesini (Vibe Guard tür filtresi, şarkı atlama, menü ve Wi-Fi ekranı) sağlayan bir yazılım hizmetidir.
        </p>
        <p>
          <B>Muzikors bir müzik yayıncısı veya müzik akış (streaming) servisi değildir.</B> Müzik, Mekanın kendi ses sisteminde ve Mekanın bağladığı müzik hesabı üzerinden çalınır.
        </p>
      </LegalSection>

      <LegalSection title="3. Ücretler ve Ödeme">
        <p>
          <B>Kurulum:</B> Masa başı {SETUP_FEE_PER_TABLE} TL (KDV dahil), tek seferliktir. Masa sayısı kadar akrilik QR stant bu ücrete dahildir. Sonradan eklenen masalar için de masa başı aynı ücret uygulanır.
        </p>
        <p>
          <B>Ücretsiz dönem:</B> Kurulum ödemesinin alınıp hizmetin açıldığı tarihten itibaren ilk {TRIAL_MONTHS} ay abonelik ücreti alınmaz.
        </p>
        <p>
          <B>Yıllık abonelik:</B> Ücretsiz dönemin bitiminden itibaren abonelik bedeli yıllık {ANNUAL_FEE.toLocaleString('tr-TR')} TL&apos;dir ve her yıl peşin ödenir. Aylık aidat yoktur. Muzikors, yeni fiyatları en az 30 gün önceden bildirmek kaydıyla bir sonraki yenileme döneminden itibaren güncelleyebilir.
        </p>
        <p>
          Ödemeler havale/EFT ile alınır. Abonelik bitiş tarihinden sonra 3 günlük tolerans süresi tanınır; bu sürede yenileme yapılmazsa şarkı istekleri durdurulur.
        </p>
        <p className="text-[14px] text-white/55">Kurulum ücreti, Mekana özel QR stantların üretimine başlanmasından sonra iade edilmez.</p>
      </LegalSection>

      <LegalSection title="4. Müzik Yayın Lisansı ve Telif Sorumluluğu">
        <p>
          5846 sayılı Fikir ve Sanat Eserleri Kanunu uyarınca, işletmede halka açık müzik yayını için ilgili meslek birliklerinden lisans alınması zorunludur. Bu lisanslar başlıca <B>MESAM ve MSG</B> (eser sahipleri), <B>MÜ-YAP</B> (fonogram yapımcıları) ve <B>MÜYORBİR</B> (icracı sanatçılar) tarafından verilir.
        </p>
        <p>
          Mekan, sözleşme süresi boyunca geçerli müzik yayın lisanslarına sahip olmayı, lisans belgelerini başvuruda ve her yenilemede Muzikors&apos;a iletmeyi kabul eder. <B>Muzikors, lisansı olmayan veya lisansının süresi dolmuş mekanlara hizmet vermez</B>; lisansın sona ermesi halinde hizmeti askıya alabilir ve aboneliği yenilemez.
        </p>
        <p>
          Mekanda çalınan müziklerin umuma iletim lisansları ile Mekanın kullandığı üçüncü taraf müzik servislerinin (örneğin Spotify) kullanım koşullarına uyum sorumluluğu Mekana aittir. Bu yükümlülüklere aykırılık nedeniyle Muzikors&apos;a yöneltilecek talepler Mekana rücu edilir.
        </p>
      </LegalSection>

      <LegalSection title="5. Mekanın Yükümlülükleri">
        <p>
          Mekan; başvuruda verdiği bilgilerin doğru olduğunu, Kafe Paneli giriş bilgilerini üçüncü kişilerle paylaşmayacağını ve sistemi hukuka ve genel ahlaka uygun şekilde kullanacağını kabul eder. Uygunsuz içerikli istekleri Vibe Guard ve şarkı atlama araçlarıyla yönetmek Mekanın takdirindedir.
        </p>
      </LegalSection>

      <LegalSection title="6. Askıya Alma, Fesih ve Hizmet Değişiklikleri">
        <p>
          Taraflardan her biri, abonelik döneminin sonunda yenilememek suretiyle sözleşmeyi sona erdirebilir. Muzikors; ödeme yapılmaması, lisansın sona ermesi veya sistemin kötüye kullanılması halinde hizmeti askıya alabilir.
        </p>
        <p>
          Muzikors&apos;un çalışması, Mekanın bağladığı üçüncü taraf müzik servislerinin teknik erişimine bağlıdır. Bu servislerin erişimi kalıcı olarak kısıtlaması ve Muzikors&apos;un makul sürede alternatif sunamaması halinde, Muzikors peşin ödenmiş yıllık ücretin kullanılmayan süreye isabet eden kısmını iade eder veya süreyi uzatır.
        </p>
      </LegalSection>

      <LegalSection title="7. Kişisel Veriler">
        <p>
          Mekan yetkilisine ait iletişim bilgileri, hizmetin kurulması, faturalandırma ve destek amaçlarıyla 6698 sayılı KVKK&apos;ya uygun olarak işlenir. Ayrıntılar için{' '}
          <Link href="/privacy" className="text-white underline underline-offset-2">
            KVKK ve Gizlilik Politikası
          </Link>
          &apos;na bakınız.
        </p>
      </LegalSection>

      <LegalSection title="8. Uygulanacak Hukuk ve Yetkili Mahkeme">
        <p>İşbu sözleşme Türk Hukuku&apos;na tabidir. Uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.</p>
      </LegalSection>
    </LegalLayout>
  );
}
