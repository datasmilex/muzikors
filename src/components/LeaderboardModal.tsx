'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Gift, Loader2, Store, Trophy, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import { formatUserDisplayName } from '../utils/formatters';
import { AvatarFrame } from './AvatarFrame';
import { getLevelDetails } from '../utils/levelSystem';
import { Sheet } from './ui/Sheet';
import { EmptyState, Segmented, SkeletonRows, btn } from './ui/controls';
import { EASE_OUT } from '../lib/motion';

interface GiveawayWinner {
  rank: number;
  user_id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  reward_title: string;
  drawn_at: string;
}

interface RewardSettings {
  is_active: boolean;
  user_rewards: { rank: string; title: string; description: string }[];
  venue_rewards: { rank: string; title: string; description: string }[];
  rules_text?: string;
  giveaway_winners?: GiveawayWinner[];
  giveaway_drawn_at?: string | null;
}

type Tab = 'users' | 'venues';

const RankBadge: React.FC<{ rank: number }> = ({ rank }) => (
  <span
    className={`w-7 shrink-0 text-center text-[14px] font-bold tabular-nums ${
      rank === 1 ? 'text-[var(--theme-primary)]' : rank <= 3 ? 'text-white/80' : 'text-white/35'
    }`}
  >
    {rank}
  </span>
);

export const LeaderboardModal: React.FC = () => {
  const { activeModal, closeModal, user: currentUser, showToast, openProfile } = useApp();
  const [tab, setTab] = useState<Tab>('users');
  const [showRewards, setShowRewards] = useState(false);
  const [rewardSettings, setRewardSettings] = useState<RewardSettings | null>(null);
  const [giveaway, setGiveaway] = useState({ participant_count: 0, is_joined: false });
  const [joining, setJoining] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isOpen = activeModal === 'leaderboard';

  const fetchGiveawayStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_giveaway_status', { p_user_id: currentUser?.id || null });
      if (!error && data) {
        setGiveaway({ participant_count: Number(data.participant_count || 0), is_joined: Boolean(data.is_joined) });
      }
    } catch (e) {
      console.error('[Giveaway status error]', e);
    }
  }, [currentUser?.id]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, avatar_frame, total_songs_requested, is_premium, is_beta_tester, xp, level')
          .order('level', { ascending: false })
          .order('xp', { ascending: false })
          .limit(50);
        setUsers(
          !error && data
            ? data.map((p: any) => {
                const lvl = getLevelDetails(Number(p.xp || 0));
                return {
                  id: p.id,
                  name: p.full_name || 'Kullanıcı',
                  username: p.username || null,
                  avatar: p.avatar_url,
                  avatar_frame: p.avatar_frame || 'none',
                  is_premium: Boolean(p.is_premium),
                  is_beta_tester: Boolean(p.is_beta_tester),
                  xp: Number(p.xp || 0),
                  level: lvl.level,
                  title: lvl.title,
                };
              })
            : []
        );
      } else {
        const { data, error } = await supabase
          .from('venues')
          .select('id, venue_name, logo_url, total_requests')
          .order('total_requests', { ascending: false })
          .limit(50);
        setVenues(!error && data ? data.map((v: any) => ({ id: v.id, name: v.venue_name, logo: v.logo_url, requests: v.total_requests || 0 })) : []);
      }

      const { data: settingsRow } = await supabase.from('app_settings').select('value').eq('key', 'leaderboard_rewards').maybeSingle();
      if (settingsRow?.value) setRewardSettings(settingsRow.value as RewardSettings);
    } catch (err) {
      console.error('[Leaderboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (!isOpen) return;
    fetchData();
    fetchGiveawayStatus();
  }, [isOpen, fetchData, fetchGiveawayStatus]);

  const joinGiveaway = async () => {
    if (!currentUser) {
      showToast('Çekilişe katılmak için giriş yapman gerekiyor.');
      return;
    }
    setJoining(true);
    try {
      const { data, error } = await supabase.rpc('join_giveaway', { p_user_id: currentUser.id });
      if (error) throw error;
      if (data?.success) {
        setGiveaway((g) => ({ participant_count: Number(data.participant_count || g.participant_count + 1), is_joined: true }));
        showToast('Çekilişe katıldın. Bol şans!');
      }
    } catch (err: any) {
      showToast('Çekilişe katılınamadı: ' + (err?.message || 'Lütfen tekrar dene.'));
    } finally {
      setJoining(false);
    }
  };

  const rewards = tab === 'users' ? rewardSettings?.user_rewards : rewardSettings?.venue_rewards;

  return (
    <Sheet
      open={isOpen}
      onClose={closeModal}
      title="Sıralama"
      subtitle={tab === 'users' ? 'En yüksek seviyeli müzikseverler' : 'En çok şarkı istenen mekânlar'}
      height="tall"
      width="lg"
      toolbar={
        <Segmented
          layoutId="leaderboard-tab"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'users', label: 'Kullanıcılar', icon: <Users className="w-4 h-4" /> },
            { value: 'venues', label: 'Mekânlar', icon: <Store className="w-4 h-4" /> },
          ]}
        />
      }
    >
      {rewardSettings?.is_active && (
        <div className="mb-4 rounded-2xl bg-white/[0.04] overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRewards((v) => !v)}
            aria-expanded={showRewards}
            className="w-full flex items-center gap-3 px-4 min-h-[56px] text-left"
          >
            <Gift className="w-5 h-5 text-[var(--theme-primary)] shrink-0" />
            <span className="flex-1 min-w-0">
              <span className="block text-[14px] font-semibold">{tab === 'users' ? 'Aylık VIP çekilişi' : 'Ayın mekân ödülü'}</span>
              <span className="block text-[12px] text-white/50">
                {tab === 'users'
                  ? giveaway.is_joined
                    ? `Katıldın · ${giveaway.participant_count} katılımcı`
                    : `${giveaway.participant_count} katılımcı`
                  : '1. sıradaki mekâna özel ödül'}
              </span>
            </span>
            <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${showRewards ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showRewards && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 space-y-4">
                  {tab === 'users' && (
                    giveaway.is_joined ? (
                      <div className={`${btn.secondary} w-full pointer-events-none`}>
                        <Check className="w-4 h-4 text-emerald-400" strokeWidth={3} />
                        Çekilişe katıldın
                      </div>
                    ) : (
                      <button type="button" onClick={joinGiveaway} disabled={joining} className={`${btn.primary} w-full`}>
                        {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
                        Ücretsiz katıl
                      </button>
                    )
                  )}

                  {tab === 'users' && rewardSettings.giveaway_winners && rewardSettings.giveaway_winners.length > 0 && (
                    <div>
                      <p className="text-[12px] font-semibold text-white/45 mb-2">Son çekilişin kazananları</p>
                      <ul className="space-y-2">
                        {rewardSettings.giveaway_winners.map((w, i) => (
                          <li key={i} className="flex items-center gap-3">
                            <RankBadge rank={w.rank || i + 1} />
                            <span className="flex-1 text-[14px] font-medium truncate">{w.full_name}</span>
                            <span className="text-[12px] text-white/50 shrink-0">{w.reward_title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="text-[12px] font-semibold text-white/45 mb-2">Ödüller</p>
                    {rewards && rewards.length > 0 ? (
                      <ul className="space-y-2.5">
                        {rewards.map((rw, i) => (
                          <li key={i} className="flex gap-3">
                            <RankBadge rank={Number(rw.rank) || i + 1} />
                            <span className="min-w-0">
                              <span className="block text-[14px] font-medium">{rw.title}</span>
                              <span className="block text-[12px] text-white/50 leading-snug">{rw.description}</span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[13px] text-white/50">Bu ay için ödül henüz belirlenmedi.</p>
                    )}
                  </div>

                  {rewardSettings.rules_text && <p className="text-[11px] text-white/35 leading-relaxed">{rewardSettings.rules_text}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab + (loading ? '-loading' : '')}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.24, ease: EASE_OUT } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="pb-2"
        >
          {loading ? (
            <SkeletonRows count={8} />
          ) : tab === 'users' ? (
            users.length === 0 ? (
              <EmptyState icon={<Trophy className="w-6 h-6" />} title="Henüz sıralama yok" />
            ) : (
              <ul className="landscape:grid landscape:grid-cols-2 landscape:gap-x-6">
                {users.map((u, i) => {
                  const isMe = currentUser?.id === u.id;
                  return (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => openProfile(u.id)}
                        className={`w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-2xl text-left active:bg-white/[0.04] transition-colors ${isMe ? 'bg-white/[0.05]' : ''}`}
                      >
                        <RankBadge rank={i + 1} />
                        <AvatarFrame frameId={u.avatar_frame} size="md">
                          <img
                            src={u.avatar || '/logo.png'}
                            alt=""
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/logo.png';
                            }}
                            className="w-full h-full object-cover rounded-full bg-white/[0.06]"
                          />
                        </AvatarFrame>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-1.5 text-[14px] font-semibold">
                            <span className="truncate">{isMe ? 'Sen' : formatUserDisplayName(u.username, u.name)}</span>
                            {u.is_premium && <PremiumBadge className="w-3.5 h-3.5 shrink-0" />}
                            {u.is_beta_tester && <BetaTesterBadge className="w-3.5 h-3.5 shrink-0" />}
                          </span>
                          <span className="block text-[12px] text-white/45 truncate">{u.title}</span>
                        </span>
                        <span className="text-right shrink-0">
                          <span className="block text-[14px] font-semibold tabular-nums">Lv. {u.level}</span>
                          <span className="block text-[11px] text-white/40 tabular-nums">{u.xp} XP</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )
          ) : venues.length === 0 ? (
            <EmptyState icon={<Store className="w-6 h-6" />} title="Henüz sıralama yok" />
          ) : (
            <ul className="landscape:grid landscape:grid-cols-2 landscape:gap-x-6">
              {venues.map((v, i) => (
                <li key={v.id} className="flex items-center gap-3 py-2.5">
                  <RankBadge rank={i + 1} />
                  <span className="w-10 h-10 shrink-0 rounded-xl overflow-hidden bg-white/[0.06] grid place-items-center">
                    {v.logo ? <img src={v.logo} alt="" loading="lazy" className="w-full h-full object-cover" /> : <Store className="w-5 h-5 text-white/40" />}
                  </span>
                  <span className="flex-1 min-w-0 text-[14px] font-semibold truncate">{v.name}</span>
                  <span className="text-right shrink-0">
                    <span className="block text-[14px] font-semibold tabular-nums">{v.requests}</span>
                    <span className="block text-[11px] text-white/40">istek</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>
    </Sheet>
  );
};
