'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Store, BookOpen, Wifi, Copy, Check, Clock, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VenueInfoModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  

  if (!activeVenue) return null;

  const wifiName = (activeVenue as any).wifi_name || (activeVenue as any).wifi_ssid;
  const wifiPass = (activeVenue as any).wifi_password || (activeVenue as any).wifi_pass;
  const menuUrl = (activeVenue as any).menu_link || (activeVenue as any).menu_url;
  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = Boolean(menuUrl?.trim());

  const formatTime = (t?: string) => {
    if (!t) return null;
    return t.slice(0, 5); // "09:00:00" -> "09:00"
  };

  const openingTime = formatTime((activeVenue as any).opening_time);
  const closingTime = formatTime((activeVenue as any).closing_time);
  const hasWorkingHours = Boolean(openingTime) && Boolean(closingTime);

  return (
    <AnimatePresence>
      {activeModal === 'venue_info' && (<>

      <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md h-[85vh] sm:h-[650px] sm:rounded-3xl rounded-t-3xl flex flex-col overflow-hidden glass-panel-gold border border-[#D4AF37]/30 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] bg-[#120C08]"
        >
          {/* Header */}
          <div className="flex-none p-4 flex items-center justify-between border-b border-[#D4AF37]/20 bg-black/20">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <Store className="w-6 h-6 drop-shadow-md" />
              <h2 className="text-xl font-black tracking-tight text-white">Mekân Bilgileri</h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col items-center space-y-6 pb-20 custom-scrollbar">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-5">
            <div className="w-[140px] h-[140px] rounded-full border border-[#D4AF37]/40 p-1.5 flex items-center justify-center bg-gradient-to-br from-[#1C130D] to-[#120C08] shadow-[0_0_40px_rgba(212,175,55,0.25)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse rounded-full pointer-events-none" />
              {(activeVenue as any).logo_url?.trim() ? (
                <img 
                  src={(activeVenue as any).logo_url} 
                  alt={(activeVenue as any).venue_name || (activeVenue as any).name} 
                  className="w-full h-full object-cover rounded-full z-10"
                />
              ) : (
                <Store className="w-14 h-14 text-[#D4AF37]/50 z-10" />
              )}
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tighter drop-shadow-lg">{(activeVenue as any).venue_name || (activeVenue as any).name}</h1>
              {hasWorkingHours && (
                <div className="inline-flex items-center justify-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-gray-300 text-xs font-semibold shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="tracking-wide">Çalışma Saatleri: {openingTime} - {closingTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons & Info */}
          <div className="w-full max-w-sm space-y-6">
            
            {hasMenu && (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-[#241911] to-[#1C130D] border border-[#D4AF37]/40 text-amber-100 font-black text-lg flex items-center justify-center gap-3 active:bg-[#222] active:border-[#D4AF37]/60 active:shadow-[0_0_25px_rgba(212,175,55,0.2)] active:scale-95 transition-all shadow-xl group"
              >
                <BookOpen className="w-6 h-6 text-[#D4AF37] group-active:scale-95 transition-transform" />
                Dijital Menü
              </a>
            )}

            {hasWifi && (
              <div className="w-full bg-[#1A1A1A]/50 border border-[#D4AF37]/20 rounded-2xl p-4 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-center gap-2 mb-5 border-b border-[#D4AF37]/10 pb-4">
                  <Wifi className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                  <h3 className="text-sm font-black text-white tracking-widest uppercase">Wi-Fi Bilgileri</h3>
                </div>
                
                <div className="space-y-4">
                  {wifiName?.trim() && (
                    <div className="flex items-center justify-between bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ağ Adı</span>
                      <span className="text-sm text-white font-black">{wifiName}</span>
                    </div>
                  )}
                  
                  {wifiPass?.trim() && (
                    <div className="flex items-center justify-between bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner group">
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Şifre</span>
                      <div className="flex items-center gap-3">
                        <span className="text-base text-[#D4AF37] font-mono font-black tracking-widest drop-shadow-md">{wifiPass}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(wifiPass);
                            setCopied(true);
                            showToast('Wi-Fi Şifresi Kopyalandı!');
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-2 rounded-xl bg-white/5 active:bg-white/10 text-gray-300 transition-all active:scale-95 active:scale-90 shadow-sm"
                          title="Şifreyi Kopyala"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {!hasMenu && !hasWifi && (
              <div className="text-center p-8 bg-[#1A1A1A]/50 rounded-[1.5rem] border border-white/5 backdrop-blur-md">
                <p className="text-gray-400 text-sm font-medium">Bu mekân için detaylı bilgi eklenmemiştir.</p>
              </div>
            )}

          </div>
        </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
