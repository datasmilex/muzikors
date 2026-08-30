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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[#0d0c11] rounded-3xl p-5 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden max-h-[85vh] flex flex-col justify-between border border-white/[0.1]"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-4 relative z-10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400 shadow-inner">
                  {activeModal === 'campaigns' && <Gift className="w-4 h-4" />}
                  {activeModal === 'about' && <Info className="w-4 h-4" />}
                  {activeModal === 'partners' && <Handshake className="w-4 h-4" />}
                  {activeModal === 'contact' && <MessageCircle className="w-4 h-4" />}
                  {activeModal === 'howitworks' && <HelpCircle className="w-4 h-4" />}
                  {activeModal === 'terms' && <Info className="w-4 h-4" />}
                </div>

                <h2 className="text-sm font-black text-white tracking-tight capitalize">
                  {activeModal === 'campaigns' && 'Kampanyalar'}
                  {activeModal === 'terms' && 'Kullanım & KVKK'}
                  {activeModal === 'about' && 'Hakkında'}
                  {activeModal === 'partners' && 'Mekan Ortaklığı'}
                  {activeModal === 'contact' && 'İletişim & Destek'}
                  {activeModal === 'howitworks' && 'Nasıl Çalışır?'}
                </h2>
              </div>

              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Switch */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar text-xs text-neutral-300 leading-relaxed relative z-10">
              {activeModal === 'campaigns' && (
                <div className="space-y-3">
                  <div className="bg-[#141318] rounded-2xl p-5 border border-white/[0.08] text-center py-8">
                    <Gift className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-60" />
                    <h4 className="font-bold text-white mb-1 text-sm">Çok Yakında</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">Özel fırsatlar ve kampanyalarla çok yakında buradayız.</p>
                  </div>
                </div>
              )}

              {activeModal === 'about' && (
                <div className="space-y-3 bg-[#141318] rounded-2xl p-4 border border-white/[0.08]">
                  <p className="leading-relaxed">
                    <strong className="text-amber-400 text-base font-black block mb-1">Muzikors</strong> Mekanlarda müzik seçimini müşterilere sunan yeni nesil dijital jukebox platformudur.
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
                    <div className="text-center py-6 space-y-3 bg-[#141318] rounded-2xl p-4 border border-emerald-500/20">
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

                      <div className="space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">Mekan Adı *</label>
                          <input
                            type="text"
                            required
                            value={partnerForm.venueName}
                            onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                            placeholder="Örn: Velvet Lounge"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-all"
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-all"
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
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-neutral-400 mb-1 uppercase tracking-wider pl-0.5">E-posta</label>
                          <input
                            type="email"
                            value={partnerForm.email}
                            onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                            placeholder="Örn: mekan@example.com"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-400/60 transition-all"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all mt-4"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Başvuru Gönder</span>
                      </button>
                    </form>
                  )}
                </div>
              )}

              {activeModal === 'contact' && (
                <div className="space-y-4 text-center py-4 bg-[#141318] rounded-2xl border border-white/[0.08]">
                  <div>
                    <p className="font-bold text-white text-sm mb-1">Destek &amp; İletişim</p>
                    <p className="text-amber-400 font-mono text-xs font-bold bg-black/40 py-1.5 px-3 rounded-lg inline-block border border-white/5">destek@muzikors.com</p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] space-y-2 px-4">
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
                      <span>📞 +90 506 863 83 06</span>
                    </a>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase mt-2">Haftanın 7 günü 10:00 - 02:00</p>
                  </div>
                </div>
              )}

              {activeModal === 'howitworks' && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 bg-[#141318] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Masa QR Okut</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Bulunduğun kafedeki QR kodu tarayarak mekan jukebox sistemine bağlan.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#141318] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Şarkı Ara</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Binlerce Spotify şarkısı arasından dilediğini seç.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-[#141318] p-3 rounded-2xl border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-full bg-amber-400 text-black font-black text-xs flex items-center justify-center shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-white text-xs mb-0.5">Şarkını Çaldır</h4>
                      <p className="text-neutral-400 text-[11px] leading-snug">Sıraya ekle ve mekanın atmosferini şekillendir!</p>
                    </div>
                  </div>
                </div>
              )}

              {activeModal === 'terms' && (
                <div className="space-y-3">
                  <div className="flex bg-[#141318] p-1 rounded-xl border border-white/10 overflow-x-auto custom-scrollbar no-scrollbar">
                    <button 
                      onClick={() => setActiveLegalTab('kvkk')} 
                      className={`flex-1 min-w-[max-content] px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'kvkk' ? 'bg-amber-400 text-black' : 'text-white/60'}`}
                    >
                      KVKK
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('consent')} 
                      className={`flex-1 min-w-[max-content] px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'consent' ? 'bg-amber-400 text-black' : 'text-white/60'}`}
                    >
                      Açık Rıza
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('cookie')} 
                      className={`flex-1 min-w-[max-content] px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'cookie' ? 'bg-amber-400 text-black' : 'text-white/60'}`}
                    >
                      Çerez
                    </button>
                    <button 
                      onClick={() => setActiveLegalTab('terms')} 
                      className={`flex-1 min-w-[max-content] px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeLegalTab === 'terms' ? 'bg-amber-400 text-black' : 'text-white/60'}`}
                    >
                      Koşullar
                    </button>
                  </div>

                  <div className="bg-[#141318] rounded-2xl p-3.5 border border-white/[0.08] space-y-3 min-h-[220px]">
                    {activeLegalTab === 'kvkk' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] text-neutral-300">
                        <h4 className="font-bold text-amber-400 text-xs">KVKK Aydınlatma Metni</h4>
                        <p><strong className="text-white block">Veri Sorumlusu:</strong> Muzikors B2B SaaS Platformu.</p>
                        <p><strong className="text-white block">İşlenen Veriler:</strong> IP adresi, cihaz bilgisi, istek geçmişi.</p>
                        <p><strong className="text-white block">Haklar:</strong> Kullanıcı dilediği an hesabını ve verilerini silebilir.</p>
                      </motion.div>
                    )}

                    {activeLegalTab === 'consent' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] text-neutral-300">
                        <h4 className="font-bold text-amber-400 text-xs">Açık Rıza Metni</h4>
                        <p>Kullanıcı, kişisel verilerinin ve oturum bilgilerinin güvenli veritabanı altyapısında işlenmesine rıza göstermektedir.</p>
                      </motion.div>
                    )}

                    {activeLegalTab === 'cookie' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] text-neutral-300">
                        <h4 className="font-bold text-amber-400 text-xs">Çerez Politikası</h4>
                        <p>Muzikors, oturum durumunun korunması ve güvenlik amacıyla teknik çerezler kullanır. Reklam amacıyla satılmaz.</p>
                      </motion.div>
                    )}

                    {activeLegalTab === 'terms' && (
                      <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 text-[11px] text-neutral-300">
                        <h4 className="font-bold text-amber-400 text-xs">Hizmet Koşulları</h4>
                        <p>Muzikors uygulamasının son kullanıcı tarafı tamamen ücretsizdir.</p>
                      </motion.div>
                    )}
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
