'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { QrCode } from 'lucide-react';

export const QuickActionsBanner: React.FC = () => {
  const { user, openModal } = useApp();

  if (!user) return null;

  return (
    <div className="w-full px-4 py-2 flex items-center justify-between bg-transparent z-20 relative">
      <div className="flex-1 flex items-center justify-between gap-3">


        {/* QR Scanner Button */}
        <button
          onClick={() => openModal('qr')}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 rounded-full bg-[#D4AF37]/90 backdrop-blur-sm text-black font-black text-sm active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[#D4AF37]"
        >
          <QrCode className="w-4 h-4" strokeWidth={2.5} />
          <span>QR Okut</span>
        </button>
      </div>
    </div>
  );
};
