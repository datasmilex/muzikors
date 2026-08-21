'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Gift, Check, CheckCircle2, ChevronLeft, Pin, PinOff, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ACHIEVEMENTS,
  TIER_STYLES,
  getAchievementProgress,
  isAchievementUnlocked,
  isAchievementClaimed,
  type Achievement,
} from '../data/achievements';
import confetti from 'canvas-confetti';
import { supabase } from '../lib/supabaseClient';
import { formatUserDisplayName } from '../utils/formatters';

const TIER_LABELS: Record<string, string> = {
  bronze: 'Bronz',
  silver: 'Gümüş',
  gold: 'Altın',
  diamond: 'Elmas',
};

// ─── Single Achievement Card ─────────────────────────────────────────────────
interface AchievementCardProps {
  achievement: Achievement;
  totalSongs: number;
  claimedList: string[];
  pinnedList: string[];
  onClaim?: (achievement: Achievement) => Promise<void>;
  onTogglePin?: (id: string) => void;
  isClaiming?: boolean;
  isBetaTester: boolean;
  isBetaTesterRewardClaimed: boolean;
  isOwnProfile?: boolean;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  totalSongs,
  claimedList,
  pinnedList,
  onClaim,
  onTogglePin,
  isClaiming = false,
  isBetaTester,
  isBetaTesterRewardClaimed,
  isOwnProfile = true,
}) => {
  const s = TIER_STYLES[achievement.tier];
  const progress = getAchievementProgress(achievement, totalSongs, isBetaTester);
  const unlocked = isAchievementUnlocked(achievement, totalSongs, isBetaTester);
  const claimed = isAchievementClaimed(achievement, claimedList, isBetaTesterRewardClaimed);
  const pinned = pinnedList.includes(achievement.id);
  const pct = Math.round((progress / achievement.target) * 100);

  const description = achievement.description.replace('{target}', achievement.target.toLocaleString('tr-TR'));

  return (
    <motion.div
      layout
      className={`relative rounded-2xl p-4 border transition-all duration-300 ${s.bg} ${s.border} ${unlocked && !claimed ? s.glow : ''} ${!unlocked ? 'opacity-60' : ''}`}
    >
      {/* Pin button (top-right) — only visible when unlocked & claimed on own profile */}
      {isOwnProfile && claimed && onTogglePin && (
        <button
          onClick={() => onTogglePin(achievement.id)}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-all active:scale-90 ${
            pinned
              ? 'bg-[#D4AF37]/20 text-[#D4AF37]'
              : 'bg-white/5 text-gray-500 active:text-gray-300'
          }`}
          title={pinned ? 'Profili Kaldır' : 'Profile Sabitle'}
        >
          {pinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
        </button>
      )}

      <div className="flex items-start gap-3">
        {/* Emoji Badge */}
        <div
          className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-3xl border ${s.bg} ${s.border} ${unlocked ? s.glow : ''} relative`}
        >
          <span className={`${!unlocked ? 'grayscale opacity-40' : ''}`}>
            {achievement.emoji}
          </span>
          {claimed && (
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[#0A0A0A] flex items-center justify-center">
              <Check className="w-3 h-3 text-white stroke-[3]" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <h3 className={`text-sm font-black leading-tight ${unlocked ? 'text-white' : 'text-gray-400'}`}>
              {achievement.title}
            </h3>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${s.badge}`}>
              {TIER_LABELS[achievement.tier]}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium leading-relaxed mb-2">
            {description}
          </p>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${s.progressFill}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold ${s.text}`}>
                {progress.toLocaleString('tr-TR')} / {achievement.target.toLocaleString('tr-TR')}
              </span>
              <span className="text-[10px] font-bold text-amber-300/70">
                {!isOwnProfile ? (
                  unlocked || claimed ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Kazanıldı
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-bold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> Kilitli
                    </span>
                  )
                ) : claimed ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Ödül Alındı
                  </span>
                ) : achievement.id === 'beta_tester' ? (
                  <span className="text-purple-400 font-bold">Ödül: Özel Beta Rozeti</span>
                ) : (
                  <span className="opacity-75">Ödül: +{achievement.reward} Kredi</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Claim button — only shows when unlocked but not yet claimed ON OWN PROFILE */}
      {isOwnProfile && unlocked && !claimed && onClaim && (
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onClaim(achievement)}
          disabled={isClaiming}
          className={`w-full mt-3 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all active:scale-95 ${
            isClaiming
              ? 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93B] text-stone-950 shadow-[0_4px_15px_rgba(212,175,55,0.4)] animate-pulse'
          }`}
        >
          <Gift className="w-4 h-4" />
          {isClaiming ? 'İşleniyor...' : `Ödülü Al (+${achievement.reward} Kredi)`}
        </motion.button>
      )}
    </motion.div>
  );
};

// ─── Main Achievements Modal ─────────────────────────────────────────────────
export interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProfile?: any;
  isOwnProfile?: boolean;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ 
  isOpen, 
  onClose,
  targetProfile,
  isOwnProfile = true,
}) => {
  const { user, setUser, showToast } = useApp();
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [savingPin, setSavingPin] = useState(false);

  const activeProfile = isOwnProfile ? user : (targetProfile || user);

  const claimedList: string[] = (activeProfile as any)?.claimed_achievements ?? [];
  const pinnedList: string[] = (activeProfile as any)?.pinned_achievements ?? [];
  const totalSongs = activeProfile?.totalSongsRequested ?? activeProfile?.total_songs_requested ?? 0;
  const isBetaTester = activeProfile?.is_beta_tester ?? activeProfile?.isBetaTester ?? false;
  const isBetaTesterRewardClaimed = activeProfile?.beta_tester_reward_claimed ?? false;

  // Count unlocked but unclaimed (only for own profile)
  const pendingCount = isOwnProfile ? ACHIEVEMENTS.filter(
    a => isAchievementUnlocked(a, totalSongs, isBetaTester) && !isAchievementClaimed(a, claimedList, isBetaTesterRewardClaimed)
  ).length : 0;

  const completedCount = ACHIEVEMENTS.filter(
    a => isAchievementUnlocked(a, totalSongs, isBetaTester) || isAchievementClaimed(a, claimedList, isBetaTesterRewardClaimed)
  ).length;

  const handleClaim = useCallback(async (achievement: Achievement) => {
    if (!isOwnProfile || !user || !supabase) return;
    setClaimingId(achievement.id);

    try {
      if (achievement.id === 'beta_tester') {
        // Direct update in Supabase profiles table
        await supabase
          .from('profiles')
          .update({ beta_tester_reward_claimed: true })
          .eq('id', user.id);

        try {
          await supabase.rpc('claim_beta_tester_reward');
        } catch (rpcErr) {
          console.warn('[BetaTesterClaim RPC ignored]', rpcErr);
        }

        // Update local state
        setUser(prev => prev ? {
          ...prev,
          beta_tester_reward_claimed: true,
        } as any : null);

        showToast('Tebrikler! Beta Tester rozetiniz tanımlandı. 🎉');
      } else {
        const { data, error } = await supabase.rpc('claim_achievement', {
          p_user_id: user.id,
          p_achievement_id: achievement.id,
          p_reward_amount: achievement.reward,
        });

        if (error) throw error;

        const result = data as { success: boolean; reason?: string; reward?: number };
        if (!result.success) {
          showToast('Bu ödül zaten alınmış.');
          return;
        }

        // Update local state
        setUser(prev => prev ? {
          ...prev,
          claimed_achievements: [...(claimedList), achievement.id],
        } as any : null);
      }

      // Confetti explosion 🎉
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E5A93B', '#FFF0C7', '#10b981'],
        disableForReducedMotion: true,
      });

      showToast(`🎁 +${achievement.reward} Promosyon Kredisi kazandın!`);
    } catch (err) {
      console.error('[claim_achievement]', err);
      showToast('Ödül alınırken bir hata oluştu.');
    } finally {
      setClaimingId(null);
    }
  }, [isOwnProfile, user, claimedList, setUser, showToast]);

  const handleTogglePin = useCallback(async (achievementId: string) => {
    if (!isOwnProfile || !user || !supabase || savingPin) return;
    setSavingPin(true);

    let newPinned: string[];
    if (pinnedList.includes(achievementId)) {
      newPinned = pinnedList.filter(id => id !== achievementId);
    } else {
      if (pinnedList.length >= 3) {
        showToast('En fazla 3 başarım profiline sabitleyebilirsin.');
        setSavingPin(false);
        return;
      }
      newPinned = [...pinnedList, achievementId];
    }

    try {
      const { error } = await supabase.rpc('update_pinned_achievements', {
        p_user_id: user.id,
        p_pinned: newPinned,
      });
      if (error) throw error;

      setUser(prev => prev ? { ...prev, pinned_achievements: newPinned } as any : null);
      showToast(newPinned.includes(achievementId) ? '📌 Profile sabitlendi.' : 'Profil rozeti kaldırıldı.');
    } catch (err) {
      console.error('[pin_achievement]', err);
      showToast('Kayıt sırasında bir hata oluştu.');
    } finally {
      setSavingPin(false);
    }
  }, [isOwnProfile, user, pinnedList, setUser, showToast, savingPin]);

  const profileDisplayName = formatUserDisplayName(activeProfile?.username, activeProfile?.name || activeProfile?.full_name);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-[#0A0A0A] rounded-t-3xl z-10 flex flex-col"
            style={{ maxHeight: '90vh' }}
          >
            {/* Handle */}
            <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-3 mb-1 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-zinc-400 active:bg-white/10 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-base font-black text-white tracking-tight">
                    {isOwnProfile ? 'Başarımlarım' : `${profileDisplayName} Başarımları`}
                  </h2>
                </div>
                {pendingCount > 0 && (
                  <span className="text-[10px] font-bold text-emerald-400 mt-0.5">
                    {pendingCount} ödül bekliyor!
                  </span>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-full bg-white/5 text-zinc-400 active:bg-white/10 transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stats Summary Bar */}
            <div className="flex items-center gap-3 px-5 py-3 bg-[#120C08]/60 border-b border-white/5 shrink-0">
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold text-amber-200/50 uppercase tracking-widest">Şarkı İstek</p>
                <p className="text-lg font-black text-white">{totalSongs.toLocaleString('tr-TR')}</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex-1 text-center">
                <p className="text-[9px] font-bold text-amber-200/50 uppercase tracking-widest">Kazanılan</p>
                <p className="text-lg font-black text-[#D4AF37]">
                  {completedCount}/{ACHIEVEMENTS.length}
                </p>
              </div>
            </div>

            {/* Pin tip — only for own profile */}
            {isOwnProfile ? (
              <div className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37]/5 border-b border-[#D4AF37]/10 shrink-0">
                <Pin className="w-3.5 h-3.5 text-[#D4AF37]/70 shrink-0" />
                <p className="text-[10px] text-amber-200/50 font-medium">
                  Kazandığın başarımları <span className="text-[#D4AF37] font-bold">profiline sabitle</span> (maks. 3 rozet)
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-5 py-2 bg-[#D4AF37]/5 border-b border-[#D4AF37]/10 shrink-0">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]/70 shrink-0" />
                <p className="text-[10px] text-amber-200/50 font-medium">
                  {profileDisplayName} kullanıcısının kilit açtığı ve kazandığı başarımlar
                </p>
              </div>
            )}

            {/* Achievement Cards */}
            <div className="overflow-y-auto flex-1 px-4 py-4 space-y-3 pb-8 custom-scrollbar">
              {/* Section: Şarkı */}
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">🎵 Şarkı Görevleri</p>
              {ACHIEVEMENTS.filter(a => a.category === 'songs').map(a => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  totalSongs={totalSongs}
                  claimedList={claimedList}
                  pinnedList={pinnedList}
                  onClaim={isOwnProfile ? handleClaim : undefined}
                  onTogglePin={isOwnProfile ? handleTogglePin : undefined}
                  isClaiming={claimingId === a.id}
                  isBetaTester={isBetaTester}
                  isBetaTesterRewardClaimed={isBetaTesterRewardClaimed}
                  isOwnProfile={isOwnProfile}
                />
              ))}

              {/* Section: Özel */}
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 mt-4">✨ Özel Başarımlar</p>
              {ACHIEVEMENTS.filter(a => a.category === 'special').map(a => (
                <AchievementCard
                  key={a.id}
                  achievement={a}
                  totalSongs={totalSongs}
                  claimedList={claimedList}
                  pinnedList={pinnedList}
                  onClaim={isOwnProfile ? handleClaim : undefined}
                  onTogglePin={isOwnProfile ? handleTogglePin : undefined}
                  isClaiming={false}
                  isBetaTester={isBetaTester}
                  isBetaTesterRewardClaimed={isBetaTesterRewardClaimed}
                  isOwnProfile={isOwnProfile}
                />
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
