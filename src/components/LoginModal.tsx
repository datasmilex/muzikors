'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, loginWithProvider, loginPromptReason, showToast, openModal } = useApp();
  const [legalConsent, setLegalConsent] = useState(false);

  const handleLoginClick = (provider: 'google' | 'apple') => {
    if (!legalConsent) {
      showToast('Devam etmek için lütfen yasal metinleri onaylayın.');
      return;
    }
    loginWithProvider(provider);
  };

  return (
    <AnimatePresence>
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 landscape:p-2">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ willChange: 'opacity' }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/85"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className="relative w-full max-w-sm landscape:max-w-xl bg-[var(--theme-card)] border border-white/[0.1] rounded-3xl landscape:rounded-2xl p-6 landscape:p-4 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[94vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-end mb-1">
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Split for Landscape */}
            <div className="landscape:grid landscape:grid-cols-2 landscape:gap-4 landscape:items-center">
              {/* Left Column: Hero Icon & Title */}
              <div className="flex flex-col items-center text-center mb-5 landscape:mb-0">
                <div className="w-14 h-14 landscape:w-12 landscape:h-12 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 landscape:mb-2 p-2.5">
                  <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain" />
                </div>

                <h2 className="text-xl landscape:text-lg font-bold text-white tracking-tight">
                  Muzikors&apos;a Giriş Yap
                </h2>
                <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                  Mekanın çalma listesine şarkı ekle, oyla ve ritmi yönet.
                </p>
              </div>

              {/* Right Column: Actions */}
              <div className="space-y-3">
                {/* Alert Banner */}
                {loginPromptReason && (
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-2.5 flex items-start gap-2 text-neutral-300 text-xs font-medium leading-relaxed">
                    <AlertCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                    <span>{loginPromptReason}</span>
                  </div>
                )}

                {/* Legal Checkbox */}
                <label className="flex items-start gap-2.5 cursor-pointer bg-white/[0.03] p-2.5 rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                  <div className="mt-0.5 shrink-0 flex items-center justify-center w-4 h-4 rounded-md border border-neutral-600 bg-black overflow-hidden relative">
                    <input
                      type="checkbox"
                      checked={legalConsent}
                      onChange={(e) => setLegalConsent(e.target.checked)}
                      className="absolute opacity-0 cursor-pointer w-full h-full"
                    />
                    {legalConsent && (
                      <div className="absolute inset-0 bg-[var(--theme-primary)] flex items-center justify-center pointer-events-none">
                        <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] leading-relaxed text-neutral-400 select-none">
                    <button type="button" onClick={(e) => { e.stopPropagation(); openModal('kvkk'); }} className="text-[var(--theme-primary-light)] hover:underline font-bold cursor-pointer">KVKK</button>,{' '}
                    <button type="button" onClick={(e) => { e.stopPropagation(); openModal('consent'); }} className="text-[var(--theme-primary-light)] hover:underline font-bold cursor-pointer">Açık Rıza</button>,{' '}
                    <button type="button" onClick={(e) => { e.stopPropagation(); openModal('cookie'); }} className="text-[var(--theme-primary-light)] hover:underline font-bold cursor-pointer">Çerez</button> ve{' '}
                    <button type="button" onClick={(e) => { e.stopPropagation(); openModal('terms'); }} className="text-[var(--theme-primary-light)] hover:underline font-bold cursor-pointer">Kullanım Koşulları</button>&apos;nı okudum, onaylıyorum.
                  </span>
                </label>

                {/* Google Button */}
                <button
                  onClick={() => handleLoginClick('google')}
                  className="w-full py-3 px-4 rounded-2xl bg-white text-black font-black text-xs flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-md hover:bg-neutral-100 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google ile Giriş Yap</span>
                </button>

                {/* Apple Button */}
                <button
                  onClick={() => handleLoginClick('apple')}
                  className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-neutral-900 border border-white/20 text-white font-black text-xs flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-md cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.71-14.25-5.78-9.08-10.36-19.14-13.73-30.19-3.37-11.05-5.06-21.72-5.06-32 0-14.15 3.37-26.04 10.11-35.66 6.74-9.62 15.44-14.54 26.1-14.76 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.38 3.53 11.53 3.75 1.85-.22 5.89-1.52 12.11-3.9 6.23-2.39 11.41-3.47 15.55-3.26 13.92.76 24.81 5.98 32.65 15.65-12.18 7.39-18.15 17.5-17.93 30.33.22 10.22 4.13 18.81 11.74 25.77 7.61 6.96 16.63 10.87 27.07 11.74-2.18 6.52-4.89 13.48-8.15 20.87zM119.22 31.85c0-7.39 2.61-14.13 7.83-20.22 5.22-6.09 11.63-9.9 19.24-11.41.22 1.3.33 2.5.33 3.59 0 7.39-2.72 14.35-8.15 20.87-5.43 6.52-12.07 10.33-19.89 11.41-.22-1.08-.36-2.5-.36-4.24z" />
                  </svg>
                  <span>Apple ile Giriş Yap</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
