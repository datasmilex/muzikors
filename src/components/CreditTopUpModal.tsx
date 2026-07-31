'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Coins, Check, CreditCard, Sparkles, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CREDIT_PACKAGES } from '../data/mockData';

export const CreditTopUpModal: React.FC = () => {
  const { activeModal, closeModal, handlePayTRPayment } = useApp();
  const [selectedPackId, setSelectedPackId] = useState<string>('pack-120');
  const [isLegalAccepted, setIsLegalAccepted] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);

  if (activeModal !== 'topup') return null;

  const selectedPack = CREDIT_PACKAGES.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES[1];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Bottom Sheet / Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-md bg-[#120C08] sm:rounded-[2.5rem] rounded-t-[2.5rem] p-6 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] overflow-hidden glass-panel-gold border border-[#D4AF37]/30 backdrop-blur-3xl"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Top handle bar (mobile only) */}
          <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto mb-6 sm:hidden" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-6 border-b border-[#D4AF37]/20 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-[1.2rem] bg-gradient-to-br from-[#D4AF37]/20 to-[#120C08] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#D4AF37]/10 animate-pulse pointer-events-none" />
                <Coins className="w-6 h-6 z-10 drop-shadow-md group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight drop-shadow-lg">Kredi Yükle</h2>
                <p className="text-xs text-amber-200/60 font-semibold mt-0.5 tracking-wide">Müzik kutusunda şarkı istemek için bakiye ekleyin</p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:rotate-90 text-zinc-400 hover:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Credit Package Options */}
          <div className="space-y-4 my-6 relative z-10">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackId === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackId(pkg.id)}
                  className={`w-full text-left rounded-[1.5rem] p-5 transition-all duration-300 relative border flex items-center justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#241911] to-[#1C130D] border-[#D4AF37]/60 shadow-[0_0_25px_rgba(212,175,55,0.2)] hover:-translate-y-1'
                      : 'bg-[#1A1A1A]/40 border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:-translate-y-0.5'
                  }`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <span className="absolute -top-3 right-5 gold-gradient-bg text-stone-950 font-black text-[10px] px-3 py-1 rounded-full shadow-[0_5px_15px_rgba(212,175,55,0.3)] uppercase tracking-widest z-10">
                      {pkg.badge}
                    </span>
                  )}

                  <div className="flex items-center gap-4">
                    {/* Circle Radio Indicator */}
                    <div
                      className={`w-7 h-7 rounded-full border-[2.5px] flex items-center justify-center transition-all duration-300 shadow-inner ${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-stone-950 scale-110'
                          : 'border-[#D4AF37]/30 bg-[#120C08] group-hover:border-[#D4AF37]/50'
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 stroke-[4]" />}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className={`text-2xl font-black tracking-tight ${isSelected ? 'text-white' : 'text-gray-200'}`}>+{pkg.credits} <span className="text-sm text-[#D4AF37]">Kredi</span></span>
                        {pkg.bonusCredits > 0 && (
                          <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20 shadow-sm ml-1">
                            +{pkg.bonusCredits} Hediye
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-amber-200/50 font-semibold mt-1 tracking-wide">{pkg.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end justify-center">
                    {pkg.oldPriceTL && (
                      <span className="text-[11px] text-gray-500 font-bold line-through mb-1">₺{pkg.oldPriceTL}</span>
                    )}
                    <span className={`text-xl font-black drop-shadow-md ${isSelected ? 'text-[#D4AF37]' : 'text-amber-100/80'}`}>₺{pkg.priceTL}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Secure Payment Info */}
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-200/60 mb-6 bg-[#1A1A1A]/40 py-3 rounded-xl border border-white/5 relative z-10">
            <ShieldCheck className="w-5 h-5 text-emerald-500 drop-shadow-sm" />
            <span className="tracking-wide">256-Bit SSL ile %100 Güvenli Ödeme (PayTR / Kredi Kartı)</span>
          </div>

          {/* Legal Checkbox */}
          <div className="flex items-start gap-3 mb-8 px-2 relative z-10 group">
            <div className="relative flex items-center pt-0.5">
              <input
                type="checkbox"
                id="legal-checkbox"
                checked={isLegalAccepted}
                onChange={(e) => setIsLegalAccepted(e.target.checked)}
                className="w-5 h-5 rounded-md border-gray-600 bg-[#1A1A1A] text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 focus:ring-2 transition-all cursor-pointer"
              />
            </div>
            <label htmlFor="legal-checkbox" className="text-xs font-medium text-gray-400 leading-relaxed cursor-pointer select-none">
              <a href="/legal/sales" className="text-[#E5A93C] hover:text-[#FFC145] underline underline-offset-4 transition-colors font-bold">Mesafeli Satış Sözleşmesi</a>'ni ve <a href="/legal/refund" className="text-[#E5A93C] hover:text-[#FFC145] underline underline-offset-4 transition-colors font-bold">İptal/İade Koşulları</a>'nı okudum, onaylıyorum.
            </label>
          </div>

          {/* Action Button */}
          <button
            onClick={async () => {
              setIsLoadingPayment(true);
              await handlePayTRPayment(selectedPack.id);
              setIsLoadingPayment(false);
            }}
            disabled={!isLegalAccepted || isLoadingPayment}
            className={`w-full py-5 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] transition-all duration-300 relative z-10 overflow-hidden group ${
              isLegalAccepted && !isLoadingPayment
                ? 'gold-gradient-bg text-stone-950 hover:brightness-110 active:scale-95 hover:scale-[1.02]' 
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700 shadow-none'
            }`}
          >
            {isLoadingPayment ? (
              <div className="w-6 h-6 border-[3px] border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <CreditCard className={`w-6 h-6 ${isLegalAccepted && !isLoadingPayment ? 'text-stone-950 group-hover:-translate-y-1 group-hover:rotate-6 transition-transform' : 'text-zinc-500'}`} />
            )}
            <span className="tracking-wide">{isLoadingPayment ? 'Ödeme Sayfasına Yönlendiriliyor...' : `PayTR ile Güvenle Öde (₺${selectedPack.priceTL})`}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
