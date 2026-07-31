'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { QrCode, Map, User, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WelcomeScreen: React.FC = () => {
  const { openModal, user } = useApp();

  return (
    <div className="w-full min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-between relative overflow-hidden">
      {/* Background Cinematic Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#D4AF37]/10 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-[#120C08] blur-[120px] rounded-full mix-blend-screen" />
        
        {/* Animated Particles or subtle lines can be added here if desired */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5 mix-blend-overlay" />
      </div>

      {/* Top Header - Minimal */}
      <div className="w-full px-6 py-8 flex items-center justify-between relative z-20">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#241911] to-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center shadow-inner relative group">
            <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse pointer-events-none rounded-2xl" />
            <img src="/logo.png" alt="Muzikors" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
          </div>
          <span className="text-xl font-black tracking-tight text-white drop-shadow-md">
            Muzikors
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative w-11 h-11 rounded-full border border-[#D4AF37]/30 p-0.5 bg-[#120C08] hover:border-[#D4AF37] hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-center"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-5 h-5 text-[#D4AF37]" />
          )}
        </motion.button>
      </div>

      {/* Main Content (Center) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-6 relative z-20 mb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl font-black text-white tracking-tight leading-tight drop-shadow-lg">
            Mekanın Ritmini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F3D573]">
              Sen Belirle
            </span>
          </h1>
          <p className="text-sm font-medium text-amber-200/50 mt-4 max-w-[260px] mx-auto leading-relaxed">
            Müzikors'a bağlanan masanla şarkı isteklerini gönder, anın tadını çıkar.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200, delay: 0.4 }}
          className="relative flex flex-col items-center"
        >
          {/* Main Huge QR Button */}
          <button
            onClick={() => openModal('qr')}
            className="relative w-48 h-48 rounded-[3rem] bg-gradient-to-br from-[#1C130D] to-black border-2 border-[#D4AF37]/40 flex flex-col items-center justify-center gap-4 shadow-[0_0_60px_rgba(212,175,55,0.2)] hover:shadow-[0_0_80px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group overflow-hidden"
          >
            {/* Inner rotating glow */}
            <div className="absolute inset-[-50%] bg-gradient-to-tr from-transparent via-[#D4AF37]/20 to-transparent animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            {/* Scanner line effect inside button */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#D4AF37] shadow-[0_0_10px_#D4AF37] animate-[scan_2.5s_ease-in-out_infinite] opacity-70 pointer-events-none" />
            
            <QrCode className="w-16 h-16 text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.6)] relative z-10 group-hover:scale-110 transition-transform duration-300" strokeWidth={1.5} />
            
            <span className="text-[15px] font-black tracking-widest uppercase text-white drop-shadow-md relative z-10">
              QR Okut
            </span>
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { top: 100%; opacity: 0; }
              }
            `}} />
          </button>

          {/* Pulsing rings behind the button */}
          <div className="absolute inset-0 rounded-[3rem] border border-[#D4AF37]/30 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] pointer-events-none -z-10" />
          <div className="absolute inset-[-10px] rounded-[3.5rem] border border-[#D4AF37]/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] delay-1000 pointer-events-none -z-10" />
        </motion.div>

        {/* Secondary Map Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-14 w-full max-w-[240px]"
        >
          <button
            onClick={() => openModal('map')}
            className="w-full flex items-center justify-center gap-3 h-14 rounded-full bg-[#1A1A1A]/60 backdrop-blur-xl border border-white/10 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] active:scale-95 group"
          >
            <Map className="w-5 h-5 text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
            <span className="text-sm font-black tracking-wider uppercase text-gray-300 group-hover:text-white transition-colors">
              Mekanları Keşfet
            </span>
          </button>
        </motion.div>
      </div>

      {/* Bottom Footer Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="w-full pb-8 pt-4 flex flex-col items-center gap-2 relative z-20"
      >
        <div className="flex items-center gap-1.5 text-[#D4AF37]/50 text-[10px] font-bold tracking-widest uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Güvenli Bağlantı</span>
        </div>
        <p className="text-[10px] font-medium text-gray-500/50 text-center px-8">
          Muzikors sistemiyle uyumlu bir masanın QR kodunu okuttuğunuzda otomatik olarak bağlanacaksınız.
        </p>
      </motion.div>
    </div>
  );
};
