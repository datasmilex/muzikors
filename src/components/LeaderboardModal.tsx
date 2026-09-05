'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Store, Loader2, Gift, ChevronDown, Check, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import { formatUserDisplayName } from '../utils/formatters';
import { AvatarFrame } from './AvatarFrame';
import { getLevelDetails } from '../utils/levelSystem';

interface GiveawayWinner {
  rank: number;
  user_id: string;
  full_name: string;
  username: string | null;
  avatar_url: string | null;
  reward_title: string;
  drawn_at: string;
}

export const LeaderboardModal: React.FC = () => {
  const { activeModal, closeModal, user: currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'venues'>('users');
  const [showRewards, setShowRewards] = useState(false);
  const [rewardSettings, setRewardSettings] = useState<{
    is_active: boolean;
    user_rewards: { rank: string; title: string; description: string }[];
    venue_rewards: { rank: string; title: string; description: string }[];
    rules_text?: string;
    giveaway_winners?: GiveawayWinner[];
    giveaway_drawn_at?: string | null;
  } | null>(null);

  const [giveawayStatus, setGiveawayStatus] = useState<{ participant_count: number; is_joined: boolean }>({
    participant_count: 0,
    is_joined: false
  });
  const [joiningGiveaway, setJoiningGiveaway] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeModal === 'leaderboard') {
      fetchData();
      fetchGiveawayStatus();
    }
  }, [activeModal, activeTab, currentUser?.id]);

  const fetchGiveawayStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_giveaway_status', {
        p_user_id: currentUser?.id || null
      });
      if (!error && data) {
        setGiveawayStatus({
          participant_count: Number(data.participant_count || 0),
          is_joined: !!data.is_joined
        });
      }
    } catch (e) {
      console.error('[Giveaway status error]', e);
    }
  };

  const handleJoinGiveaway = async () => {
    if (!currentUser) {
      alert('Çekilişe katılabilmek için lütfen önce giriş yapın!');
      return;
    }

    setJoiningGiveaway(true);
    try {
      const { data, error } = await supabase.rpc('join_giveaway', {
        p_user_id: currentUser.id
      });
      if (error) throw error;
      if (data?.success) {
        setGiveawayStatus({
          participant_count: Number(data.participant_count || giveawayStatus.participant_count + 1),
          is_joined: true
        });

        // Trigger celebratory confetti
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({
            particleCount: 65,
            spread: 60,
            origin: { y: 0.65 }
          });
        } catch (_) {}
      }
    } catch (err: any) {
      alert('Çekilişe katılırken bir hata oluştu: ' + (err.message || 'Lütfen tekrar deneyin.'));
    } finally {
      setJoiningGiveaway(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'users') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, username, avatar_url, avatar_frame, total_songs_requested, is_premium, is_beta_tester, xp, level')
          .order('level', { ascending: false })
          .order('xp', { ascending: false })
          .limit(50);
        
        if (profiles && !error) {
          const list = profiles.map((p: any) => {
            const totalXp = Number(p.xp || 0);
            const lvlInfo = getLevelDetails(totalXp);
            return {
              id: p.id,
              name: p.full_name || 'Kullanıcı',
              username: p.username || null,
              avatar: p.avatar_url,
              avatar_frame: p.avatar_frame || 'none',
              is_premium: p.is_premium || false,
              is_beta_tester: p.is_beta_tester || false,
              total_songs_requested: p.total_songs_requested || 0,
              xp: totalXp,
              level: lvlInfo.level,
              title: lvlInfo.title,
              fullTitle: lvlInfo.fullTitle,
              tier: lvlInfo.tier
            };
          });
          setUsers(list);
        } else {
          setUsers([]);
        }
      } else {
        const { data: venueData, error } = await supabase
          .from('venues')
          .select('id, venue_name, logo_url, total_requests')
          .order('total_requests', { ascending: false })
          .limit(50);
        
        if (venueData && !error) {
          const list = venueData.map((v: any) => ({
            id: v.id,
            venue_name: v.venue_name,
            logo_url: v.logo_url,
            total_songs_requested: v.total_requests || 0
          }));
          setVenues(list);
        } else {
          setVenues([]);
        }
      }

      // Fetch dynamic leaderboard rewards settings from Supabase
      const { data: settingsRow } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'leaderboard_rewards')
        .maybeSingle();

      if (settingsRow?.value) {
        setRewardSettings(settingsRow.value);
      }
    } catch (err) {
      console.error('[Leaderboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'leaderboard' && (
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
            className="relative w-full max-w-md h-[82vh] sm:h-[620px] sm:rounded-3xl rounded-t-[2.5rem] flex flex-col overflow-hidden bg-[var(--theme-card)] border-t sm:border border-white/[0.1] shadow-[0_-20px_60px_rgba(0,0,0,0.95)]"
          >
            {/* Header */}
            <div className="flex-none p-5 flex items-center justify-between border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-[var(--theme-primary)] shrink-0" />
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">Liderlik Tablosu</h2>
                  <span className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">
                    {activeTab === 'users' ? 'En Yüksek Seviyeli Müzikseverler' : 'En Çok Şarkı Çalınan Mekanlar'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-none px-5 pt-4">
              <div className="flex p-1 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'users'
                      ? 'bg-[var(--theme-primary)] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Kullanıcılar</span>
                </button>
                <button
                  onClick={() => setActiveTab('venues')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'venues'
                      ? 'bg-[var(--theme-primary)] text-black shadow-md'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Mekanlar</span>
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 space-y-2 flex flex-col custom-scrollbar">
              {/* Rewards Accordion - Controlled via Admin Panel app_settings */}
              {rewardSettings?.is_active && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowRewards(!showRewards)}
                    className="w-full p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-[var(--theme-primary)]/30 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Gift className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{activeTab === 'users' ? 'Kullanıcı VIP Çekilişi' : 'Ayın Mekan Ödülü'}</span>
                          {activeTab === 'users' && giveawayStatus.is_joined && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                              Katıldın
                            </span>
                          )}
                        </h4>
                        <p className="text-[10px] text-neutral-400">
                          {activeTab === 'users' 
                            ? 'Çekilişe katılan şanslı müzikseverlere hediyeler' 
                            : '1. sıradaki popüler mekana özel ödül'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-[var(--theme-primary)]">
                        {showRewards ? 'Gizle' : 'Gör'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-[var(--theme-primary)] transition-transform ${showRewards ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {showRewards && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] space-y-2.5">
                          {activeTab === 'users' ? (
                            <>
                              {/* 1. ÇEKİLİŞE KATIL BUTONU & DURUM KARTI */}
                              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto">
                                  <Gift className="w-4 h-4 text-[var(--theme-primary)] shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                                      <span>Aylık VIP Çekilişi</span>
                                      <span className="text-[10px] font-normal text-neutral-400">({giveawayStatus.participant_count} Katılımcı)</span>
                                    </p>
                                    <p className="text-[10px] text-neutral-400 mt-0.5">
                                      {giveawayStatus.is_joined 
                                        ? 'Tebrikler, çekiliş havuzundasın!' 
                                        : 'Tek tıkla ücretsiz katıl, VIP kazan'}
                                    </p>
                                  </div>
                                </div>

                                {giveawayStatus.is_joined ? (
                                  <div className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 shrink-0">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    <span>Çekilişe Katıldın</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={handleJoinGiveaway}
                                    disabled={joiningGiveaway}
                                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[var(--theme-primary)] hover:brightness-110 text-black font-black text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                                  >
                                    {joiningGiveaway ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Gift className="w-3.5 h-3.5" />}
                                    <span>Çekilişe Katıl</span>
                                  </button>
                                )}
                              </div>

                              {/* 2. KAZANANLAR VARSA GÖSTER */}
                              {rewardSettings.giveaway_winners && rewardSettings.giveaway_winners.length > 0 && (
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
                                  <p className="text-[11px] font-black text-amber-300 flex items-center gap-1">
                                    <Crown className="w-3.5 h-3.5 fill-current" />
                                    <span>Son Çekilişin Kazananları:</span>
                                  </p>
                                  <div className="grid grid-cols-1 gap-1.5">
                                    {rewardSettings.giveaway_winners.map((winner, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40 border border-white/5">
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-5 h-5 rounded-full bg-[var(--theme-primary)] text-black font-black text-[10px] flex items-center justify-center shrink-0">
                                            {winner.rank || idx + 1}
                                          </div>
                                          <img
                                            src={winner.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.full_name || 'K')}&background=0d1322&color=F59E0B`}
                                            alt=""
                                            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/logo.png'; }}
                                            className="w-6 h-6 rounded-lg object-cover border border-white/10 shrink-0"
                                          />
                                          <span className="text-xs font-bold text-white truncate">{winner.full_name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-amber-400 shrink-0 pl-2">
                                          {winner.reward_title}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* 3. ÇEKİLİŞ ÖDÜLLERİ LİSTESİ */}
                              <div className="space-y-1.5">
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                                  Verilecek Çekiliş Hediyeleri
                                </p>
                                {rewardSettings.user_rewards && rewardSettings.user_rewards.length > 0 ? (
                                  rewardSettings.user_rewards.map((rw, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                                      <div className="w-6 h-6 rounded-full bg-[var(--theme-primary)] flex items-center justify-center font-black text-black text-[10px] shrink-0">
                                        {rw.rank || idx + 1}
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-white mb-0.5">{rw.title}</p>
                                        <p className="text-[10px] text-neutral-400 leading-snug">{rw.description}</p>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-xs text-neutral-400 p-2">Bu ay için henüz çekiliş ödülü belirlenmedi.</p>
                                )}
                              </div>
                            </>
                          ) : (
                            rewardSettings.venue_rewards && rewardSettings.venue_rewards.length > 0 ? (
                              rewardSettings.venue_rewards.map((rw, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 bg-black/40 p-2.5 rounded-xl border border-white/5">
                                  <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center font-black text-black text-[10px] shrink-0">
                                    {rw.rank || idx + 1}
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-white mb-0.5">{rw.title}</p>
                                    <p className="text-[10px] text-neutral-400 leading-snug">{rw.description}</p>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-neutral-400 p-2">Bu ay için henüz mekan ödülü belirlenmedi.</p>
                            )
                          )}
                          {rewardSettings.rules_text && (
                            <p className="text-[9px] text-neutral-500 pt-1 text-center italic border-t border-white/5">
                              {rewardSettings.rules_text}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {loading ? (
                <div className="h-full flex flex-col items-center justify-center space-y-3 py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-primary)]" />
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Yükleniyor...</span>
                </div>
              ) : activeTab === 'users' ? (
                users.length > 0 ? (
                  users.map((user, idx) => {
                    const isTop = idx === 0;
                    const isUserVip = user.is_premium || (currentUser?.id === user.id && currentUser?.isPremium);
                    const isUserBeta = user.is_beta_tester || (currentUser?.id === user.id && currentUser?.is_beta_tester);
                    const isCurrentLoggedUser = currentUser?.id === user.id;

                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isCurrentLoggedUser
                            ? 'bg-[var(--theme-card-alt)] border-[var(--theme-primary)]/50 shadow-sm'
                            : isTop
                            ? 'bg-[var(--theme-card-alt)] border-[var(--theme-primary)]/30'
                            : 'bg-white/[0.02] border-white/[0.06]'
                        }`}
                      >
                        <div className={`w-7 h-7 flex-none flex items-center justify-center font-black text-xs rounded-full shadow-sm ${
                          idx + 1 === 1 ? 'bg-[var(--theme-primary)] text-black' : 
                          idx + 1 === 2 ? 'bg-slate-300 text-slate-900' : 
                          idx + 1 === 3 ? 'bg-amber-700 text-white' : 
                          'bg-white/10 text-neutral-400'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="relative shrink-0">
                          <AvatarFrame frameId={user.avatar_frame} size="md">
                            <img
                              src={user.avatar || '/logo.png'}
                              alt={user.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                          </AvatarFrame>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate flex items-center gap-1.5">
                            <span className="truncate">{formatUserDisplayName(user.username, user.name)}</span>
                            {isUserVip && <PremiumBadge className="w-3.5 h-3.5 shrink-0" />}
                            {isUserBeta && <BetaTesterBadge className="w-3.5 h-3.5 shrink-0" />}
                          </p>
                          <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5 flex items-center gap-1">
                            <span>{user.title}</span>
                          </p>
                        </div>

                        <div className="flex-none px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center min-w-[54px]">
                          <span className="text-xs font-black text-[var(--theme-primary)]">Lv. {user.level}</span>
                          <span className="text-[8px] font-bold text-neutral-500 uppercase">{user.xp} XP</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-neutral-500 py-10 text-xs">Henüz veri bulunmuyor.</div>
                )
              ) : (
                venues.length > 0 ? (
                  venues.map((venue, idx) => {
                    const isTop = idx === 0;

                    return (
                      <div
                        key={venue.id}
                        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                          isTop ? 'bg-[var(--theme-card-alt)] border-[var(--theme-primary)]/30' : 'bg-white/[0.02] border-white/[0.06]'
                        }`}
                      >
                        <div className={`w-7 h-7 flex-none flex items-center justify-center font-black text-xs rounded-full shadow-sm ${
                          idx + 1 === 1 ? 'bg-[var(--theme-primary)] text-black' : 
                          idx + 1 === 2 ? 'bg-slate-300 text-slate-900' : 
                          idx + 1 === 3 ? 'bg-amber-700 text-white' : 
                          'bg-white/10 text-neutral-400'
                        }`}>
                          {idx + 1}
                        </div>

                        <div className="relative w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                          {venue.logo_url ? (
                            <img src={venue.logo_url} alt={venue.venue_name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-5 h-5 text-amber-400" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs text-white truncate">
                            {venue.venue_name}
                          </p>
                        </div>

                        <div className="flex-none px-3 py-1.5 rounded-xl bg-black/40 border border-white/5 flex flex-col items-center justify-center">
                          <span className="text-xs font-black text-amber-400">{venue.total_songs_requested || 0}</span>
                          <span className="text-[8px] font-bold text-neutral-500 uppercase">İstek</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-neutral-500 py-10 text-xs">Henüz kayıt bulunamadı.</div>
                )
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
