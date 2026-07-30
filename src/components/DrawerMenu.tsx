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
  const { activeModal, closeModal, openModal, openProtectedModal, user, logout, loginWithProvider, showToast, activeVenue } = useApp();

  const [isDj, setIsDj] = useState(false);

  useEffect(() => {
    if (activeModal === 'drawer' && user && activeVenue) {
      supabase.rpc('get_user_venue_stats', { p_user_id: user.id, p_venue_id: Number(activeVenue.id) })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setIsDj(data[0].is_venue_dj);
          }
        });
    }
  }, [activeModal, user, activeVenue]);

  if (activeModal !== 'drawer') return null;

  // Calculate daily reward dot
  const hasClaimedToday = isClaimedTodayTR(user?.lastDailyClaim || null);
  const showRewardDot = !!user && !hasClaimedToday;

  const navItems: { label: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; showBadge?: boolean }[] = [
    { label: 'Profil', icon: <User className="w-5 h-5 text-[#D4AF37]" />, modal: 'profile', isProtected: true },
    { label: 'Günlük Ödül 🎁', icon: <Gift className="w-5 h-5 text-[#D4AF37]" />, modal: 'daily_reward', isProtected: true, showBadge: showRewardDot },
    { label: 'Kampanyalar', icon: <Sparkles className="w-5 h-5 text-[#D4AF37]" />, modal: 'campaigns' },
    { label: 'Hakkımızda', icon: <Info className="w-5 h-5 text-[#D4AF37]" />, modal: 'about' },
    { label: 'Ortaklık', icon: <Handshake className="w-5 h-5 text-[#D4AF37]" />, modal: 'partners' },
    { label: 'İletişim', icon: <MessageCircle className="w-5 h-5 text-[#D4AF37]" />, modal: 'contact' },
    { label: 'Nasıl Çalışır', icon: <HelpCircle className="w-5 h-5 text-[#D4AF37]" />, modal: 'howitworks' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-4/5 max-w-xs h-full bg-[#120C08] border-r border-[#D4AF37]/30 flex flex-col justify-between p-5 z-10 shadow-2xl overflow-y-auto"
        >
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl gold-gradient-bg flex items-center justify-center text-stone-950 font-black shadow-md">
                  <Music className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold gold-gradient-text">Muzikors</h2>
                  <span className="text-[10px] text-amber-200/60 font-medium">Mobile Jukebox</span>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {!user ? (
              <div className="my-4 p-3.5 rounded-2xl glass-panel-gold border-2 border-[#D4AF37]/50 space-y-2.5 text-center shadow-lg">
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-extrabold text-[#D4AF37]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Giriş Yap ve Müziği Yönet!</span>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      closeModal();
                      loginWithProvider('google');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google ile Giriş Yap</span>
                  </button>

                </div>
              </div>
            ) : (
              <div className="my-4 glass-panel-gold rounded-2xl p-3 flex items-center justify-between border border-[#D4AF37]/30">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={user.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                    className="w-10 h-10 rounded-full border border-[#D4AF37] object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white truncate">{user.name}</h3>
                      {isDj && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[8px] font-black text-amber-300 uppercase tracking-wider whitespace-nowrap">
                          Mekanın DJ'i 👑
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#D4AF37]">
                      <Coins className="w-3 h-3" />
                      <span>{user.credits} Kredi</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openModal('topup')}
                  className="px-2.5 py-1 rounded-lg gold-gradient-bg text-stone-950 font-bold text-[10px] shrink-0"
                >
                  +Yükle
                </button>
              </div>
            )}


            <nav className="space-y-1 mt-2">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    closeModal();
                    if (item.isProtected && !user) {
                      openProtectedModal(item.modal, 'Bu bölümü görüntülemek için giriş yapmalısınız.');
                    } else {
                      openModal(item.modal);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1C130D] border border-transparent hover:border-[#D4AF37]/20 text-amber-100/90 font-medium text-sm transition-all group relative"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1C130D] border border-[#D4AF37]/20 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors relative">
                      {item.icon}
                      {item.showBadge && (
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-sm animate-pulse" />
                      )}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-200/40 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}

              {/* Disabled Watch Ads Button */}
              <button
                disabled={true}
                onClick={() => showToast('Bu özellik çok yakında mobil uygulamamızla birlikte yayında olacaktır!')}
                className="w-full flex items-center justify-between p-3 mt-2 rounded-xl bg-black/30 border border-white/5 opacity-60 cursor-not-allowed group relative"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-gray-500">
                    <PlaySquare className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-400">Reklam İzle & Kredi Kazan</span>
                    <span className="text-[10px] text-gray-500">Uygulamayı indirerek kredi kazan.</span>
                  </div>
                </div>
                <div className="text-[9px] font-bold bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full shrink-0">Pek Yakında</div>
              </button>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#D4AF37]/20 text-center space-y-3">
            {user ? (
              <button
                onClick={logout}
                className="w-full py-2 px-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-red-900/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Çıkış Yap</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  closeModal();
                  openModal('login');
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#1C130D] border border-[#D4AF37]/30 text-amber-200 font-semibold text-xs flex items-center justify-center gap-2 hover:border-[#D4AF37] transition-colors"
              >
                <LogIn className="w-4 h-4 text-[#D4AF37]" />
                <span>Giriş Yap / Kaydol</span>
              </button>
            )}

            <div className="text-[11px] text-amber-200/50 flex flex-col items-center">
              <span className="gold-gradient-text font-bold">Müzik Senin, Gece Senin</span>
              <span className="text-[9px] text-amber-200/40 mt-0.5">© 2026 Muzikors Mobile Inc.</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
