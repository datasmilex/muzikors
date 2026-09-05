'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, User, Compass, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { openModal, user } = useApp();

  return (
    <div className="w-full min-h-screen bg-[var(--theme-bg)] flex flex-col justify-between relative overflow-hidden text-white select-none transition-colors duration-300">
      {/* Ambient Luxury Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg h-[400px] bg-gradient-to-b from-[var(--theme-primary)]/20 via-[var(--theme-primary-dark)]/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[100vw] h-[350px] bg-gradient-to-t from-[var(--theme-card)] via-black to-transparent blur-2xl" />
        {/* Subtle decorative grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Bar Navigation */}
      <header className="w-full px-6 pt-7 pb-4 flex items-center justify-between relative z-20">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-[var(--theme-card)] border border-white/10 p-1.5 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <img src="/logo.png" alt="Muzikors" className="w-full h-full object-contain drop-shadow-[0_0_10px_var(--theme-glow)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Muzikors
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shadow-[0_0_8px_var(--theme-glow)]" />
            </span>
            <span className="text-[10px] font-bold text-[var(--theme-primary-light)] uppercase tracking-widest -mt-0.5">
              Social Jukebox
            </span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative h-11 px-3.5 rounded-full bg-[var(--theme-card)]/90 border border-white/10 hover:border-[var(--theme-primary)]/40 active:scale-95 transition-all shadow-lg flex items-center gap-2.5 backdrop-blur-xl"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-7 h-7 object-cover rounded-full ring-1 ring-[var(--theme-primary)]/50" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)]">
              <User className="w-3.5 h-3.5" />
            </div>
          )}
          <span className="text-xs font-bold text-neutral-200">
            {user ? (user.name ? user.name.split(' ')[0] : 'Hesabım') : 'Giriş Yap'}
          </span>
        </motion.button>
      </header>

      {/* Hero Body */}
      <main className="flex-1 flex flex-col items-center justify-center w-full px-6 relative z-20 py-4">
        {/* Title and Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-center max-w-xs mx-auto mb-10"
        >
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-[1.15]">
            Mekanın Ritmini <br />
            <span className="text-[var(--theme-primary)]">Sen Belirle.</span>
          </h1>
          <p className="text-xs sm:text-sm font-normal text-neutral-400 mt-3 leading-relaxed">
            Masandaki QR kodu okut, çalan şarkıları oyla ve dilediğin parçayı anında sıraya ekle.
          </p>
        </motion.div>

        {/* Center Scanner Action Button */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 18, stiffness: 180, delay: 0.3 }}
          className="relative flex flex-col items-center my-2"
        >
          {/* Subtle Ambient Aura */}
          <div className="absolute inset-0 bg-[var(--theme-glow)] blur-3xl rounded-full -z-10 scale-125" />
          
          <button
            id="tour-qr-button"
            onClick={() => openModal('qr')}
            className="group relative w-48 h-48 rounded-[2.5rem] bg-gradient-to-b from-[var(--theme-card-alt)] to-[var(--theme-card)] border border-[var(--theme-primary)]/30 hover:border-[var(--theme-primary)]/60 flex flex-col items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_var(--theme-glow)] active:scale-95 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            {/* Animated Laser Reticle effect */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--theme-primary)] to-transparent shadow-[0_0_12px_var(--theme-glow)] animate-[scan_2.4s_ease-in-out_infinite]" />
            
            <QrCode className="w-14 h-14 text-[var(--theme-primary)] stroke-[1.75] group-hover:scale-105 transition-transform duration-300" />
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold tracking-wider uppercase text-white group-hover:text-[var(--theme-primary-light)] transition-colors">
                Bir Mekana Bağlan
              </span>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 5%; opacity: 0; }
                15% { opacity: 1; }
                85% { opacity: 1; }
                100% { top: 95%; opacity: 0; }
              }
            `}} />
          </button>
        </motion.div>

        {/* Secondary Action - Discover Venues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mt-8 w-full max-w-xs"
        >
          <button
            onClick={() => openModal('map')}
            className="w-full flex items-center justify-center gap-2.5 h-13 py-3.5 px-5 rounded-2xl bg-[var(--theme-card)]/90 hover:bg-[var(--theme-card-alt)] border border-white/10 hover:border-white/20 active:scale-95 transition-all shadow-md backdrop-blur-xl group"
          >
            <Compass className="w-4 h-4 text-[var(--theme-primary)] group-hover:rotate-45 transition-transform duration-300" />
            <span className="text-xs font-bold tracking-wide text-neutral-200 group-hover:text-white">
              Yakındaki Muzikors Mekanları
            </span>
          </button>
        </motion.div>
      </main>

      {/* Footer Info */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full pb-7 pt-3 flex flex-col items-center gap-1.5 relative z-20 text-center"
      >
        <div className="flex items-center gap-1.5 text-neutral-500 text-[10px] font-semibold tracking-wider uppercase">
          <Radio className="w-3 h-3 text-[var(--theme-primary)]/80" />
          <span>Spotify Canlı Ses Sistemi Entegrasyonu</span>
        </div>
      </motion.footer>
    </div>
  );
};
