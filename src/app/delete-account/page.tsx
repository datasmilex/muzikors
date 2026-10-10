import React from 'react';
import { LegalLayout, LegalSection, B } from '../../components/legal/LegalLayout';

export const metadata = {
  title: 'Muzikors - Hesap ve Veri Silme Talebi',
  description: 'Muzikors uygulamasındaki hesabınızı ve tüm verilerinizi nasıl sileceğinize dair bilgilendirme.',
};

export default function DeleteAccountPage() {
  return (
    <LegalLayout title="Hesap ve Veri Silme" subtitle="Muzikors hesabınızı ve tüm verilerinizi iki yoldan silebilirsiniz.">
      <LegalSection title="Yöntem 1: Uygulama içinden (anında)">
        <p>
          Muzikors mobil uygulamasında veya web arayüzünde <B>Profil &gt; Hesabı Sil</B> adımlarını izleyerek hesabınızı, istek geçmişinizi ve tüm verilerinizi veritabanımızdan kalıcı olarak ve anında silebilirsiniz.
        </p>
      </LegalSection>

      <LegalSection title="Yöntem 2: E-posta ile talep">
        <p>
          Uygulama cihazınızda yüklü değilse, kayıtlı e-posta adresinizden{' '}
          <a href="mailto:destek@muzikors.com?subject=Hesab%C4%B1m%C4%B1n%20Silinmesi" className="text-white underline underline-offset-2">
            destek@muzikors.com
          </a>{' '}
          adresine <B>&quot;Hesabımın Silinmesi&quot;</B> konu başlığıyla e-posta göndererek veri silme talebinde bulunabilirsiniz. Talebiniz en geç 24 saat içerisinde işleme alınır.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
