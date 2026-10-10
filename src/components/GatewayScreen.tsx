'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Check, Copy, ExternalLink, Music, Store, Wifi, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EASE_OUT } from '../lib/motion';
import { groupCard, groupRow } from './ui/controls';

// Mekâna ilk bağlanınca gösterilen karşılama: mekânın adı, Wi-Fi ve menü.
export const GatewayScreen: React.FC = () => {
  const { activeVenue, setHasEnteredGateway, openModal, showToast } = useApp();
  const reduceMotion = useReducedMotion();
  const [copied, setCopied] = useState(false);

  if (!activeVenue) return null;

  const wifiName = activeVenue.wifi_name || (activeVenue as any).wifi_ssid || '';
  const wifiPass = activeVenue.wifi_password || (activeVenue as any).wifi_pass || '';
  const menuUrl = activeVenue.menu_link || (activeVenue as any).menu_url || '';
  const isNativeMenu = activeVenue.menu_type === 'native';
  const hasMenu = isNativeMenu || Boolean(menuUrl.trim());

  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT, delay } },
        };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(wifiPass);
      setCopied(true);
      showToast('Wi-Fi şifresi kopyalandı');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Kopyalanamadı');
    }
  };

  return (
    <div className="relative flex-1 min-h-screen landscape:min-h-0 landscape:h-full flex flex-col text-white overflow-y-auto">
      <button
        type="button"
        onClick={() => setHasEnteredGateway(true)}
        aria-label="Kapat"
        className="absolute top-4 right-4 w-11 h-11 grid place-items-center rounded-full text-white/70 active:scale-95 transition-transform z-10"
      >
        <span className="w-9 h-9 grid place-items-center rounded-full bg-white/[0.07]">
          <X className="w-[18px] h-[18px]" />
        </span>
      </button>

      <div className="flex-1 flex flex-col landscape:flex-row items-center justify-center gap-8 landscape:gap-12 px-6 py-12 landscape:py-6">
        <motion.div {...rise(0)} className="flex flex-col items-center text-center">
          <span className="w-28 h-28 landscape:w-24 landscape:h-24 rounded-[32px] overflow-hidden bg-[var(--theme-card)] grid place-items-center shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {activeVenue.logo_url?.trim() ? (
              <img src={activeVenue.logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-12 h-12 text-white/40" />
            )}
          </span>
          <p className="text-[14px] text-white/50 mt-5">Hoş geldin</p>
          <h1 className="text-[26px] font-bold tracking-tight mt-0.5 max-w-[300px]">{activeVenue.venue_name || activeVenue.name}</h1>
        </motion.div>

        <motion.div {...rise(0.1)} className="w-full max-w-[340px] space-y-3">
          <button
            type="button"
            onClick={() => setHasEnteredGateway(true)}
            className="w-full min-h-[52px] rounded-2xl bg-[var(--theme-primary)] text-black text-[16px] font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
          >
            <Music className="w-5 h-5" />
            Müziğe katıl
          </button>

          {(wifiName || wifiPass || hasMenu) && (
            <div className={groupCard}>
              {wifiName && (
                <div className={groupRow}>
                  <Wifi className="w-[18px] h-[18px] text-white/55" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] text-white/45">Wi-Fi</span>
                    <span className="block text-[15px] font-medium truncate">{wifiName}</span>
                  </span>
                </div>
              )}
              {wifiPass && (
                <button type="button" onClick={copyPassword} className={groupRow}>
                  <span className="w-[18px]" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[12px] text-white/45">Şifre · kopyalamak için dokun</span>
                    <span className="block text-[15px] font-medium font-mono truncate">{wifiPass}</span>
                  </span>
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                </button>
              )}
              {hasMenu &&
                (isNativeMenu ? (
                  <button type="button" onClick={() => openModal('menu')} className={groupRow}>
                    <BookOpen className="w-[18px] h-[18px] text-white/55" />
                    <span className="flex-1 text-[15px] font-medium">Menüyü görüntüle</span>
                  </button>
                ) : (
                  <a href={menuUrl} target="_blank" rel="noopener noreferrer" className={groupRow}>
                    <BookOpen className="w-[18px] h-[18px] text-white/55" />
                    <span className="flex-1 text-[15px] font-medium">Menüyü görüntüle</span>
                    <ExternalLink className="w-4 h-4 text-white/30" />
                  </a>
                ))}
            </div>
          )}
        </motion.div>
      </div>

      <footer className="pb-5 text-center text-[12px] text-white/30">
        <a href="/legal/terms" className="hover:text-white/60">Koşullar</a>
        <span className="mx-2">·</span>
        <a href="/legal/privacy" className="hover:text-white/60">Gizlilik</a>
        <span className="mx-2">·</span>
        <a href="/legal/refund" className="hover:text-white/60">İptal ve iade</a>
      </footer>
    </div>
  );
};
