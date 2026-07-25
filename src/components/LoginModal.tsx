'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, X, Sparkles, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, loginWithProvider, loginPromptReason, showToast, openModal } = useApp();
  const [legalConsent, setLegalConsent] = useState(false);

  if (activeModal !== 'login') return null;

  const handleLoginClick = (provider: 'google' | 'spotify') => {
    if (!legalConsent) {
      showToast('Devam etmek için lütfen KVKK ve Açık Rıza metinlerini onaylayın.');
      return;
    }
    loginWithProvider(provider);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-2xl"
        />

        {/* Login & Onboarding Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-sm bg-[#120C08] border-2 border-[#D4AF37]/40 rounded-[32px] p-6 z-10 shadow-2xl overflow-hidden flex flex-col justify-between"
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

            <h1 className="text-2xl font-black gold-gradient-text tracking-wide">
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

            {/* Spotify Sign-In Button */}
            <button
              onClick={() => handleLoginClick('spotify')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-md"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 496 512">
                <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-35.9-22-81.1-26.8-134.2-14.7-9.5 2.2-19.4-3.8-21.6-13.3-2.2-9.5 3.8-19.4 13.3-21.6 59-13.4 109.4-7.7 149.9 17.1 7.4 4.5 9.7 14.3 5.3 21.7-2.4 4.1-7.1 6.8-11.7 6.8zm28.9-64.4c-5.3 0-8.6-1.6-13.5-4.5-43.2-26.5-109.1-34.2-160.3-18.7-11.8 3.6-24.1-3.2-27.7-15-3.6-11.8 3.2-24.1 15-27.7 58.7-17.7 131.7-8.9 181.7 21.8 9.5 5.8 12.5 18.2 6.7 27.7-3.1 5.3-9.1 8.7-15 8.7zm2.7-67.6C321.4 186.8 238 184 181.4 201.2c-14.3 4.3-29.2-3.8-33.5-18.1-4.3-14.3 3.8-29.2 18.1-33.5 63.7-19.4 156.1-16.1 220.1 21.9 12.9 7.7 17.2 24.4 9.5 37.3-5 8.2-13.9 12.1-22.3 12.1z" />
              </svg>
              <span>Spotify ile Giriş Yap</span>
            </button>
          </div>

          {/* Legacy Legal Info Text Removed in favor of mandatory checkbox */}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
