'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, ChevronRight } from 'lucide-react';

export const QuickActionsBanner: React.FC = () => {
  const { user, openModal, isVenueBound } = useApp();

  if (!user) return null;

  return (
    <div className="w-full px-4 pt-2.5 pb-0 flex items-center justify-between bg-transparent z-20 relative">
      <div className="flex-1 flex items-center justify-between gap-2">
        <button
          onClick={() => openModal('qr')}
          className="w-full flex items-center justify-between h-9 px-3.5 rounded-2xl bg-[var(--theme-card)] hover:bg-white/[0.06] border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold text-neutral-300 shadow-sm group cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
            <span className="text-white text-xs font-bold">Bir Mekana Bağlan</span>
          </div>
          <div className="flex items-center gap-1 text-neutral-400 group-hover:text-white transition-colors">
            <span className="text-[11px] font-medium text-neutral-300">Tara</span>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </button>
      </div>
    </div>
  );
};
