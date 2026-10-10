import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Muzikors - Gizlilik Politikası, KVKK ve Şartlar',
  description: 'Muzikors 6698 Sayılı KVKK Aydınlatma Metni, Açık Rıza, Çerez Politikası ve Hizmet Koşulları.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0604] text-white flex flex-col items-center p-6 sm:p-12 font-sans selection:bg-amber-500/30">
      <div className="w-full max-w-4xl bg-[#120C08] border-2 border-[#D4AF37]/20 rounded-[32px] p-8 sm:p-12 shadow-2xl space-y-12 relative">
        
        {/* Navigation & Header */}
        <div className="space-y-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-white transition-all text-xs font-black bg-white/5 px-4 py-2 rounded-xl border border-white/10 hover:border-[#D4AF37]/50 active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
            </Link>
          </div>

          <div className="text-center border-b border-[#D4AF37]/20 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold gold-gradient-text tracking-tight mb-3">
              Gizlilik Politikası, KVKK ve Şartlar
            </h1>
            <p className="text-amber-200/70 text-sm max-w-2xl mx-auto leading-relaxed">
              Muzikors B2B SaaS Platformu kullanımına ilişkin yasal aydınlatma, veri işleme ilkeleri ve kullanıcı hizmet koşulları metnidir.
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-12 text-amber-200/80 leading-relaxed text-sm sm:text-base">
          
          {/* SECTION 1: KVKK */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              1. 6698 Sayılı KVKK Uyarınca Aydınlatma Metni
            </h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/15 space-y-4">
              <p>
                <strong className="text-white">Veri Sorumlusu:</strong> Muzikors B2B SaaS Platformu (“Muzikors”) olarak; kullanıcılarımızın kişisel verilerinin 6698 sayılı Kişisel Verilerin Korunması Kanunu (“KVKK”) ve ikincil düzenlemelere uygun olarak işlenmesine ve korunmasına azami özen göstermekteyiz.
              </p>
              <p>
                <strong className="text-white">İşlenen Kişisel Veriler:</strong>
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-neutral-300">
                <li><strong className="text-white">Kimlik ve Hesap Verileri:</strong> Google oturumu aracılığıyla elde edilen ad, soyad, e-posta adresi, profil fotoğrafı URI'si ve benzersiz kullanıcı kimliği (User ID).</li>
                <li><strong className="text-white">Cihaz &amp; Ağ Bilgileri:</strong> IP adresi, cihaz modeli, işletim sistemi sürümü ve Firebase Cloud Messaging (FCM) anlık bildirim belirteci (token).</li>
                <li><strong className="text-white">Uygulama İçi Etkileşim:</strong> Bağlanılan mekan (check-in), şarkı arama ve kuyruğa ekleme geçmişi, şarkı oylama tercihleri ve favoriler.</li>
                <li><strong className="text-white">Anlık Konum:</strong> Yalnızca kullanıcının fiziksel olarak ilgili anlaşmalı kafede bulunduğunu doğrulamak (Vibe Guard menzil kontrolü) ve yakındaki mekanları listelemek amacıyla sorgulanır. Sürekli arka plan takibi kesinlikle yapılmaz.</li>
                <li><strong className="text-white">Abonelik Verisi:</strong> Muzikors VIP / Premium abonelik statüsü, başlangıç/bitiş tarihi ve Google Play Sipariş Numarası.</li>
              </ul>

              <div className="p-4 rounded-xl bg-black/50 border border-amber-500/20 text-neutral-300 text-xs sm:text-sm">
                <strong className="text-[#E5A93C] block mb-1">Finansal Veri Güvenliği ve Kredi Satışı Bulunmaması:</strong>
                Muzikors platformunda kesinlikle kredi, jeton veya bakiye satışı yapılmamaktadır. Kredi kartı, banka hesap veya CVC bilgileri Muzikors tarafından hiçbir şekilde toplanmaz veya saklanmaz. Tüm abonelik tahsilatları ve yenilemeleri doğrudan resmi Google Play In-App Billing (Google Play Faturalandırma) altyapısı üzerinden yürütülür.
              </div>

              <p>
                <strong className="text-white">Hukuki Sebepler (KVKK Madde 5):</strong> Kişisel verileriniz; bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m.5/2-c), 5651 sayılı Kanun uyarınca trafik loglarının tutulması hukuki yükümlülüğü (m.5/2-ç) ve meşru menfaatlerimiz (m.5/2-f - platform güvenliği, spam ve bot önleme) kapsamında işlenmektedir.
              </p>

              <p>
                <strong className="text-white">Haklarınız (KVKK Madde 11):</strong> Her kullanıcı dilediği an verilerinin silinmesini veya düzeltilmesini talep edebilir. Kullanıcılar uygulama içindeki <strong className="text-white">Profil &gt; Profili Düzenle &gt; Hesabımı Sil</strong> adımını uygulayarak veya <strong className="text-[#D4AF37]">destek@muzikors.com</strong> e-posta adresine yazılı bildirimde bulunarak hesaplarını ve tüm ilişkili verilerini derhal silebilirler.
              </p>
            </div>
          </section>

          {/* SECTION 2: CONSENT */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              2. Açık Rıza ve Yurt Dışına Veri Aktarımı Metni
            </h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/15 space-y-4">
              <p>
                Muzikors Aydınlatma Metni kapsamında; platform altyapısının kesintisiz, güvenli ve modern bulut mimarisi standartlarında (SOC2, ISO 27001) yürütülebilmesi adına:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-neutral-300">
                <li>
                  Kimlik, cihaz, şarkı istek geçmişi ve VIP abonelik durum verilerimin, yurt dışında (Birleşik Krallık/Londra ve ABD sınırları içerisinde) barındırılan güvenli <strong className="text-white">Supabase (AWS)</strong> bulut veritabanlarında saklanmasına ve işlenmesine,
                </li>
                <li>
                  Uygulama içi şarkı sırası bildirimleri, şarkımın çalmaya başlaması ve mekana özel anonsların <strong className="text-white">Google Firebase Cloud Messaging (FCM)</strong> kanalıyla anlık mobil bildirim (Push Notification) olarak tarafıma iletilmesine,
                </li>
              </ul>
              <p className="pt-2 text-xs sm:text-sm text-neutral-400">
                Özgür irademle açık rıza gösteriyorum. Bu rıza dilediğiniz an cihaz ayarlarından bildirimleri kapatarak veya <strong className="text-[#D4AF37]">destek@muzikors.com</strong> adresine başvurarak geri alınabilir.
              </p>
            </div>
          </section>

          {/* SECTION 3: COOKIES & PERMISSIONS */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              3. Çerez Politikası, İzinler ve Veri Güvenliği
            </h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/15 space-y-4">
              <p>
                <strong className="text-white">Kamera Erişimi:</strong> Mobil uygulamamız yalnızca anlaşmalı kafelerdeki masalarda yer alan Muzikors QR kodlarını anlık taramak amacıyla kamera izni talep eder. Kamera görüntüsü kaydedilmez, fotoğraflanmaz veya hiçbir harici sunucuya iletilmez.
              </p>
              <p>
                <strong className="text-white">Konum İzni:</strong> Kullanıcının fiziksel olarak kafede bulunduğunu doğrulamak (Vibe Guard) ve yakındaki kafeleri listelemek için anlık olarak kullanılır. Arka planda konum takibi yapılmaz.
              </p>
              <p>
                <strong className="text-white">Teknik Çerezler ve LocalStorage:</strong> Oturum devamlılığı, seçilen tema ve kullanıcı tercihleri için zorunlu yerel depolama teknolojileri kullanılır. Reklam, profil çıkarma veya pazarlama amaçlı üçüncü taraf izleme çerezi kesinlikle kullanılmaz ve üçüncü şahıslara satılmaz.
              </p>
              <p>
                <strong className="text-white">Şifreleme Standartları:</strong> Tüm veri trafiği HTTPS ve TLS 1.3 güvenlik protokolleri ile uçtan uca şifrelenmektedir.
              </p>
            </div>
          </section>

          {/* SECTION 4: TERMS & VIP SUBSCRIPTION */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              4. Kullanıcı Hizmet Sözleşmesi ve VIP Abonelik Koşulları
            </h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/15 space-y-4">
              <p>
                <strong className="text-white">Muzikors Bir Müzik Yayımcısı Değildir:</strong> Muzikors; internet radyosu, ses akış platformu veya müzik yayımcısı DEĞİLDİR. Muzikors, yalnızca mekan işletmesi ile mekan müşterisi arasında şarkı tercihlerinin iletilmesini sağlayan dijital bir interaktif istek panosu yazılımıdır.
              </p>
              <p>
                <strong className="text-white">5846 Sayılı FSEK Telif Sorumluluk Reddi:</strong> 5846 sayılı Fikir ve Sanat Eserleri Kanunu (“FSEK”) uyarınca; mekanda çalınan müziklerin umuma iletim hakkı, meslek birlikleri lisanslaması (MESAM, MSG, MÜ-YAP, MÜYOBİR vb.) ve kullanılan üçüncü taraf müzik servislerinin (Spotify vb.) ticari kullanım şartlarına uyum sorumluluğu <strong className="text-white">TAMAMEN VE MÜNHASIRAN MEKAN İŞLETMECİSİNE AİTTİR</strong>.
              </p>
              <p>
                <strong className="text-white">Vibe Guard (Tarz Koruması):</strong> Mekan işletmecisi, mekan atmosferini ve müzikal kimliğini korumak adına kuyruğa eklenen şarkıları onaylama, reddetme veya çalmakta olan bir şarkıyı atlama (skip) mutlak yetkisine sahiptir.
              </p>
              <p>
                <strong className="text-white">Muzikors VIP Abonelik Modeli:</strong> Muzikors son kullanıcı tarafında kredi satışı kesinlikle YOKTUR. Kullanıcılara yalnızca "Muzikors VIP / Premium Abonelik" modeli sunulur. VIP Abonelik; bekleme süresiz istek gönderme, öncelikli şarkı sırası ve özel profil amblemleri sağlar.
              </p>
              <p>
                <strong className="text-white">Google Play Faturalandırma &amp; Cayma Hakkı:</strong> VIP Abonelik satın alımları ve otomatik yenilemeleri doğrudan Google Play Store tarafından yönetilir. 6502 sayılı TKHK Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı bulunmamaktadır; Google Play iade kuralları geçerlidir.
              </p>
            </div>
          </section>

          {/* SECTION 5: ACCOUNT DELETION */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-[#E5A93C] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
              5. Hesap ve Veri Silme Politikası
            </h2>
            <div className="bg-[#1C130D] rounded-2xl p-6 sm:p-8 border border-[#D4AF37]/15 space-y-4">
              <p>
                Google Play Geliştirici Politikaları uyarınca; kullanıcılarımızın hesaplarını ve tüm kişisel verilerini silme hakkı bulunmaktadır:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-2 text-neutral-300">
                <li><strong className="text-white">Uygulama İçinden:</strong> Profil &gt; Profili Düzenle &gt; Hesabımı Sil butonuna dokunarak tüm verilerinizi anında silebilirsiniz.</li>
                <li><strong className="text-white">Web Üzerinden:</strong> Uygulama cihazınızda yüklü değilse <strong className="text-white">https://muzikors.com.tr/delete-account</strong> sayfasından veya <strong className="text-[#D4AF37]">destek@muzikors.com</strong> adresine e-posta göndererek hesabınızın ve tüm verilerinizin kalıcı olarak silinmesini talep edebilirsiniz.</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-[#D4AF37]/20 text-xs text-amber-200/50 space-y-2">
          <p>© {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.</p>
          <p>Resmi İletişim &amp; Destek: <strong className="text-[#D4AF37]">destek@muzikors.com</strong></p>
        </div>

      </div>
    </div>
  );
}
