import React from 'react';
import { Check, FlaskConical } from 'lucide-react';

export const PremiumBadge: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`inline-flex items-center justify-center bg-gradient-to-br from-yellow-400 via-[#D4AF37] to-amber-600 rounded-full shadow-[0_0_5px_rgba(212,175,55,0.6)] ${className}`}
      title="Muzikors Premium Üyesi"
    >
      <Check className="w-[60%] h-[60%] text-black stroke-[3]" />
    </div>
  );
};

export const BetaTesterBadge: React.FC<{ className?: string; showLabel?: boolean }> = ({ className = '', showLabel = false }) => {
  if (showLabel) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-[9px] font-extrabold text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)] ${className}`}
        title="Beta Tester"
      >
        <FlaskConical className="w-2.5 h-2.5 text-amber-400 shrink-0" />
        <span>Beta</span>
      </span>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.4)] ${className}`}
      title="Beta Tester"
    >
      <FlaskConical className="w-[60%] h-[60%] text-black stroke-[2.5]" />
    </div>
  );
};
