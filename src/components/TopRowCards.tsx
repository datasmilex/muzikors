'use client';

import React from 'react';
import { Coins, QrCode, PlusCircle, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopRowCards: React.FC = () => {
  const { user, openModal, openProtectedModal, activeVenue } = useApp();

  return (
    <div className="flex flex-col gap-3 px-4 pt-3 pb-1">
      <div className="grid grid-cols-1 gap-3">

      <button
        onClick={() => openModal('qr')}
        className="rounded-2xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden border border-white/[0.08] bg-[var(--theme-card)] hover:border-white/20 transition-all group active:scale-95 cursor-pointer"
      >
        <QrCode className="w-8 h-8 text-[var(--theme-primary)] mb-2" strokeWidth={1.75} />
        <span className="text-sm font-bold text-white transition-colors">
          Bir Mekana Bağlan
        </span>
      </button>
      </div>

    </div>
  );
};
