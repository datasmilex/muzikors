'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Sparkles } from 'lucide-react';

export const QuickActionsBanner: React.FC = () => {
  const { user, openModal, isVenueBound } = useApp();

  if (!user) return null;

  return (
    <div className="w-full px-4 pt-1 pb-0 flex items-center justify-between bg-transparent z-20 relative">
      <div className="flex-1 flex items-center justify-between gap-2">
        <button
          onClick={() => openModal('qr')}
          className="w-full flex items-center justify-between h-9 px-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold text-neutral-300"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span>{isVenueBound ? 'Masa / QR Değiştir' : 'Masa QR Okut'}</span>
          </div>
          <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider">
            Tara
          </span>
        </button>
      </div>
    </div>
  );
};
