'use client';

import React from 'react';
import { Coins, QrCode, PlusCircle, Sparkles, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopRowCards: React.FC = () => {
  const { user, openModal, openProtectedModal, activeVenue } = useApp();

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-1">
      <div className="grid grid-cols-1 gap-3">

      <button
        onClick={() => openModal('qr')}
        className="glass-panel rounded-2xl p-3.5 flex flex-col items-center justify-center text-center relative overflow-hidden border border-[#D4AF37]/30 active:border-[#D4AF37] transition-all group active:scale-95 cursor-pointer bg-gradient-to-br from-[#26190F]/90 to-[#120C08]/90"
      >
        <div className="w-11 h-11 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center mb-2 group-active:scale-95 group-active:bg-[#D4AF37]/25 transition-all text-[#D4AF37]">
          <QrCode className="w-6 h-6" />
        </div>
        <span className="text-sm font-bold text-amber-100 group-active:text-[#D4AF37] transition-colors">
          QR Okut
        </span>
        <span className="text-[10px] text-amber-200/60 mt-0.5">
          Masa QR&apos;ı Tara
        </span>
      </button>
      </div>

    </div>
  );
};
