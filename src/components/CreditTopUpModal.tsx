'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Check, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CREDIT_PACKAGES } from '../data/mockData';

export const CreditTopUpModal: React.FC = () => {
  const { activeModal, closeModal, topUpCredits } = useApp();
  const [selectedPackId, setSelectedPackId] = useState<string>('pack-120');
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

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

                  <div className="text-right flex flex-col items-end justify-center">
                    {pkg.oldPriceTL && (
                      <span className="text-[10px] text-gray-500 line-through mb-0.5">₺{pkg.oldPriceTL}</span>
                    )}
                    <span className="text-lg font-extrabold text-amber-100">₺{pkg.priceTL}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure Payment Info */}
          <div className="flex items-center justify-center gap-2 text-[11px] text-amber-200/50 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>256-Bit SSL ile %100 Güvenli Ödeme (iyzico / Kredi Kartı)</span>
          </div>

          {/* Legal Checkbox */}
          <div className="flex items-start gap-3 mb-6 px-2">
            <input
              type="checkbox"
              id="legal-checkbox"
              checked={isLegalAccepted}
              onChange={(e) => setIsLegalAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-gray-600 bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <label htmlFor="legal-checkbox" className="text-[11px] text-gray-400 leading-tight">
              <a href="/legal/sales" className="text-[#E5A93C] underline underline-offset-2">Mesafeli Satış Sözleşmesi</a>'ni ve <a href="/legal/refund" className="text-[#E5A93C] underline underline-offset-2">İptal/İade Koşulları</a>'nı okudum, onaylıyorum.
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={async () => {
              setIsLoadingPayment(true);
              await topUpCredits(selectedPack.id);
              setIsLoadingPayment(false);
            }}
            disabled={!isLegalAccepted || isLoadingPayment}
            className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
              isLegalAccepted && !isLoadingPayment
                ? 'gold-gradient-bg text-stone-950 hover:brightness-110 active:scale-[0.98]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CreditCard className={`w-5 h-5 ${isLegalAccepted && !isLoadingPayment ? 'text-stone-950' : 'text-gray-500'}`} />
            <span>{isLoadingPayment ? 'Yönlendiriliyor...' : `iyzico ile Öde (₺${selectedPack.priceTL})`}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
