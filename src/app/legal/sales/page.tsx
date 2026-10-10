import React from 'react';
import { LegalLayout, LegalSection, LegalNote, B } from '../../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - VIP Abonelik Mesafeli Satış Sözleşmesi',
  description: 'Muzikors VIP Abonelik Mesafeli Satış Sözleşmesi ve Abonelik Koşulları.',
};

export default function SalesPage() {
  return (
    <LegalLayout
      title="Mesafeli Satış Sözleşmesi"
      subtitle="Muzikors VIP / Premium Dijital Abonelik Hizmetine İlişkin Mesafeli Satış Sözleşmesi"
    >
      <LegalSection title="1. Taraflar">
        <p>
          <B>SATICI / SAAS SAĞLAYICI:</B>
          <br />
          Unvan: Muzikors B2B SaaS Platformu
          <br />
          E-posta: destek@muzikors.com
          <br />
          Web: https://muzikors.com.tr
        </p>
        <p>
          <B>ALICI (KULLANICI):</B>
          <br />
          Muzikors mobil uygulamasını veya web platformunu kullanan, Google Play In-App Billing aracılığıyla VIP / Premium abonelik başlatan son kullanıcıdır.
        </p>
      </LegalSection>

      <LegalSection title="2. Sözleşmenin Konusu ve Modeli">
        <p>
          İşbu sözleşmenin konusu; ALICI&apos;nın Google Play Store aracılığıyla elektronik ortamda siparişini verdiği Muzikors VIP / Premium Abonelik paketinin satışı, özellikleri ve kullanımı ile ilgili olarak 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve yükümlülüklerinin tespitidir.
        </p>
        <LegalNote title="Abonelik Modeli Bildirimi">
          Muzikors platformunda kredi, jeton veya bakiye satışı yapılmamaktadır. Hizmet yalnızca belirli periyotlarla yenilenen VIP Abonelik hakkını kapsar.
        </LegalNote>
      </LegalSection>

      <LegalSection title="3. Hizmetin Teslimi ve Kullanımı">
        <p>
          VIP Abonelik; Google Play In-App Billing üzerinden ödeme onayının alınmasının hemen ardından ALICI&apos;nın kullanıcı hesabına anlık olarak tanımlanır. Abonelik; bekleme süresiz şarkı isteği, öncelikli sıralama ve zenginleştirilmiş kişiselleştirme özelliklerini kapsar.
        </p>
      </LegalSection>

      <LegalSection title="4. Cayma Hakkı ve İstisnalar">
        <p>
          Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmelerde <B>CAYMA HAKKI KULLANILAMAZ</B>. ALICI, satın aldığı VIP aboneliğin anında ifa edilen dijital bir hizmet olduğunu peşinen kabul eder. Aboneliğin iptal edilmesi durumunda dönem sonuna kadar haklar geçerliliğini korur.
        </p>
      </LegalSection>

      <LegalSection title="5. Genel Hükümler">
        <p>5.1. ALICI, platformda belirtilen VIP abonelik şartlarını ve Google Play faturalandırma koşullarını okuyup teyit ettiğini kabul eder.</p>
        <p>5.2. SATICI, hizmetin eksiksiz ve taahhüt edilen niteliklere uygun olarak sunulmasından sorumludur.</p>
        <p>5.3. 5846 sayılı FSEK uyarınca mekanda çalınan müziklerin umuma iletim lisanslama sorumluluğu mekan işletmecisine ait olup Muzikors istek iletim yazılımıdır.</p>
      </LegalSection>

      <LegalSection title="6. Uyuşmazlıkların Çözümü">
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda Türk Hukuku uygulanır ve ALICI&apos;nın yerleşim yerindeki veya tüketici işleminin yapıldığı yerdeki Tüketici Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
