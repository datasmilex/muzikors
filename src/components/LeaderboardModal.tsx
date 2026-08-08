'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, Users, Store, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { PremiumBadge } from './PremiumBadge';

export const LeaderboardModal: React.FC = () => {
  const { activeModal, closeModal, user: currentUser } = useApp();
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
      if (activeTab === 'users') {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, total_songs_requested')
          .order('total_songs_requested', { ascending: false })
          .limit(50);
        
        if (profiles && !error) {
          const list = profiles.map((p: any) => ({
            id: p.id,
            name: p.full_name || 'Kullanıcı',
            avatar: p.avatar_url,
            total_songs_requested: p.total_songs_requested || 0
          }));
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
    } catch (err) {
      console.error('[Leaderboard fetch error]', err);
    } finally {
      setLoading(false);
    }
  };

  

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
      {activeModal === 'leaderboard' && (<>

      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center p-0 sm:p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md h-[80vh] sm:h-[600px] sm:rounded-[2.5rem] rounded-t-[2.5rem] flex flex-col overflow-hidden glass-panel-gold border border-[#D4AF37]/30 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] bg-[#120C08]"
        >
          {/* Decorative Glow */}

          {/* Header */}
          <div className="flex-none p-5 flex items-center justify-between border-b border-[#D4AF37]/20 relative z-10">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
                <Trophy className="w-5 h-5 drop-shadow-md" />
              </div>
              <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">Tüm Zamanların En İyileri</h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2.5 rounded-full bg-white/5 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex-none flex items-center p-2 mx-4 mt-4 bg-black/40 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'users' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-400 active:text-zinc-200'
              }`}
            >
              <Users className="w-4 h-4" /> Kullanıcılar
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'venues' ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20' : 'text-zinc-400 active:text-zinc-200'
              }`}
            >
              <Store className="w-4 h-4" /> Kafeler
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 pt-6 space-y-0 flex flex-col custom-scrollbar">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
                <span className="text-xs font-bold text-amber-200/50 uppercase tracking-widest">Veriler Yükleniyor...</span>
              </div>
            ) : activeTab === 'users' ? (
              users.length > 0 ? (
                users.map((user, idx) => {
                  const zIndex = users.length - idx;
                  const isTop = idx === 0;
                  const isUserVip = currentUser?.id === user.id && currentUser?.isPremium;
                  
                  return (
                    <div 
                      key={user.id} 
                      className={`relative group transition-all duration-500 active:-translate-y-2 active:z-50 ${idx !== 0 ? '-mt-4' : ''}`}
                      style={{ zIndex }}
                    >
                      <div className={`flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-xl shadow-[0_-5px_15px_rgba(0,0,0,0.3),0_10px_30px_rgba(0,0,0,0.5)] ${
                        isTop ? 'bg-gradient-to-r from-[#2A1D13] to-[#1C130D] border-[#D4AF37]/50' : 'bg-[#120C08]/95 border-[#D4AF37]/20 active:border-[#D4AF37]/40'
                      } ${isUserVip ? 'border-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.15)]' : ''}`}>
                        <div className={`w-10 h-10 flex-none flex items-center justify-center font-black text-xl rounded-full shadow-lg ${
                          idx + 1 === 1 ? 'gold-gradient-bg text-black' : 
                          idx + 1 === 2 ? 'bg-slate-300 text-slate-800' : 
                          idx + 1 === 3 ? 'bg-amber-700 text-amber-100' : 
                          'bg-black/50 text-amber-200 border border-[#D4AF37]/30 text-base'
                        }`}>
                          {idx + 1 === 1 ? '1' : idx + 1 === 2 ? '2' : idx + 1 === 3 ? '3' : idx + 1}
                        </div>
                        
                        <div className="relative group shrink-0">
                          <div className={`absolute -inset-0.5 rounded-full blur opacity-30 animate-pulse ${isUserVip ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-300' : 'bg-gradient-to-r from-[#D4AF37] to-amber-600'}`} />
                          <div className={`relative w-12 h-12 rounded-full border-2 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.2)] ${isUserVip ? 'border-amber-400 shadow-[0_0_20px_rgba(252,211,77,0.4)]' : 'border-[#D4AF37]/50'}`}>
                            <img
                              src={user.avatar || '/logo.png'}
                              alt={user.name}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-black truncate flex items-center gap-1.5 ${isTop ? 'text-lg text-white' : 'text-base text-gray-200'}`}>
                            {maskName(user.name)}
                            {isUserVip && (
                              <PremiumBadge className="w-3.5 h-3.5" />
                            )}
                          </p>
                          
                        </div>
                        
                        <div className="flex-none px-4 py-2 rounded-2xl bg-black/50 border border-[#D4AF37]/20 flex flex-col items-center justify-center shadow-inner">
                          <span className="text-sm font-black text-[#D4AF37] drop-shadow-md">{user.total_songs_requested || 0}</span>
                          <span className="text-[9px] font-bold text-amber-200/50 uppercase tracking-widest">Şarkı</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-zinc-500 mt-10 font-medium">Henüz kayıt bulunamadı.</div>
              )
            ) : (
              venues.length > 0 ? (
                venues.map((venue, idx) => {
                  const zIndex = venues.length - idx;
                  const isTop = idx === 0;
                  
                  return (
                    <div 
                      key={venue.id} 
                      className={`relative group transition-all duration-500 active:-translate-y-2 active:z-50 ${idx !== 0 ? '-mt-4' : ''}`}
                      style={{ zIndex }}
                    >
                      <div className={`flex items-center gap-4 p-4 rounded-3xl border backdrop-blur-xl shadow-[0_-5px_15px_rgba(0,0,0,0.3),0_10px_30px_rgba(0,0,0,0.5)] ${
                        isTop ? 'bg-gradient-to-r from-[#2A1D13] to-[#1C130D] border-[#D4AF37]/50' : 'bg-[#120C08]/95 border-[#D4AF37]/20 active:border-[#D4AF37]/40'
                      }`}>
                        <div className={`w-10 h-10 flex-none flex items-center justify-center font-black text-xl rounded-full shadow-lg ${
                          idx + 1 === 1 ? 'gold-gradient-bg text-black' : 
                          idx + 1 === 2 ? 'bg-slate-300 text-slate-800' : 
                          idx + 1 === 3 ? 'bg-amber-700 text-amber-100' : 
                          'bg-black/50 text-amber-200 border border-[#D4AF37]/30 text-base'
                        }`}>
                          {idx + 1 === 1 ? '1' : idx + 1 === 2 ? '2' : idx + 1 === 3 ? '3' : idx + 1}
                        </div>
                        
                        <div className="relative w-12 h-12 rounded-2xl border border-white/10 bg-gradient-to-br from-[#D4AF37]/20 to-transparent flex items-center justify-center shrink-0 shadow-md overflow-hidden">
                          {venue.logo_url ? (
                            <img src={venue.logo_url} alt={venue.venue_name} className="w-full h-full object-cover" />
                          ) : (
                            <Store className="w-6 h-6 text-[#D4AF37]" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`font-black truncate ${isTop ? 'text-lg text-white' : 'text-base text-gray-200'}`}>
                            {venue.venue_name}
                          </p>
                          
                        </div>
                        
                        <div className="flex-none px-4 py-2 rounded-2xl bg-black/50 border border-[#D4AF37]/20 flex flex-col items-center justify-center shadow-inner">
                          <span className="text-sm font-black text-[#D4AF37] drop-shadow-md">{venue.total_songs_requested || 0}</span>
                          <span className="text-[9px] font-bold text-amber-200/50 uppercase tracking-widest">Şarkı</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-zinc-500 mt-10 font-medium">Henüz kayıt bulunamadı.</div>
              )
            )}

            {/* Rewards Section */}
            <div className="mt-8 mb-4 p-5 rounded-3xl bg-gradient-to-br from-[#241911] to-[#1C130D] border border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(212,175,55,0.05)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <Trophy className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="font-black text-amber-100 tracking-tight text-lg drop-shadow-sm">Ayın Ödülleri</h3>
              </div>
              
              <div className="space-y-3 relative z-10">
                {activeTab === 'users' ? (
                  <div className="flex items-start gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                    <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center font-black text-black shrink-0">1-3</div>
                    <div>
                      <p className="text-sm font-bold text-white mb-0.5">1 Aylık Ücretsiz Premium</p>
                      <p className="text-xs text-amber-200/60 leading-snug">Liderlik tablosunda ilk 3'e giren kullanıcılara 1 aylık Muzikors Premium hediye!</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full gold-gradient-bg flex items-center justify-center font-black text-black shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.5)]">1</div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">Premium Plaket + Sponsorluk</p>
                        <p className="text-xs text-amber-200/60 leading-snug">Ahşap Muzikors Premium Plaketi ve özel sosyal medya sponsorluğu.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                      <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-black text-slate-800 shrink-0">2-3</div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">Premium Plaket</p>
                        <p className="text-xs text-amber-200/60 leading-snug">Ahşap Muzikors Premium Plaketi.</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
