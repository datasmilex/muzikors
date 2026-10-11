import React from 'react';
import { LegalLayout, LegalSection, LegalNote, B } from '../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - Gizlilik Politikası, KVKK ve Şartlar',
  description: 'Muzikors 6698 Sayılı KVKK Aydınlatma Metni, Açık Rıza, Çerez Politikası ve Hizmet Koşulları.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      title="Gizlilik Politikası, KVKK ve Şartlar"
      subtitle="Muzikors B2B SaaS Platformu kullanımına ilişkin yasal aydınlatma, veri işleme ilkeleri ve kullanıcı hizmet koşulları metnidir."
    >
      <LegalSection title="1. 6698 Sayılı KVKK Uyarınca Aydınlatma Metni">
        <p>
          <B>Veri Sorumlusu:</B> Muzikors B2B SaaS Platformu (“Muzikors”) olarak; kullanıcılarımızın kişisel verilerinin 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ikincil düzenlemelere uygun olarak işlenmesine ve korunmasına azami özen göstermekteyiz.
        </p>
        <p>
          <B>İşlenen Kişisel Veriler:</B>
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><B>Kimlik ve Hesap Verileri:</B> Google oturumu aracılığıyla elde edilen ad, soyad, e-posta adresi, profil fotoğrafı URI&apos;si ve benzersiz kullanıcı kimliği (User ID).</li>
          <li><B>Cihaz &amp; Ağ Bilgileri:</B> IP adresi, cihaz modeli, işletim sistemi sürümü ve Firebase Cloud Messaging (FCM) anlık bildirim belirteci (token).</li>
          <li><B>Uygulama İçi Etkileşim:</B> Bağlanılan mekan (check-in), şarkı arama ve kuyruğa ekleme geçmişi, şarkı oylama tercihleri ve favoriler.</li>
          <li><B>Anlık Konum:</B> Yalnızca kullanıcının fiziksel olarak ilgili anlaşmalı kafede bulunduğunu doğrulamak (mekân menzil kontrolü) ve yakındaki mekanları listelemek amacıyla sorgulanır. Sürekli arka plan takibi kesinlikle yapılmaz.</li>
          <li><B>Abonelik Verisi:</B> Muzikors VIP / Premium abonelik statüsü, başlangıç/bitiş tarihi ve Google Play Sipariş Numarası.</li>
        </ul>
        <LegalNote title="Finansal Veri Güvenliği ve Kredi Satışı Bulunmaması">
          Muzikors platformunda kesinlikle kredi, jeton veya bakiye satışı yapılmamaktadır. Kredi kartı, banka hesap veya CVC bilgileri Muzikors tarafından hiçbir şekilde toplanmaz veya saklanmaz. Tüm abonelik tahsilatları ve yenilemeleri doğrudan resmi Google Play In-App Billing (Google Play Faturalandırma) altyapısı üzerinden yürütülür.
        </LegalNote>
        <p>
          <B>Hukuki Sebepler (KVKK Madde 5):</B> Kişisel verileriniz; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m.5/2-c), 5651 sayılı Kanun uyarınca trafik loglarının tutulması hukuki yükümlülüğü (m.5/2-ç) ve meşru menfaatlerimiz (m.5/2-f - platform güvenliği, spam ve bot önleme) kapsamında işlenmektedir.
        </p>
        <p>
          <B>Haklarınız (KVKK Madde 11):</B> Her kullanıcı dilediği an verilerinin silinmesini veya düzeltilmesini talep edebilir. Kullanıcılar uygulama içindeki <B>Profil &gt; Hesabı Sil</B> adımını uygulayarak veya destek@muzikors.com e-posta adresine yazılı bildirimde bulunarak hesaplarını ve tüm ilişkili verilerini derhal silebilirler.
        </p>
      </LegalSection>

      <LegalSection title="2. Açık Rıza ve Yurt Dışına Veri Aktarımı Metni">
        <p>
          Muzikors Aydınlatma Metni kapsamında; platform altyapısının kesintisiz, güvenli ve modern bulut mimarisi standartlarında (SOC2, ISO 27001) yürütülebilmesi adına:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Kimlik, cihaz, şarkı istek geçmişi ve VIP abonelik durum verilerimin, yurt dışında (Birleşik Krallık/Londra ve ABD sınırları içerisinde) barındırılan güvenli <B>Supabase (AWS)</B> bulut veritabanlarında saklanmasına ve işlenmesine,
          </li>
          <li>
            Uygulama içi şarkı sırası bildirimleri, şarkımın çalmaya başlaması ve mekana özel anonsların <B>Google Firebase Cloud Messaging (FCM)</B> kanalıyla anlık mobil bildirim (Push Notification) olarak tarafıma iletilmesine,
          </li>
        </ul>
        <p>
          Özgür irademle açık rıza gösteriyorum. Bu rıza dilediğiniz an cihaz ayarlarından bildirimleri kapatarak veya destek@muzikors.com adresine başvurarak geri alınabilir.
        </p>
      </LegalSection>

      <LegalSection title="3. Çerez Politikası, İzinler ve Veri Güvenliği">
        <p>
          <B>Kamera Erişimi:</B> Mobil uygulamamız yalnızca anlaşmalı kafelerdeki masalarda yer alan Muzikors QR kodlarını anlık taramak amacıyla kamera izni talep eder. Kamera görüntüsü kaydedilmez, fotoğraflanmaz veya hiçbir harici sunucuya iletilmez.
        </p>
        <p>
          <B>Konum İzni:</B> Kullanıcının fiziksel olarak kafede bulunduğunu doğrulamak ve yakındaki kafeleri listelemek için anlık olarak kullanılır. Arka planda konum takibi yapılmaz.
        </p>
        <p>
          <B>Teknik Çerezler ve LocalStorage:</B> Oturum devamlılığı, seçilen tema ve kullanıcı tercihleri için zorunlu yerel depolama teknolojileri kullanılır. Reklam, profil çıkarma veya pazarlama amaçlı üçüncü taraf izleme çerezi kesinlikle kullanılmaz ve üçüncü şahıslara satılmaz.
        </p>
        <p>
          <B>Şifreleme Standartları:</B> Tüm veri trafiği HTTPS ve TLS 1.3 güvenlik protokolleri ile uçtan uca şifrelenmektedir.
        </p>
      </LegalSection>

      <LegalSection title="4. Kullanıcı Hizmet Sözleşmesi ve VIP Abonelik Koşulları">
        <p>
          <B>Muzikors Bir Müzik Yayımcısı Değildir:</B> Muzikors; internet radyosu, ses akış platformu veya müzik yayımcısı DEĞİLDİR. Muzikors, yalnızca mekan işletmesi ile mekan müşterisi arasında şarkı tercihlerinin iletilmesini sağlayan dijital bir interaktif istek panosu yazılımıdır.
        </p>
        <p>
          <B>5846 Sayılı FSEK Telif Sorumluluk Reddi:</B> 5846 sayılı Fikir ve Sanat Eserleri Kanunu (“FSEK”) uyarınca; mekanda çalınan müziklerin umuma iletim hakkı, meslek birlikleri lisanslaması (MESAM, MSG, MÜ-YAP, MÜYORBİR vb.) ve kullanılan üçüncü taraf müzik servislerinin (Spotify vb.) ticari kullanım şartlarına uyum sorumluluğu <B>TAMAMEN VE MÜNHASIRAN MEKAN İŞLETMECİSİNE AİTTİR</B>.
        </p>
        <p>
          <B>Vibe Guard (Tarz Koruması):</B> Mekan işletmecisi, mekan atmosferini ve müzikal kimliğini korumak adına kuyruğa eklenen şarkıları onaylama, reddetme veya çalmakta olan bir şarkıyı atlama (skip) mutlak yetkisine sahiptir.
        </p>
        <p>
          <B>Muzikors VIP Abonelik Modeli:</B> Muzikors son kullanıcı tarafında kredi satışı kesinlikle YOKTUR. Kullanıcılara yalnızca &quot;Muzikors VIP / Premium Abonelik&quot; modeli sunulur. VIP Abonelik; bekleme süresiz istek gönderme, öncelikli şarkı sırası ve özel profil amblemleri sağlar.
        </p>
        <p>
          <B>Google Play Faturalandırma &amp; Cayma Hakkı:</B> VIP Abonelik satın alımları ve otomatik yenilemeleri doğrudan Google Play Store tarafından yönetilir. 6502 sayılı TKHK Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı bulunmamaktadır; Google Play iade kuralları geçerlidir.
        </p>
      </LegalSection>

      <LegalSection title="5. Hesap ve Veri Silme Politikası">
        <p>Google Play Geliştirici Politikaları uyarınca; kullanıcılarımızın hesaplarını ve tüm kişisel verilerini silme hakkı bulunmaktadır:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <B>Uygulama İçinden:</B> Profil &gt; Hesabı Sil seçeneğine dokunarak tüm verilerinizi anında silebilirsiniz.
          </li>
          <li>
            <B>Web Üzerinden:</B> Uygulama cihazınızda yüklü değilse https://muzikors.com.tr/delete-account sayfasından veya destek@muzikors.com adresine e-posta göndererek hesabınızın ve tüm verilerinizin kalıcı olarak silinmesini talep edebilirsiniz.
          </li>
        </ul>
      </LegalSection>
    </LegalLayout>
  );
}
