'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useApp();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-sm pointer-events-none"
        >
          <div className="glass-panel-gold rounded-xl p-3 text-center shadow-2xl backdrop-blur-xl border border-[#D4AF37]/50 flex items-center justify-center gap-2 text-sm font-medium text-amber-100">
            <span>{toastMessage}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
