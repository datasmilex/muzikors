'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, BookOpen, Wifi, Copy, Check, Clock, X, ShieldCheck } from 'lucide-react';
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
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center landscape:items-center landscape:justify-center landscape:p-2">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/85"
            style={{ willChange: 'opacity' }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ willChange: 'transform' }}
            className="relative w-full max-w-md landscape:max-w-2xl max-h-[90vh] sm:max-h-[640px] landscape:max-h-[96vh] sm:rounded-3xl landscape:rounded-2xl rounded-t-[2.5rem] flex flex-col overflow-hidden bg-[var(--theme-card)] border-t sm:border landscape:border border-white/[0.1] shadow-[0_-20px_60px_rgba(0,0,0,0.95)] z-10"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-2.5 pb-1 shrink-0 landscape:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex-none px-5 py-3.5 flex items-center justify-between border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-[var(--theme-primary)]" />
                <h2 className="text-xs font-black tracking-wider text-[var(--theme-text)] uppercase">Mekân Bilgileri</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-[var(--theme-card-alt)]/80 hover:bg-[var(--theme-card-alt)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors cursor-pointer border border-white/5 active:scale-95"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 landscape:p-3.5 space-y-3.5 custom-scrollbar pb-8 landscape:pb-4">
              
              {/* Venue Profile Header */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-[var(--theme-card-alt)]/50 border border-white/[0.08]">
                <div className="w-12 h-12 rounded-xl border border-white/10 flex items-center justify-center bg-black/40 overflow-hidden shrink-0">
                  {(activeVenue as any).logo_url?.trim() ? (
                    <img 
                      src={(activeVenue as any).logo_url} 
                      alt={(activeVenue as any).venue_name || (activeVenue as any).name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store className="w-6 h-6 text-[var(--theme-primary)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm font-black text-[var(--theme-text)] truncate tracking-tight">
                    {(activeVenue as any).venue_name || (activeVenue as any).name}
                  </h1>
                  <p className="text-xs text-[var(--theme-text-muted)] truncate mt-0.5">
                    {(activeVenue as any).full_address || (activeVenue as any).address || (activeVenue as any).district || (activeVenue as any).city || 'Muzikors İşletmesi'}
                  </p>
                </div>
              </div>

              {/* Digital Menu Button - Craftsmanship Tactile Card (No Neon Pink AI Slop) */}
              {hasMenu && (
                <div>
                  {isNativeMenu ? (
                    <button
                      type="button"
                      onClick={() => openModal('menu')}
                      className="w-full py-3 px-4 rounded-2xl bg-[var(--theme-card-alt)]/90 hover:bg-[var(--theme-card-alt)] active:bg-white/[0.12] border border-white/10 text-[var(--theme-text)] font-bold text-xs flex items-center justify-between active:scale-[0.98] transition-all group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                        <span>Dijital Menüyü Görüntüle</span>
                      </div>
                      <span className="text-xs text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all font-medium">İncele →</span>
                    </button>
                  ) : (
                    <a
                      href={menuUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-2xl bg-[var(--theme-card-alt)]/90 hover:bg-[var(--theme-card-alt)] active:bg-white/[0.12] border border-white/10 text-[var(--theme-text)] font-bold text-xs flex items-center justify-between active:scale-[0.98] transition-all group"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                        <span>Dijital Menüyü Görüntüle</span>
                      </div>
                      <span className="text-xs text-[var(--theme-text-muted)] group-hover:text-[var(--theme-text)] group-hover:translate-x-0.5 transition-all font-medium">Dış Bağlantı ↗</span>
                    </a>
                  )}
                </div>
              )}

              {/* Structured Info Sections - Zero Icon Capsules, Zero Pill Bloat */}
              <div className="space-y-2.5">
                
                {/* 1. Working Hours */}
                {hasWorkingHours && (
                  <div className="p-3.5 rounded-2xl bg-[var(--theme-card-alt)]/40 border border-white/[0.08]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text-muted)]">
                        <Clock className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                        <span className="uppercase tracking-wider text-[10px]">Çalışma Saatleri</span>
                      </div>
                      {isOpenNow !== null && (
                        <div className="flex items-center gap-1.5 text-xs font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full ${isOpenNow ? 'bg-emerald-400' : 'bg-neutral-500'}`} />
                          <span className={isOpenNow ? 'text-emerald-400' : 'text-neutral-400'}>
                            {isOpenNow ? 'Açık' : 'Kapalı'}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-black text-[var(--theme-text)] font-mono mt-2 tracking-wide">
                      {openingTime} — {closingTime}
                    </p>
                  </div>
                )}

                {/* 2. Vibe Guard (Müzik Tarzı Kuralı) */}
                <div className="p-3.5 rounded-2xl bg-[var(--theme-card-alt)]/40 border border-white/[0.08]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text-muted)]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span className="uppercase tracking-wider text-[10px]">Müzik Tarzı (Vibe Guard)</span>
                    </div>
                    <span className="text-[11px] font-bold text-[var(--theme-text-muted)]">
                      {hasVibeGuard ? `${allowedGenres.length} Tür İzinli` : 'Serbest'}
                    </span>
                  </div>

                  {hasVibeGuard ? (
                    <div className="mt-2.5 space-y-2">
                      <p className="text-[11px] text-[var(--theme-text-muted)] leading-relaxed">
                        Mekân atmosferini korumak için yalnızca bu müzik türlerinden istekler kabul edilir:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {allowedGenres.map((genre) => (
                          <span
                            key={genre}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[var(--theme-text)] text-xs font-semibold"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-[var(--theme-text-muted)] mt-2">
                      Bu mekânda tüm müzik türlerinden şarkı istekleri serbesttir.
                    </p>
                  )}
                </div>

                {/* 3. Wi-Fi Information */}
                {hasWifi && (
                  <div className="p-3.5 rounded-2xl bg-[var(--theme-card-alt)]/40 border border-white/[0.08]">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-text-muted)] mb-2.5">
                      <Wifi className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span className="uppercase tracking-wider text-[10px]">Mekân Wi-Fi</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {wifiName?.trim() && (
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06]">
                          <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block">Ağ Adı</span>
                          <span className="text-xs font-bold text-[var(--theme-text)] truncate block mt-0.5">{wifiName}</span>
                        </div>
                      )}
                      {wifiPass?.trim() && (
                        <div className="p-2.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-[9px] text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block">Şifre</span>
                            <span className="text-xs font-mono font-bold text-[var(--theme-text)] truncate block mt-0.5">{wifiPass}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(wifiPass);
                              setCopied(true);
                              showToast('Wi-Fi Şifresi Kopyalandı!');
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-[var(--theme-text)] transition-all active:scale-90 cursor-pointer shrink-0 border border-white/5"
                            title="Şifreyi Kopyala"
                          >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}
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
