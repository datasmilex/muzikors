'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, MapPin, User, Sparkles, Compass, Radio } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { openModal, user } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#070604] flex flex-col justify-between relative overflow-hidden text-white select-none">
      {/* Ambient Luxury Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] max-w-lg h-[400px] bg-gradient-to-b from-[#f59e0b]/15 via-[#d97706]/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[100vw] h-[350px] bg-gradient-to-t from-[#141318] via-black to-transparent blur-2xl" />
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
          <div className="w-10 h-10 rounded-2xl bg-[#141318] border border-white/10 p-1.5 flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
            <img src="/logo.png" alt="Muzikors" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              Muzikors
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            </span>
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest -mt-0.5">
              Social Jukebox
            </span>
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative h-11 px-3.5 rounded-full bg-[#141318]/90 border border-white/10 hover:border-amber-400/40 active:scale-95 transition-all shadow-lg flex items-center gap-2.5 backdrop-blur-xl"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-7 h-7 object-cover rounded-full ring-1 ring-amber-400/50" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-[11px] font-bold tracking-wide uppercase mb-4 shadow-sm">
            <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>İnteraktif Mekan Müziği</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-[1.15]">
            Mekanın Ritmini <br />
            <span className="text-amber-400">Sen Belirle.</span>
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
          <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full -z-10 scale-125" />
          
          <button
            id="tour-qr-button"
            onClick={() => openModal('qr')}
            className="group relative w-48 h-48 rounded-[2.5rem] bg-gradient-to-b from-[#1c1a24] to-[#100f14] border border-amber-400/30 hover:border-amber-400/60 flex flex-col items-center justify-center gap-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(245,158,11,0.2)] active:scale-95 transition-all duration-300 overflow-hidden"
          >
            {/* Animated Laser Reticle effect */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_12px_#f59e0b] animate-[scan_2.4s_ease-in-out_infinite]" />
            
            <div className="w-20 h-20 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 group-hover:scale-105 group-active:scale-95 transition-transform duration-300 shadow-inner">
              <QrCode className="w-10 h-10 stroke-[1.75]" />
            </div>
            
            <div className="flex flex-col items-center -mt-1">
              <span className="text-sm font-black tracking-widest uppercase text-white group-hover:text-amber-300 transition-colors">
                Masa QR Okut
              </span>
              <span className="text-[10px] font-semibold text-neutral-400 tracking-normal mt-0.5">
                Kamerayı Açmak İçin Dokun
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
            className="w-full flex items-center justify-center gap-2.5 h-13 py-3.5 px-5 rounded-2xl bg-[#141318]/90 hover:bg-[#1a1920] border border-white/10 hover:border-white/20 active:scale-95 transition-all shadow-md backdrop-blur-xl group"
          >
            <Compass className="w-4 h-4 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
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
          <Sparkles className="w-3 h-3 text-amber-400/80" />
          <span>Spotify Canlı Ses Sistemi Entegrasyonu</span>
        </div>
      </motion.footer>
    </div>
  );
};
