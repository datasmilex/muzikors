'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  return (
    <AnimatePresence>
      {activeModal === 'daily_reward' && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-xs bg-[#120C08] rounded-3xl p-5 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] flex flex-col items-center justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30 text-center"
        >
          {/* Decorative Glow */}

          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300 z-20"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6 mt-4 relative z-10">
            <div className="w-20 h-20 rounded-full border-[3px] border-zinc-600 bg-gradient-to-br from-zinc-800 to-[#120C08] flex items-center justify-center relative shadow-[0_0_30px_rgba(100,100,100,0.3)]">
              <Gift className="w-10 h-10 text-zinc-500 drop-shadow-md" />
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md mb-2 relative z-10">
            Günlük Sürprizler
          </h2>

          <p className="text-[13px] text-zinc-400 font-medium mb-8 leading-relaxed relative z-10 px-2">
            Çok yakında yeni sürprizler ve hediyelerle burada olacağız. Takipte kal!
          </p>

          <button
            disabled={true}
            className="w-full py-4 px-4 rounded-[1.5rem] font-black text-base flex items-center justify-center gap-3 transition-all duration-300 relative z-10 shadow-none bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed group"
          >
            <Clock className="w-5 h-5" />
            <span className="tracking-wide text-sm uppercase">Çok Yakında</span>
          </button>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};

