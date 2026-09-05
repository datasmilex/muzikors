import React from 'react';
import { useApp } from '../context/AppContext';
import { Ban } from 'lucide-react';

export const VenueGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isVenueActive, isVenueBound, activeVenue } = useApp();

  if (isVenueBound && !isVenueActive) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-red-950/20 blur-3xl rounded-full" />
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(239,68,68,0.3)]">
          <Ban className="w-12 h-12 text-red-500" />
        </div>
        <div className="relative z-10 space-y-3">
          <h2 className="text-2xl font-bold text-red-400">
            Bu Mekân Şu An Müzik İsteklerine Kapalıdır.
          </h2>
          <p className="text-sm font-semibold text-gray-400 max-w-xs mx-auto">
            {activeVenue?.name || 'Mekân yetkilisi'} sistemi geçici olarak pasife almıştır.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
