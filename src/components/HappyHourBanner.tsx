import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isHappyHourNow } from '../utils/formatters';

export const HappyHourBanner: React.FC = () => {
  const { activeVenue } = useApp();

  if (!activeVenue) return null;

  const isHappyHourActive = isHappyHourNow(
    activeVenue.is_happy_hour_active || false,
    activeVenue.hh_start_time || null,
    activeVenue.hh_end_time || null
  );

  if (!isHappyHourActive) return null;

  return (
    <div className="px-4 py-2 relative z-50">
      <motion.div 
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full bg-[#120C08]/80 backdrop-blur-md border border-[#D4AF37]/30 rounded-full overflow-hidden shadow-[0_4px_20px_rgba(212,175,55,0.15)] flex items-center p-1.5"
      >
        {/* Glow Element */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent animate-[shimmer_3s_infinite] -translate-x-full" />
        
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center shrink-0 shadow-inner z-10">
          <Sparkles className="w-3.5 h-3.5 text-stone-950 animate-pulse" />
        </div>
        
        <div className="flex-1 overflow-hidden px-2 flex items-center whitespace-nowrap z-10">
          <p className="text-[11px] font-bold text-amber-50 truncate tracking-wide">
            Happy Hour Aktif! Tüm şarkı isteklerinde <span className="text-[#D4AF37] font-black">%{(activeVenue.hh_discount_rate || 0)} indirim</span> fırsatını kaçırma.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
