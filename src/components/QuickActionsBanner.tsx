'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, Sparkles } from 'lucide-react';

export const QuickActionsBanner: React.FC = () => {
  const { user, openModal, isVenueBound } = useApp();

  if (!user) return null;

  return (
    <div className="w-full px-4 pt-2.5 pb-0 flex items-center justify-between bg-transparent z-20 relative">
      <div className="flex-1 flex items-center justify-between gap-2">
        <button
          onClick={() => openModal('qr')}
          className="w-full flex items-center justify-between h-9 px-3.5 rounded-2xl bg-[#141318] hover:bg-white/[0.06] border border-white/[0.08] active:scale-95 transition-all text-xs font-semibold text-neutral-300 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white text-xs font-bold">{isVenueBound ? 'Masa / QR Değiştir' : 'Masa QR Okut'}</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 uppercase tracking-wider">
            Tara
          </span>
        </button>
      </div>
    </div>
  );
};
