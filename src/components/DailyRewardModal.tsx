'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Flame, Check, Clock, Loader2, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSecondsUntilTRMidnight } from '../lib/timeHelpers';

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal, user, claimDailyReward } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsUntilTRMidnight());

  useEffect(() => {
    if (activeModal !== 'daily_reward') return;
    setSecondsLeft(getSecondsUntilTRMidnight());
    const interval = setInterval(() => {
      setSecondsLeft(getSecondsUntilTRMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModal]);

  if (activeModal !== 'daily_reward') return null;

  const todayTR = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());

  const d = new Date();
  d.setDate(d.getDate() - 1);
  const yesterdayTR = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(d);

  const isClaimedToday = user?.lastDailyClaim === todayTR;
  
  // Calculate what streak the user is currently on or will receive
  const rawStreak = user?.daily_streak || 0;
  let targetStreak = 1;
  if (isClaimedToday) {
    targetStreak = Math.max(1, rawStreak);
  } else if (user?.lastDailyClaim === yesterdayTR) {
    targetStreak = rawStreak + 1;
  } else {
    targetStreak = 1;
  }

  // Active day index (0-6 for 7-day cycle)
  const activeCycleDay = ((targetStreak - 1) % 7) + 1; // 1 to 7
  const todayRewardXp = 5 + (targetStreak - 1) * 2;

  const formatCountdown = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleClaim = async () => {
    if (claiming || isClaimedToday) return;
    setClaiming(true);
    await claimDailyReward();
    setClaiming(false);
  };

  const streakDays = [
    { day: 1, xp: 5 },
    { day: 2, xp: 7 },
    { day: 3, xp: 9 },
    { day: 4, xp: 11 },
    { day: 5, xp: 13 },
    { day: 6, xp: 15 },
    { day: 7, xp: 17, isGrand: true },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-sm bg-[var(--theme-card)] border-t sm:border border-white/[0.1] sm:rounded-3xl rounded-t-[2.5rem] p-6 z-10 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center text-center overflow-hidden"
        >
          {/* Top Pill Handle */}
          <div className="w-10 h-1 bg-white/20 rounded-full mb-3 shrink-0 sm:hidden" />

          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Header */}
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mb-3 mt-1 shadow-inner relative">
            <Gift className="w-8 h-8 text-amber-400" />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center font-black text-[10px] shadow-sm">
              <Sparkles className="w-3 h-3" />
            </div>
          </div>

          <div className="space-y-1 mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-black">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>{targetStreak}. Gün Giriş Serisi</span>
            </div>
            <h2 className="text-base font-black text-white tracking-tight">
              Günlük Giriş Ödülü
            </h2>
            <p className="text-[11px] text-neutral-400 leading-snug">
              Her gün giriş yaparak seriyi koru, katlanan XP ve ekstra şarkı istek hakkı kazan!
            </p>
          </div>

          {/* 7-Day Streak Timeline */}
          <div className="w-full bg-white/[0.02] border border-white/[0.06] rounded-2xl p-3 mb-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-bold text-neutral-400 px-1">
              <span>7 Günlük Seri Takvimi</span>
              <span className="text-amber-400 font-mono">+{todayRewardXp} XP / Bugün</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {streakDays.map((s) => {
                const isPast = isClaimedToday ? s.day <= activeCycleDay : s.day < activeCycleDay;
                const isCurrent = isClaimedToday ? false : s.day === activeCycleDay;

                return (
                  <div
                    key={s.day}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all text-center ${
                      isPast
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-sm'
                        : isCurrent
                        ? 'bg-amber-400/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105'
                        : 'bg-white/[0.02] border-white/5 text-neutral-500'
                    }`}
                  >
                    <span className="text-[8px] font-bold uppercase mb-0.5">
                      {s.day}. Gün
                    </span>
                    <span className="text-[10px] font-black">
                      +{s.xp}
                    </span>
                    <div className="mt-1">
                      {isPast ? (
                        <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                      ) : (
                        <span className="text-[8px]">{s.isGrand ? '👑' : '✨'}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reward Perks Summary */}
          <div className="w-full grid grid-cols-2 gap-2 mb-4">
            <div className="p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-neutral-400 font-bold uppercase block">Kazanılan XP</span>
                <span className="text-xs font-black text-amber-300">+{todayRewardXp} XP</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] flex items-center gap-2.5 text-left">
              <div className="w-8 h-8 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-[var(--theme-primary)]" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-neutral-400 font-bold uppercase block">Şarkı Hakkı</span>
                <span className="text-xs font-black text-white">+1 Ek Hak</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {isClaimedToday ? (
            <div className="w-full space-y-2">
              <div className="w-full py-3 rounded-2xl bg-white/[0.05] border border-white/10 text-neutral-300 font-bold text-xs flex items-center justify-center gap-2 shadow-inner">
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                <span>Bugünün Ödülü Alındı</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-neutral-400 font-mono">
                <Clock className="w-3 h-3 text-neutral-500" />
                <span>Sonraki ödüle: {formatCountdown(secondsLeft)}</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claiming}
              className="w-full py-3.5 rounded-2xl bg-[var(--theme-primary)] hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              {claiming ? (
                <Loader2 className="w-4 h-4 animate-spin text-black" />
              ) : (
                <>
                  <Gift className="w-4 h-4 stroke-[2.5]" />
                  <span>Günün Ödülünü Al (+{todayRewardXp} XP)</span>
                </>
              )}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
