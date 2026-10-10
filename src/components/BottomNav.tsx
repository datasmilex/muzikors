'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Menu, Plus, Store, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModalType } from '../types';
import { getUserDailySongRights, isClaimedTodayTR } from '../lib/timeHelpers';
import { SPRING_SNAPPY } from '../lib/motion';

type NavItem = { modal: ModalType; label: string; icon: React.ElementType; badge?: boolean };

// Başparmakla ulaşılan alt çubuk: ortada "Şarkı iste", menü sağ altta.
export const BottomNav: React.FC = () => {
  const { openModal, isVenueBound, isVenueActive, activeModal, user, showToast } = useApp();
  const rights = getUserDailySongRights(user);
  const rewardWaiting = Boolean(user) && !isClaimedTodayTR(user?.lastDailyClaim || null);

  const leftItems: NavItem[] = [
    { modal: 'venue_info', label: 'Mekân', icon: Store },
    { modal: 'leaderboard', label: 'Sıralama', icon: Trophy },
  ];
  const rightItems: NavItem[] = [
    { modal: 'map', label: 'Keşfet', icon: Compass },
    { modal: 'drawer', label: 'Menü', icon: Menu, badge: rewardWaiting },
  ];

  const handleRequest = () => {
    if (!isVenueBound) {
      openModal('qr');
      return;
    }
    if (!isVenueActive) {
      showToast('Bu mekân şu an istek almıyor.');
      return;
    }
    openModal('search');
  };

  const renderItem = (item: NavItem) => {
    const active = activeModal === item.modal;
    const Icon = item.icon;
    return (
      <button
        key={item.modal}
        type="button"
        onClick={() => openModal(item.modal)}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={`relative h-full min-w-0 flex flex-col items-center justify-center gap-1 rounded-2xl active:scale-95 transition-[transform,color] duration-150 ${
          active ? 'text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        {active && (
          <motion.span
            layoutId="nav-active"
            transition={SPRING_SNAPPY}
            className="absolute inset-x-1 inset-y-1.5 rounded-2xl bg-white/[0.08]"
          />
        )}
        <span className="relative">
          <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.25 : 1.9} />
          {item.badge && (
            <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[var(--theme-primary)] ring-2 ring-[var(--theme-card)]" />
          )}
        </span>
        <span className="relative text-[11px] font-semibold">{item.label}</span>
      </button>
    );
  };

  return (
    <nav aria-label="Ana menü" className="fixed nav-safe-bottom left-1/2 -translate-x-1/2 z-50 w-[calc(100%-24px)] max-w-[420px]">
      <div className="grid grid-cols-5 items-stretch h-[68px] px-1 rounded-[24px] bg-[rgba(var(--theme-card-rgb),0.92)] backdrop-blur-xl border border-white/[0.07] shadow-[0_14px_36px_rgba(0,0,0,0.5)]">
        {leftItems.map(renderItem)}

        <div className="flex flex-col items-center justify-end pb-2">
          <button
            id="tour-add-song"
            type="button"
            onClick={handleRequest}
            aria-label="Şarkı iste"
            className="relative -mt-9 w-[58px] h-[58px] rounded-full bg-[var(--theme-primary)] text-black grid place-items-center shadow-[0_10px_24px_rgba(0,0,0,0.45)] ring-[5px] ring-[var(--theme-bg)] active:scale-90 transition-transform duration-150"
          >
            <Plus className="w-7 h-7" strokeWidth={2.75} />
            {user && isVenueBound && (
              <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-[var(--theme-bg)] text-[11px] font-bold text-white grid place-items-center tabular-nums ring-1 ring-white/10">
                {rights.remainingSongs}
              </span>
            )}
          </button>
          <span className="mt-1 text-[11px] font-semibold text-white/80">Şarkı iste</span>
        </div>

        {rightItems.map(renderItem)}
      </div>
    </nav>
  );
};
