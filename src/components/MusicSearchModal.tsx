'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Check, Clock, Coins, Loader2, Heart, ExternalLink, Plus, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';
import { formatDuration, getSongCreditCost, isHappyHourNow, calculateDiscountedPrice } from '../utils/formatters';

export const MusicSearchModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    requestTrack,
    user,
    activeVenue,
    cooldown,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  
  const [activeTab, setActiveTab] = useState<'all' | 'top10' | 'global' | null>('all');
  
  const [isSearching, setIsSearching] = useState(false);
  const [submittingTrackId, setSubmittingTrackId] = useState<string | null>(null);

  const isHappyHourActive = isHappyHourNow(
    activeVenue?.is_happy_hour_active || false,
    activeVenue?.hh_start_time || null,
    activeVenue?.hh_end_time || null
  );
  const hhDiscount = activeVenue?.hh_discount_rate || 0;
  const [confirmingTrack, setConfirmingTrack] = useState<Track | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // Derived selected track cost
  const selectedDurMs = selectedTrack ? ((selectedTrack as any).duration_ms || selectedTrack.durationMs || (selectedTrack.duration ? selectedTrack.duration * 1000 : 0)) : 0;
  const selectedBaseCost = getSongCreditCost(selectedDurMs);
  const selectedFinalCost = selectedBaseCost === null ? null : (isHappyHourActive ? calculateDiscountedPrice(selectedBaseCost, hhDiscount) : selectedBaseCost);

  // Auto-search real Spotify tracks on mount or query change
  useEffect(() => {
    const isDefaultSearch = searchQuery.trim() === '';
    
    let queryToFetch = searchQuery.trim();
    if (isDefaultSearch) {
      if (activeTab === 'global') {
        queryToFetch = 'year:2025-2026 genre:pop market:TR';
      } else {
        queryToFetch = 'year:2025-2026 genre:pop'; // all / default
      }
    }

    // Venue guard: if no spotify connection, block search
    if (!activeVenue?.id) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    
    // Apply 800ms debounce for actual typing, but load default instantly
    const delay = isDefaultSearch ? 10 : 800;
    
    const timer = setTimeout(async () => {
      try {
        if (isDefaultSearch && activeTab === 'top10') {
          // TOP 10 ŞARKILAR: RPC üzerinden son 30 günün en çok istenenleri getir
          const { data: topData, error: topError } = await supabase.rpc('get_venue_top_tracks', { p_venue_id: Number(activeVenue.id) });
          if (!topError && topData && topData.length > 0) {
            const topTracks: Track[] = topData.map((t: any) => ({
              id: t.track_id,
              title: t.song_title,
              artist: t.artist_name,
              coverUrl: t.album_cover,
              albumCover: t.album_cover,
            }));
            setSearchResults(topTracks);
            if (!selectedTrack) setSelectedTrack(topTracks[0]);
            setIsLoading(false);
            return;
          }
          // Eğer hiç şarkı istenmemişse veya hata varsa listeyi boşalt
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        const url = `/api/spotify/search?q=${encodeURIComponent(queryToFetch)}&venueId=${encodeURIComponent(activeVenue.id)}`;
        console.log(`[MusicSearch] Fetching ${url}`);
        const res = await fetch(url);

        // Always parse JSON so we can see the error body even on non-ok responses
        let data: any = {};
        try { data = await res.json(); } catch { /* non-JSON body */ }

        if (!res.ok) {
          console.error('[MusicSearch API Error Details]:', data.details || data);
          setSearchResults([]);
          return;
        }

        const tracks: Track[] = data.tracks ?? [];
        console.log(`[MusicSearch] Got ${tracks.length} tracks for "${queryToFetch}"`);
        setSearchResults(tracks);
        if (tracks.length > 0 && !selectedTrack) {
          setSelectedTrack(tracks[0]);
        }
      } catch (err) {
        console.error('[MusicSearch] Network/fetch exception:', err);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, activeVenue?.id]);


  if (activeModal !== 'search') return null;

  const formatDuration = (duration_ms: number) => {
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleConfirmRequest = (trackToRequest?: Track) => {
    const target = trackToRequest || selectedTrack;
    if (target) {
      setConfirmingTrack(target);
      setIsAnonymous(false);
    }
  };

  const handleFinalRequest = async () => {
    if (confirmingTrack && !submittingTrackId) {
      setSubmittingTrackId(confirmingTrack.id);
      try {
        const success = await requestTrack(confirmingTrack, isAnonymous);
        if (success) {
          setConfirmingTrack(null);
          closeModal();
        }
      } finally {
        setSubmittingTrackId(null);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Bottom Sheet / Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-md h-[92vh] bg-[#120C08] sm:rounded-[2.5rem] rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {confirmingTrack ? (
            <div className="flex flex-col h-full justify-between pb-4 relative z-10">
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mx-auto flex items-center justify-center shadow-inner">
                    <AlertTriangle className="w-8 h-8 text-[#E5A93C] drop-shadow-md" />
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">Şarkı İsteğini Onayla</h2>
                  <p className="text-xs text-amber-200/60 px-4 font-medium leading-relaxed">
                    Şarkı isteğinizi onaylamadan önce lütfen aşağıdaki KVKK aydınlatmasını okuyun.
                  </p>
                </div>

                {/* Track Info Box */}
                <div className="flex items-center gap-4 bg-gradient-to-r from-[#241911] to-[#1C130D] rounded-[1.5rem] p-4 border border-[#D4AF37]/40 shadow-xl">
                  <div className="w-14 h-14 rounded-[1rem] overflow-hidden border border-[#D4AF37]/30 shadow-md shrink-0">
                    <img src={confirmingTrack.albumCover || confirmingTrack.coverUrl || confirmingTrack.album_art || '/logo.png'} className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <p className="text-base font-black text-white truncate drop-shadow-md">{confirmingTrack.title}</p>
                    <p className="text-xs font-semibold text-[#D4AF37] truncate mt-0.5">{confirmingTrack.artist}</p>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between bg-[#1A1A1A]/60 rounded-[1.5rem] p-5 border border-white/5 shadow-inner">
                  <div>
                    <p className="text-sm font-bold text-white tracking-wide">İsmimi Ekranda Gizle</p>
                    <p className="text-[10px] text-amber-200/50 mt-1 font-semibold uppercase tracking-wider">Sadece "Anonim Müşteri" görünür</p>
                  </div>
                  <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner ${isAnonymous ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Consent Text */}
                <div className="bg-amber-900/10 rounded-[1.5rem] p-5 border border-amber-500/20 text-xs leading-relaxed text-amber-100/80 font-medium">
                  {isAnonymous ? (
                    <p>"Şarkı isteğin TV ekranında ve panellerde <b className="text-white">Anonim Müşteri</b> olarak görünecektir. Onaylıyor musun?"</p>
                  ) : (
                    <p>"Şarkı isteğinle birlikte ismin <b className="text-white">{user?.name ? user.name.split(' ').map((n, i, arr) => i === arr.length - 1 ? n.charAt(0) + '.***' : n).join(' ') : 'Müşteri'}</b> olarak TV ekranında ve uygulamada yayınlanacaktır. KVKK kapsamında isminin görünmesini onaylıyor musun?"</p>
                  )}
                </div>

                {/* Vibe Guard Warning */}
                {activeVenue?.allowed_genres && activeVenue.allowed_genres.length > 0 && (
                  <div className="bg-orange-500/10 rounded-[1.5rem] p-5 border border-orange-500/20 text-[11px] leading-relaxed text-orange-200/90 mt-4">
                    <p>
                      <b className="text-orange-400">⚠️ Bilgilendirme:</b> Mekân sadece şu tarzlara öncelik vermektedir: <span className="font-black text-orange-300">{activeVenue.allowed_genres.join(', ')}</span>. Eğer mekanın tarzına tamamen zıt bir şarkı eklerseniz, mekan sahibi şarkıyı atlama (skip) hakkına sahiptir. Sorumluluk size aittir.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mt-6">
                <button
                  onClick={handleFinalRequest}
                  disabled={submittingTrackId === confirmingTrack.id}
                  className="w-full py-5 rounded-[1.5rem] gold-gradient-bg text-stone-950 font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-95 hover:scale-[1.02] transition-all group"
                >
                  {submittingTrackId === confirmingTrack.id ? <Loader2 className="w-6 h-6 animate-spin" /> : <Check className="w-6 h-6 stroke-[3] group-hover:scale-110 transition-transform" />}
                  <span>{submittingTrackId === confirmingTrack.id ? 'İstek Gönderiliyor...' : 'Onaylıyorum, İsteği Gönder'}</span>
                </button>
                <button
                  onClick={() => { setConfirmingTrack(null); closeModal(); }}
                  disabled={submittingTrackId === confirmingTrack.id}
                  className="w-full py-4 rounded-[1.5rem] bg-transparent border border-white/10 text-gray-400 font-bold text-sm flex items-center justify-center hover:bg-white/5 hover:text-white active:scale-95 transition-all"
                >
                  İptal / Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Top Header & Mode Tab Switcher */}
          <div className="shrink-0 space-y-4 relative z-10">
            <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto sm:hidden" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Music className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-black text-white tracking-tight">Müzik Arama</h2>
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-white/5 border border-transparent hover:border-[#D4AF37]/30 hover:bg-white/10 hover:rotate-90 text-zinc-400 hover:text-white transition-all duration-300"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Search Controls */}
            <div className="space-y-3 mt-2">
              {/* Vibe Guard Info Text */}
              {activeVenue?.allowed_genres && activeVenue.allowed_genres.length > 0 && (
                <p className="text-[11px] font-bold text-amber-200/60 pl-1 uppercase tracking-widest">
                  Kafenin Tercihi: <span className="text-[#D4AF37] drop-shadow-sm">{activeVenue.allowed_genres.join(', ')}</span>
                </p>
              )}
              <div className="relative group">
                  <Search className="w-5 h-5 text-[#D4AF37] absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:scale-110 transition-transform" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.trim() !== '') {
                        setActiveTab(null);
                      } else if (activeTab === null) {
                        setActiveTab('all');
                      }
                    }}
                    placeholder="Sanatçı veya şarkı adı yazın (örn: Sezen Aksu)..."
                    className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-[#1C130D] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all shadow-inner"
                  />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-200/50 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  ) : null}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none snap-x">
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all snap-start ${
                      activeTab === 'all'
                        ? 'gold-gradient-bg text-stone-950 shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-105'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-[#D4AF37]/30 hover:text-white'
                    }`}
                  >
                    Trendler
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('top10');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all snap-start ${
                      activeTab === 'top10'
                        ? 'gold-gradient-bg text-stone-950 shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-105'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-[#D4AF37]/30 hover:text-white'
                    }`}
                  >
                    Mekanın Tercihi
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('global');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all snap-start ${
                      activeTab === 'global'
                        ? 'gold-gradient-bg text-stone-950 shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-105'
                        : 'bg-white/5 text-gray-400 border border-white/5 hover:border-[#D4AF37]/30 hover:text-white'
                    }`}
                  >
                    Global Hits
                  </button>
                </div>
              </div>
            </div>

          {/* Search Track Results List */}
          <div className="flex-1 overflow-y-auto my-2 space-y-0 flex flex-col pt-2 pr-1 custom-scrollbar relative z-10">
              {isLoading ? (
                <div className="text-center py-16 text-amber-200/60 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">Spotify Müzikleri Aranıyor...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-16 text-amber-200/40">
                  <Music className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
                  <p className="text-sm font-semibold">Aramanıza uygun Spotify şarkısı bulunamadı</p>
                </div>
              ) : (
                searchResults.map((track, idx) => {
                  const zIndex = searchResults.length - idx;
                  const isSelected = selectedTrack?.id === track.id;
                  const durMs = (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0);
                  const baseCost = getSongCreditCost(durMs);
                  const finalCost = baseCost === null ? null : (isHappyHourActive ? calculateDiscountedPrice(baseCost, hhDiscount) : baseCost);
                  const isExplicitFilterActive = activeVenue?.explicit_filter_enabled === true;
                  const isExplicitTrack = track.explicit === true || (track as any).is_explicit === true;
                  const isExplicitBlocked = isExplicitFilterActive && isExplicitTrack;
                  
                  const isBlocked = finalCost === null || isExplicitBlocked;
                  const canAfford = (user?.credits ?? 0) >= (finalCost ?? 0);

                  return (
                    <div 
                      key={track.id}
                      className={`relative group transition-all duration-500 hover:-translate-y-1 hover:z-50 ${idx !== 0 ? '-mt-2' : ''}`}
                      style={{ zIndex }}
                    >
                      <div
                        onClick={() => !isBlocked && setSelectedTrack(track)}
                        className={`rounded-2xl p-3.5 flex items-center justify-between border backdrop-blur-xl shadow-lg transition-all duration-300 ${
                          isBlocked
                            ? 'bg-black/60 opacity-60 border-red-500/20'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#241911] to-[#1C130D] border-[#D4AF37]/60 shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-[1.02] cursor-pointer'
                            : 'bg-[#1A1A1A]/90 border-[#D4AF37]/20 hover:border-[#D4AF37]/40 hover:bg-[#221811] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="relative w-14 h-14 rounded-[1rem] overflow-hidden border border-[#D4AF37]/30 shadow-md shrink-0">
                            <img
                              src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                              alt={track.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#D4AF37]/20 flex items-center justify-center backdrop-blur-[2px]">
                                <Check className="w-6 h-6 text-white drop-shadow-md stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h4 className={`text-base font-black truncate ${isSelected ? 'text-white' : 'text-gray-100'}`}>{track.title}</h4>
                              {isExplicitBlocked ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  Sansürlü
                                </span>
                              ) : finalCost === null ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-wider shrink-0 shadow-sm">
                                  <AlertTriangle className="w-3 h-3" />
                                  7+ Dk (Eklenemez)
                                </span>
                              ) : null}
                            </div>
                            <p className="text-xs font-semibold text-[#D4AF37] truncate flex items-center gap-2">
                              <span>{track.artist}</span>
                              {durMs > 0 && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <span className="text-amber-200/50">⏱️ {formatDuration(durMs)}</span>
                                </>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pl-3">
                          {isExplicitBlocked ? (
                            <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-inner">
                              Engelli
                            </span>
                          ) : finalCost === null ? (
                            <span className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 shadow-inner">
                              &gt;7 Dk
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrack(track);
                                handleConfirmRequest(track);
                              }}
                              disabled={cooldown.active || !canAfford || submittingTrackId === track.id}
                              className={`px-4 py-2 rounded-[1rem] font-black text-xs flex items-center gap-1.5 shadow-lg transition-all duration-300 ${
                                !canAfford || submittingTrackId === track.id
                                  ? 'bg-black/50 text-amber-200/30 border border-white/5 cursor-not-allowed'
                                  : 'bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/10 active:scale-95 hover:shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                              }`}
                            >
                              {submittingTrackId === track.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37]" />
                              ) : (
                                <Plus className="w-4 h-4 stroke-[3]" />
                              )}
                              {submittingTrackId === track.id ? (
                                <span>İşleniyor</span>
                              ) : (
                                <div className="flex items-center gap-1">
                                  <span>Seç</span>
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 pt-4 border-t border-[#D4AF37]/20 space-y-3 relative z-10 bg-[#120C08]/80 backdrop-blur-md">
            {cooldown.active && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-[1rem] p-3 flex items-center justify-between text-xs text-amber-200 shadow-inner">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="font-bold">Anti-Spam Bekleme Süresi</span>
                </div>
                <span className="font-mono font-black text-amber-400 text-sm">
                  {formatCooldown(cooldown.remainingSeconds)}
                </span>
              </div>
            )}

            {selectedTrack && (
              <div className="flex items-center justify-between bg-gradient-to-r from-[#1C130D] to-[#120C08] rounded-[1.5rem] p-4 border border-[#D4AF37]/30 shadow-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={selectedTrack.albumCover || selectedTrack.coverUrl || selectedTrack.album_art || '/logo.png'}
                    alt={selectedTrack.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                    className="w-10 h-10 rounded-[0.8rem] object-cover border border-[#D4AF37]/20 shadow-sm"
                  />
                  <div className="truncate">
                    <p className="text-sm font-black text-white truncate drop-shadow-sm">{selectedTrack.title}</p>
                    <p className="text-[11px] font-semibold text-[#D4AF37] truncate">{selectedTrack.artist}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isHappyHourActive && selectedBaseCost !== selectedFinalCost && (
                    <span className="text-[10px] line-through opacity-50 mr-1 text-white block">{selectedBaseCost} Kredi</span>
                  )}
                  <span className="text-sm font-black text-[#D4AF37] block drop-shadow-md">{selectedFinalCost} Kredi</span>
                  <span className="text-[10px] font-bold text-amber-200/50 uppercase tracking-wider">Bakiye: {user ? user.credits : 0}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleConfirmRequest()}
              disabled={!selectedTrack || cooldown.active || selectedFinalCost === null}
              className={`w-full py-4 px-6 rounded-[1.5rem] font-black text-base flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-300 group ${
                cooldown.active || !selectedTrack || selectedFinalCost === null
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800 shadow-none'
                  : 'gold-gradient-bg text-stone-950 hover:brightness-110 active:scale-95 hover:scale-[1.02]'
              }`}
            >
              <Coins className={`w-6 h-6 ${cooldown.active || !selectedTrack ? 'text-zinc-600' : 'text-stone-950 group-hover:scale-110 transition-transform'}`} />
              {cooldown.active ? (
                <span>Bekleme Süresi ({formatCooldown(cooldown.remainingSeconds)})</span>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>Seçili Şarkıyı İste (</span>
                  {isHappyHourActive && selectedBaseCost !== selectedFinalCost && (
                    <span className="line-through opacity-50">{selectedBaseCost}</span>
                  )}
                  <span className={isHappyHourActive && selectedBaseCost !== selectedFinalCost ? "text-stone-800 font-extrabold" : "font-extrabold"}>{selectedFinalCost ?? 10} 🪙)</span>
                </div>
              )}
            </button>
          </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
