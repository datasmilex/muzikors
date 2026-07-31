'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, loginWithProvider, loginPromptReason, showToast, openModal } = useApp();
  const [legalConsent, setLegalConsent] = useState(false);

  

  const handleLoginClick = (provider: 'google') => {
    if (!legalConsent) {
      showToast('Devam etmek için lütfen KVKK ve Açık Rıza metinlerini onaylayın.');
      return;
    }
    loginWithProvider(provider);
  };

  return (
    <AnimatePresence>
      {activeModal === 'login' && (<>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Login & Onboarding Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          className="relative w-full max-w-sm bg-[#120C08] border border-[#D4AF37]/30 rounded-3xl p-5 z-10 shadow-[0_15px_40px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col justify-between"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-200/70">
              Giriş Ekranı
            </span>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Reason Banner if Auth Guard Triggered */}
          {loginPromptReason && (
            <div className="mt-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl p-3 flex items-center gap-2.5 text-amber-200 text-xs font-bold">
              <AlertCircle className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <span>{loginPromptReason}</span>
            </div>
          )}

          {/* Top Layout */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37] p-1.5 glass-panel-gold flex items-center justify-center mb-3 shadow-xl gold-border-glow">
              <div className="w-full h-full rounded-full bg-[#1C130D] flex items-center justify-center text-[#D4AF37]">
                <Music className="w-8 h-8 stroke-[2.5]" />
              </div>
            </div>

            <h1 className="text-xl font-black gold-gradient-text tracking-wide">
              Muzikors
            </h1>
            <p className="text-xs text-amber-200/70 font-medium max-w-[240px] mt-1">
              Geceye Sen Yön Ver, İstediğin Şarkı Çalsın!
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[11px] font-bold text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Giriş Yapanlara +25 Hoş Geldin Kredisi!</span>
            </div>
          </div>

          {/* Main Card: Google & Spotify Login Buttons */}
          <div className="glass-panel rounded-2xl p-4 border border-[#D4AF37]/30 space-y-3 bg-[#1C130D]/90">
            <h2 className="text-sm font-bold text-center text-white mb-2">
              Giriş Yap
            </h2>

            {/* Mandatory Legal Consent */}
            <label className="flex items-start gap-2.5 cursor-pointer bg-black/40 p-3 rounded-xl border border-white/5 mb-2 group">
              <div className="mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={legalConsent}
                  onChange={(e) => setLegalConsent(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-black/50 text-[#E5A93C] focus:ring-[#E5A93C] focus:ring-offset-0 focus:ring-1 cursor-pointer"
                />
              </div>
              <span className="text-[10px] leading-relaxed font-medium text-gray-300 group-hover:text-white transition-colors">
                <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#E5A93C] hover:underline">KVKK Aydınlatma Metni</button>'ni, <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#E5A93C] hover:underline">Açık Rıza Metni</button>'ni ve <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-[#E5A93C] hover:underline">Çerez Politikası</button>'nı okudum, kabul ediyorum.
              </span>
            </label>

            {/* Google Sign-In Button */}
            <button
              onClick={() => handleLoginClick('google')}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md ring-2 ring-[#D4AF37]/40"
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

          {/* Legacy Legal Info Text Removed in favor of mandatory checkbox */}
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
