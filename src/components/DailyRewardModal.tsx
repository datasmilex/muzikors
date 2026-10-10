'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, Gift, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSecondsUntilTRMidnight } from '../lib/timeHelpers';
import { Sheet } from './ui/Sheet';
import { btn } from './ui/controls';
import { SPRING_SOFT } from '../lib/motion';

const trDate = (d: Date) =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);

const formatCountdown = (secs: number) => {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h > 0 ? `${h} sa ${m} dk` : `${m} dk`;
};

export const DailyRewardModal: React.FC = () => {
  const { activeModal, closeModal, user, claimDailyReward } = useApp();
  const [claiming, setClaiming] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(getSecondsUntilTRMidnight());
  const isOpen = activeModal === 'daily_reward';

  useEffect(() => {
    if (!isOpen) return;
    setSecondsLeft(getSecondsUntilTRMidnight());
    const interval = setInterval(() => setSecondsLeft(getSecondsUntilTRMidnight()), 30000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const today = trDate(new Date());
  const yesterday = trDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const claimedToday = user?.lastDailyClaim === today;

  const rawStreak = user?.daily_streak || 0;
  const streak = claimedToday ? Math.max(1, rawStreak) : user?.lastDailyClaim === yesterday ? rawStreak + 1 : 1;
  const cycleDay = ((streak - 1) % 7) + 1;
  // Her gün +2 XP artar; haftalık çizelgedeki değerler mevcut seriye göre hesaplanır
  const xpForDay = (day: number) => 5 + (streak - cycleDay + day - 1) * 2;
  const todayXp = xpForDay(cycleDay);

  const handleClaim = async () => {
    if (claiming || claimedToday) return;
    setClaiming(true);
    await claimDailyReward();
    setClaiming(false);
  };

  return (
    <Sheet
      open={isOpen}
      onClose={closeModal}
      width="sm"
      ariaLabel="Günlük ödül"
      footer={
        claimedToday ? (
          <div className="text-center">
            <div className={`${btn.secondary} w-full pointer-events-none`}>
              <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
              <span>Bugünkü ödülü aldın</span>
            </div>
            <p className="text-[12px] text-white/45 mt-2">Sonraki ödül {formatCountdown(secondsLeft)} sonra</p>
          </div>
        ) : (
          <button type="button" onClick={handleClaim} disabled={claiming} className={`${btn.primary} w-full`}>
            {claiming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            <span>Ödülü al · +{todayXp} XP</span>
          </button>
        )
      }
    >
      <div className="text-center pt-1">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-white/[0.06] grid place-items-center text-[var(--theme-primary)] mb-3">
          <Gift className="w-7 h-7" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight">Günlük ödül</h2>
        <p className="text-[14px] text-white/55 mt-1 inline-flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-[var(--theme-primary)]" />
          {streak}. gün serisi
        </p>
      </div>

      <div className="grid grid-cols-7 gap-1.5 mt-6 pb-2" role="list" aria-label="7 günlük seri">
        {Array.from({ length: 7 }, (_, i) => i + 1).map((day) => {
          const done = claimedToday ? day <= cycleDay : day < cycleDay;
          const current = !claimedToday && day === cycleDay;
          return (
            <motion.div
              key={day}
              role="listitem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0, transition: { ...SPRING_SOFT, delay: day * 0.03 } }}
              className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 ${
                current ? 'bg-[rgba(var(--theme-primary-rgb),0.16)]' : 'bg-white/[0.04]'
              }`}
            >
              <span className={`text-[11px] ${current ? 'text-[var(--theme-primary-light)]' : 'text-white/40'}`}>{day}. gün</span>
              <span
                className={`w-7 h-7 rounded-full grid place-items-center text-[11px] font-bold tabular-nums ${
                  done ? 'bg-white/[0.12] text-white' : current ? 'bg-[var(--theme-primary)] text-black' : 'text-white/40'
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : `+${xpForDay(day)}`}
              </span>
            </motion.div>
          );
        })}
      </div>
      <p className="text-[12px] text-white/45 text-center pb-2">Her gün gel, seri uzadıkça kazandığın XP artsın.</p>
    </Sheet>
  );
};
