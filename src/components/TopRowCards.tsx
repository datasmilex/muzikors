'use client';

import React from 'react';
import { Coins, QrCode, PlusCircle, Sparkles, Tv } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopRowCards: React.FC = () => {
  const { user, openModal, openProtectedModal, activeVenue } = useApp();

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-1">
      <div className="grid grid-cols-2 gap-3">
      <div className="glass-panel-gold rounded-2xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-[#D4AF37]/30 group hover:border-[#D4AF37]/60 transition-all">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs text-amber-200/80 font-medium">
            <Coins className="w-4 h-4 text-[#D4AF37] animate-bounce" />
            <span>Kredi Miktarı</span>
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-400/50" />
        </div>

        <div className="my-1">
          <span className="text-2xl font-black tracking-tight text-white flex items-baseline gap-1">
            {user ? user.credits : 0} <span className="text-xs font-semibold text-[#D4AF37]">KREDİ</span>
          </span>
        </div>

        <button
          onClick={() => openProtectedModal('topup', 'Kredi yüklemek için lütfen Google veya Spotify ile giriş yapın')}
          className="mt-1 w-full py-1.5 px-2 rounded-xl gold-gradient-bg text-stone-950 font-bold text-xs flex items-center justify-center gap-1 hover:brightness-110 active:scale-95 transition-all shadow-md"
        >
          <PlusCircle className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Kredi Yükle</span>
        </button>
      </div>

      <button
        onClick={() => openModal('qr')}
        className="glass-panel rounded-2xl p-3.5 flex flex-col items-center justify-center text-center relative overflow-hidden border border-[#D4AF37]/30 hover:border-[#D4AF37] transition-all group active:scale-95 cursor-pointer bg-gradient-to-br from-[#26190F]/90 to-[#120C08]/90"
      >
        <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mb-2 group-hover:scale-110 group-hover:bg-[#D4AF37]/25 transition-all text-[#D4AF37]">
          <QrCode className="w-6 h-6" />
        </div>
        <span className="text-sm font-bold text-amber-100 group-hover:text-[#D4AF37] transition-colors">
          QR Okut
        </span>
        <span className="text-[10px] text-amber-200/60 mt-0.5">
          Masa QR&apos;ı Tara
        </span>
      </button>
      </div>

      <button
        onClick={() => activeVenue?.is_tv_active && openProtectedModal('tvShoutout', 'TV mesajı göndermek için giriş yapın')}
        disabled={!activeVenue?.is_tv_active}
        className={`w-full rounded-xl p-3 flex flex-row items-center justify-center gap-2 font-bold transition-all border ${
          activeVenue?.is_tv_active 
            ? 'glass-panel-gold bg-gradient-to-r from-[#D4AF37] to-[#FCEFD5] text-stone-950 border-[#D4AF37]/50 hover:brightness-110 active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)]' 
            : 'bg-black/40 border-white/10 text-white/40 cursor-not-allowed'
        }`}
      >
        <Tv className={`w-5 h-5 ${activeVenue?.is_tv_active ? 'stroke-[2.5]' : ''}`} />
        <span>{activeVenue?.is_tv_active ? "TV'ye Mesaj Gönder (20 🪙)" : "TV Ekranı Kapalı"}</span>
      </button>
    </div>
  );
};
