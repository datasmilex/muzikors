'use client';

import React from 'react';
import { Menu, User, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const { openModal, activeVenue, user, isVenueBound, isVenueActive } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[#D4AF37]/20 px-4 py-3 flex items-center justify-between shadow-lg">
      <button
        onClick={() => openModal('drawer')}
        className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1C130D]/80 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all active:scale-95"
        aria-label="Menü Aç"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex items-center gap-2 text-center">
        <img
          src="/logo.png"
          alt="Muzikors Logo"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.png';
          }}
          className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
        />
        <div className="flex flex-col items-start text-left">
          <h1 className="text-base font-extrabold tracking-wide gold-gradient-text leading-tight">
            Muzikors
            {isVenueBound && activeVenue && (
              <span className="text-[#D4AF37]/80 font-normal"> | {activeVenue.name}</span>
            )}
          </h1>
          <span className="text-[10px] font-medium truncate max-w-[200px] flex items-center gap-1">
            {isVenueBound ? (
              isVenueActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400/80">Canlı Yayın Aktif</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span className="text-red-400/80">Mekan Hizmet Dışı</span>
                </>
              )
            ) : (
              <>
                <QrCode className="w-3 h-3 text-amber-400/60" />
                <span className="text-amber-200/50">Bir Mekana Bağlı Değilsiniz</span>
              </>
            )}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative w-10 h-10 rounded-full border border-[#D4AF37]/40 p-0.5 bg-[#1C130D] overflow-hidden hover:border-[#D4AF37] transition-all active:scale-95 flex items-center justify-center"
        >
          {user && user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
          ) : (
            <User className="w-5 h-5 text-[#D4AF37]" />
          )}
          {user && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />}
        </button>
      </div>
    </header>
  );
};
