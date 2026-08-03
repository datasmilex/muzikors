'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CREDIT_PACKAGES } from '../data/mockData';

export const CreditTopUpModal: React.FC = () => {
  const { activeModal, closeModal, handleIyzicoPayment } = useApp();
  const [selectedPackId, setSelectedPackId] = useState<string>('pack-120');
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  

  const selectedPack = CREDIT_PACKAGES.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES[1];

  return (
    <AnimatePresence>
      {activeModal === 'topup' && (<>

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

        {/* Compact Centered Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-xs bg-[#120C08] rounded-3xl p-4 z-10 shadow-[0_15px_40px_rgba(212,175,55,0.15)] glass-panel-gold border border-[#D4AF37]/30 backdrop-blur"
        >
          {/* Decorative Glow */}

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#D4AF37]/20 to-[#120C08] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse pointer-events-none" />
                <Coins className="w-4 h-4 z-10 drop-shadow-md group-active:scale-95 transition-transform" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight drop-shadow-lg">Kredi Yükle</h2>
                <p className="text-[9px] text-amber-200/60 font-semibold mt-0.5 tracking-wide">Şarkı isteği için bakiye ekleyin</p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Credit Package Options (Compact) */}
          <div className="space-y-3 mt-5 mb-4 relative z-10">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackId(pkg.id)}
                  className={`w-full text-left rounded-[1rem] p-3 transition-all duration-300 relative border flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#241911] to-[#1C130D] border-[#D4AF37]/60 shadow-[0_0_15px_rgba(212,175,55,0.2)] scale-[1.02]'
                      : 'bg-[#1A1A1A]/40 border-[#D4AF37]/20 active:border-[#D4AF37]/40'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <span className="absolute -top-2.5 right-4 gold-gradient-bg text-stone-950 font-black text-[9px] px-2.5 py-0.5 rounded-full shadow-[0_4px_10px_rgba(212,175,55,0.4)] uppercase tracking-wider z-10">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-2.5">
                    {/* Circle Radio Indicator */}
                    <div
                      className={`w-4 h-4 shrink-0 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 shadow-inner ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-stone-950 scale-110'
                          : 'border-[#D4AF37]/30 bg-[#120C08] group-active:border-[#D4AF37]/50'
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-sm font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-200'}`}>+{pkg.credits} <span className="text-[10px] text-[#D4AF37]">Kredi</span></span>
                        {pkg.bonusCredits > 0 && (
                          <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shadow-sm whitespace-nowrap">
                            +{pkg.bonusCredits} Hediye
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end justify-center shrink-0 pl-2">
                    {pkg.oldPriceTL && (
                      <span className="text-[10px] text-gray-500 font-bold line-through mb-0.5">₺{pkg.oldPriceTL}</span>
                    )}
                    <span className={`text-[15px] font-black drop-shadow-md ${isSelected ? 'text-[#D4AF37]' : 'text-amber-100/80'}`}>₺{pkg.priceTL}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure Payment Info */}
          <div className="flex items-center justify-center gap-1.5 text-[9px] font-bold text-amber-200/60 mb-4 bg-[#1A1A1A]/40 py-2 rounded-lg border border-white/5 relative z-10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 drop-shadow-sm" />
            <span className="tracking-wide">256-Bit SSL ile %100 Güvenli Ödeme</span>
          </div>

          {/* Legal Checkbox */}
          <div className="flex items-start gap-2 mb-4 px-1 relative z-10 group">
            <div className="relative flex items-center pt-0.5">
              <input
                type="checkbox"
                id="legal-checkbox"
                checked={isLegalAccepted}
                onChange={(e) => setIsLegalAccepted(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 focus:ring-1 transition-all cursor-pointer"
              />
            </div>
            <label htmlFor="legal-checkbox" className="text-[10px] font-medium text-gray-400 leading-relaxed cursor-pointer select-none">
              <a href="/legal/sales" className="text-[#E5A93C] active:text-[#FFC145] underline underline-offset-2 transition-colors font-bold">Satış Sözleşmesi</a>'ni ve <a href="/legal/refund" className="text-[#E5A93C] active:text-[#FFC145] underline underline-offset-2 transition-colors font-bold">İptal Koşulları</a>'nı okudum.
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={async () => {
              setIsLoadingPayment(true);
              await handleIyzicoPayment(selectedPack.id);
              setIsLoadingPayment(false);
            }}
            disabled={!isLegalAccepted || isLoadingPayment}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(212,175,55,0.3)] transition-all duration-300 relative z-10 overflow-hidden group ${
              isLegalAccepted && !isLoadingPayment
                ? 'gold-gradient-bg text-stone-950 active:brightness-110 active:scale-95' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 shadow-none'
            }`}
          >
            {isLoadingPayment ? (
              <div className="w-4 h-4 border-[2.5px] border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <CreditCard className={`w-4 h-4 ${isLegalAccepted && !isLoadingPayment ? 'text-stone-950 group-active:-translate-y-0.5 group-active:rotate-3 transition-transform' : 'text-zinc-500'}`} />
            )}
            <span className="tracking-wide">{isLoadingPayment ? 'Yönlendiriliyor...' : `Öde (₺${selectedPack.priceTL})`}</span>
          </button>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
