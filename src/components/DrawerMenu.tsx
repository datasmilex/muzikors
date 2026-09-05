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
  LogOut,
  Tag,
  Music,
  LogIn,
  PlaySquare,
  Crown,
  Palette,
  Store,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { isClaimedTodayTR } from '../lib/timeHelpers';
import { ModalType } from '../types';
import { THEMES } from '../lib/theme';

export const DrawerMenu: React.FC = () => {
  const { activeModal, closeModal, openModal, openProtectedModal, user, logout, loginWithProvider, showToast, activeVenue, theme, setTheme, openRewardedAdModal } = useApp();

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
  }, [activeModal, user, activeVenue]);

  const hasClaimedToday = isClaimedTodayTR(user?.lastDailyClaim || null);
  const showRewardDot = !!user && !hasClaimedToday;

  const primaryNavItems: { label: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; showBadge?: boolean; isPremiumBtn?: boolean }[] = [
    { label: 'Profilim', icon: <User className="w-4 h-4 text-[var(--theme-primary)]" />, modal: 'profile', isProtected: true },
    { label: 'Muzikors Premium', icon: <Crown className="w-4 h-4 text-[var(--theme-primary)]" />, modal: 'premium', isPremiumBtn: true },
    { label: 'İşletmem & Kafe Paneli', icon: <Store className="w-4 h-4 text-[var(--theme-primary)]" />, modal: 'venue_owner', isProtected: true },
    { label: 'Günlük Ödül', icon: <Gift className="w-4 h-4 text-[var(--theme-primary)]" />, modal: 'daily_reward', isProtected: true, showBadge: showRewardDot },
    { label: 'Kampanyalar', icon: <Tag className="w-4 h-4 text-[var(--theme-primary)]" />, modal: 'campaigns' },
  ];

  const secondaryNavItems: { label: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; showBadge?: boolean }[] = [
    { label: 'Hakkımızda', icon: <Info className="w-4 h-4 text-neutral-400" />, modal: 'about' },
    { label: 'Ortaklık', icon: <Handshake className="w-4 h-4 text-neutral-400" />, modal: 'partners' },
    { label: 'İletişim & Destek', icon: <MessageCircle className="w-4 h-4 text-neutral-400" />, modal: 'contact' },
    { label: 'Nasıl Çalışır?', icon: <HelpCircle className="w-4 h-4 text-neutral-400" />, modal: 'howitworks' },
  ];

  return (
    <AnimatePresence>
      {activeModal === 'drawer' && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-[82%] max-w-[300px] h-full bg-[var(--theme-card)] border-r border-white/[0.08] flex flex-col justify-between p-5 z-10 shadow-[20px_0_50px_rgba(0,0,0,0.9)] overflow-y-auto custom-scrollbar"
          >
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center p-2 shrink-0">
                    <img src="/logo.png" alt="Muzikors" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white tracking-tight">Muzikors</h2>
                    <span className="text-[9px] text-[var(--theme-primary-light)] font-medium uppercase tracking-widest">Mobile Jukebox</span>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white/[0.05] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Card / Login Banner */}
              {!user ? (
                <div className="my-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-center space-y-3 shadow-sm">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-white">Giriş Yap ve Şarkı İste</span>
                    <span className="text-[10px] text-neutral-400">Favori parçalarını sıraya ekle</span>
                  </div>

                  <button
                    onClick={() => {
                      closeModal();
                      loginWithProvider('google');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google ile Giriş</span>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => { closeModal(); openModal('profile'); }}
                  className="my-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/15 flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-sm group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-black border border-white/15 overflow-hidden shrink-0">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-[var(--theme-primary)] m-auto" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white truncate group-hover:text-[var(--theme-primary-light)] transition-colors">
                        {user.name}
                      </h3>
                      <span className="text-[10px] text-neutral-400 font-medium block truncate">
                        {user.isPremium ? 'Premium Üye' : 'Standart Üye'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-[var(--theme-primary)] group-hover:translate-x-0.5 transition-all" />
                </div>
              )}

              {/* Navigation Items */}
              <nav className="space-y-1 my-3">
                {primaryNavItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      closeModal();
                      if (item.isProtected && !user) {
                        openProtectedModal(item.modal, 'Bu bölümü görüntülemek için lütfen giriş yapın.');
                      } else {
                        openModal(item.modal);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      item.isPremiumBtn
                        ? 'bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 text-[var(--theme-primary-light)] hover:bg-[var(--theme-primary)]/15'
                        : 'bg-transparent hover:bg-white/[0.04] text-neutral-300 hover:text-white'
                    } active:scale-95`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                        {item.icon}
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {item.showBadge && (
                        <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse shadow-[0_0_6px_var(--theme-glow)]" />
                      )}
                      <ChevronRight className="w-4 h-4 text-neutral-600" />
                    </div>
                  </button>
                ))}

                {/* More toggle */}
                <button
                  onClick={() => setIsMoreOpen(!isMoreOpen)}
                  className="w-full flex items-center justify-between px-3.5 py-2 mt-1 rounded-xl text-neutral-400 font-semibold text-[11px] hover:text-neutral-200 transition-colors"
                >
                  <span className="uppercase tracking-wider">Kurumsal & Destek</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isMoreOpen ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMoreOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden space-y-1 pl-3 border-l border-white/[0.08] ml-3"
                    >
                      {secondaryNavItems.map((item) => (
                        <button
                          key={item.label}
                          onClick={() => {
                            closeModal();
                            openModal(item.modal);
                          }}
                          className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition-colors text-left"
                        >
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.label}</span>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Rewarded Ad */}
                <button
                  onClick={() => {
                    closeModal();
                    openRewardedAdModal();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 mt-2 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[var(--theme-primary)]/40 active:scale-95 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-neutral-900/90 border-t border-l border-[var(--theme-primary)]/60 border-b border-r border-[var(--theme-primary)]/15 flex items-center justify-center text-[var(--theme-primary)] shadow-inner relative">
                      <PlaySquare className="w-3.5 h-3.5" />
                      <div className="absolute inset-0.5 rounded-md border border-white/5 pointer-events-none" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">Reklam İzle & Kazan</span>
                      <span className="text-[9px] text-neutral-400">+1 Şarkı İstek Hakkı</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)] text-black text-[9px] font-black uppercase">
                    +1 Hak
                  </span>
                </button>
              </nav>

              {/* Theme Switcher Widget */}
              <div className="mt-3 p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] shadow-inner">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                  <div className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                    <span className="text-[11px] font-bold text-white">Renk Teması</span>
                  </div>
                  <span className="text-[10px] font-bold text-[var(--theme-primary-light)]">
                    {THEMES.find((t) => t.id === theme)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1">
                  {THEMES.map((t) => {
                    const isSelected = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        title={`${t.name} - ${t.subtitle}`}
                        className={`flex flex-col items-center gap-1 p-1 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white/10 border border-[var(--theme-primary)] scale-105 shadow-sm'
                            : 'hover:bg-white/[0.04] border border-transparent opacity-60 hover:opacity-100 active:scale-95'
                        }`}
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center border border-white/20 shadow-sm"
                          style={{ backgroundColor: t.previewColor || t.accentColor }}
                        >
                          {isSelected && (
                            <Check className={`w-3 h-3 stroke-[3] ${t.id === 'crema' ? 'text-black' : 'text-white'}`} />
                          )}
                        </div>
                        <span className="text-[8px] font-bold text-neutral-300 truncate w-full text-center leading-none mt-0.5">
                          {t.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="pt-3 border-t border-white/[0.08] space-y-2.5 text-center">
              {user ? (
                <button
                  onClick={logout}
                  className="w-full py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Çıkış Yap</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    closeModal();
                    openModal('login');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>Giriş Yap / Kaydol</span>
                </button>
              )}

              <span className="text-[9px] font-semibold text-neutral-500 block uppercase tracking-wider">
                Muzikors Mobile © 2026
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
