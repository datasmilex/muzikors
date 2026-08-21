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
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[9px] font-extrabold text-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.3)] ${className}`}
        title="Beta Tester"
      >
        <FlaskConical className="w-2.5 h-2.5 text-purple-400 shrink-0" />
        <span>Beta</span>
      </span>
    );
  }

  return (
    <div 
      className={`inline-flex items-center justify-center bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)] ${className}`}
      title="Beta Tester"
    >
      <FlaskConical className="w-[60%] h-[60%] text-white stroke-[2.5]" />
    </div>
  );
};
