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
        {/* Credits Button */}
        <button
          onClick={() => openModal('topup')}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 hover:scale-[1.02] active:scale-95 transition-all shadow-inner backdrop-blur-sm"
        >
          <span className="text-xs font-black text-[#D4AF37] drop-shadow-md">
            {user.credits + (user.promo_credits || 0)} <span className="text-[9px] opacity-70">Kredi</span>
          </span>
          <div className="w-4 h-4 rounded-full bg-[#D4AF37] flex items-center justify-center text-black">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </div>
        </button>

        {/* QR Scanner Button */}
        <button
          onClick={() => openModal('qr')}
          className="flex-1 flex items-center justify-center gap-1.5 h-9 px-3 rounded-full bg-[#D4AF37]/90 backdrop-blur-sm text-black font-black text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_15px_rgba(212,175,55,0.4)] border border-[#D4AF37]"
        >
          <QrCode className="w-4 h-4" strokeWidth={2.5} />
          <span>QR Okut</span>
        </button>
      </div>
    </div>
  );
};
