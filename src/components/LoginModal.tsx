'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sheet } from './ui/Sheet';
import { SPRING_SNAPPY } from '../lib/motion';

const Checkbox: React.FC<{ checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }> = ({ checked, onChange, children }) => (
  <label className="flex items-start gap-3 cursor-pointer select-none py-1">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
    <span
      aria-hidden="true"
      className={`mt-0.5 w-[22px] h-[22px] shrink-0 rounded-[7px] grid place-items-center transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-white/60 ${
        checked ? 'bg-[var(--theme-primary)]' : 'bg-white/[0.08] border border-white/15'
      }`}
    >
      <motion.span initial={false} animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }} transition={SPRING_SNAPPY}>
        <Check className="w-3.5 h-3.5 text-black" strokeWidth={3.5} />
      </motion.span>
    </span>
    <span className="text-[13px] leading-relaxed text-white/65">{children}</span>
  </label>
);

export const LoginModal: React.FC = () => {
  const { activeModal, closeModal, loginWithProvider, loginPromptReason, showToast, openModal } = useApp();
  const [ageConsent, setAgeConsent] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);

  const ready = ageConsent && legalConsent;

  const handleLogin = (provider: 'google' | 'apple') => {
    if (!ageConsent) {
      showToast('Devam etmek için 13 yaşından büyük olduğunu onaylaman gerekiyor.');
      return;
    }
    if (!legalConsent) {
      showToast('Devam etmek için yasal metinleri onaylaman gerekiyor.');
      return;
    }
    loginWithProvider(provider);
  };

  const legalLink = (to: 'kvkk' | 'consent' | 'cookie' | 'terms', label: string) => (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        openModal(to);
      }}
      className="text-white underline underline-offset-2 decoration-white/30 hover:decoration-white"
    >
      {label}
    </button>
  );

  return (
    <Sheet open={activeModal === 'login'} onClose={closeModal} width="sm" ariaLabel="Giriş yap">
      <div className="flex flex-col items-center text-center pt-1">
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] p-3 mb-4">
          <img src="/logo.png" alt="" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight">Muzikors&apos;a hoş geldin</h2>
        <p className="text-[14px] text-white/55 mt-1.5 max-w-[280px] leading-relaxed">
          {loginPromptReason || 'Şarkı istemek ve sıradakileri oylamak için giriş yap.'}
        </p>
      </div>

      <div className="mt-6 space-y-2">
        <Checkbox checked={ageConsent} onChange={setAgeConsent}>
          13 yaşından büyüğüm.
        </Checkbox>
        <Checkbox checked={legalConsent} onChange={setLegalConsent}>
          {legalLink('kvkk', 'Aydınlatma metnini')}, {legalLink('consent', 'açık rıza')} ve{' '}
          {legalLink('cookie', 'çerez')} metinlerini okudum; {legalLink('terms', 'kullanım koşullarını')} kabul ediyorum.
        </Checkbox>
      </div>

      <div className={`mt-6 space-y-2.5 transition-opacity duration-200 ${ready ? 'opacity-100' : 'opacity-60'}`}>
        <button
          type="button"
          onClick={() => handleLogin('google')}
          className="w-full min-h-[50px] px-5 rounded-2xl bg-white text-black text-[15px] font-semibold flex items-center justify-center gap-3 active:scale-[0.97] transition-transform duration-150"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Google ile devam et</span>
        </button>
        <button
          type="button"
          onClick={() => handleLogin('apple')}
          className="w-full min-h-[50px] px-5 rounded-2xl bg-black border border-white/15 text-white text-[15px] font-semibold flex items-center justify-center gap-3 active:scale-[0.97] transition-transform duration-150"
        >
          <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 170 170" aria-hidden="true">
            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.71-14.25-5.78-9.08-10.36-19.14-13.73-30.19-3.37-11.05-5.06-21.72-5.06-32 0-14.15 3.37-26.04 10.11-35.66 6.74-9.62 15.44-14.54 26.1-14.76 4.35 0 9.29 1.14 14.83 3.42 5.54 2.28 9.38 3.53 11.53 3.75 1.85-.22 5.89-1.52 12.11-3.9 6.23-2.39 11.41-3.47 15.55-3.26 13.92.76 24.81 5.98 32.65 15.65-12.18 7.39-18.15 17.5-17.93 30.33.22 10.22 4.13 18.81 11.74 25.77 7.61 6.96 16.63 10.87 27.07 11.74-2.18 6.52-4.89 13.48-8.15 20.87zM119.22 31.85c0-7.39 2.61-14.13 7.83-20.22 5.22-6.09 11.63-9.9 19.24-11.41.22 1.3.33 2.5.33 3.59 0 7.39-2.72 14.35-8.15 20.87-5.43 6.52-12.07 10.33-19.89 11.41-.22-1.08-.36-2.5-.36-4.24z" />
          </svg>
          <span>Apple ile devam et</span>
        </button>
      </div>
    </Sheet>
  );
};
