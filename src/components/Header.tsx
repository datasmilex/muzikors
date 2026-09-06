'use client';

import React from 'react';
import { Menu, User, QrCode, Coins } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarFrame } from './AvatarFrame';
import { getUserDailySongRights } from '../lib/timeHelpers';

export const Header: React.FC = () => {
  const { openModal, activeVenue, user, isVenueBound, isVenueActive } = useApp();
  const songRights = getUserDailySongRights(user);

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--theme-bg)]/90 backdrop-blur-2xl border-b border-white/[0.08] px-4 landscape:px-3 py-2.5 landscape:py-1.5 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.8)] transition-colors duration-300">
      {/* Left: Menu Drawer Trigger */}
      <button
        onClick={() => openModal('drawer')}
        className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-[var(--theme-primary)] active:bg-white/10 transition-all active:scale-95"
        aria-label="Menü Aç"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Center: Interactive Venue Pill / Branding */}
      <div 
        onClick={() => isVenueBound && openModal('venue_info')}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer ${
          isVenueBound ? 'active:scale-95' : ''
        }`}
      >
        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-white/15 bg-black/40 flex items-center justify-center">
          <img
            src={(isVenueBound && activeVenue && (activeVenue as any).logo_url) ? (activeVenue as any).logo_url : '/logo.png'}
            alt={isVenueBound && activeVenue ? activeVenue.name : 'Muzikors'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col items-start text-left max-w-[170px] sm:max-w-[220px]">
          <span className="text-xs font-black tracking-tight text-white truncate flex items-center gap-1.5">
            {isVenueBound && activeVenue ? activeVenue.name : 'Muzikors'}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider truncate flex items-center gap-1 -mt-0.5">
            {isVenueBound ? (
              isVenueActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10b981]" />
                  <span className="text-emerald-400 font-semibold">Canlı Yayın</span>
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#ef4444]" />
                  <span className="text-red-400 font-semibold">Kapalı</span>
                </>
              )
            ) : (
              <>
                <QrCode className="w-2.5 h-2.5 text-[var(--theme-primary)]" />
                <span className="text-[var(--theme-primary-light)]">Masa Bağlı Değil</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Right: Daily Song Rights Badge & User Profile */}
      <div className="flex items-center gap-2">
        {user && (
          <button
            onClick={() => openModal('profile')}
            className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-black active:scale-95 transition-all ${
              songRights.isBonusActive 
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]'
                : 'bg-[var(--theme-primary)]/15 border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)]'
            }`}
          >
            <span>{songRights.display}</span>
          </button>
        )}

        <button
          id="tour-wallet-button"
          onClick={() => openModal(user ? 'profile' : 'login')}
          className="relative active:scale-95 transition-all flex items-center justify-center shrink-0"
        >
          <AvatarFrame frameId={user?.avatar_frame} size="md">
            <div className="w-10 h-10 landscape:w-8 landscape:h-8 rounded-full bg-[var(--theme-card)] border border-white/15 flex items-center justify-center overflow-hidden shadow-inner">
              {user && user.avatar && !user.avatar.includes('googleusercontent') ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-[var(--theme-primary)]" />
              )}
            </div>
          </AvatarFrame>
          {user && <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[var(--theme-bg)] shadow-[0_0_6px_#10b981] z-20" />}
        </button>
      </div>
    </header>
  );
};
