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
      {activeModal === 'daily_reward' && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-xs bg-[#120C08] rounded-3xl p-5 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] flex flex-col items-center justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30 text-center"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 hover:rotate-90 text-zinc-400 hover:text-white transition-all duration-300 z-20"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-center mb-6 mt-4 relative z-10">
            <div className="w-20 h-20 rounded-full border-[3px] border-[#D4AF37] bg-gradient-to-br from-[#D4AF37]/20 to-[#120C08] flex items-center justify-center relative shadow-[0_0_30px_rgba(212,175,55,0.3)]">
              {isButtonDisabled ? (
                <CheckCircle2 className="w-10 h-10 text-[#D4AF37] drop-shadow-md" />
              ) : (
                <Gift className="w-10 h-10 text-[#D4AF37] animate-bounce drop-shadow-md" />
              )}
            </div>
          </div>

          <h2 className="text-xl font-black text-white tracking-tight drop-shadow-md mb-2 relative z-10">
            Günlük Ödül 🎁
          </h2>

          <p className="text-[13px] text-amber-200/60 font-medium mb-8 leading-relaxed relative z-10 px-2">
            {isButtonDisabled
              ? "Bugünkü ödülünü aldın! Yarın tekrar bekleriz."
              : "Her gün giriş yap, bedava kredileri topla! Hemen +2 Kredini al."}
          </p>

          <button
            disabled={isButtonDisabled || isClaiming}
            onClick={handleClaimReward}
            className={`w-full py-4 px-4 rounded-[1.5rem] font-black text-base flex items-center justify-center gap-3 transition-all duration-300 relative z-10 shadow-[0_10px_30px_rgba(212,175,55,0.2)] group
              ${isButtonDisabled
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                : 'gold-gradient-bg text-stone-950 hover:brightness-110 hover:scale-[1.02] active:scale-95'
              }
            `}
          >
            {isClaiming ? (
              <span className="animate-pulse tracking-wide">Bekleniyor...</span>
            ) : isButtonDisabled ? (
              <>
                <Clock className="w-5 h-5" />
                <span className="font-mono tracking-widest text-sm">
                  {timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">Günlük Ödülünü Al</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
