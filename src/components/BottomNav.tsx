'use client';

import React from 'react';
import { Store, Map, Plus, MessageCircle, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getUserDailySongRights } from '../lib/timeHelpers';

export const BottomNav: React.FC = () => {
  const { openModal, isVenueBound, activeModal, user } = useApp();
  const songRights = getUserDailySongRights(user);
  const remainingSongs = songRights.remainingSongs;
  const maxDailySongs = songRights.baseMaxDailySongs;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm z-50 pointer-events-none">
      {/* Floating Island Container */}
      <div className="relative flex items-center justify-between bg-[var(--theme-card)]/95 backdrop-blur-2xl border border-white/[0.12] rounded-[2rem] px-4 py-2 shadow-[0_20px_50px_rgba(0,0,0,0.95)] pointer-events-auto transition-all duration-300">
        
        {/* Kafe Bilgileri */}
        <button
          onClick={() => openModal('venue_info')}
          disabled={!isVenueBound}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
            activeModal === 'venue_info' ? 'text-[var(--theme-primary)]' : 'text-neutral-400 hover:text-neutral-200'
          } ${!isVenueBound ? 'opacity-30 cursor-not-allowed' : 'active:scale-90'}`}
        >
          <Store className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'venue_info' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-tight">Mekan</span>
          {activeModal === 'venue_info' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
        </button>

        {/* Harita */}
        <button
          onClick={() => openModal('map')}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
            activeModal === 'map' ? 'text-[var(--theme-primary)]' : 'text-neutral-400 hover:text-neutral-200'
          } active:scale-90`}
        >
          <Map className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'map' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-tight">Harita</span>
          {activeModal === 'map' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
        </button>

        {/* Center Primary Action Button: ŞARKI İSTE (FAB) */}
        <div className="relative -top-6 flex flex-col items-center mx-1">
          <button
            id="tour-add-song"
            onClick={() => openModal('search')}
            disabled={!isVenueBound}
            className={`group relative flex items-center justify-center w-15 h-15 rounded-full theme-fab-gradient theme-glow-shadow border-4 border-[var(--theme-bg)] z-50 active:scale-95 transition-all duration-200 ${
              !isVenueBound ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:scale-105'
            }`}
          >
            <Plus className="w-7 h-7 text-black stroke-[3] group-hover:rotate-90 transition-transform duration-300" />

            {/* Remaining Song Rights Badge */}
            {user && isVenueBound && (
              <span className="absolute -top-2 px-2 py-0.5 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/60 text-[9px] font-black text-[var(--theme-primary-light)] shadow-md whitespace-nowrap">
                {remainingSongs}/{maxDailySongs}
              </span>
            )}
          </button>
          
          <span className="text-[10px] font-black text-[var(--theme-primary)] tracking-wider uppercase drop-shadow-md mt-1 transition-colors duration-300">
            İstek
          </span>
        </div>

        {/* Akış */}
        <button
          onClick={() => openModal('globalFeed')}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
            activeModal === 'globalFeed' ? 'text-[var(--theme-primary)]' : 'text-neutral-400 hover:text-neutral-200'
          } active:scale-90`}
        >
          <MessageCircle className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'globalFeed' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-tight">Akış</span>
          {activeModal === 'globalFeed' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
        </button>

        {/* Sıralamalar */}
        <button
          onClick={() => openModal('leaderboard')}
          className={`flex flex-col items-center justify-center w-12 py-1 transition-all ${
            activeModal === 'leaderboard' ? 'text-[var(--theme-primary)]' : 'text-neutral-400 hover:text-neutral-200'
          } active:scale-90`}
        >
          <Trophy className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'leaderboard' ? 2.5 : 2} />
          <span className="text-[10px] font-bold tracking-tight">Sıralama</span>
          {activeModal === 'leaderboard' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
        </button>
      </div>
    </div>
  );
};
