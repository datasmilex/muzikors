import React from 'react';
import { Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';

// Mekân sistemi kapattıysa sıra ve istek ekranı yerine sade bir bilgi gösterilir.
export const VenueGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isVenueActive, isVenueBound, activeVenue, openModal } = useApp();

  if (isVenueBound && !isVenueActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
        <span className="w-16 h-16 rounded-full bg-white/[0.06] grid place-items-center text-white/60 mb-5">
          <Moon className="w-7 h-7" />
        </span>
        <h2 className="text-[20px] font-bold tracking-tight">Şu an istek alınmıyor</h2>
        <p className="text-[14px] text-white/55 mt-2 max-w-[280px] leading-relaxed">
          {activeVenue?.name || 'Bu mekân'} müzik isteklerini geçici olarak kapattı.
        </p>
        <button
          type="button"
          onClick={() => openModal('map')}
          className="mt-6 min-h-[48px] px-5 rounded-2xl bg-white/[0.07] text-[15px] font-semibold active:scale-[0.97] transition-transform"
        >
          Başka mekân bul
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
