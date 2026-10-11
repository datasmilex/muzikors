import React from 'react';
import { LegalLayout, LegalSection, LegalNote, B } from '../../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - Gizlilik ve KVKK Politikası',
  description: 'Muzikors 6698 Sayılı KVKK Aydınlatma Metni, Açık Rıza ve Gizlilik İlkeleri.',
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Gizlilik ve KVKK Politikası"
      subtitle="Muzikors B2B SaaS Platformu 6698 Sayılı Kanun Uyarınca Kişisel Verilerin İşlenmesi ve Korunması Bildirimi"
    >
      <LegalSection title="1. Veri Sorumlusu ve Kapsam">
        <p>
          Muzikors B2B SaaS Platformu (“Muzikors”) olarak; kullanıcılarımızın kişisel verilerini 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ikincil mevzuata tam uyumla işlemekteyiz.
        </p>
        <p className="text-[14px] text-white/55">Resmi İletişim: destek@muzikors.com | Web: https://muzikors.com.tr</p>
      </LegalSection>

      <LegalSection title="2. İşlenen Veriler ve Finansal Güvenlik">
        <ul className="list-disc pl-5 space-y-2">
          <li><B>Kimlik/Oturum:</B> Google ile oturum açma kapsamında ad, soyad, e-posta adresi ve profil resmi URI&apos;si.</li>
          <li><B>Cihaz/Ağ:</B> IP adresi, cihaz modeli, OS sürümü ve Firebase bildirim belirteci (FCM token).</li>
          <li><B>Mekan &amp; İstek Geçmişi:</B> Bağlanılan mekan (check-in), şarkı arama ve istek geçmişi, oylama tercihleri.</li>
          <li><B>Anlık Konum:</B> Yalnızca kullanıcının kafede olup olmadığını doğrulamak ve yakındaki kafeleri listelemek için anlık sorgulanır. Sürekli arka plan takibi yapılmaz.</li>
          <li><B>Abonelik Durumu:</B> Muzikors VIP / Premium abonelik statüsü ve Google Play Sipariş Numarası.</li>
        </ul>
        <LegalNote title="Abonelik & Ödeme Güvencesi">
          Muzikors platformunda kesinlikle kredi veya jeton satışı yapılmamaktadır. Kredi kartı ve hassas banka bilgileri Muzikors tarafından hiçbir biçimde toplanmaz ve barındırılmaz. Tüm ödemeler ve abonelikler doğrudan Google Play In-App Billing güvencesiyle işlenir.
        </LegalNote>
      </LegalSection>

      <LegalSection title="3. Açık Rıza ve Bulut Veri Güvenliği">
        <p>
          Kullanıcı; verilerinin global ölçekte yüksek güvenlik standartlarına (SOC2, ISO 27001) sahip Supabase (AWS) bulut altyapısında saklanmasına, işlenmesine ve yurt dışı sunucu aktarımlarına özgür iradesiyle açık rıza göstermektedir.
        </p>
        <p>
          Şarkı sırası ve mekan duyuruları Google Firebase Cloud Messaging (FCM) üzerinden anlık bildirim olarak ulaştırılır. Kişisel veriler hiçbir surette ticari amaçlarla üçüncü şahıslara veya reklamcılara satılmaz.
        </p>
      </LegalSection>

      <LegalSection title="4. Donanım İzinleri ve Çerezler">
        <p>
          Kamera erişimi sadece kafedeki masada bulunan Muzikors QR kodunu okutmak için anlık kullanılır; görüntü kaydı tutulmaz. LocalStorage teknolojisi yalnızca teknik oturum devamlılığı ve tema tercihlerini hatırlamak için zorunlu olarak kullanılır.
        </p>
      </LegalSection>

      <LegalSection title="5. Haklarınız (KVKK Madde 11) ve Hesap Silme">
        <p>
          Kullanıcılar, uygulama içerisindeki <B>Profil &gt; Hesabı Sil</B> seçeneğini kullanarak veya destek@muzikors.com adresine talep ileterek hesaplarını ve tüm verilerini derhal ve kalıcı olarak sildirebilirler.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
