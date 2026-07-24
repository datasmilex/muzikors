'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Coins, Music, Trash2, LogOut, Sparkles, Trophy, Loader2, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

interface LeaderboardUser {
  userId: string;
  fullName: string;
  avatarUrl: string;
  songCount: number;
}

export const ProfileView: React.FC = () => {
  const { activeModal, closeModal, user, deleteAccount, logout, loginWithProvider, isSpotifyConnected } = useApp();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // ── PERMANENT MONTHLY LEADERBOARD FETCH FROM song_requests_log ─────────
  useEffect(() => {
    if (activeModal !== 'profile' || !supabase) return;

    const fetchMonthlyLeaderboard = async () => {
      setIsLoadingLeaderboard(true);
      try {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

        // 1. Fetch permanent logs created this month
        const { data: logData, error: logErr } = await supabase
          .from('song_requests_log')
          .select('user_id')
          .gte('created_at', firstDayOfMonth);

        const userCounts: { [key: string]: number } = {};

        if (!logErr && logData && logData.length > 0) {
          logData.forEach((row: any) => {
            if (row.user_id) {
              userCounts[row.user_id] = (userCounts[row.user_id] || 0) + 1;
            }
          });
        }

        const userIds = Object.keys(userCounts);

        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .in('id', userIds);

          const list: LeaderboardUser[] = (profiles || [])
            .map((p: any) => ({
              userId: p.id,
              fullName: p.full_name || 'Kullanıcı',
              avatarUrl: p.avatar_url || '',
              songCount: userCounts[p.id] || 0,
            }))
            .sort((a, b) => b.songCount - a.songCount)
            .slice(0, 10);

          setLeaderboard(list);
        } else {
          // Fallback to profiles total_songs_requested for display if log table is new
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, total_songs_requested')
            .gt('total_songs_requested', 0)
            .order('total_songs_requested', { ascending: false })
            .limit(10);

          if (profiles && profiles.length > 0) {
            setLeaderboard(
              profiles.map((p: any) => ({
                userId: p.id,
                fullName: p.full_name || 'Kullanıcı',
                avatarUrl: p.avatar_url || '',
                songCount: p.total_songs_requested || 0,
              }))
            );
          } else {
            setLeaderboard([]);
          }
        }
      } catch (err) {
        console.error('[Leaderboard exception]', err);
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchMonthlyLeaderboard();
  }, [activeModal]);

  if (activeModal !== 'profile') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Profile Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md max-h-[90vh] bg-[#120C08] border-2 border-[#D4AF37]/40 rounded-3xl p-5 z-10 shadow-2xl overflow-y-auto scrollbar-thin flex flex-col justify-between"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-base font-extrabold gold-gradient-text">Profilim</h2>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Avatar & Username */}
          <div className="flex flex-col items-center text-center my-4">
            <div className="relative w-20 h-20 rounded-full p-1 border-2 border-[#D4AF37] shadow-xl bg-[#1C130D] mb-2 flex items-center justify-center">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1C130D] flex items-center justify-center text-[#D4AF37]">
                  <User className="w-10 h-10" />
                </div>
              )}
              {user && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full gold-gradient-bg border-2 border-stone-950 flex items-center justify-center text-stone-950">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <h3 className="text-base font-black text-white">{user ? user.name : 'Misafir Kullanıcı'}</h3>
            <span className="text-xs text-[#D4AF37] font-semibold mt-0.5">{user ? user.username : '@misafir'}</span>

            {/* ITEM 1: Visible Spotify Status Badge */}
            <div className="mt-2">
              {isSpotifyConnected ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold shadow-sm">
                  Spotify Hesabı Bağlı
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-extrabold shadow-sm">
                  Spotify Hesabı Bağlı Değil
                </span>
              )}
            </div>
          </div>

          {/* ITEM 4: Profile Stats Persistence (3 Stat Cards) */}
          <div className="grid grid-cols-3 gap-2 my-2">
            <div className="glass-panel-gold rounded-2xl p-3 text-center border border-[#D4AF37]/35 flex flex-col items-center justify-center">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-1">
                <Coins className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">{user ? user.credits : 0}</span>
              <span className="text-[9px] font-bold text-amber-200/70 uppercase tracking-tight mt-0.5">
                Mevcut Kredi
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-3 text-center border border-[#D4AF37]/25 flex flex-col items-center justify-center bg-[#1C130D]">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                <Award className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">
                {user ? (user.lifetimeCredits || user.credits || 10) : 0}
              </span>
              <span className="text-[9px] font-bold text-amber-200/70 uppercase tracking-tight mt-0.5">
                Yüklenen Kredi
              </span>
            </div>

            <div className="glass-panel rounded-2xl p-3 text-center border border-[#D4AF37]/25 flex flex-col items-center justify-center bg-[#1C130D]">
              <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-1">
                <Music className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white">{user ? user.totalSongsRequested : 0}</span>
              <span className="text-[9px] font-bold text-amber-200/70 uppercase tracking-tight mt-0.5">
                İstenen Şarkı
              </span>
            </div>
          </div>

          {/* ITEM 5: Monthly Leaderboard Section */}
          <div className="my-3 pt-3 border-t border-[#D4AF37]/20 space-y-2">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-100">
                <Trophy className="w-4 h-4 text-[#D4AF37]" />
                <span>Bu Ayın En Çok Şarkı Açanları</span>
              </div>
              <span className="text-[10px] text-amber-200/50">Canlı</span>
            </div>

            {isLoadingLeaderboard ? (
              <div className="py-6 text-center text-amber-200/50 flex flex-col items-center justify-center">
                <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin mb-1" />
                <span className="text-[10px]">Sıralama yükleniyor...</span>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-4 glass-panel rounded-2xl text-center text-amber-200/50 text-xs">
                Bu ay henüz şarkı isteği yapılmadı.
              </div>
            ) : (
              <div className="flex gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
                {leaderboard.map((item, index) => (
                  <div
                    key={item.userId + index}
                    className="glass-panel-gold rounded-2xl p-2.5 border border-[#D4AF37]/30 min-w-[105px] w-[105px] shrink-0 flex flex-col items-center text-center shadow-md relative"
                  >
                    {/* Rank Badge */}
                    <div className="absolute top-1 left-1.5 w-4 h-4 rounded-full gold-gradient-bg text-stone-950 font-black text-[9px] flex items-center justify-center shadow-sm">
                      #{index + 1}
                    </div>

                    {/* 1. User Avatar Image */}
                    <div className="w-10 h-10 rounded-full border border-[#D4AF37] overflow-hidden mb-1.5 bg-[#1C130D] flex items-center justify-center shrink-0">
                      {item.avatarUrl ? (
                        <img
                          src={item.avatarUrl}
                          alt={item.fullName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-5 h-5 text-[#D4AF37]" />
                      )}
                    </div>

                    {/* 2. User Full Name */}
                    <h4 className="text-[11px] font-bold text-white truncate w-full">
                      {item.fullName}
                    </h4>

                    {/* 3. Count of songs requested this month */}
                    <span className="text-[10px] font-extrabold text-[#D4AF37] mt-0.5">
                      {item.songCount} Şarkı
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#D4AF37]/20 text-center space-y-2">
            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    closeModal();
                    loginWithProvider('google');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google ile Giriş Yap</span>
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    loginWithProvider('spotify');
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1DB954] hover:bg-[#1ed760] text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 496 512">
                    <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-35.9-22-81.1-26.8-134.2-14.7-9.5 2.2-19.4-3.8-21.6-13.3-2.2-9.5 3.8-19.4 13.3-21.6 59-13.4 109.4-7.7 149.9 17.1 7.4 4.5 9.7 14.3 5.3 21.7-2.4 4.1-7.1 6.8-11.7 6.8zm28.9-64.4c-5.3 0-8.6-1.6-13.5-4.5-43.2-26.5-109.1-34.2-160.3-18.7-11.8 3.6-24.1-3.2-27.7-15-3.6-11.8 3.2-24.1 15-27.7 58.7-17.7 131.7-8.9 181.7 21.8 9.5 5.8 12.5 18.2 6.7 27.7-3.1 5.3-9.1 8.7-15 8.7zm2.7-67.6C321.4 186.8 238 184 181.4 201.2c-14.3 4.3-29.2-3.8-33.5-18.1-4.3-14.3 3.8-29.2 18.1-33.5 63.7-19.4 156.1-16.1 220.1 21.9 12.9 7.7 17.2 24.4 9.5 37.3-5 8.2-13.9 12.1-22.3 12.1z" />
                  </svg>
                  <span>Spotify ile Giriş Yap</span>
                </button>
              </div>
            ) : showConfirmDelete ? (
              <div className="bg-red-950/60 border border-red-500/40 rounded-2xl p-3 space-y-2">
                <p className="text-xs text-red-200 font-bold">Hesabınızı silmek istediğinize emin misiniz?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-1.5 rounded-xl bg-stone-800 text-amber-100 font-bold text-xs"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700"
                  >
                    Evet, Sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={logout}
                  className="text-xs font-semibold text-amber-200/70 hover:text-white flex items-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Çıkış Yap</span>
                </button>

                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                  <span>Hesabı Sil</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
