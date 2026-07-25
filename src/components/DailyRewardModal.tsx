'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal, user, showToast } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);

  if (activeModal !== 'daily_reward') return null;

  // Ensure user is logged in
  if (!user) return null;

  const todayStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }).split(',')[0];
  const lastClaimStr = user.lastDailyClaim 
    ? new Date(user.lastDailyClaim).toLocaleString('en-US', { timeZone: 'Europe/Istanbul' }).split(',')[0] 
    : null;
    
  const hasClaimedToday = lastClaimStr === todayStr;

  const handleClaimReward = async () => {
    if (hasClaimedToday || isClaiming) return;
    setIsClaiming(true);

    try {
      const { data, error } = await supabase.rpc('claim_daily_reward');
      
      if (error) throw error;
      
      if (data?.success) {
        showToast(data.message || '+2 Kredi hesabına eklendi!');
      } else {
        showToast(data?.message || 'Ödül alınamadı.');
      }
    } catch (error) {
      console.error('[DailyReward] Error:', error);
      showToast('Ödül alınırken bir hata oluştu.');
    } finally {
      setIsClaiming(false);
      // Wait a moment before closing to show success state if needed
      setTimeout(closeModal, 1500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xs bg-[#120C08] border-2 border-[#D4AF37]/40 rounded-3xl p-6 z-10 shadow-2xl text-center"
        >
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex justify-center mb-4 mt-2">
            <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] bg-[#D4AF37]/10 flex items-center justify-center relative shadow-[0_0_20px_rgba(212,175,55,0.3)]">
              {hasClaimedToday ? (
                <CheckCircle2 className="w-8 h-8 text-[#D4AF37]" />
              ) : (
                <Gift className="w-8 h-8 text-[#D4AF37] animate-bounce" />
              )}
            </div>
          </div>

          <h2 className="text-xl font-black gold-gradient-text tracking-wide mb-2">
            Günlük Ödül 🎁
          </h2>

          <p className="text-xs text-amber-200/70 font-medium mb-6">
            {hasClaimedToday
              ? "Yeni günlük ödülün bu gece 00:00'da yenilenecektir."
              : "Her gün giriş yap, bedava kredileri topla! Hemen +2 Kredini al."}
          </p>

          <button
            disabled={hasClaimedToday || isClaiming}
            onClick={handleClaimReward}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md
              ${hasClaimedToday
                ? 'bg-black/40 border border-white/5 text-gray-500 cursor-not-allowed'
                : 'gold-gradient-bg text-black hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {hasClaimedToday ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Bugünkü Ödül Alındı ✨</span>
              </>
            ) : isClaiming ? (
              <span className="animate-pulse">Bekleniyor...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>2 Kredini Al 🎉</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
