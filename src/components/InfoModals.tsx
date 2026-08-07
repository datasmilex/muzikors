'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Info, Handshake, MessageCircle, HelpCircle, Send, CheckCircle2, Sparkles } from 'lucide-react';
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
      {isInfoModal && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          className="relative w-full max-w-sm bg-[#120C08] rounded-3xl p-5 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] overflow-hidden max-h-[85vh] flex flex-col justify-between glass-panel-gold border border-[#D4AF37]/30"
        >
          {/* Decorative Glow */}

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-5 relative z-10">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
                {activeModal === 'campaigns' && <Gift className="w-5 h-5 drop-shadow-md" />}
                {activeModal === 'about' && <Info className="w-5 h-5 drop-shadow-md" />}
                {activeModal === 'partners' && <Handshake className="w-5 h-5 drop-shadow-md" />}
                {activeModal === 'contact' && <MessageCircle className="w-5 h-5 drop-shadow-md" />}
                {activeModal === 'howitworks' && <HelpCircle className="w-5 h-5 drop-shadow-md" />}
                {activeModal === 'terms' && <Info className="w-5 h-5 drop-shadow-md" />}
              </div>

              <h2 className="text-lg font-black text-white tracking-tight drop-shadow-lg capitalize">
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
              className="p-2 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Switch */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar text-[13px] text-amber-200/80 leading-relaxed relative z-10">
            {activeModal === 'campaigns' && (
              <div className="space-y-4">
                <div className="bg-[#1A1A1A]/80 rounded-2xl p-4 border border-[#D4AF37]/20 shadow-inner group active:-translate-y-1 transition-transform text-center py-8">
                  <Gift className="w-10 h-10 text-zinc-500 mx-auto mb-3 opacity-50" />
                  <h4 className="font-black text-white mb-2 text-base">Çok Yakında</h4>
                  <p className="font-medium text-amber-200/60 leading-relaxed">Yeni sürprizler ve fırsatlarla çok yakında buradayız. Takipte kalın!</p>
                </div>
              </div>
            )}

            {activeModal === 'about' && (
              <div className="space-y-4 bg-[#1A1A1A]/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                <p className="leading-relaxed">
                  <strong className="text-[#D4AF37] text-lg font-black block mb-2">Muzikors</strong> Mekanlarda müzik seçimini tamamen müşterilere sunan yeni nesil dijital interaktif jukebox platformudur.
                </p>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent my-4" />
                <p className="leading-relaxed font-medium">
                  Masadaki QR kodu tarayarak mekana bağlanın, favori Spotify şarkılarınızı arayın, tamamen ücretsiz olarak sıraya ekleyin ve mekanın atmosferine yön verin!
                </p>
              </div>
            )}

            {activeModal === 'partners' && (
              <div>
                {partnerSubmitted ? (
                  <div className="text-center py-6 space-y-4 bg-[#1A1A1A]/60 rounded-2xl p-4 border border-emerald-500/20 shadow-inner">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-black text-white tracking-tight">Başvurunuz Alındı</h3>
                    <p className="text-sm font-medium text-amber-200/70 leading-relaxed">
                      Mekan ortaklığı başvurunuz ekibimize iletildi. En kısa sürede sizinle iletişime geçeceğiz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerSubmit} className="space-y-4">
                    <p className="text-[13px] font-medium text-amber-200/70 mb-4 px-2 leading-relaxed">
                      Kafeniz veya mekanınız için Muzikors Jukebox platformunu kurmak için formu doldurun.
                    </p>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-amber-200/80 mb-1.5 uppercase tracking-wider pl-1">Mekan Adı *</label>
                        <input
                          type="text"
                          required
                          value={partnerForm.venueName}
                          onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                          placeholder="Örn: Velvet Lounge"
                          className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-200/80 mb-1.5 uppercase tracking-wider pl-1">Yetkili Adı Soyadı *</label>
                        <input
                          type="text"
                          required
                          value={partnerForm.contactPerson}
                          onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                          placeholder="Örn: Ahmet Yılmaz"
                          className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-200/80 mb-1.5 uppercase tracking-wider pl-1">Telefon Numarası *</label>
                        <input
                          type="tel"
                          required
                          value={partnerForm.phone}
                          onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                          placeholder="Örn: 0555 123 4567"
                          className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-200/80 mb-1.5 uppercase tracking-wider pl-1">E-posta Adresi</label>
                        <input
                          type="email"
                          value={partnerForm.email}
                          onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                          placeholder="Örn: mekan@example.com"
                          className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-xl px-4 py-3 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all shadow-inner"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 rounded-[1.5rem] gold-gradient-bg text-stone-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(212,175,55,0.2)] active:scale-95 transition-all mt-6 group"
                    >
                      <Send className="w-5 h-5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
                      <span className="tracking-wide">Ortaklık Başvurusu Gönder</span>
                    </button>
                  </form>
                )}
              </div>
            )}

            {activeModal === 'contact' && (
              <div className="space-y-6 text-center py-6 bg-[#1A1A1A]/60 rounded-2xl border border-white/5 shadow-inner">
                <div>
                  <p className="font-black text-white text-base mb-1 tracking-tight">Destek &amp; Müşteri Hizmetleri</p>
                  <p className="text-[#D4AF37] font-mono text-sm font-bold bg-[#D4AF37]/10 py-1.5 px-4 rounded-lg inline-block border border-[#D4AF37]/20">destek@muzikors.com</p>
                </div>
                <div className="pt-6 border-t border-[#D4AF37]/20 space-y-3 px-6">
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm active:bg-emerald-500/20 active:scale-95 transition-all shadow-[0_5px_15px_rgba(16,185,129,0.1)] group"
                  >
                    <MessageCircle className="w-5 h-5 group-active:scale-95 transition-transform" />
                    <span className="tracking-wide">WhatsApp Destek Hattı</span>
                  </a>
                  <a
                    href="tel:+905068638306"
                    className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] font-black text-sm active:bg-[#D4AF37]/20 active:scale-95 transition-all shadow-[0_5px_15px_rgba(212,175,55,0.1)] group"
                  >
                    <span className="group-active:scale-95 transition-transform">📞</span>
                    <span className="tracking-wide">+90 506 863 83 06</span>
                  </a>
                  <p className="text-xs font-bold text-amber-200/50 uppercase tracking-widest mt-4">Haftanın 7 günü 10:00 - 02:00</p>
                </div>
              </div>
            )}

            {activeModal === 'howitworks' && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-[#1A1A1A]/80 p-4 rounded-2xl border border-white/5 active:-translate-y-1 transition-transform group">
                  <div className="w-10 h-10 rounded-full gold-gradient-bg text-stone-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md group-active:scale-95 transition-transform">1</div>
                  <div>
                    <h4 className="font-black text-white text-sm mb-1">Masa QR Okut</h4>
                    <p className="text-amber-200/60 text-xs font-medium leading-relaxed">Bulunduğun kafedeki QR kodu tarayarak mekan jukebox sistemine otomatik bağlan.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#1A1A1A]/80 p-4 rounded-2xl border border-white/5 active:-translate-y-1 transition-transform group">
                  <div className="w-10 h-10 rounded-full gold-gradient-bg text-stone-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md group-active:scale-95 transition-transform">2</div>
                  <div>
                    <h4 className="font-black text-white text-sm mb-1">Şarkı Ara</h4>
                    <p className="text-amber-200/60 text-xs font-medium leading-relaxed">Binlerce Spotify şarkısı arasından dilediğini seç.</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-[#1A1A1A]/80 p-4 rounded-2xl border border-white/5 active:-translate-y-1 transition-transform group">
                  <div className="w-10 h-10 rounded-full gold-gradient-bg text-stone-950 font-black text-lg flex items-center justify-center shrink-0 shadow-md group-active:scale-95 transition-transform">3</div>
                  <div>
                    <h4 className="font-black text-white text-sm mb-1">Şarkını Çaldır</h4>
                    <p className="text-amber-200/60 text-xs font-medium leading-relaxed">Sıraya gir, tamamen ücretsiz olarak mekanın atmosferine sen de katıl!</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'terms' && (
              <div className="space-y-5">
                {/* 4-Tab Switcher */}
                <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar no-scrollbar scroll-smooth snap-x">
                  <button 
                    onClick={() => setActiveLegalTab('kvkk')} 
                    className={`flex-1 min-w-[max-content] px-4 py-2.5 text-xs font-black rounded-lg transition-all snap-start ${activeLegalTab === 'kvkk' ? 'gold-gradient-bg text-black shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
                  >
                    KVKK
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('consent')} 
                    className={`flex-1 min-w-[max-content] px-4 py-2.5 text-xs font-black rounded-lg transition-all snap-start ${activeLegalTab === 'consent' ? 'gold-gradient-bg text-black shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
                  >
                    Açık Rıza
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('cookie')} 
                    className={`flex-1 min-w-[max-content] px-4 py-2.5 text-xs font-black rounded-lg transition-all snap-start ${activeLegalTab === 'cookie' ? 'gold-gradient-bg text-black shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
                  >
                    Çerez
                  </button>
                  <button 
                    onClick={() => setActiveLegalTab('terms')} 
                    className={`flex-1 min-w-[max-content] px-4 py-2.5 text-xs font-black rounded-lg transition-all snap-start ${activeLegalTab === 'terms' ? 'gold-gradient-bg text-black shadow-md scale-105' : 'text-gray-400 active:text-white'}`}
                  >
                    Koşullar
                  </button>
                </div>

                {/* Tab Content */}
                <div className="bg-[#1A1A1A]/60 rounded-2xl p-4 border border-white/5 space-y-4 min-h-[250px] shadow-inner">
                  {activeLegalTab === 'kvkk' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h4 className="font-black text-[#D4AF37] text-base tracking-tight">KVKK Aydınlatma Metni</h4>
                      <div className="space-y-3 text-xs text-amber-200/70 font-medium leading-relaxed">
                        <p><strong className="text-white font-bold uppercase tracking-wider block mb-0.5">Veri Sorumlusu:</strong> Muzikors B2B SaaS Platformu.</p>
                        <div className="w-8 h-px bg-white/10" />
                        <p><strong className="text-white font-bold uppercase tracking-wider block mb-0.5">İşlenen Veriler:</strong> IP adresi, cihaz bilgisi, Spotify hesabı kamuya açık kullanıcı kimliği, mekân içi şarkı istek geçmişi.</p>
                        <div className="w-8 h-px bg-white/10" />
                        <p><strong className="text-white font-bold uppercase tracking-wider block mb-0.5">Veri İşleme Amacı:</strong> İnteraktif müzik kuyruğu yönetimi, güvenli oturum doğrulama ve mekân içi sıralama hizmeti sunulması.</p>
                        <div className="w-8 h-px bg-white/10" />
                        <p><strong className="text-white font-bold uppercase tracking-wider block mb-0.5">Haklar (KVKK Madde 11):</strong> Kullanıcı profili ayarlarından "Hesabı Sil" özelliğini kullanarak tüm verilerini dilediği an silme hakkına sahiptir.</p>
                      </div>
                    </motion.div>
                  )}

                  {activeLegalTab === 'consent' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h4 className="font-black text-[#D4AF37] text-base tracking-tight">Açık Rıza Metni</h4>
                      <p className="text-amber-200/70 text-xs font-medium leading-relaxed">
                        Kullanıcı, Muzikors platformunda hesabını oluştururken ve hizmeti kullanırken; kişisel verilerinin ve oturum bilgilerinin yüksek güvenlik standartlarına sahip bulut veritabanı altyapısında (Supabase) saklanmasına, işlenmesine ve yurt dışı sunucu aktarımlarına özgür iradesiyle açık rıza göstermektedir.
                      </p>
                    </motion.div>
                  )}

                  {activeLegalTab === 'cookie' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h4 className="font-black text-[#D4AF37] text-base tracking-tight">Çerez Politikası</h4>
                      <div className="space-y-3 text-amber-200/70 text-xs font-medium leading-relaxed">
                        <p>
                          Muzikors, oturum durumunun korunması, Spotify API erişim jetonlarının (tokens) güvenliği ve kullanıcı tercihlerinin hatırlanması amacıyla zorunlu teknik çerezler ve localStorage (yerel depolama) teknolojileri kullanmaktadır.
                        </p>
                        <div className="w-8 h-px bg-white/10" />
                        <p>
                          Bu çerezler reklam/pazarlama amacıyla <strong className="text-white">kullanılmaz</strong> ve üçüncü şahıslara <strong className="text-white">satılmaz</strong>.
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {activeLegalTab === 'terms' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <h4 className="font-black text-[#D4AF37] text-base tracking-tight">Hizmet Koşulları & İade Politikası</h4>
                      <div className="space-y-3 text-amber-200/70 text-xs font-medium leading-relaxed">
                        <p>
                          Muzikors uygulamasının son kullanıcı tarafı <strong className="text-white">tamamen ücretsizdir</strong>. Müzik arama, istek gönderme ve diğer etkileşimler için hiçbir ücret talep edilmez.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
