'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Compass, QrCode, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EASE_OUT } from '../lib/motion';

// Henüz bir mekâna bağlı olmayan kullanıcının ilk ekranı: tek ana eylem QR okutmak.
export const WelcomeScreen: React.FC = () => {
  const { openModal, user } = useApp();
  const reduceMotion = useReducedMotion();

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay } },
        };

  return (
    <div className="w-full min-h-screen landscape:min-h-0 landscape:h-full flex flex-col text-white select-none">
      <header className="flex items-center justify-between px-5 pt-6 landscape:pt-3">
        <motion.div {...rise(0)} className="flex items-center gap-2.5">
          <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl object-contain bg-white/[0.06] p-1.5" />
          <span className="text-[17px] font-bold tracking-tight">Muzikors</span>
        </motion.div>
        <motion.button
          {...rise(0.05)}
          type="button"
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="h-10 pl-1.5 pr-3.5 rounded-full bg-white/[0.06] flex items-center gap-2 active:scale-95 transition-transform"
        >
          <span className="w-7 h-7 rounded-full overflow-hidden bg-white/[0.08] grid place-items-center">
            {user?.avatar && !user.avatar.includes('googleusercontent') ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-white/70" />
            )}
          </span>
          <span className="text-[13px] font-semibold">{user ? user.name?.split(' ')[0] || 'Hesabım' : 'Giriş yap'}</span>
        </motion.button>
      </header>

      <main className="flex-1 flex flex-col landscape:flex-row items-center justify-center gap-10 landscape:gap-14 px-6 py-8 landscape:py-4">
        <motion.div {...rise(0.1)} className="text-center landscape:text-left max-w-[320px]">
          <h1 className="text-[34px] landscape:text-[28px] font-bold tracking-tight leading-[1.1]">
            Mekânın müziğini
            <br />
            <span className="text-[var(--theme-primary)]">sen seç.</span>
          </h1>
          <p className="text-[15px] text-white/55 mt-4 leading-relaxed">
            Masandaki QR kodu okut, şarkını sıraya ekle, sıradakileri oyla.
          </p>
        </motion.div>

        <motion.div {...rise(0.18)} className="w-full max-w-[300px] space-y-3">
          <button
            id="tour-qr-button"
            type="button"
            onClick={() => openModal('qr')}
            className="w-full rounded-[28px] bg-[var(--theme-card)] p-6 flex flex-col items-center gap-4 active:scale-[0.98] transition-transform duration-150"
          >
            <span className="relative w-20 h-20 rounded-3xl bg-white/[0.05] grid place-items-center">
              <span className="ring-out absolute inset-0 rounded-3xl border border-[var(--theme-primary)]/40" aria-hidden="true" />
              <QrCode className="w-9 h-9 text-[var(--theme-primary)]" strokeWidth={1.75} />
            </span>
            <span className="text-center">
              <span className="block text-[16px] font-bold">QR kodu okut</span>
              <span className="block text-[13px] text-white/50 mt-0.5">Masadaki kodla mekâna bağlan</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => openModal('map')}
            className="w-full min-h-[48px] rounded-2xl bg-white/[0.05] flex items-center justify-center gap-2 text-[14px] font-semibold text-white/75 active:scale-[0.98] transition-transform duration-150"
          >
            <Compass className="w-4 h-4 text-white/55" />
            Yakındaki mekânlar
          </button>
        </motion.div>
      </main>

      <footer className="pb-6 landscape:pb-3 text-center text-[12px] text-white/30">
        <a href="/legal/terms" className="hover:text-white/60">Koşullar</a>
        <span className="mx-2">·</span>
        <a href="/legal/privacy" className="hover:text-white/60">Gizlilik</a>
      </footer>
    </div>
  );
};
