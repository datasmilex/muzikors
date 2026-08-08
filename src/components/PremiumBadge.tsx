import React from 'react';
import { Check } from 'lucide-react';

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
