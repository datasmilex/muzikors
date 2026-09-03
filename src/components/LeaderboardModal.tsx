'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Store, Loader2, Gift, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import { formatUserDisplayName } from '../utils/formatters';
import { AvatarFrame } from './AvatarFrame';
import { getLevelDetails } from '../utils/levelSystem';

export const LeaderboardModal: React.FC = () => {
  const { activeModal, closeModal, user: currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'venues'>('users');
  const [showRewards, setShowRewards] = useState(false);
  const [rewardSettings, setRewardSettings] = useState<{
    is_active: boolean;
    user_rewards: { rank: string; title: string; description: string }[];
    venue_rewards: { rank: string; title: string; description: string }[];
    rules_text?: string;
  } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeModal === 'leaderboard') {
      fetchData();
    }
  }, [activeModal, activeTab]);

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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)] shadow-inner">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-black text-white tracking-tight">Liderlik Tablosu</h2>
                  <span className="text-[10px] text-[var(--theme-primary-light)] font-bold uppercase tracking-wider">En Çok Şarkı Çaldıranlar</span>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-none flex items-center p-1.5 mx-5 mt-4 bg-[var(--theme-card-alt)] rounded-2xl border border-white/[0.08]">
              <button
                onClick={() => setActiveTab('users')}
                className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'users' ? 'bg-[var(--theme-primary)] text-black shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Kullanıcılar
              </button>
              <button
                onClick={() => setActiveTab('venues')}
                className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-all ${
                  activeTab === 'venues' ? 'bg-[var(--theme-primary)] text-black shadow-md' : 'text-white/60 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5" /> Mekanlar
              </button>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto px-5 pb-6 pt-4 space-y-2 flex flex-col custom-scrollbar">
              {/* Rewards Accordion - Controlled via Admin Panel app_settings */}
              {rewardSettings?.is_active && (
                <div className="mb-2">
                  <button
                    onClick={() => setShowRewards(!showRewards)}
                    className="w-full p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-[var(--theme-primary)]/30 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)]">
                        <Gift className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-white">
                          {activeTab === 'users' ? 'Ayın Kullanıcı Ödülleri' : 'Ayın Mekan Ödülleri'}
                        </h4>
                        <p className="text-[10px] text-neutral-400">İlk 3&apos;e girenlerin kazanacağı ödüller</p>
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
                        <div className="mt-2 p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] space-y-2">
                          {activeTab === 'users' ? (
                            rewardSettings.user_rewards && rewardSettings.user_rewards.length > 0 ? (
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
                              <p className="text-xs text-neutral-400 p-2">Bu ay için henüz kullanıcı ödülü belirlenmedi.</p>
                            )
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
