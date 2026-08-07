'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Gift,
  Info,
  Handshake,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  Coins,
  LogOut,
  Sparkles,
  Music,
  LogIn,
  PlaySquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { isClaimedTodayTR } from '../lib/timeHelpers';
import { ModalType } from '../types';

export const DrawerMenu: React.FC = () => {
  const { activeModal, closeModal, openModal, openProtectedModal, user, logout, loginWithProvider, showToast, activeVenue, presentPremiumPaywall } = useApp();

  const [isDj, setIsDj] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    if (activeModal === 'drawer' && user?.id && activeVenue?.id) {
      supabase.rpc('get_user_venue_stats', { p_user_id: user.id, p_venue_id: Number(activeVenue.id) })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setIsDj(data[0].is_venue_dj);
          }
        });
    }
  }, [activeModal, user?.id, activeVenue?.id]);

  

  // Calculate daily reward dot
  const hasClaimedToday = isClaimedTodayTR(user?.lastDailyClaim || null);
  const showRewardDot = !!user && !hasClaimedToday;

  const primaryNavItems: { label: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; showBadge?: boolean }[] = [
    { label: 'Profil', icon: <User className="w-5 h-5 text-[#D4AF37]" />, modal: 'profile', isProtected: true },
    { label: 'Günlük Ödül 🎁', icon: <Gift className="w-5 h-5 text-[#D4AF37]" />, modal: 'daily_reward', isProtected: true, showBadge: showRewardDot },
    { label: 'Kampanyalar', icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, modal: 'campaigns' },
  ];

  const secondaryNavItems: { label: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; showBadge?: boolean }[] = [
    { label: 'Hakkımızda', icon: <Info className="w-5 h-5 text-[#D4AF37]" />, modal: 'about' },
    { label: 'Ortaklık', icon: <Handshake className="w-5 h-5 text-[#D4AF37]" />, modal: 'partners' },
    { label: 'İletişim', icon: <MessageCircle className="w-5 h-5 text-[#D4AF37]" />, modal: 'contact' },
    { label: 'Nasıl Çalışır', icon: <HelpCircle className="w-5 h-5 text-[#D4AF37]" />, modal: 'howitworks' },
  ];

  return (
    <AnimatePresence>
      {activeModal === 'drawer' && (<>

      <div className="fixed inset-0 z-[100] flex">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Drawer Container */}
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-[80%] max-w-[280px] h-full bg-[#120C08] border-r border-[#D4AF37]/30 flex flex-col justify-between p-4 z-10 shadow-[20px_0_40px_rgba(212,175,55,0.15)] overflow-y-auto custom-scrollbar glass-panel-gold"
        >
          {/* Decorative Glow */}

          <div className="relative z-10">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-[1.25rem] gold-gradient-bg flex items-center justify-center text-stone-950 font-black shadow-[0_5px_15px_rgba(212,175,55,0.3)]">
                  <Music className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">Muzikors</h2>
                  <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">Mobile Jukebox</span>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="p-2.5 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!user ? (
              <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#241911] to-[#1C130D] border border-[#D4AF37]/40 space-y-3 text-center shadow-[0_10px_30px_rgba(212,175,55,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 blur-2xl rounded-full pointer-events-none" />
                <div className="flex flex-col items-center justify-center gap-2 relative z-10">
                  <Sparkles className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                  <span className="text-sm font-black text-white tracking-wide">Giriş Yap ve Müziği Yönet!</span>
                  <span className="text-[11px] text-amber-200/60 font-medium">Favori şarkılarını öne çıkar</span>
                </div>

                <div className="space-y-2 relative z-10">
                  <button
                    onClick={() => {
                      closeModal();
                      loginWithProvider('google');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-white text-stone-950 font-black text-xs flex items-center justify-center gap-2 transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)] active:scale-95"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google ile Devam Et</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="my-4 bg-[#1A1A1A]/80 rounded-2xl p-3 flex flex-col gap-3 border border-[#D4AF37]/20 shadow-inner group">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo.png';
                      }}
                      className="w-12 h-12 rounded-full border-2 border-[#D4AF37] object-cover shadow-[0_0_15px_rgba(212,175,55,0.3)] group-active:scale-95 transition-transform"
                    />
                    {isDj && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-[#1A1A1A] flex items-center justify-center text-[8px]" title="Mekanın DJ'i">
                        👑
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black text-white truncate drop-shadow-sm">{user.name}</h3>
                    <span className="text-[10px] font-bold text-amber-200/50 uppercase tracking-widest block mt-0.5 truncate">{user.username || '@misafir'}</span>
                  </div>
                </div>
                

              </div>
            )}


            <nav className="space-y-1.5 mt-2">
              {primaryNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    closeModal();
                    if (item.modal === 'premium_buy' as ModalType) {
                      presentPremiumPaywall();
                      return;
                    }
                    if (item.isProtected && !user) {
                      openProtectedModal(item.modal, 'Bu bölümü görüntülemek için giriş yapmalısınız.');
                    } else {
                      openModal(item.modal);
                    }
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl active:bg-[#1A1A1A] border border-transparent active:border-[#D4AF37]/20 text-gray-300 font-bold text-sm transition-all group relative active:scale-[0.98]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#D4AF37]/20 flex items-center justify-center group-active:border-[#D4AF37]/50 group-active:bg-[#D4AF37]/5 transition-colors relative shadow-inner">
                      {item.icon}
                      {item.showBadge && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[#120C08] shadow-sm animate-pulse" />
                      )}
                    </div>
                    <span className="group-active:text-white transition-colors tracking-wide">{item.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-600 group-active:text-[#D4AF37] group-active:translate-x-1 transition-all" />
                </button>
              ))}

              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 mt-1 rounded-xl active:bg-[#1A1A1A] border border-transparent text-gray-400 font-bold text-sm transition-all group relative"
              >
                <div className="flex items-center gap-3">
                  <span className="tracking-wide text-xs uppercase opacity-60">Daha Fazla / Kurumsal</span>
                </div>
                <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${isMoreOpen ? 'rotate-90' : ''}`} />
              </button>

              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden space-y-1.5 pl-2 border-l border-white/5 ml-3"
                  >
                    {secondaryNavItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => {
                          closeModal();
                          if (item.modal === 'manage_subscription' as ModalType) {
                            showToast('Abonelik yönetimi şu anda güncellenmektedir.');
                            return;
                          }
                          if (item.isProtected && !user) {
                            openProtectedModal(item.modal, 'Bu bölümü görüntülemek için giriş yapmalısınız.');
                          } else {
                            openModal(item.modal);
                          }
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl active:bg-[#1A1A1A] border border-transparent text-gray-400 font-bold text-xs transition-all group relative active:scale-[0.98]"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-md bg-[#1A1A1A] border border-white/5 flex items-center justify-center group-active:border-[#D4AF37]/50 transition-colors">
                            {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-3.5 h-3.5 text-gray-400 group-active:text-[#D4AF37]' })}
                          </div>
                          <span className="group-active:text-white transition-colors">{item.label}</span>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Disabled Watch Ads Button */}
              <button
                disabled={true}
                onClick={() => showToast('Bu özellik çok yakında mobil uygulamamızla birlikte yayında olacaktır!')}
                className="w-full flex items-center justify-between px-3 py-2.5 mt-3 rounded-xl bg-black/40 border border-white/5 opacity-60 cursor-not-allowed group relative"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/60 border border-white/10 flex items-center justify-center text-gray-500">
                    <PlaySquare className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-gray-400">Reklam İzle & Kazan</span>
                    <span className="text-[10px] font-medium text-gray-500 mt-0.5">Uygulamayı indirerek kazan.</span>
                  </div>
                </div>
                <div className="text-[9px] font-black bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md shrink-0 uppercase tracking-widest border border-white/5">Pek Yakında</div>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#D4AF37]/20 text-center space-y-3 relative z-10 mt-4">
            {user ? (
              <button
                onClick={logout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-sm flex items-center justify-center gap-2 active:bg-red-500/20 active:scale-95 transition-all group shadow-inner"
              >
                <LogOut className="w-4 h-4 group-active:-translate-x-1 transition-transform" />
                <span className="tracking-wide">Çıkış Yap</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  closeModal();
                  openModal('login');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-black text-sm flex items-center justify-center gap-2 active:bg-white/10 active:scale-95 transition-all shadow-inner group"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37] group-active:scale-95 transition-transform" />
                <span className="tracking-wide">Giriş Yap / Kaydol</span>
              </button>
            )}

            <div className="flex flex-col items-center gap-1">
              <span className="gold-gradient-text font-black text-xs tracking-wider">Müzik Senin, Gece Senin</span>
              <span className="text-[10px] font-bold text-amber-200/30 uppercase tracking-widest">© 2026 Muzikors Mobile Inc.</span>
            </div>
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
