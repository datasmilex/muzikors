'use client';

import React from 'react';
import { Info, Map, Plus, Tv, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { openModal, isVenueBound, activeModal } = useApp();

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-sm z-50">
      {/* Floating Pill Container */}
      <div className="relative flex items-center justify-between bg-black/75 backdrop-blur border border-[#D4AF37]/30 rounded-full px-5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.15)]">
        
        {/* Kafe Bilgileri */}
        <button
          onClick={() => openModal('venue_info')}
          disabled={!isVenueBound}
          className={`flex flex-col items-center justify-center w-12 transition-all ${
            activeModal === 'venue_info' ? 'text-[#D4AF37] scale-110' : 'text-zinc-500 active:text-zinc-300'
          } ${!isVenueBound ? 'opacity-30 cursor-not-allowed' : 'active:scale-90'}`}
        >
          <Info className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'venue_info' ? 2.5 : 2} />
          <span className="text-[9px] font-bold tracking-wider">Kafe</span>
        </button>

        {/* Harita */}
        <button
          onClick={() => openModal('map')}
          className={`flex flex-col items-center justify-center w-12 transition-all ${
            activeModal === 'map' ? 'text-[#D4AF37] scale-110' : 'text-zinc-500 active:text-zinc-300'
          } active:scale-90`}
        >
          <Map className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'map' ? 2.5 : 2} />
          <span className="text-[9px] font-bold tracking-wider">Harita</span>
        </button>

        {/* ŞARKI EKLE (FAB) - Floating Action Button overflowing the pill */}
        <div className="relative -top-8 flex flex-col items-center mx-2">
          <button
            id="tour-add-song"
            onClick={() => openModal('search')}
            disabled={!isVenueBound}
            className={`relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#FFDF73] to-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.5)] border-4 border-[#120C08] z-50 active:scale-95 transition-transform duration-100 will-change-transform ${
              !isVenueBound ? 'opacity-50 cursor-not-allowed grayscale' : ''
            }`}
          >
            {isVenueBound && (
              <span className="absolute inset-0 rounded-full border border-[#D4AF37] animate-ping opacity-40" style={{ animationDuration: '3s' }} />
            )}
            <Plus className="w-8 h-8 text-black stroke-[3] drop-shadow-md" />
          </button>
          {/* Subtle label below FAB */}
          <span className="absolute -bottom-5 text-[10px] font-black text-[#D4AF37] tracking-widest uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">Ekle</span>
        </div>

        {/* TV Mesajı */}
        <button
          onClick={() => openModal('tvShoutout')}
          disabled={!isVenueBound}
          className={`flex flex-col items-center justify-center w-12 transition-all ${
            activeModal === 'tvShoutout' ? 'text-[#D4AF37] scale-110' : 'text-zinc-500 active:text-zinc-300'
          } ${!isVenueBound ? 'opacity-30 cursor-not-allowed' : 'active:scale-90'}`}
        >
          <Tv className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'tvShoutout' ? 2.5 : 2} />
          <span className="text-[9px] font-bold tracking-wider">Ekran</span>
        </button>

        {/* Sıralamalar */}
        <button
          onClick={() => openModal('leaderboard')}
          className={`flex flex-col items-center justify-center w-12 transition-all ${
            activeModal === 'leaderboard' ? 'text-[#D4AF37] scale-110' : 'text-zinc-500 active:text-zinc-300'
          } active:scale-90`}
        >
          <Trophy className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'leaderboard' ? 2.5 : 2} />
          <span className="text-[9px] font-bold tracking-wider">Sıralama</span>
        </button>
      </div>
    </div>
  );
};
