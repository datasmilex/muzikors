'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, BookOpen, Wifi, Copy, Check, Clock, X, ShieldCheck, Music } from 'lucide-react';
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
  const allowedGenres: string[] = activeVenue.allowed_genres || [];
  const hasVibeGuard = Array.isArray(allowedGenres) && allowedGenres.length > 0;

  const formatTime = (t?: string) => {
    if (!t) return null;
    return t.slice(0, 5); // "09:00:00" -> "09:00"
  };

  const openingTime = formatTime((activeVenue as any).opening_time);
  const closingTime = formatTime((activeVenue as any).closing_time);
  const hasWorkingHours = Boolean(openingTime) && Boolean(closingTime);

  const getOpenStatus = () => {
    if (!openingTime || !closingTime) return null;
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const [openH, openM] = openingTime.split(':').map(Number);
    const [closeH, closeM] = closingTime.split(':').map(Number);
    const openMins = openH * 60 + openM;
    const closeMins = closeH * 60 + closeM;

    if (closeMins > openMins) {
      return currentMins >= openMins && currentMins < closeMins;
    }
    // Overnight (e.g. 10:00 to 02:00)
    return currentMins >= openMins || currentMins < closeMins;
  };

  const isOpenNow = getOpenStatus();

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
            className="relative w-full max-w-md max-h-[90vh] sm:max-h-[640px] sm:rounded-3xl rounded-t-[2.5rem] flex flex-col overflow-hidden bg-[var(--theme-card)] border-t sm:border border-white/[0.1] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] z-10"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex-none px-5 py-3 flex items-center justify-between border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[var(--theme-primary)]" />
                <h2 className="text-sm font-bold tracking-wide text-white uppercase">Mekân Bilgileri</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar pb-10">
              
              {/* Venue Profile Minimal Card */}
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-14 h-14 rounded-2xl border border-white/10 p-0.5 flex items-center justify-center bg-black/40 shadow-inner overflow-hidden shrink-0">
                  {(activeVenue as any).logo_url?.trim() ? (
                    <img 
                      src={(activeVenue as any).logo_url} 
                      alt={(activeVenue as any).venue_name || (activeVenue as any).name} 
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <Store className="w-7 h-7 text-[var(--theme-primary)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-base font-black text-white truncate tracking-tight">
                    {(activeVenue as any).venue_name || (activeVenue as any).name}
                  </h1>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {(activeVenue as any).address || (activeVenue as any).city || 'Muzikors İşletmesi'}
                  </p>
                </div>
              </div>

              {/* Digital Menu Button */}
              {hasMenu && (
                <div>
                  {isNativeMenu ? (
                    <button
                      type="button"
                      onClick={() => openModal('menu')}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[var(--theme-primary)] hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Dijital Menüyü Görüntüle</span>
                    </button>
                  ) : (
                    <a
                      href={menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 px-4 rounded-2xl bg-[var(--theme-primary)] hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md text-center"
                    >
                      <BookOpen className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Dijital Menüyü Görüntüle</span>
                    </a>
                  )}
                </div>
              )}

              {/* Minimalist Structured Info Section */}
              <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] divide-y divide-white/[0.06] overflow-hidden">
                
                {/* 1. Working Hours */}
                {hasWorkingHours && (
                  <div className="p-4 flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-white/[0.04] text-[var(--theme-primary)] shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Çalışma Saatleri</span>
                        {isOpenNow !== null && (
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOpenNow 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-500'}`} />
                            {isOpenNow ? 'Şu an Açık' : 'Şu an Kapalı'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white font-mono mt-1">
                        {openingTime} - {closingTime}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. Vibe Guard (Müzik Tarzı Kuralı) */}
                <div className="p-4 flex items-start gap-3.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0 mt-0.5 border border-amber-500/20">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Müzik Tarzı (Vibe Guard)</span>
                      <span className="text-[10px] font-bold text-amber-300 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                        {hasVibeGuard ? `${allowedGenres.length} Tür İzinli` : 'Serbest'}
                      </span>
                    </div>

                    {hasVibeGuard ? (
                      <div className="space-y-1.5">
                        <p className="text-[11px] text-neutral-400 leading-snug">
                          Mekan atmosferini korumak için yalnızca bu müzik türlerinden istekler kabul edilir:
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {allowedGenres.map((genre) => (
                            <span
                              key={genre}
                              className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-white text-[10px] font-semibold flex items-center gap-1"
                            >
                              <Music className="w-2.5 h-2.5 text-amber-400" />
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-neutral-400">
                        Bu mekânda tüm müzik türlerinden şarkı istekleri serbesttir.
                      </p>
                    )}
                  </div>
                </div>

                {/* 3. Wi-Fi Information */}
                {hasWifi && (
                  <div className="p-4 flex items-start gap-3.5">
                    <div className="p-2 rounded-xl bg-white/[0.04] text-[var(--theme-primary)] shrink-0 mt-0.5">
                      <Wifi className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">Mekân Wi-Fi</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {wifiName?.trim() && (
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex flex-col justify-center">
                            <span className="text-[9px] text-neutral-500 font-bold uppercase">Ağ Adı</span>
                            <span className="text-xs font-bold text-white truncate mt-0.5">{wifiName}</span>
                          </div>
                        )}
                        {wifiPass?.trim() && (
                          <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <span className="text-[9px] text-neutral-500 font-bold uppercase block">Şifre</span>
                              <span className="text-xs font-mono font-bold text-white truncate block mt-0.5">{wifiPass}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(wifiPass);
                                setCopied(true);
                                showToast('Wi-Fi Şifresi Kopyalandı!');
                                setTimeout(() => setCopied(false), 2000);
                              }}
                              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-neutral-300 hover:text-white transition-all active:scale-90 cursor-pointer shrink-0"
                              title="Şifreyi Kopyala"
                            >
                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
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
