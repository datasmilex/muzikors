'use client';

import React from 'react';
import { Menu, User, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { openModal, activeVenue, user, isVenueBound, isVenueActive } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#120C08]/90 backdrop-blur-2xl border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <button
        onClick={() => openModal('drawer')}
        className="w-11 h-11 rounded-full flex items-center justify-center bg-white/5 border border-white/10 text-[#D4AF37] active:bg-white/10 transition-all active:scale-95 shadow-inner"
        aria-label="Menü Aç"
      >
        <Menu className="w-5 h-5 drop-shadow-md" />
      </button>

      <div className="flex items-center gap-3 text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#241911] to-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center shadow-inner overflow-hidden relative group">
          <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse pointer-events-none" />
          <img
            src="/logo.png"
            alt="Muzikors Logo"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-9 h-9 object-contain drop-shadow-[0_0_10px_rgba(212,175,55,0.6)] relative z-10 group-active:scale-95 transition-transform"
          />
        </div>
        <div className="flex flex-col items-start text-left">
          <h1 className="text-base font-black tracking-tighter text-white drop-shadow-md leading-tight">
            Muzikors
            {isVenueBound && activeVenue && (
              <span className="text-[#D4AF37] font-bold tracking-normal"> | {activeVenue.name}</span>
            )}
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[200px] flex items-center gap-1.5 mt-0.5">
            {isVenueBound ? (
              isVenueActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />
                  <span className="text-emerald-400">Canlı</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
                  <span className="text-red-400">Kapalı</span>
                </>
              )
            ) : (
              <>
                <QrCode className="w-3 h-3 text-[#D4AF37]/70" />
                <span className="text-amber-200/50">Mekan Yok</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative w-10 h-10 rounded-full border-2 border-[#D4AF37]/30 p-0.5 bg-black overflow-hidden active:border-[#D4AF37] active:scale-95 transition-all active:scale-95 flex items-center justify-center shadow-inner shrink-0"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-5 h-5 text-[#D4AF37]" />
          )}
          {user && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black shadow-[0_0_8px_#10b981]" />}
        </button>
      </div>
    </header>
  );
};
