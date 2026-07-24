'use client';

import React from 'react';
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
  LogIn
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModalType } from '../types';

export const DrawerMenu: React.FC = () => {
  const { activeModal, closeModal, openModal, user, logout, loginWithProvider } = useApp();

  if (activeModal !== 'drawer') return null;

  const navItems: { label: string; icon: React.ReactNode; modal: ModalType }[] = [
    { label: 'Profil', icon: <User className="w-5 h-5 text-[#D4AF37]" />, modal: 'profile' },
    { label: 'Kampanyalar', icon: <Gift className="w-5 h-5 text-[#D4AF37]" />, modal: 'campaigns' },
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

                  <button
                    onClick={() => {
                      closeModal();
                      loginWithProvider('spotify');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 496 512">
                      <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-35.9-22-81.1-26.8-134.2-14.7-9.5 2.2-19.4-3.8-21.6-13.3-2.2-9.5 3.8-19.4 13.3-21.6 59-13.4 109.4-7.7 149.9 17.1 7.4 4.5 9.7 14.3 5.3 21.7-2.4 4.1-7.1 6.8-11.7 6.8zm28.9-64.4c-5.3 0-8.6-1.6-13.5-4.5-43.2-26.5-109.1-34.2-160.3-18.7-11.8 3.6-24.1-3.2-27.7-15-3.6-11.8 3.2-24.1 15-27.7 58.7-17.7 131.7-8.9 181.7 21.8 9.5 5.8 12.5 18.2 6.7 27.7-3.1 5.3-9.1 8.7-15 8.7zm2.7-67.6C321.4 186.8 238 184 181.4 201.2c-14.3 4.3-29.2-3.8-33.5-18.1-4.3-14.3 3.8-29.2 18.1-33.5 63.7-19.4 156.1-16.1 220.1 21.9 12.9 7.7 17.2 24.4 9.5 37.3-5 8.2-13.9 12.1-22.3 12.1z" />
                    </svg>
                    <span>Spotify ile Giriş Yap</span>
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
                    <h3 className="text-xs font-bold text-white truncate">{user.name}</h3>
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
                    openModal(item.modal);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#1C130D] border border-transparent hover:border-[#D4AF37]/20 text-amber-100/90 font-medium text-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1C130D] border border-[#D4AF37]/20 flex items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
                      {item.icon}
                    </div>
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-200/40 group-hover:text-[#D4AF37] group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
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
