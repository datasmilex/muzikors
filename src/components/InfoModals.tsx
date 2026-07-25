'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Info, Handshake, MessageCircle, HelpCircle, Send, CheckCircle2 } from 'lucide-react';
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

  const isInfoModal = [
    'campaigns',
    'about',
    'partners',
    'contact',
    'howitworks',
    'terms',
  ].includes(activeModal);

  if (!isInfoModal) return null;

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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-[#120C08] border-2 border-[#D4AF37]/40 rounded-[32px] p-6 z-10 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              {activeModal === 'campaigns' && <Gift className="w-5 h-5" />}
              {activeModal === 'about' && <Info className="w-5 h-5" />}
              {activeModal === 'partners' && <Handshake className="w-5 h-5" />}
              {activeModal === 'contact' && <MessageCircle className="w-5 h-5" />}
              {activeModal === 'howitworks' && <HelpCircle className="w-5 h-5" />}
              {activeModal === 'terms' && <Info className="w-5 h-5" />}

              <h2 className="text-base font-bold text-white capitalize">
                {activeModal === 'campaigns' && 'Mevcut Kampanyalar'}
                {activeModal === 'terms' && 'Kullanım Koşulları & KVKK'}
                {activeModal === 'about' && 'Muzikors Hakkında'}
                {activeModal === 'partners' && 'Mekan Ortaklığı'}
                {activeModal === 'contact' && 'İletişim & Destek'}
                {activeModal === 'howitworks' && 'Nasıl Çalışır?'}
              </h2>
            </div>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content Switch */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin text-xs text-amber-200/80 leading-relaxed">
            {activeModal === 'campaigns' && (
              <div className="space-y-3">
                <div className="glass-panel rounded-2xl p-4 border border-[#D4AF37]/40 bg-[#D4AF37]/10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-[9px] font-bold px-2 py-1 rounded-bl-xl">Kazanıldı / Aktif</div>
                  <h4 className="font-bold text-white mb-1.5 mt-2">Google ile Giriş Ödülü 🎁</h4>
                  <p>Muzikors'a katıldığın için hesabına +10 Hoş Geldin Kredisi tanımlandı! Dilediğin şarkıyı öne taşımak için hemen kullanabilirsin.</p>
                </div>

                <div className="glass-panel rounded-2xl p-4 border border-[#D4AF37]/20">
                  <h4 className="font-bold text-white mb-1">VIP Kredi Bonusu</h4>
                  <p>100 Kredi alımlarınızda +15, 200 Kredi alımlarınızda +40 Hediye Kredi otomatik hesabınıza tanımlanır.</p>
                </div>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="space-y-2">
                <p>
                  <strong>Muzikors</strong>, mekanlarda müzik seçimini tamamen müşterilere sunan nesil dijital interaktif jukebox platformudur.
                </p>
                <p>
                  Masadaki QR kodu tarayarak mekana bağlanın, favori Spotify şarkılarınızı arayın, kredilerinizle sıraya ekleyin ve mekanın atmosferine yön verin!
                </p>
              </div>
            )}

            {activeModal === 'partners' && (
              <div>
                {partnerSubmitted ? (
                  <div className="text-center py-6 space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                    <h3 className="text-sm font-bold text-white">Başvurunuz Alındı</h3>
                    <p className="text-xs text-amber-200/70">
                      Mekan ortaklığı başvurunuz ekibimize iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerSubmit} className="space-y-3">
                    <p className="text-[11px] text-amber-200/70 mb-2">
                      Kafeniz veya mekanınız için Muzikors Jukebox platformunu kurmak için formu doldurun.
                    </p>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-200/80 mb-1">Mekan Adı *</label>
                      <input
                        type="text"
                        required
                        value={partnerForm.venueName}
                        onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                        placeholder="Örn: Velvet Lounge"
                        className="w-full bg-[#1C130D] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-200/80 mb-1">Yetkili Adı Soyadı *</label>
                      <input
                        type="text"
                        required
                        value={partnerForm.contactPerson}
                        onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                        placeholder="Örn: Ahmet Yılmaz"
                        className="w-full bg-[#1C130D] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-200/80 mb-1">Telefon Numarası *</label>
                      <input
                        type="tel"
                        required
                        value={partnerForm.phone}
                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                        placeholder="Örn: 0555 123 4567"
                        className="w-full bg-[#1C130D] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-amber-200/80 mb-1">E-posta Adresi</label>
                      <input
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        placeholder="Örn: mekan@example.com"
                        className="w-full bg-[#1C130D] border border-[#D4AF37]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl gold-gradient-bg text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all mt-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ortaklık Başvurusu Gönder</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeModal === 'contact' && (
              <div className="space-y-3 text-center py-4">
                <p className="font-semibold text-white text-sm">Destek &amp; Müşteri Hizmetleri</p>
                <p className="text-amber-300 font-mono text-xs">destek@muzikors.com</p>
                <div className="pt-2 border-t border-[#D4AF37]/20 space-y-2">
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs hover:bg-emerald-500/20 transition-all"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp: +90 506 863 83 06</span>
                  </a>
                  <a
                    href="tel:+905068638306"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-xs hover:bg-[#D4AF37]/20 transition-all"
                  >
                    <span>📞 +90 506 863 83 06</span>
                  </a>
                  <p className="text-[10px] text-amber-200/50">Haftanın 7 günü 10:00 - 02:00</p>
                </div>
              </div>
            )}

            {activeModal === 'howitworks' && (
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gold-gradient-bg text-stone-950 font-black flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-bold text-white">Masa QR Okut</h4>
                    <p className="text-amber-200/60">Bulunduğun kafedeki QR kodu tarayarak mekan jukebox sistemine otomatik bağlan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gold-gradient-bg text-stone-950 font-black flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-bold text-white">Kredi Yükle & Şarkı Ara</h4>
                    <p className="text-amber-200/60">Bakiye yükle, binlerce Spotify şarkısı arasından dilediğini seç.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full gold-gradient-bg text-stone-950 font-black flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-bold text-white">Şarkını Çaldır</h4>
                    <p className="text-amber-200/60">Sıraya gir, diğer dinleyicilerden oy alarak sıranı öne geçir ve şarkının keyfini çıkar.</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-4">
                {/* 4-Tab Switcher */}
                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth snap-x">
                  <button 
                    onClick={() => setActiveLegalTab('kvkk')} 
                    className={`flex-1 min-w-[max-content] px-3 py-2 text-[10px] font-bold rounded-lg transition-all snap-start ${activeLegalTab === 'kvkk' ? 'gold-gradient-bg text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    KVKK
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('consent')} 
                    className={`flex-1 min-w-[max-content] px-3 py-2 text-[10px] font-bold rounded-lg transition-all snap-start ${activeLegalTab === 'consent' ? 'gold-gradient-bg text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    Açık Rıza
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('cookie')} 
                    className={`flex-1 min-w-[max-content] px-3 py-2 text-[10px] font-bold rounded-lg transition-all snap-start ${activeLegalTab === 'cookie' ? 'gold-gradient-bg text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    Çerez Politikası
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('terms')} 
                    className={`flex-1 min-w-[max-content] px-3 py-2 text-[10px] font-bold rounded-lg transition-all snap-start ${activeLegalTab === 'terms' ? 'gold-gradient-bg text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
                  >
                    Hizmet Koşulları
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/5 space-y-3 min-h-[220px]">
                  {activeLegalTab === 'kvkk' && (
                    <>
                      <h4 className="font-bold text-[#E5A93C] text-sm flex items-center gap-2">KVKK Aydınlatma Metni</h4>
                      <p className="text-amber-200/60 text-[11px] leading-relaxed">
                        <strong className="text-white">Veri Sorumlusu:</strong> Muzikors B2B SaaS Platformu.<br /><br />
                        <strong className="text-white">İşlenen Veriler:</strong> IP adresi, cihaz bilgisi, Spotify hesabı kamuya açık kullanıcı kimliği, mekân içi şarkı istek geçmişi.<br /><br />
                        <strong className="text-white">Veri İşleme Amacı:</strong> İnteraktif müzik kuyruğu yönetimi, güvenli oturum doğrulama ve mekân içi sıralama hizmeti sunulması.<br /><br />
                        <strong className="text-white">Haklar (KVKK Madde 11):</strong> Kullanıcı profili ayarlarından "Hesabı Sil" özelliğini kullanarak tüm verilerini dilediği an silme hakkına sahiptir.
                      </p>
                    </>
                  )}

                  {activeLegalTab === 'consent' && (
                    <>
                      <h4 className="font-bold text-[#E5A93C] text-sm flex items-center gap-2">Açık Rıza Metni</h4>
                      <p className="text-amber-200/60 text-[11px] leading-relaxed">
                        Kullanıcı, Muzikors platformunda hesabını oluştururken ve hizmeti kullanırken; kişisel verilerinin ve oturum bilgilerinin yüksek güvenlik standartlarına sahip bulut veritabanı altyapısında (Supabase) saklanmasına, işlenmesine ve yurt dışı sunucu aktarımlarına özgür iradesiyle açık rıza göstermektedir.
                      </p>
                    </>
                  )}

                  {activeLegalTab === 'cookie' && (
                    <>
                      <h4 className="font-bold text-[#E5A93C] text-sm flex items-center gap-2">Çerez Politikası</h4>
                      <p className="text-amber-200/60 text-[11px] leading-relaxed">
                        Muzikors, oturum durumunun korunması, Spotify API erişim jetonlarının (tokens) güvenliği ve kullanıcı tercihlerinin hatırlanması amacıyla zorunlu teknik çerezler ve localStorage (yerel depolama) teknolojileri kullanmaktadır.<br /><br />
                        Bu çerezler reklam/pazarlama amacıyla kullanılmaz ve üçüncü şahıslara satılmaz.
                      </p>
                    </>
                  )}

                  {activeLegalTab === 'terms' && (
                    <>
                      <h4 className="font-bold text-[#E5A93C] text-sm flex items-center gap-2">Hizmet Koşulları & İade Politikası</h4>
                      <p className="text-amber-200/60 text-[11px] leading-relaxed">
                        Yüklenen krediler telifli içerik satın alma ücreti değil, mekân içi müzik kuyruğundaki "Sıralama Önceliği Yazılım Bedeli"dir.<br /><br />
                        Dijital hizmet anında ifa edildiğinden bakiye ve kredi harcamaları iade edilemez.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
