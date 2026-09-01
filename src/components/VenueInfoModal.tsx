'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, BookOpen, Wifi, Copy, Check, Clock, X, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VenueInfoModal: React.FC = () => {
  const { activeModal, closeModal, openModal, activeVenue, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeVenue) return null;

  const wifiName = (activeVenue as any).wifi_name || (activeVenue as any).wifi_ssid;
  const wifiPass = (activeVenue as any).wifi_password || (activeVenue as any).wifi_pass;
  const menuUrl = (activeVenue as any).menu_link || (activeVenue as any).menu_url;
  const isNativeMenu = (activeVenue as any).menu_type === 'native';
  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = isNativeMenu || Boolean(menuUrl?.trim());
  const allowedGenres = activeVenue.allowed_genres || [];
  const hasVibeGuard = Array.isArray(allowedGenres) && allowedGenres.length > 0;

  const formatTime = (t?: string) => {
    if (!t) return null;
    return t.slice(0, 5); // "09:00:00" -> "09:00"
  };

  const openingTime = formatTime((activeVenue as any).opening_time);
  const closingTime = formatTime((activeVenue as any).closing_time);
  const hasWorkingHours = Boolean(openingTime) && Boolean(closingTime);

  return (
    <AnimatePresence>
      {activeModal === 'venue_info' && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-md h-[85vh] sm:h-[620px] sm:rounded-3xl rounded-t-[2.5rem] flex flex-col overflow-hidden bg-[var(--theme-card)] border-t sm:border border-white/[0.1] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] z-10"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-12 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex-none px-5 py-3 flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[var(--theme-primary)]" />
                <h2 className="text-base font-black tracking-tight text-white">Mekân Bilgileri</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center space-y-6 pb-20 custom-scrollbar">
              {/* Logo Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="w-24 h-24 rounded-full border border-[var(--theme-primary)]/30 p-1 flex items-center justify-center bg-[var(--theme-card-alt)] shadow-lg overflow-hidden relative">
                  {(activeVenue as any).logo_url?.trim() ? (
                    <img 
                      src={(activeVenue as any).logo_url} 
                      alt={(activeVenue as any).venue_name || (activeVenue as any).name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Store className="w-10 h-10 text-[var(--theme-primary)]" />
                  )}
                </div>
                <div className="text-center space-y-1">
                  <h1 className="text-xl font-black text-white tracking-tight">
                    {(activeVenue as any).venue_name || (activeVenue as any).name}
                  </h1>
                  {hasWorkingHours && (
                    <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-white/[0.04] border border-white/10 rounded-full text-neutral-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span>{openingTime} - {closingTime}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons & Info */}
              <div className="w-full space-y-4">
                {hasMenu && (
                  isNativeMenu ? (
                    <button
                      type="button"
                      onClick={() => openModal('menu')}
                      className="w-full py-3.5 rounded-2xl bg-[var(--theme-card-alt)] hover:bg-[var(--theme-card)] border border-[var(--theme-primary)]/30 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                      <span>Dijital Menüyü İncele</span>
                    </button>
                  ) : (
                    <a
                      href={menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 rounded-2xl bg-[var(--theme-card-alt)] hover:bg-[var(--theme-card)] border border-[var(--theme-primary)]/30 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-sm"
                    >
                      <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                      <span>Dijital Menüyü İncele</span>
                    </a>
                  )
                )}

                {hasWifi && (
                  <div className="w-full bg-[var(--theme-card-alt)] border border-white/[0.08] rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3.5 border-b border-white/[0.06] pb-2.5">
                      <Wifi className="w-4 h-4 text-[var(--theme-primary)]" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Wi-Fi Bilgileri</h3>
                    </div>
                    
                    <div className="space-y-2.5">
                      {wifiName?.trim() && (
                        <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Ağ Adı</span>
                          <span className="text-xs text-white font-bold">{wifiName}</span>
                        </div>
                      )}
                      
                      {wifiPass?.trim() && (
                        <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                          <span className="text-[10px] text-neutral-400 font-bold uppercase">Şifre</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white font-mono font-bold">{wifiPass}</span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(wifiPass);
                                setCopied(true);
                                showToast('Wi-Fi Şifresi Kopyalandı!');
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                              title="Şifreyi Kopyala"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {hasVibeGuard && (
                  <div className="w-full bg-[var(--theme-card-alt)] border border-amber-500/20 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 border-b border-white/[0.06] pb-2.5">
                      <ShieldAlert className="w-4 h-4 text-amber-400" />
                      <h3 className="text-xs font-black text-white uppercase tracking-wider">Mekân Müzik Tarzı (Vibe Guard)</h3>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-relaxed">
                      Bu mekanda atmosferi korumak amacıyla sadece aşağıdaki müzik türlerinden şarkı istekleri kabul edilir:
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {allowedGenres.map((genre: string) => (
                        <span
                          key={genre}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {!hasMenu && !hasWifi && !hasVibeGuard && (
                  <div className="text-center p-6 bg-[var(--theme-card-alt)] rounded-2xl border border-white/[0.08]">
                    <p className="text-xs text-neutral-400">Bu mekân için henüz ek bilgi eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
