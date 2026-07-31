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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-gradient-to-r from-yellow-500/20 via-yellow-400/30 to-yellow-500/20 border-b border-yellow-500/30 overflow-hidden relative z-50 shadow-[0_4px_20px_rgba(234,179,8,0.2)]"
    >
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
      
      <div className="flex items-center justify-center gap-3 px-4 py-3 relative z-10">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </motion.div>
        
        <div className="text-sm font-bold text-yellow-50 tracking-wide text-center">
          🎉 Happy Hour Başladı! Tüm şarkılarda <span className="text-yellow-400 font-extrabold">%{(activeVenue.hh_discount_rate || 0)} İndirim!</span>
        </div>

        <motion.div
          animate={{ rotate: [0, -15, 15, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 1 }}
        >
          <Sparkles className="w-5 h-5 text-yellow-400" />
        </motion.div>
      </div>
    </motion.div>
  );
};
