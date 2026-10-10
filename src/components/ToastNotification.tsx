'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { SPRING_SNAPPY } from '../lib/motion';

export const ToastNotification: React.FC = () => {
  const { toastMessage } = useApp();
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className="toast-safe-top pointer-events-none fixed inset-x-0 z-[110] flex justify-center px-4"
    >
      <AnimatePresence mode="wait">
        {toastMessage && (
          <motion.div
            key={toastMessage}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: reduceMotion ? { duration: 0.15 } : SPRING_SNAPPY }}
            exit={{ opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.16 } }}
            className="max-w-[420px] px-4 py-3 rounded-2xl bg-[rgba(28,28,32,0.96)] border border-white/[0.08] shadow-[0_12px_32px_rgba(0,0,0,0.5)] text-[13px] font-medium text-white/90 leading-snug text-center"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
