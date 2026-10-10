'use client';

import React from 'react';
import { ChevronRight, QrCode, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarFrame } from './AvatarFrame';

// Sol: mekân kimliği (dokununca mekân bilgileri). Sağ: QR ile mekân değiştir, profil.
export const Header: React.FC = () => {
  const { openModal, activeVenue, user, isVenueBound, isVenueActive } = useApp();

  const venueName = isVenueBound && activeVenue ? activeVenue.name : 'Muzikors';
  const logo = isVenueBound && activeVenue?.logo_url ? activeVenue.logo_url : '/logo.png';
  const hasCustomAvatar = Boolean(user?.avatar && !user.avatar.includes('googleusercontent'));

  return (
    <header className="sticky top-0 z-30 w-full h-16 landscape:h-12 px-4 landscape:px-3 flex items-center gap-1.5 bg-[rgba(var(--theme-bg-rgb),0.85)] backdrop-blur-xl">
      <button
        type="button"
        onClick={() => isVenueBound && openModal('venue_info')}
        aria-label={isVenueBound ? `${venueName} bilgileri` : 'Muzikors'}
        className="flex-1 min-w-0 flex items-center gap-3 text-left active:opacity-70 transition-opacity duration-150"
      >
        <span className="w-10 h-10 landscape:w-8 landscape:h-8 shrink-0 rounded-xl overflow-hidden bg-white/[0.06]">
          <img
            src={logo}
            alt=""
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-full h-full object-cover"
          />
        </span>
        <span className="min-w-0">
          <span className="flex items-center gap-1 text-[15px] font-bold leading-tight tracking-tight">
            <span className="truncate">{venueName}</span>
            {isVenueBound && <ChevronRight className="w-3.5 h-3.5 shrink-0 text-white/35" />}
          </span>
          <span className="flex items-center gap-1.5 text-[12px] text-white/50 mt-0.5 landscape:hidden">
            {isVenueBound ? (
              isVenueActive ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Canlı
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  Şu an kapalı
                </>
              )
            ) : (
              'Bir mekâna bağlan'
            )}
          </span>
        </span>
      </button>

      <button
        id="tour-qr-button"
        type="button"
        onClick={() => openModal('qr')}
        aria-label="QR kod okut"
        className="w-11 h-11 shrink-0 grid place-items-center rounded-full text-white/80 hover:text-white active:scale-95 transition-[transform,color] duration-150"
      >
        <span className="w-10 h-10 landscape:w-9 landscape:h-9 grid place-items-center rounded-full bg-white/[0.06]">
          <QrCode className="w-[18px] h-[18px]" />
        </span>
      </button>

      <button
        id="tour-wallet-button"
        type="button"
        onClick={() => openModal(user ? 'profile' : 'login')}
        aria-label={user ? 'Profilim' : 'Giriş yap'}
        className="w-11 h-11 shrink-0 grid place-items-center active:scale-95 transition-transform duration-150"
      >
        <AvatarFrame frameId={user?.avatar_frame} size="md">
          <span className="w-10 h-10 landscape:w-9 landscape:h-9 rounded-full overflow-hidden bg-white/[0.06] grid place-items-center">
            {user && hasCustomAvatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <User className="w-[18px] h-[18px] text-white/70" />
            )}
          </span>
        </AvatarFrame>
      </button>
    </header>
  );
};
