'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Store, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

export const LeaderboardModal: React.FC = () => {
  const { activeModal, closeModal } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'venues'>('users');
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
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      if (activeTab === 'users') {
        const { data: logData, error: logErr } = await supabase
          .from('song_requests_log')
          .select('user_id')
          .gte('created_at', firstDayOfMonth);
        
        const counts: { [key: string]: number } = {};
        if (!logErr && logData) {
          logData.forEach((row: any) => {
            if (row.user_id) counts[row.user_id] = (counts[row.user_id] || 0) + 1;
          });
        }
        const userIds = Object.keys(counts);
        if (userIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, name, full_name, avatar_url')
            .in('id', userIds);
          
          if (profiles) {
            const list = profiles.map((p: any) => ({
              id: p.id,
              name: p.name || p.full_name || 'Kullanıcı',
              avatar: p.avatar_url,
              total_songs_requested: counts[p.id] || 0
            })).sort((a, b) => b.total_songs_requested - a.total_songs_requested).slice(0, 20);
            setUsers(list);
          }
        } else {
          setUsers([]);
        }
      } else {
        const { data: logData, error: logErr } = await supabase
          .from('song_requests_log')
          .select('venue_id')
          .gte('created_at', firstDayOfMonth);
        
        const counts: { [key: string]: number } = {};
        if (!logErr && logData) {
          logData.forEach((row: any) => {
            if (row.venue_id) counts[row.venue_id] = (counts[row.venue_id] || 0) + 1;
          });
        }
        const venueIds = Object.keys(counts);
        if (venueIds.length > 0) {
          const { data: venueData } = await supabase
            .from('venues')
            .select('id, venue_name, logo_url')
            .in('id', venueIds);
          
          if (venueData) {
            const list = venueData.map((v: any) => ({
              id: v.id,
              venue_name: v.venue_name,
              logo_url: v.logo_url,
              total_songs_requested: counts[v.id] || 0
            })).sort((a, b) => b.total_songs_requested - a.total_songs_requested).slice(0, 20);
            setVenues(list);
          }
        } else {
          setVenues([]);
        }
      }
    } catch (err) {
      console.error('[Leaderboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  if (activeModal !== 'leaderboard') return null;

  const maskName = (name: string) => {
    if (!name) return 'Anonim Müşteri';
    const parts = name.trim().split(' ');
    if (parts.length > 1) {
      const lastName = parts.pop();
      return `${parts.join(' ')} ${lastName?.charAt(0)}.***`;
    }
    return `${name.charAt(0)}.***`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative w-full max-w-md h-[80vh] sm:h-[600px] sm:rounded-[2rem] rounded-t-[2rem] flex flex-col overflow-hidden glass-panel border border-[#D4AF37]/20 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] bg-[#120C08]"
        >
          {/* Header */}
          <div className="flex-none p-4 flex items-center justify-between border-b border-[#D4AF37]/20">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Trophy className="w-5 h-5" />
              <h2 className="text-lg font-bold">Bu Ayın Sıralamaları</h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex-none flex items-center p-2 mx-4 mt-4 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'users' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Users className="w-4 h-4" /> Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'venues' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Store className="w-4 h-4" /> Kafeler
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
              </div>
            ) : activeTab === 'users' ? (
              users.length > 0 ? (
                users.map((user, idx) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <div className="w-8 flex-none text-center font-bold text-lg text-zinc-500">
                      {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <img
                      src={user.avatar || '/logo.png'}
                      alt={user.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo.png';
                      }}
                      className="w-10 h-10 rounded-full border border-white/10 object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{maskName(user.name)}</p>
                      <p className="text-xs text-amber-200/60 truncate">Şarkı isteği krallığı</p>
                    </div>
                    <div className="flex-none px-3 py-1 rounded-xl bg-black/50 border border-[#D4AF37]/20">
                      <span className="text-xs font-bold text-[#D4AF37]">{user.total_songs_requested || 0} Şarkı</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 mt-10">Kullanıcı bulunamadı.</div>
              )
            ) : (
              venues.length > 0 ? (
                venues.map((venue, idx) => (
                  <div key={venue.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-[#D4AF37]/30 transition-colors">
                    <div className="w-8 flex-none text-center font-bold text-lg text-zinc-500">
                      {idx + 1 === 1 ? '🥇' : idx + 1 === 2 ? '🥈' : idx + 1 === 3 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <div className="w-10 h-10 rounded-full border border-white/10 bg-[#D4AF37]/10 flex items-center justify-center">
                      <Store className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{venue.venue_name}</p>
                      <p className="text-xs text-amber-200/60 truncate">Sistemdeki toplam istek</p>
                    </div>
                    <div className="flex-none px-3 py-1 rounded-xl bg-black/50 border border-[#D4AF37]/20">
                      <span className="text-xs font-bold text-[#D4AF37]">{venue.total_songs_requested || 0} Şarkı</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-zinc-500 mt-10">Kafe bulunamadı.</div>
              )
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
