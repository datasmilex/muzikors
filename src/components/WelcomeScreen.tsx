'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, User, Compass } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { openModal, user } = useApp();

  return (
    <div className="w-full min-h-screen bg-[var(--theme-bg)] flex flex-col justify-between relative overflow-hidden text-white select-none transition-colors duration-300">
      {/* Top Bar Sheen */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Top Bar Navigation */}
      <header className="w-full px-5 pt-6 pb-3 flex items-center justify-between relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 p-1.5 flex items-center justify-center shadow-md">
            <img src="/logo.png" alt="Muzikors" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              Muzikors
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
            </span>
            <span className="text-[9px] font-bold text-[var(--theme-primary-light)] uppercase tracking-widest -mt-0.5">
              Social Jukebox
            </span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="h-9 px-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 active:scale-95 transition-all flex items-center gap-2"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-5 h-5 object-cover rounded-full ring-1 ring-[var(--theme-primary)]/40" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)]">
              <User className="w-3 h-3" />
            </div>
          )}
          <span className="text-xs font-semibold text-neutral-200">
            {user ? (user.name ? user.name.split(' ')[0] : 'Hesabım') : 'Giriş Yap'}
          </span>
        </motion.button>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-5 relative z-20 py-4">
        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="text-center max-w-xs mx-auto mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Mekanın Ritmini <br />
            <span className="text-[var(--theme-primary)]">Sen Belirle.</span>
          </h1>
          <p className="text-xs sm:text-sm font-normal text-neutral-400 mt-3 leading-relaxed">
            Masandaki QR kodu okut, çalan şarkıları oyla ve dilediğin parçayı anında sıraya ekle.
          </p>
        </motion.div>

        {/* Center Scanner Action Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.2 }}
          className="relative flex flex-col items-center w-full max-w-[280px]"
        >
          <button
            id="tour-qr-button"
            onClick={() => openModal('qr')}
            className="group w-full p-6 rounded-2xl bg-neutral-900/80 border border-white/10 hover:border-[var(--theme-primary)]/40 flex flex-col items-center justify-center gap-4 shadow-xl active:scale-[0.98] transition-all cursor-pointer"
          >
            {/* Minimal Lens Reticle Frame */}
            <div className="relative w-20 h-20 rounded-xl bg-black/60 border border-white/10 group-hover:border-[var(--theme-primary)]/40 flex items-center justify-center transition-colors">
              <div className="w-2.5 h-2.5 border-t border-l border-[var(--theme-primary)]/70 absolute top-1 left-1" />
              <div className="w-2.5 h-2.5 border-t border-r border-[var(--theme-primary)]/70 absolute top-1 right-1" />
              <div className="w-2.5 h-2.5 border-b border-l border-[var(--theme-primary)]/70 absolute bottom-1 left-1" />
              <div className="w-2.5 h-2.5 border-b border-r border-[var(--theme-primary)]/70 absolute bottom-1 right-1" />
              
              <QrCode className="w-10 h-10 text-[var(--theme-primary)] group-hover:scale-105 transition-transform" />
            </div>

            <div className="text-center">
              <span className="text-sm font-bold tracking-wide text-white block">
                QR Kodu Tara & Bağlan
              </span>
              <span className="text-[11px] text-neutral-400 mt-0.5 block">
                Masanızdaki karekodu okutun
              </span>
            </div>
          </button>
        </motion.div>

        {/* Secondary Action - Discover Venues */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-4 w-full max-w-[280px]"
        >
          <button
            onClick={() => openModal('map')}
            className="w-full flex items-center justify-center gap-2 h-11 px-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-white/15 active:scale-[0.98] transition-all text-neutral-300 hover:text-white"
          >
            <Compass className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span className="text-xs font-semibold">
              Yakındaki Muzikors Mekanları
            </span>
          </button>
        </motion.div>
      </main>

      {/* Footer Info */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full pb-6 pt-2 flex items-center justify-center gap-2 text-neutral-500 text-[10px] font-medium tracking-wider uppercase"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Spotify Canlı Ses Sistemi Entegrasyonu</span>
      </motion.footer>
    </div>
  );
};
