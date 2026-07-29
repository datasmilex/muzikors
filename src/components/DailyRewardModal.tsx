'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { isClaimedTodayTR, getSecondsUntilTRMidnight } from '../lib/timeHelpers';

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal, user, setUser, showToast } = useApp();
  const [isClaiming, setIsClaiming] = useState(false);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [localClaimed, setLocalClaimed] = useState(false);

  useEffect(() => {
    setLocalClaimed(isClaimedTodayTR(user?.lastDailyClaim || null));
  }, [user?.lastDailyClaim]);

  // Handle countdown when claimed
  useEffect(() => {
    if (!localClaimed) {
      setTimeLeft(null);
      return;
    }

    // Initialize time left
    setTimeLeft(getSecondsUntilTRMidnight());

    const interval = setInterval(() => {
      const seconds = getSecondsUntilTRMidnight();
      if (seconds <= 0) {
        clearInterval(interval);
        setTimeLeft(null); 
        setLocalClaimed(false); // 00:00:00'da butonu otomatik aktifleştir
        
        // Supabase tarafında ödül her halükarda geceyarısı sıfırlanıyor (veya 24h),
        // Biz sadece client-side'da UI'ı açıyoruz. Müşteri F5 atarsa veya tekrar tıklarsa sorun olmaz.
      } else {
        setTimeLeft(seconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [localClaimed]);

  if (activeModal !== 'daily_reward') return null;

  // Ensure user is logged in
  if (!user) return null;

  // Real-time calculation
  const isButtonDisabled = localClaimed;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleClaimReward = async () => {
    if (isButtonDisabled || isClaiming) return;
    setIsClaiming(true);

    try {
      const { data, error } = await supabase.rpc('claim_daily_reward');
      
      if (error) throw error;
      
      if (data?.success) {
        showToast(data.message || '+2 Kredi hesabına eklendi!');
        
        // Update user state immediately with new lastDailyClaim
        setUser(prev => prev ? {
          ...prev,
          credits: prev.credits + 2,
          lastDailyClaim: new Date().toISOString()
        } : prev);
        
      } else {
        showToast(data?.message || 'Ödül alınamadı.');
      }
    } catch (error) {
      console.error('[DailyReward] Error:', error);
      showToast('Ödül alınırken bir hata oluştu.');
    } finally {
      setIsClaiming(false);
      // Let user see the timer starting instead of closing instantly
      // setTimeout(closeModal, 1500); 
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
              {isButtonDisabled ? (
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
            {isButtonDisabled
              ? "Bugünkü ödülünü aldın! Yarın tekrar bekleriz."
              : "Her gün giriş yap, bedava kredileri topla! Hemen +2 Kredini al."}
          </p>

          <button
            disabled={isButtonDisabled || isClaiming}
            onClick={handleClaimReward}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-md
              ${isButtonDisabled
                ? 'bg-black/40 border border-[#D4AF37]/30 text-[#D4AF37]/80 cursor-not-allowed'
                : 'gold-gradient-bg text-black hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {isClaiming ? (
              <span className="animate-pulse">Bekleniyor...</span>
            ) : isButtonDisabled ? (
              <>
                <Clock className="w-4 h-4" />
                <span className="font-mono tracking-wider">
                  Yeni Ödüle: {timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>🎁 Günlük Ödülünü Al</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
