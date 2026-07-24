'use client';

import React from 'react';
import { MapPin, ChevronRight, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GpsBanner: React.FC = () => {
  const { openModal, activeVenue } = useApp();

  return (
    <div className="px-4 py-2">
      <button
        onClick={() => openModal('map')}
        className="w-full glass-panel rounded-xl p-3 flex items-center justify-between border border-[#D4AF37]/25 hover:border-[#D4AF37]/50 active:scale-[0.99] transition-all bg-gradient-to-r from-[#1C130D]/90 via-[#26190F]/70 to-[#1C130D]/90 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
            <MapPin className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                Muzikors Haritası
              </span>
              <span className="text-[10px] bg-[#D4AF37]/20 text-[#D4AF37] px-1.5 py-0.5 rounded-full font-semibold">
                GPS
              </span>
            </div>
            <p className="text-xs text-amber-100/90 font-medium truncate max-w-[210px] mt-0.5">
              {activeVenue ? activeVenue.name : 'Yakındaki Mekanları Kesfet'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#D4AF37]">
          <Navigation className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 text-amber-200/50" />
        </div>
      </button>
    </div>
  );
};
