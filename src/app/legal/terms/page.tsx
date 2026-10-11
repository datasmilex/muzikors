import React from 'react';
import { LegalLayout, LegalSection, B } from '../../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - Kullanıcı Hizmet Sözleşmesi ve VIP Abonelik Koşulları',
  description: 'Muzikors Kullanıcı Hizmet Sözleşmesi, FSEK Telif Hakları Sorumluluk Reddi ve VIP Abonelik Şartları.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Kullanıcı Hizmet Sözleşmesi"
      subtitle="Muzikors Platformu Kullanım Şartları, FSEK Telif Hakları Sorumluluk Reddi ve VIP Abonelik Koşulları"
    >
      <LegalSection title="1. Taraflar ve Sözleşmenin Konusu">
        <p>
          İşbu sözleşme; Muzikors B2B SaaS Platformu (“Muzikors”) ile Muzikors mobil uygulamasını veya web platformunu kullanan son kullanıcı (“Kullanıcı”) arasında elektronik ortamda akdedilmiştir. Kullanıcı, uygulamaya giriş yaparak bu sözleşmedeki şartları peşinen kabul etmiş sayılır.
        </p>
      </LegalSection>

      <LegalSection title="2. Hizmetin Tanımı ve Hukuki Statüsü">
        <p>
          <B>Muzikors Bir Müzik Yayımcısı Değildir:</B> Muzikors; bir radyo, ses dosyası barındırıcısı, müzik yapımcısı veya ses akış (streaming) sağlayıcısı DEĞİLDİR. Muzikors, yalnızca anlaşmalı mekan müşterisi ile mekanın ses yürütücüsü arasında şarkı tercihlerinin, oylarının ve sıralamasının iletilmesini sağlayan bir dijital B2B SaaS istek panosu yazılımıdır.
        </p>
      </LegalSection>

      <LegalSection title="3. 5846 Sayılı FSEK Telif Hakları Sorumluluk Reddi">
        <p>
          5846 sayılı Fikir ve Sanat Eserleri Kanunu (“FSEK”) ve ilgili telif mevzuatı uyarınca; mekanda halka açık olarak icra edilen ve çalınan müziklerin umuma iletim hakkı, lisanslanması (MESAM, MSG, MÜ-YAP, MÜYORBİR vb. meslek birlikleri izinleri) ve kullanılan üçüncü taraf müzik platformlarının (Spotify vb.) ticari koşullarına uyum sağlama yükümlülüğü <B>TAMAMEN VE MÜNHASIRAN MEKAN İŞLETMECİSİNE AİTTİR</B>.
        </p>
        <p className="text-[14px] text-white/55">Muzikors yazılımı, mekanın yasal izin ve telif sorumluluklarına taraf veya kefil değildir.</p>
      </LegalSection>

      <LegalSection title={'4. Mekanın Yetkisi ve "Vibe Guard" (Tarz Koruması)'}>
        <p>
          Her mekan işletmecisi; mekan konseptini, akustik dengesini ve müşteri profilini korumak adına kuyruğa eklenen şarkı isteklerini kabul etme, reddetme veya çalmakta olan bir şarkıyı atlama (skip) mutlak yetkisine sahiptir. Kullanıcı, gönderdiği şarkının mekan yetkilisi tarafından reddedilebileceğini veya atlanabileceğini bilerek sisteme istek gönderir. Mekanın tarzı dışında kalan istekler mekan onayına düşebilir; mekanın onaylamadığı, süresi içinde karar vermediği veya sıradan çıkardığı istekler için kullanıcının şarkı hakkı iade edilir.
        </p>
      </LegalSection>

      <LegalSection title="5. VIP Abonelik Modeli (Kredi Satışı Bulunmamaktadır)">
        <p>
          Muzikors son kullanıcı uygulamasında tekil şarkı kredisi, jeton veya bakiye satışı <B>KESİNLİKLE YAPILMAMAKTADIR</B>.
        </p>
        <p>
          Kullanıcılara sunulan tek ücretli model <B>&quot;Muzikors VIP / Premium Abonelik&quot;</B> modelidir. VIP Abonelik; kullanıcılara bekleme süresiz şarkı isteği gönderme, öncelikli sıra hakkı, özel profil amblemleri ve zenginleştirilmiş kişiselleştirme gibi dijital yazılım avantajları sunar.
        </p>
      </LegalSection>

      <LegalSection title="6. Google Play Faturalandırma, Otomatik Yenileme ve Cayma Hakkı">
        <p>
          <B>Google Play In-App Billing:</B> Tüm VIP Abonelik tahsilatları, faturalandırma ve otomatik yenileme süreçleri doğrudan Google Play Store altyapısı üzerinden yürütülür. Muzikors finansal kart verilerinize hiçbir surette erişemez.
        </p>
        <p>
          <B>Cayma Hakkı ve İade:</B> 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca elektronik ortamda anında ifa edilen hizmetlerde tüketici cayma hakkını kullanamaz. VIP Aboneliğinizi geçerli dönemin bitiminden önce Google Play Abonelik Yöneticisi&apos;nden iptal etmeniz halinde aboneliğiniz dönem sonunda yenilenmeyecektir; tahsil edilmiş bedellerin iadesi Google Play Store genel iade kurallarına tabidir.
        </p>
      </LegalSection>

      <LegalSection title="7. Yürürlük ve Yetkili Mahkeme">
        <p>
          İşbu sözleşme Türk Hukuku&apos;na tabidir. Sözleşmenin uygulanmasından doğabilecek her türlü ihtilafta İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
