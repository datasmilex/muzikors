'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Check, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CREDIT_PACKAGES } from '../data/mockData';

export const CreditTopUpModal: React.FC = () => {
  const { activeModal, closeModal, topUpCredits } = useApp();
  const [selectedPackId, setSelectedPackId] = useState<string>('pack-100');

  if (activeModal !== 'topup') return null;

  const selectedPack = CREDIT_PACKAGES.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES[1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop with STRICT 65% backdrop blur as requested */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 glass-modal-backdrop"
        />

        {/* Bottom Sheet Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="relative w-full max-w-md bg-[#160E0A]/95 border-t-2 border-[#D4AF37]/50 rounded-t-[32px] p-6 z-10 shadow-2xl overflow-hidden backdrop-blur-2xl"
        >
          {/* Top handle bar */}
          <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto mb-4" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37]">
                <Coins className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Kredi Yükle</h2>
                <p className="text-xs text-amber-200/60 font-medium">Müzik kutusunda şarkı istemek için bakiye ekleyin</p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-9 h-9 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Package Options (Wireframe 4: +50, +100, +200) */}
          <div className="space-y-3 my-5">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackId(pkg.id)}
                  className={`w-full text-left rounded-2xl p-4 transition-all duration-300 relative border flex items-center justify-between ${
                    isSelected
                      ? 'glass-panel-gold border-[#D4AF37] ring-2 ring-[#D4AF37]/50 shadow-xl'
                      : 'glass-panel border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-4 gold-gradient-bg text-stone-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-md uppercase tracking-wider">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-3.5">
                    {/* Circle Radio Indicator */}
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-stone-950'
                          : 'border-amber-200/40 bg-[#120C08]'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xl font-black text-white">+{pkg.credits} Kredi</span>
                        {pkg.bonusCredits > 0 && (
                          <span className="text-xs font-extrabold text-[#D4AF37]">
                            (+{pkg.bonusCredits} Hediye)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-200/60 font-medium mt-0.5">{pkg.description}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-amber-100">₺{pkg.priceTL}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure Payment Info */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-amber-200/50 mb-5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL ile %100 Güvenli Ödeme (Apple Pay / Credit Card)</span>
          </div>

          {/* Wireframe 4 Action Button: "Ödemeyi Onayla" */}
          <button
            onClick={() => topUpCredits(selectedPack.id)}
            className="w-full py-4 px-6 rounded-2xl gold-gradient-bg text-stone-950 font-black text-base flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <CreditCard className="w-5 h-5 text-stone-950" />
            <span>Ödemeyi Onayla (₺{selectedPack.priceTL})</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
