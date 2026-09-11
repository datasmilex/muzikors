'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Info, Handshake, MessageCircle, HelpCircle, Send, CheckCircle2, Phone, ShieldCheck, ArrowLeft, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const InfoModals: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  const [partnerForm, setPartnerForm] = useState({
    venueName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [activeLegalTab, setActiveLegalTab] = useState<'kvkk' | 'consent' | 'cookie' | 'terms'>('kvkk');

  const isLegalModal = ['terms', 'kvkk', 'consent', 'cookie'].includes(activeModal);

  const isInfoModal = [
    'campaigns',
    'about',
    'partners',
    'contact',
    'howitworks',
    'terms',
    'kvkk',
    'consent',
    'cookie',
  ].includes(activeModal);

  React.useEffect(() => {
    if (['kvkk', 'consent', 'cookie', 'terms'].includes(activeModal)) {
      setActiveLegalTab(activeModal === 'terms' ? 'terms' : (activeModal as 'kvkk' | 'consent' | 'cookie'));
    }
  }, [activeModal]);

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.venueName || !partnerForm.contactPerson || !partnerForm.phone) return;

    const subject = encodeURIComponent(`Mekan Ortaklığı Başvurusu: ${partnerForm.venueName}`);
    const body = encodeURIComponent(
      `Mekan Adı: ${partnerForm.venueName}\n` +
      `Yetkili Adı Soyadı: ${partnerForm.contactPerson}\n` +
      `Telefon Numarası: ${partnerForm.phone}\n` +
      `E-posta Adresi: ${partnerForm.email || 'Belirtilmedi'}\n`
    );

    window.location.href = `mailto:muzikorsapp@gmail.com?subject=${subject}&body=${body}`;
    setPartnerSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 landscape:p-2">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ willChange: 'opacity' }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/85"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className={`relative w-full ${isLegalModal ? 'max-w-md' : 'max-w-sm'} landscape:max-w-2xl bg-[var(--theme-card)] rounded-3xl landscape:rounded-2xl p-5 landscape:p-3.5 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[85vh] landscape:max-h-[94vh] flex flex-col justify-between border border-white/[0.1]`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 relative z-10 shrink-0">
              <div className="flex items-center gap-2.5 text-[var(--theme-primary)]">
                {activeModal === 'campaigns' && <Gift className="w-4 h-4 shrink-0" />}
                {activeModal === 'about' && <Info className="w-4 h-4 shrink-0" />}
                {activeModal === 'partners' && <Handshake className="w-4 h-4 shrink-0" />}
                {activeModal === 'contact' && <MessageCircle className="w-4 h-4 shrink-0" />}
                {activeModal === 'howitworks' && <HelpCircle className="w-4 h-4 shrink-0" />}
                {isLegalModal && <ShieldCheck className="w-4 h-4 shrink-0" />}

                <h2 className="text-sm font-bold text-white tracking-tight capitalize">
                  {activeModal === 'campaigns' && 'Kampanyalar'}
                  {isLegalModal && 'Yasal Bilgiler & Şartlar'}
                  {activeModal === 'about' && 'Hakkında'}
                  {activeModal === 'partners' && 'Mekan Ortaklığı'}
                  {activeModal === 'contact' && 'İletişim & Destek'}
                  {activeModal === 'howitworks' && 'Nasıl Çalışır?'}
                </h2>
              </div>

              <button
                onClick={() => closeModal(true)}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Switch */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar text-xs text-neutral-300 leading-relaxed relative z-10">
              {activeModal === 'campaigns' && (
                <div className="space-y-3">
                  <div className="bg-[var(--theme-card-alt)] rounded-2xl p-5 border border-white/[0.08] text-center py-8">
                    <Gift className="w-8 h-8 text-[var(--theme-primary)] mx-auto mb-2 opacity-60" />
                    <h4 className="font-bold text-white mb-1 text-sm">Çok Yakında</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">Özel fırsatlar ve kampanyalarla çok yakında buradayız.</p>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div className="space-y-3 bg-[var(--theme-card-alt)] rounded-2xl p-4 border border-white/[0.08]">
                  <p className="leading-relaxed">
                    <strong className="text-[var(--theme-primary)] text-base font-black block mb-1">Muzikors</strong> Mekanlarda müzik seçimini müşterilere sunan yeni nesil dijital jukebox platformudur.
                  </p>
                  <div className="h-px w-full bg-white/[0.08] my-3" />
                  <p className="leading-relaxed text-neutral-400">
                    Masadaki QR kodu okutun, favori parçanızı arayın ve mekanın müzik akışına katılın!
                  </p>
                </div>
              )}

              {activeModal === 'partners' && (
                <div>
                  {partnerSubmitted ? (
                    <div className="text-center py-6 space-y-3 bg-[var(--theme-card-alt)] rounded-2xl p-4 border border-emerald-500/20">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-sm">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-bold text-white tracking-tight">Başvurunuz Alındı</h3>
                      <p className="text-xs text-neutral-400 leading-relaxed">
                        Mekan ortaklığı başvurunuz ekibimize iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePartnerSubmit} className="space-y-3">
                      <p className="text-xs text-neutral-400 px-1">
                        Mekanınızda Muzikors Jukebox kullanmak için bilgilerinizi bırakın.
                      </p>

                      <div className="space-y-2.5 landscape:grid landscape:grid-cols-2 landscape:gap-2.5 landscape:space-y-0">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">Mekan Adı *</label>
                          <input
                            type="text"
                            required
                            value={partnerForm.venueName}
                            onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                            placeholder="Örn: Velvet Lounge"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)]/60 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">Yetkili Kişi *</label>
                          <input
                            type="text"
                            required
                            value={partnerForm.contactPerson}
                            onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                            placeholder="Örn: Ahmet Yılmaz"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)]/60 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">Telefon *</label>
                          <input
                            type="tel"
                            required
                            value={partnerForm.phone}
                            onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                            placeholder="Örn: 0555 123 4567"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)]/60 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">E-posta</label>
                          <input
                            type="email"
                            value={partnerForm.email}
                            onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                            placeholder="Örn: mekan@example.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)]/60 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-2xl bg-[var(--theme-primary)] hover:opacity-95 text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all mt-4 shadow-md"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Başvuru Gönder</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="p-4 bg-[var(--theme-card-alt)] rounded-2xl border border-white/[0.08] landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:items-center text-center">
                  <div>
                    <p className="font-bold text-white text-sm mb-1">Destek &amp; İletişim</p>
                    <p className="text-[var(--theme-primary)] font-mono text-xs font-bold bg-black/40 py-1.5 px-3 rounded-lg inline-block border border-white/5">destek@muzikors.com</p>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase mt-2">Haftanın 7 günü 10:00 - 02:00</p>
                  </div>
                  <div className="pt-3 landscape:pt-0 border-t landscape:border-t-0 landscape:border-l border-white/[0.06] space-y-2 px-2 landscape:pl-4">
                    <a
                      href="https://wa.me/905068638306"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-xs active:scale-95 transition-all"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp Destek</span>
                    </a>
                    <a
                      href="tel:+905068638306"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-bold text-xs active:scale-95 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>+90 506 863 83 06</span>
                    </a>
                  </div>
                </div>
              )}

              {activeModal === 'howitworks' && (
                <div className="space-y-2.5 landscape:grid landscape:grid-cols-3 landscape:gap-2.5 landscape:space-y-0">
                  <div className="flex items-center gap-3 bg-[var(--theme-card-alt)] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Bir Mekana Bağlan</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Kafedeki QR kodu okut, jukebox sistemine bağlan.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[var(--theme-card-alt)] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Şarkı Ara</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Binlerce Spotify şarkısı arasından dilediğini seç.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[var(--theme-card-alt)] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Şarkını Çaldır</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Sıraya ekle ve atmosferi yönet!</p>
                    </div>
                  </div>
                </div>
              )}

              {isLegalModal && (
                <div className="space-y-3">
                  {/* Tab Navigation */}
                  <div className="flex bg-[var(--theme-card-alt)] p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar no-scrollbar gap-1">
                    <button 
                      onClick={() => setActiveLegalTab('kvkk')} 
                      className={`flex-1 min-w-[max-content] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'kvkk' ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      KVKK
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('consent')} 
                      className={`flex-1 min-w-[max-content] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'consent' ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Açık Rıza
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('cookie')} 
                      className={`flex-1 min-w-[max-content] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'cookie' ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Çerezler
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('terms')} 
                      className={`flex-1 min-w-[max-content] px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'terms' ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'text-neutral-400 hover:text-white'}`}
                    >
                      Koşullar &amp; VIP
                    </button>
                  </div>

                  {/* Tab Body */}
                  <div className="bg-[var(--theme-card-alt)] rounded-2xl p-4 border border-white/[0.08] space-y-3.5 max-h-[50vh] overflow-y-auto custom-scrollbar">
                    {activeLegalTab === 'kvkk' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-[11px] text-neutral-300 leading-relaxed">
                        <div className="border-b border-white/10 pb-2">
                          <h4 className="font-bold text-[var(--theme-primary)] text-xs">6698 Sayılı KVKK Uyarınca Aydınlatma Metni</h4>
                          <span className="text-[10px] text-neutral-400">Veri Sorumlusu: Muzikors B2B SaaS Platformu</span>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">1. İşlenen Kişisel Veriler</strong>
                          <ul className="list-disc list-inside space-y-1 text-neutral-300 pl-1">
                            <li><strong className="text-neutral-200">Hesap Bilgileri:</strong> Google oturumu ile ad, soyad, e-posta adresi, profil fotoğrafı.</li>
                            <li><strong className="text-neutral-200">Cihaz &amp; Güvenlik:</strong> IP adresi, cihaz modeli, işletim sistemi sürümü ve Firebase bildirim belirteci (FCM token).</li>
                            <li><strong className="text-neutral-200">Mekan Etkileşimi:</strong> Bağlanılan mekan (check-in), şarkı arama ve istek geçmişi, oylama tercihleri.</li>
                            <li><strong className="text-neutral-200">Anlık Konum:</strong> Yalnızca kafede bulunulduğunu doğrulamak ve yakın mekanları listelemek amacıyla anlık sorgulanır; sürekli arka plan takibi yapılmaz.</li>
                            <li><strong className="text-neutral-200">Abonelik Verisi:</strong> Muzikors VIP / Premium statüsü ve Google Play Sipariş Numarası.</li>
                          </ul>
                        </div>

                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-neutral-300">
                          <p className="font-medium text-[10.5px]">
                            <strong className="text-[var(--theme-primary-light)]">Önemli Bilgilendirme:</strong> Muzikors platformunda kredi satışı yapılmamaktadır. Kredi kartı ve finansal bilgileriniz Muzikors sunucularında kesinlikle saklanmaz; tüm abonelik işlemleri Google Play In-App Billing güvencesiyle işlenir.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">2. Hukuki Sebepler ve Amaçlar</strong>
                          <p>
                            Verileriniz KVKK Madde 5/2-c (Sözleşmenin ifası), Madde 5/2-ç (5651 Sayılı Kanun gereği log saklama) ve Madde 5/2-f (Hizmet güvenliği, spam ve bot koruması) hukuki sebepleriyle işlenir.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">3. Veri Aktarımı ve Güvenlik</strong>
                          <p>
                            Verileriniz teknik zorunluluk gereği yüksek güvenlik standartlarındaki bulut altyapımız Supabase (AWS) ve Google Cloud Platform (Firebase) üzerinde saklanır. Ticari amaçla üçüncü şahıslara kesinlikle satılmaz.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">4. Haklarınız (KVKK Madde 11) &amp; Hesap Silme</strong>
                          <p>
                            Dilediğiniz an Profil ekranındaki <strong className="text-white">"Hesabımı Sil"</strong> seçeneği ile veya <strong className="text-[var(--theme-primary)]">destek@muzikors.com</strong> adresine yazılı başvuruda bulunarak hesabınızı ve tüm verilerinizi silebilirsiniz.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeLegalTab === 'consent' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-[11px] text-neutral-300 leading-relaxed">
                        <div className="border-b border-white/10 pb-2">
                          <h4 className="font-bold text-[var(--theme-primary)] text-xs">Açık Rıza ve Yurt Dışı Veri Aktarımı Metni</h4>
                          <span className="text-[10px] text-neutral-400">KVKK Madde 9 Kapsamında İzin</span>
                        </div>

                        <p>
                          Muzikors Aydınlatma Metni kapsamında; platform hizmetlerinin kesintisiz, güvenli ve modern bulut mimarisinde sunulabilmesi amacıyla:
                        </p>

                        <div className="space-y-2 pl-1">
                          <div className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-white/10 text-[var(--theme-primary)] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">1</span>
                            <p>
                              Kimlik, cihaz, şarkı istek geçmişi ve VIP abonelik durum verilerimin, uluslararası güvenlik standartlarına (SOC2, ISO 27001) sahip yurt dışı <strong className="text-white">Supabase (AWS)</strong> bulut sunucularında işlenmesine ve saklanmasına,
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-white/10 text-[var(--theme-primary)] font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">2</span>
                            <p>
                              Şarkı sırası durumu, mekana özel müzik duyuruları ve hesap bildirimlerinin <strong className="text-white">Google Firebase Cloud Messaging (FCM)</strong> aracılığıyla anlık mobil bildirim olarak iletilmesine,
                            </p>
                          </div>
                        </div>

                        <p className="pt-1">
                          Özgür irademle açık rıza gösteriyorum. Bu izni dilediğiniz an cihaz bildirim ayarlarından veya <strong className="text-[var(--theme-primary)]">destek@muzikors.com</strong> üzerinden geri alabilirsiniz.
                        </p>
                      </motion.div>
                    )}

                    {activeLegalTab === 'cookie' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-[11px] text-neutral-300 leading-relaxed">
                        <div className="border-b border-white/10 pb-2">
                          <h4 className="font-bold text-[var(--theme-primary)] text-xs">Çerezler, Donanım İzinleri ve Veri Güvenliği</h4>
                          <span className="text-[10px] text-neutral-400">Google Play Store &amp; Gizlilik Standartları</span>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">Kamera İzni</strong>
                          <p>
                            Uygulama, sadece masalardaki Muzikors QR kodlarını anında okuyarak mekana bağlanmanız amacıyla kamera erişimi ister. Kamera görüntüleri kesinlikle kaydedilmez, fotoğraflanmaz veya harici sunuculara aktarılmaz.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">Konum (GPS) İzni</strong>
                          <p>
                            Fiziksel olarak anlaşmalı kafede bulunduğunuzu doğrulamak (Vibe Guard) ve yakındaki mekanları listelemek amacıyla anlık olarak sorgulanır. Arka planda gizli takip yapılmaz.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">Zorunlu Teknik Çerezler &amp; LocalStorage</strong>
                          <p>
                            Oturumunuzun açık kalması, tercih ettiğiniz arayüz teması ve mekan bağlantınızın korunması amacıyla teknik yerel depolama kullanılır. Reklam veya pazarlama amaçlı üçüncü taraf takip çerezi kesinlikle kullanılmaz.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">Uçtan Uca Şifreleme</strong>
                          <p>
                            Tüm veri transferleri endüstri standardı HTTPS ve TLS 1.3 güvenlik katmanları üzerinden şifrelenmektedir.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {activeLegalTab === 'terms' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 text-[11px] text-neutral-300 leading-relaxed">
                        <div className="border-b border-white/10 pb-2">
                          <h4 className="font-bold text-[var(--theme-primary)] text-xs">Kullanıcı Hizmet Sözleşmesi ve VIP Abonelik Koşulları</h4>
                          <span className="text-[10px] text-neutral-400">Yasal Şartlar &amp; FSEK Sorumluluk Reddi</span>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">1. Platformun Hukuki Niteliği</strong>
                          <p>
                            Muzikors; bir müzik yayıncısı, internet radyosu veya ses akış oynatıcısı (DSP) DEĞİLDİR. Muzikors, yalnızca mekan işletmesi ile mekan müşterisi arasında şarkı tercihlerinin ve oylarının iletilmesini sağlayan dijital bir interaktif istek panosu yazılımıdır.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">2. 5846 Sayılı FSEK Telif Sorumluluk Reddi</strong>
                          <p>
                            5846 sayılı Fikir ve Sanat Eserleri Kanunu (FSEK) uyarınca; mekanda çalınan müziklerin umuma iletim lisanslaması (MESAM, MSG, MÜ-YAP, MÜYOBİR vb. meslek birlikleri izinleri) ve kullanılan üçüncü taraf müzik platformlarının (Spotify vb.) ticari koşullarına uyum sorumluluğu <strong className="text-white">TAMAMEN VE MÜNHASIRAN MEKAN İŞLETMECİSİNE AİTTİR</strong>.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">3. Vibe Guard (Tarz Koruması) ve Mekan Yetkisi</strong>
                          <p>
                            Her mekan işletmecisi; mekan konseptini ve akustik atmosferini korumak amacıyla gelen şarkı isteklerini onaylama, reddetme veya çalmakta olan bir şarkıyı atlama (skip) mutlak yetkisine sahiptir.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">4. Muzikors VIP Abonelik Modeli (Kredi Satışı Yoktur)</strong>
                          <p>
                            Platformumuzda şarkı kredisi veya jeton satışı kesinlikle YOKTUR. Kullanıcılara yalnızca "Muzikors VIP / Premium Abonelik" modeli sunulur. VIP abonelik; bekleme süresiz istek, öncelikli sıra hakkı ve özel profil amblemleri sağlar.
                          </p>
                        </div>

                        <div>
                          <strong className="text-white block font-semibold mb-1">5. Google Play Faturalandırma &amp; Cayma Hakkı</strong>
                          <p>
                            Abonelik tahsilatları ve otomatik yenilemeler doğrudan Google Play In-App Billing üzerinden yönetilir. 6502 sayılı TKHK Mesafeli Sözleşmeler Yönetmeliği m.15/1-ğ uyarınca elektronik ortamda anında ifa edilen hizmetlerde cayma hakkı bulunmamaktadır; Google Play iptal şartları geçerlidir.
                          </p>
                        </div>

                        <p className="text-[10px] text-neutral-400 pt-1">
                          Her türlü destek talebi ve yasal bildirim için: <strong className="text-[var(--theme-primary)]">destek@muzikors.com</strong>
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs">
                    <button
                      onClick={() => closeModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-neutral-300 hover:text-white font-semibold active:scale-95 transition-all text-[11px]"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Geriye Dön</span>
                    </button>

                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] text-[var(--theme-primary-light)] font-bold text-[11px] active:scale-95 transition-all"
                    >
                      <span>Web Sayfasında Oku</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
