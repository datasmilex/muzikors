'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Sparkles, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, loginWithProvider, loginPromptReason, showToast, openModal } = useApp();
  const [legalConsent, setLegalConsent] = useState(false);

  const handleLoginClick = (provider: 'google') => {
    if (!legalConsent) {
      showToast('Devam etmek için lütfen yasal metinleri onaylayın.');
      return;
    }
    loginWithProvider(provider);
  };

  return (
    <AnimatePresence>
      {activeModal === 'login' && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Premium Compact Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#1C130D] to-black border border-[#D4AF37]/20 rounded-[2rem] p-6 z-10 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden flex flex-col"
        >
          {/* Subtle Cyberpunk/Futuristic Glow */}

          {/* Header Row */}
          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">Giriş Yap</span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/5 active:bg-white/10 text-gray-400 active:text-white transition-all backdrop-blur-md"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert Banner */}
          {loginPromptReason && (
            <div className="mb-4 bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2.5 text-amber-200/90 text-[11px] font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <span>{loginPromptReason}</span>
            </div>
          )}

          {/* Icon & Title */}
          <div className="flex flex-col items-center text-center mb-6 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-black/50 border border-[#D4AF37]/30 flex items-center justify-center shadow-inner mb-3 overflow-hidden p-2">
              <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain drop-shadow-md" />
            </div>

            <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm mb-1">
              Muzikors
            </h1>
            <p className="text-[11px] text-gray-400 font-medium max-w-[200px] leading-tight">
              Geceye Sen Yön Ver, İstediğin Şarkı Çalsın!
            </p>

            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/20">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wide">
                Giriş Yapanlara +10 Hoş Geldin Kredisi!
              </span>
            </div>
          </div>

          {/* Action Area */}
          <div className="relative z-10">
            {/* Legal Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer bg-[#1A1A1A]/50 p-3.5 rounded-2xl border border-white/5 mb-4 group active:bg-[#1A1A1A]/80 transition-colors">
              <div className="mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-md border border-gray-600 bg-black/50 overflow-hidden relative">
                <input
                  type="checkbox"
                  checked={legalConsent}
                  onChange={(e) => setLegalConsent(e.target.checked)}
                  className="absolute opacity-0 cursor-pointer w-full h-full"
                />
                {legalConsent && (
                  <div className="absolute inset-0 bg-[#D4AF37] flex items-center justify-center pointer-events-none">
                    <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-[10px] leading-relaxed font-medium text-gray-400 group-active:text-gray-300 transition-colors">
                <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#D4AF37] active:underline font-bold">KVKK</button>, <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#D4AF37] active:underline font-bold">Açık Rıza</button> ve <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#D4AF37] active:underline font-bold">Çerez Politikası</button>'nı okudum, kabul ediyorum.
              </span>
            </label>

            {/* Google Button */}
            <button
              onClick={() => handleLoginClick('google')}
              className="w-full py-3.5 rounded-2xl bg-white text-black font-black text-xs flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_5px_15px_rgba(255,255,255,0.1)] border border-transparent active:border-gray-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google ile Giriş Yap
            </button>
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
