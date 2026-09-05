'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
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
      {activeModal === 'login' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm bg-[var(--theme-card)] border border-white/[0.1] rounded-3xl p-6 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-end mb-2">
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alert Banner */}
            {loginPromptReason && (
              <div className="mb-4 bg-white/[0.03] border border-white/10 rounded-2xl p-3 flex items-start gap-2.5 text-neutral-300 text-xs font-medium leading-relaxed">
                <AlertCircle className="w-4 h-4 text-[var(--theme-primary)] shrink-0 mt-0.5" />
                <span>{loginPromptReason}</span>
              </div>
            )}

            {/* Hero Icon & Title */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center mb-3 p-2.5">
                <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain" />
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight">
                Muzikors&apos;a Giriş Yap
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-[240px]">
                Mekanın çalma listesine şarkı ekle, oyla ve ritmi yönet.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              {/* Legal Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer bg-white/[0.03] p-3 rounded-2xl border border-white/[0.06] hover:bg-white/[0.06] transition-colors">
                <div className="mt-0.5 shrink-0 flex items-center justify-center w-4 h-4 rounded-md border border-neutral-600 bg-black overflow-hidden relative">
                  <input
                    type="checkbox"
                    checked={legalConsent}
                    onChange={(e) => setLegalConsent(e.target.checked)}
                    className="absolute opacity-0 cursor-pointer w-full h-full"
                  />
                  {legalConsent && (
                    <div className="absolute inset-0 bg-amber-400 flex items-center justify-center pointer-events-none">
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-[10px] leading-relaxed text-neutral-400">
                  <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-amber-400 hover:underline font-bold">KVKK</button>, <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-amber-400 hover:underline font-bold">Açık Rıza</button> ve <button type="button" onClick={(e) => { e.preventDefault(); openModal('terms'); }} className="text-amber-400 hover:underline font-bold">Çerez Politikası</button>&apos;nı okudum, onaylıyorum.
                </span>
              </label>

              {/* Google Button */}
              <button
                onClick={() => handleLoginClick('google')}
                className="w-full py-3.5 px-4 rounded-2xl bg-white text-black font-black text-xs flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-md hover:bg-neutral-100"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google ile Giriş Yap</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
