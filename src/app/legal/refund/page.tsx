import React from 'react';
import { LegalLayout, LegalSection, B } from '../../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - VIP Abonelik İptal ve İade Koşulları',
  description: 'Muzikors VIP / Premium Abonelik İptal, Yenileme ve İade Şartları.',
};

export default function RefundPage() {
  return (
    <LegalLayout title="VIP Abonelik İptal ve İade Koşulları" subtitle="Google Play Faturalandırma Sistemi ve Dijital Abonelik Şartları">
      <LegalSection title="1. Abonelik Modeli ve Kredi Satışı Bulunmaması">
        <p>
          Muzikors son kullanıcı tarafında münferit kredi, jeton veya bakiye satışı <B>KESİNLİKLE YAPILMAMAKTADIR</B>. Kullanıcılara yalnızca dijital ayrıcalıklar sağlayan &quot;Muzikors VIP / Premium Abonelik&quot; modeli sunulmaktadır.
        </p>
      </LegalSection>

      <LegalSection title="2. Google Play In-App Billing ve Abonelik İptali">
        <p>
          Tüm VIP Abonelik alımları, tahsilatları ve yenileme işlemleri doğrudan resmi <B>Google Play In-App Billing</B> altyapısı üzerinden yürütülür. Aboneliğinizi geçerli fatura döneminizin bitiminden en az 24 saat önce Google Play Abonelik Yöneticisi üzerinden dilediğiniz an iptal edebilirsiniz. İptal işlemi yapıldığında mevcut fatura döneminin sonuna kadar VIP haklarınız korunur ve dönem bitiminde kartınızdan yeni bir çekim yapılmaz.
        </p>
      </LegalSection>

      <LegalSection title="3. Cayma Hakkı İstisnası ve İade Şartları">
        <p>
          6502 sayılı Tüketicinin Korunması Hakkında Kanun ve 27.11.2014 tarihli Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesinin 1. fıkrasının (ğ) bendi uyarınca, &quot;Elektronik ortamda anında ifa edilen hizmetler ve tüketiciye anında teslim edilen gayrimaddi mallara ilişkin sözleşmeler&quot; cayma hakkının istisnaları arasındadır. VIP Abonelik anında hesaba tanımlanarak kullanıma açıldığından cayma hakkı kapsamında iade talep edilemez. Dönem içi tahsilat itirazları ve istisnai iade talepleri Google Play Store’un global iade politikalarına tabidir.
        </p>
      </LegalSection>

      <LegalSection title="4. Mekan Yetkisi ve Vibe Guard Sorumluluk Reddi">
        <p>
          Mekan kurallarına uymayan, Vibe Guard mekanizması tarafından engellenen veya mekan yetkilisinin takdiri doğrultusunda uygun görülmeyerek atlanan/reddedilen şarkılar sebebiyle abonelik bedeli iadesi yapılamaz.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
