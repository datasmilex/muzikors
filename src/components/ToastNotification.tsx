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
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] max-w-[92vw] sm:max-w-md pointer-events-none"
        >
          <div className="px-4 py-2.5 rounded-full bg-[#121118]/95 backdrop-blur-2xl border border-white/10 text-white shadow-[0_12px_36px_rgba(0,0,0,0.85)] flex items-center justify-center gap-2.5 text-center">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] shrink-0" />
            <span className="text-xs font-semibold tracking-tight text-neutral-100 leading-snug">
              {toastMessage}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
