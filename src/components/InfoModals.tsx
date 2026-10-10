'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Gift, Mail, MessageCircle, Phone, QrCode, Search, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModalType } from '../types';
import { Sheet } from './ui/Sheet';
import { EmptyState, Segmented, btn, groupCard, groupRow } from './ui/controls';
import { EASE_OUT } from '../lib/motion';

type LegalTab = 'kvkk' | 'consent' | 'cookie' | 'terms';

const LEGAL_MODALS: ModalType[] = ['terms', 'kvkk', 'consent', 'cookie'];
const INFO_MODALS: ModalType[] = ['campaigns', 'about', 'partners', 'contact', 'howitworks', ...LEGAL_MODALS];

const TITLES: Partial<Record<ModalType, string>> = {
  campaigns: 'Kampanyalar',
  about: 'Hakkımızda',
  partners: 'Mekânınız için Muzikors',
  contact: 'İletişim ve destek',
  howitworks: 'Nasıl çalışır?',
};

const SUPPORT_EMAIL = 'destek@muzikors.com';
const APPLICATION_URL = 'https://muzikors.com.tr/#hero-form';

// Yasal metinlerin uygulama içi özeti: düz, okunur metin. Tam metin web sayfasındadır.
const H = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-[15px] font-semibold text-white mt-5 first:mt-0 mb-1.5">{children}</h3>
);

const LegalBody: React.FC<{ tab: LegalTab }> = ({ tab }) => {
  if (tab === 'kvkk') {
    return (
      <>
        <p className="text-[12px] text-white/45 mb-4">6698 sayılı KVKK kapsamında aydınlatma metni · Veri sorumlusu: Muzikors</p>
        <H>İşlenen kişisel veriler</H>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Hesap bilgileri: Google veya Apple oturumuyla gelen ad, soyad, e-posta adresi ve profil fotoğrafı.</li>
          <li>Cihaz ve güvenlik: IP adresi, cihaz modeli, işletim sistemi sürümü ve bildirim belirteci (FCM).</li>
          <li>Mekân etkileşimi: bağlanılan mekân, şarkı arama ve istek geçmişi, oylar.</li>
          <li>Anlık konum: yalnızca yakındaki mekânları listelemek için, istediğinde sorgulanır. Arka planda takip yapılmaz.</li>
          <li>Abonelik: VIP üyelik durumu ve mağaza sipariş numarası.</li>
        </ul>
        <p className="mt-3">
          Muzikors&apos;ta kredi veya jeton satışı yoktur. Kart bilgilerin bizde saklanmaz; abonelik ödemeleri Google Play veya App Store üzerinden alınır.
        </p>
        <H>Hukuki sebepler ve amaçlar</H>
        <p>
          Verilerin KVKK m.5/2-c (sözleşmenin ifası), m.5/2-ç (5651 sayılı Kanun gereği kayıt saklama) ve m.5/2-f (hizmet güvenliği, spam ve bot koruması) kapsamında işlenir.
        </p>
        <H>Aktarım ve güvenlik</H>
        <p>
          Veriler Supabase (AWS) ve Google Cloud (Firebase) altyapısında saklanır. Ticari amaçla üçüncü kişilere satılmaz.
        </p>
        <H>Hakların ve hesabın silinmesi</H>
        <p>
          KVKK m.11 kapsamındaki haklarını kullanmak için Profil ekranındaki &ldquo;Hesabı sil&rdquo; seçeneğini kullanabilir veya {SUPPORT_EMAIL} adresine yazabilirsin.
        </p>
      </>
    );
  }

  if (tab === 'consent') {
    return (
      <>
        <p className="text-[12px] text-white/45 mb-4">KVKK m.9 kapsamında açık rıza ve yurt dışına aktarım</p>
        <p>Aydınlatma metni kapsamında, hizmetin kesintisiz ve güvenli sunulabilmesi için:</p>
        <ol className="list-decimal pl-5 space-y-2 mt-3">
          <li>Kimlik, cihaz, şarkı istek geçmişi ve VIP üyelik verilerimin yurt dışındaki Supabase (AWS) sunucularında işlenmesine ve saklanmasına,</li>
          <li>Sıra durumu, mekân duyuruları ve hesap bildirimlerinin Google Firebase Cloud Messaging (FCM) ile anlık bildirim olarak iletilmesine</li>
        </ol>
        <p className="mt-3">özgür irademle açık rıza veriyorum.</p>
        <p className="mt-3">
          Bu rızayı istediğin zaman cihazının bildirim ayarlarından veya {SUPPORT_EMAIL} adresine yazarak geri alabilirsin.
        </p>
      </>
    );
  }

  if (tab === 'cookie') {
    return (
      <>
        <p className="text-[12px] text-white/45 mb-4">Çerezler, cihaz izinleri ve veri güvenliği</p>
        <H>Kamera</H>
        <p>Yalnızca masadaki QR kodu okutmak için kullanılır. Görüntü kaydedilmez, fotoğraf çekilmez, sunucuya gönderilmez.</p>
        <H>Konum</H>
        <p>Yakındaki mekânları listelemek için yalnızca istediğinde, anlık olarak sorgulanır. Arka planda takip yapılmaz.</p>
        <H>Zorunlu teknik depolama</H>
        <p>
          Oturumunun açık kalması, tema tercihin ve bağlandığın mekânın hatırlanması için cihazında yerel depolama kullanılır. Reklam veya pazarlama amaçlı takip çerezi kullanılmaz.
        </p>
        <H>Şifreleme</H>
        <p>Tüm veri aktarımı HTTPS ve TLS ile şifrelenir.</p>
      </>
    );
  }

  return (
    <>
      <p className="text-[12px] text-white/45 mb-4">Kullanıcı hizmet sözleşmesi ve VIP abonelik koşulları</p>
      <H>Muzikors nedir?</H>
      <p>
        Muzikors bir müzik yayıncısı, radyo veya ses akış hizmeti değildir. Mekân ile müşterileri arasında şarkı isteklerini ve oyları ileten bir istek yazılımıdır.
      </p>
      <H>Telif sorumluluğu</H>
      <p>
        5846 sayılı FSEK uyarınca mekânda çalınan müziklerin umuma iletim lisansı (MESAM, MSG, MÜ-YAP, MÜYORBİR vb.) ve kullanılan müzik platformlarının koşullarına uyum sorumluluğu tamamen mekân işletmecisine aittir.
      </p>
      <H>Mekânın yetkisi</H>
      <p>
        Mekân, atmosferini korumak için gelen istekleri kabul etme, reddetme veya çalan şarkıyı atlama yetkisine sahiptir.
      </p>
      <H>VIP abonelik</H>
      <p>
        Muzikors&apos;ta şarkı kredisi veya jeton satışı yoktur. Tek ücretli seçenek Muzikors VIP aboneliğidir; daha fazla günlük şarkı hakkı, bekleme süresiz istek ve ek ayrıcalıklar sunar.
      </p>
      <H>Ödeme ve cayma hakkı</H>
      <p>
        Abonelik ödemeleri ve otomatik yenileme Google Play veya App Store üzerinden yönetilir. Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca anında ifa edilen dijital hizmetlerde cayma hakkı yoktur; iade talepleri mağazanın kurallarına tabidir.
      </p>
      <p className="mt-4 text-[13px] text-white/50">Destek ve yasal bildirimler: {SUPPORT_EMAIL}</p>
    </>
  );
};

export const InfoModals: React.FC = () => {
  const { activeModal, closeModal, openModal } = useApp();
  const [legalTab, setLegalTab] = useState<LegalTab>('kvkk');

  const isLegal = LEGAL_MODALS.includes(activeModal);
  const isOpen = INFO_MODALS.includes(activeModal);

  // Hangi yasal metinden açıldıysa o sekme seçili gelir
  useEffect(() => {
    if (activeModal === 'kvkk' || activeModal === 'consent' || activeModal === 'cookie' || activeModal === 'terms') {
      setLegalTab(activeModal);
    }
  }, [activeModal]);

  // Giriş ekranından açılan yasal metin kapanınca giriş ekranına dönülür
  const handleClose = () => closeModal(true);

  if (isLegal) {
    return (
      <Sheet
        open={isOpen}
        onClose={handleClose}
        title="Yasal metinler"
        height="tall"
        width="lg"
        toolbar={
          <Segmented
            layoutId="legal-tab"
            value={legalTab}
            onChange={setLegalTab}
            options={[
              { value: 'kvkk', label: 'KVKK' },
              { value: 'consent', label: 'Açık rıza' },
              { value: 'cookie', label: 'Çerezler' },
              { value: 'terms', label: 'Koşullar' },
            ]}
          />
        }
        footer={
          <a href="/privacy" target="_blank" rel="noreferrer" className={`${btn.secondary} w-full`}>
            <span>Tam metni web&apos;de aç</span>
            <ExternalLink className="w-4 h-4 text-white/50" />
          </a>
        }
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            key={legalTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            className="text-[14px] leading-relaxed text-white/70 pb-2"
          >
            <LegalBody tab={legalTab} />
          </motion.article>
        </AnimatePresence>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onClose={handleClose} title={TITLES[activeModal] || ''} width="md">
      {activeModal === 'campaigns' && (
        <EmptyState
          icon={<Gift className="w-6 h-6" />}
          title="Çok yakında"
          text="Mekânlara özel fırsatlar ve kampanyalar burada görünecek."
        />
      )}

      {activeModal === 'about' && (
        <div className="space-y-3 text-[14px] leading-relaxed text-white/70 pb-2">
          <p>
            <span className="text-white font-semibold">Muzikors</span>, mekânlarda çalan müziği müşterilerin birlikte seçtiği yeni nesil dijital müzik kutusudur.
          </p>
          <p>Masadaki QR kodu okut, şarkını ara, sıraya ekle ve sıradakileri oyla.</p>
        </div>
      )}

      {activeModal === 'partners' && (
        <div className="space-y-4 pb-2">
          <p className="text-[14px] leading-relaxed text-white/70">
            Mekânınızda müşterileriniz şarkı istesin, sırayı birlikte belirlesin. Başvuru formunu doldurun, kurulum ve fiyatlandırma için sizinle iletişime geçelim.
          </p>
          <a href={APPLICATION_URL} target="_blank" rel="noreferrer" className={`${btn.primary} w-full`}>
            <span>Başvuru formunu aç</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Mekân başvurusu')}`} className={`${btn.secondary} w-full`}>
            <Mail className="w-4 h-4 text-white/60" />
            <span>{SUPPORT_EMAIL}</span>
          </a>
        </div>
      )}

      {activeModal === 'contact' && (
        <div className="space-y-4 pb-2">
          <p className="text-[14px] text-white/60">Her gün 10:00 – 02:00 arası yanıt veriyoruz.</p>
          <div className={groupCard}>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={groupRow}>
              <Mail className="w-[18px] h-[18px] text-white/55" />
              <span className="flex-1 text-[14px] font-medium">{SUPPORT_EMAIL}</span>
            </a>
            <a href="https://wa.me/905068638306" target="_blank" rel="noreferrer" className={groupRow}>
              <MessageCircle className="w-[18px] h-[18px] text-white/55" />
              <span className="flex-1 text-[14px] font-medium">WhatsApp ile yaz</span>
              <ExternalLink className="w-4 h-4 text-white/25" />
            </a>
            <a href="tel:+905068638306" className={groupRow}>
              <Phone className="w-[18px] h-[18px] text-white/55" />
              <span className="flex-1 text-[14px] font-medium">+90 506 863 83 06</span>
            </a>
          </div>
        </div>
      )}

      {activeModal === 'howitworks' && (
        <ol className="space-y-4 pb-2">
          {[
            { icon: <QrCode className="w-5 h-5" />, title: 'Mekâna bağlan', text: 'Masadaki QR kodu okut.' },
            { icon: <Search className="w-5 h-5" />, title: 'Şarkını bul', text: 'Spotify kataloğunda ara, önizlemesini dinle.' },
            { icon: <Music className="w-5 h-5" />, title: 'Sıraya ekle', text: 'Şarkın mekânın hoparlörlerinden herkese çalsın. Sıradakileri oylayarak öne taşı.' },
          ].map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <span className="w-10 h-10 shrink-0 rounded-full bg-white/[0.06] grid place-items-center text-white/75">{step.icon}</span>
              <span className="pt-0.5">
                <span className="block text-[15px] font-semibold">
                  {i + 1}. {step.title}
                </span>
                <span className="block text-[13px] text-white/55 mt-0.5 leading-relaxed">{step.text}</span>
              </span>
            </li>
          ))}
          <li>
            <button type="button" onClick={() => openModal('search')} className={`${btn.primary} w-full mt-2`}>
              Şarkı ara
            </button>
          </li>
        </ol>
      )}
    </Sheet>
  );
};
