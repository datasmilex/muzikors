'use client';

import React from 'react';
import { Info, Map, Plus, Tv, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BottomNav: React.FC = () => {
  const { openModal, isVenueBound, activeModal } = useApp();

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 px-4 pb-4 pt-2">
      <div className="relative flex items-center justify-between bg-[#13151A]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 py-3 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
        
        {/* Kafe Bilgileri */}
        <button
          onClick={() => openModal('venue_info')}
          disabled={!isVenueBound}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeModal === 'venue_info' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
          } ${!isVenueBound ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <Info className="w-6 h-6" strokeWidth={activeModal === 'venue_info' ? 2.5 : 2} />
          <span className="text-[9px] font-semibold tracking-wider">Kafe Bilgisi</span>
        </button>

        {/* Harita */}
        <button
          onClick={() => openModal('map')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeModal === 'map' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
          } active:scale-95`}
        >
          <Map className="w-6 h-6" strokeWidth={activeModal === 'map' ? 2.5 : 2} />
          <span className="text-[9px] font-semibold tracking-wider">Harita</span>
        </button>

        {/* ŞARKI EKLE (FAB) */}
        <div className="relative -top-8 flex flex-col items-center">
          <button
            onClick={() => openModal('search')}
            disabled={!isVenueBound}
            className={`relative flex items-center justify-center w-16 h-16 rounded-full gold-gradient-bg shadow-[0_0_30px_rgba(229,169,60,0.4)] border-4 border-[#120C08] z-50 transition-all ${
              !isVenueBound ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:scale-105 active:scale-95 hover:brightness-110'
            }`}
          >
            {/* Pulse effect */}
            {isVenueBound && (
              <span className="absolute inset-0 rounded-full bg-[#D4AF37] opacity-30 animate-ping" />
            )}
            <Plus className="w-8 h-8 text-black stroke-[3]" />
          </button>
          <span className="text-[10px] font-bold text-[#E5A93C] mt-2 drop-shadow-md">Şarkı Ekle</span>
        </div>

        {/* TV Mesajı */}
        <button
          onClick={() => openModal('tvShoutout')}
          disabled={!isVenueBound}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeModal === 'tvShoutout' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
          } ${!isVenueBound ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}`}
        >
          <Tv className="w-6 h-6" strokeWidth={activeModal === 'tvShoutout' ? 2.5 : 2} />
          <span className="text-[9px] font-semibold tracking-wider">TV Mesaj</span>
        </button>

        {/* Sıralamalar */}
        <button
          onClick={() => openModal('leaderboard')}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeModal === 'leaderboard' ? 'text-[#D4AF37]' : 'text-zinc-500 hover:text-zinc-300'
          } active:scale-95`}
        >
          <Trophy className="w-6 h-6" strokeWidth={activeModal === 'leaderboard' ? 2.5 : 2} />
          <span className="text-[9px] font-semibold tracking-wider">Sıralamalar</span>
        </button>

      </div>
    </div>
  );
};
