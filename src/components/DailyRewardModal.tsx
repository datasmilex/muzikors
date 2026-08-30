'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();

  return (
    <AnimatePresence>
      {activeModal === 'daily_reward' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-xs bg-[#0d0c11] border border-white/[0.1] rounded-3xl p-6 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] flex flex-col items-center text-center"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center mb-4 mt-2">
              <Gift className="w-8 h-8 text-amber-400" />
            </div>

            <h2 className="text-lg font-black text-white tracking-tight mb-1">
              Günlük Ödüller & Sürprizler
            </h2>

            <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
              Her gün giriş yaparak ekstra şarkı istek hakları ve VIP rozetler kazan!
            </p>

            <div className="w-full p-3.5 rounded-2xl bg-[#141318] border border-white/[0.08] mb-4 flex items-center justify-between text-left">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Günün Hediyesi</span>
                  <span className="text-[10px] text-neutral-400">+1 Ücretsiz Şarkı Hakkı</span>
                </div>
              </div>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-black uppercase">
                Aktif
              </span>
            </div>

            <button
              onClick={closeModal}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs active:scale-95 transition-all shadow-md"
            >
              Anladım
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

