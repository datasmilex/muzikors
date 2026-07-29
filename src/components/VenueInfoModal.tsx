'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Store, BookOpen, Wifi, Copy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VenueInfoModal: React.FC = () => {
  const { activeModal, closeModal, activeVenue, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'venue_info' || !activeVenue) return null;

  const wifiName = activeVenue.wifi_name || (activeVenue as any).wifi_ssid;
  const wifiPass = activeVenue.wifi_password || (activeVenue as any).wifi_pass;
  const menuUrl = activeVenue.menu_link || (activeVenue as any).menu_url;
  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = Boolean(menuUrl?.trim());

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex flex-col bg-[#0A0604]">
        {/* Header */}
        <div className="flex items-center px-4 py-4 border-b border-[#D4AF37]/20 bg-[#120C08]">
          <button 
            onClick={closeModal}
            className="p-2 rounded-xl bg-[#1C130D] border border-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white mx-auto pr-9">
            Mekân Bilgileri
          </h2>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center space-y-8 pb-20">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="w-[120px] h-[120px] rounded-full border-2 border-[#D4AF37]/30 p-1 flex items-center justify-center bg-[#1A1A1A] shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden">
              {activeVenue.logo_url?.trim() ? (
                <img 
                  src={activeVenue.logo_url} 
                  alt={activeVenue.venue_name || activeVenue.name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Store className="w-12 h-12 text-[#D4AF37]/50" />
              )}
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-black text-white tracking-tight">{activeVenue.venue_name || activeVenue.name}</h1>
            </div>
          </div>

          {/* Action Buttons & Info */}
          <div className="w-full max-w-sm space-y-6">
            
            {hasMenu && (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/30 text-amber-100 font-bold flex items-center justify-center gap-3 hover:bg-[#222] hover:border-[#D4AF37]/50 active:scale-[0.98] transition-all shadow-lg"
              >
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
                Dijital Menü
              </a>
            )}

            {hasWifi && (
              <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-center gap-2 mb-4 border-b border-white/5 pb-3">
                  <Wifi className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-sm font-bold text-gray-200">Wi-Fi Bilgileri</h3>
                </div>
                
                <div className="space-y-3">
                  {wifiName?.trim() && (
                    <div className="flex items-center justify-between bg-black/40 rounded-xl p-3.5 border border-white/5">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ağ Adı</span>
                      <span className="text-sm text-white font-bold">{wifiName}</span>
                    </div>
                  )}
                  
                  {wifiPass?.trim() && (
                    <div className="flex items-center justify-between bg-black/40 rounded-xl p-3.5 border border-white/5 group">
                      <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Şifre</span>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white font-mono font-bold tracking-wider">{wifiPass}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(wifiPass);
                            setCopied(true);
                            showToast('Wi-Fi Şifresi Kopyalandı!');
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
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
              <div className="text-center p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                <p className="text-gray-400 text-sm">Bu mekân için detaylı bilgi eklenmemiştir.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};
