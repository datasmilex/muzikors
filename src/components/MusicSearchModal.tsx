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
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          className="relative w-full max-w-md h-[92vh] bg-[#120C08] border-t-2 border-[#D4AF37]/40 rounded-t-[32px] p-5 z-10 shadow-2xl flex flex-col justify-between overflow-hidden"
        >
          {confirmingTrack ? (
            <div className="flex flex-col h-full justify-between pb-4">
              <div className="space-y-6 pt-4">
                <div className="text-center space-y-2">
                  <AlertTriangle className="w-12 h-12 text-[#E5A93C] mx-auto opacity-90" />
                  <h2 className="text-xl font-bold text-white tracking-wide">Şarkı İsteğini Onayla</h2>
                  <p className="text-sm text-gray-400 px-4">
                    Şarkı isteğinizi onaylamadan önce lütfen aşağıdaki KVKK aydınlatmasını okuyun.
                  </p>
                </div>

                {/* Track Info Box */}
                <div className="flex items-center gap-3 bg-[#1A1A1A] rounded-2xl p-4 border border-[#D4AF37]/20">
                  <img src={confirmingTrack.albumCover || confirmingTrack.coverUrl || confirmingTrack.album_art || '/logo.png'} className="w-12 h-12 rounded-lg object-cover" />
                  <div className="truncate">
                    <p className="text-sm font-bold text-white truncate">{confirmingTrack.title}</p>
                    <p className="text-xs text-amber-200/60 truncate">{confirmingTrack.artist}</p>
                  </div>
                </div>

                {/* Anonymous Toggle */}
                <div className="flex items-center justify-between bg-[#1C130D] rounded-2xl p-4 border border-[#D4AF37]/10">
                  <div>
                    <p className="text-sm font-bold text-white">İsmimi Ekranda Gizle</p>
                    <p className="text-[10px] text-gray-400 mt-1">Sadece "Anonim Müşteri" olarak görünür.</p>
                  </div>
                  <button 
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors flex items-center ${isAnonymous ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isAnonymous ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Consent Text */}
                <div className="bg-amber-900/10 rounded-2xl p-4 border border-amber-500/20 text-xs leading-relaxed text-amber-100/80">
                  {isAnonymous ? (
                    <p>"Şarkı isteğin TV ekranında ve panellerde <b>'Anonim Müşteri'</b> olarak görünecektir. Onaylıyor musun?"</p>
                  ) : (
                    <p>"Şarkı isteğinle birlikte ismin <b>{user?.name ? user.name.split(' ').map((n, i, arr) => i === arr.length - 1 ? n.charAt(0) + '.***' : n).join(' ') : 'Müşteri'}</b> olarak TV ekranında ve uygulamada yayınlanacaktır. KVKK kapsamında isminin görünmesini onaylıyor musun?"</p>
                  )}
                </div>

                {/* Vibe Guard Warning */}
                {activeVenue?.allowed_genres && activeVenue.allowed_genres.length > 0 && (
                  <div className="bg-orange-500/10 rounded-2xl p-4 border border-orange-500/20 text-[11px] leading-relaxed text-orange-200/90 mt-4">
                    <p>
                      <b>⚠️ Bilgilendirme:</b> Mekân sadece şu tarzlara öncelik vermektedir: <span className="font-bold text-orange-300">{activeVenue.allowed_genres.join(', ')}</span>. Eğer mekanın tarzına tamamen zıt bir şarkı eklerseniz, mekan sahibi şarkıyı atlama (skip) hakkına sahiptir. Sorumluluk size aittir.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 mt-6">
                <button
                  onClick={handleFinalRequest}
                  disabled={submittingTrackId === confirmingTrack.id}
                  className="w-full py-4 px-6 rounded-2xl gold-gradient-bg text-stone-950 font-black text-base flex items-center justify-center gap-2 shadow-xl hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  {submittingTrackId === confirmingTrack.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[3]" />}
                  <span>{submittingTrackId === confirmingTrack.id ? 'İstek Gönderiliyor...' : 'Onaylıyorum, İsteği Gönder'}</span>
                </button>
                <button
                  onClick={() => { setConfirmingTrack(null); closeModal(); }}
                  disabled={submittingTrackId === confirmingTrack.id}
                  className="w-full py-4 px-6 rounded-2xl bg-transparent border border-gray-600 text-gray-300 font-bold text-sm flex items-center justify-center hover:bg-white/5 active:scale-[0.98] transition-all"
                >
                  İptal / Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Top Header & Mode Tab Switcher */}
          <div className="shrink-0 space-y-3">
            <div className="w-12 h-1.5 rounded-full bg-[#D4AF37]/30 mx-auto" />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">Spotify Müzik Arama</h2>
              </div>

              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white hover:border-[#D4AF37] transition-all"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Search Controls */}
            <div className="space-y-2 mt-2">
              {/* Vibe Guard Info Text */}
              {activeVenue?.allowed_genres && activeVenue.allowed_genres.length > 0 && (
                <p className="text-[11px] font-medium text-amber-200/60 pl-1">
                  Kafenin Tercihi: <span className="text-amber-200/90">{activeVenue.allowed_genres.join(', ')}</span>
                </p>
              )}
              <div className="relative">
                  <Search className="w-5 h-5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="w-full bg-[#1C130D] border border-[#D4AF37]/30 rounded-2xl py-3 pl-11 pr-10 text-sm text-white placeholder-amber-200/40 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  />
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-amber-200/60 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>

                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  <button
                    onClick={() => {
                      setActiveTab('all');
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      activeTab === 'all'
                        ? 'gold-gradient-bg text-stone-950 shadow-md'
                        : 'glass-panel text-amber-200/70 border border-[#D4AF37]/20'
                    }`}
                  >
                    Trendler
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('top10');
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      activeTab === 'top10'
                        ? 'gold-gradient-bg text-stone-950 shadow-md'
                        : 'glass-panel text-amber-200/70 border border-[#D4AF37]/20'
                    }`}
                  >
                    Mekanın Tercihi
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('global');
                      setSearchQuery('');
                    }}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                      activeTab === 'global'
                        ? 'gold-gradient-bg text-stone-950 shadow-md'
                        : 'glass-panel text-amber-200/70 border border-[#D4AF37]/20'
                    }`}
                  >
                    Global Hits
                  </button>
                </div>
              </div>
            </div>

          {/* Search Track Results List */}
          <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1 scrollbar-thin">
              {isLoading ? (
                <div className="text-center py-16 text-amber-200/60 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
                  <p className="text-xs font-bold">Spotify Web API Canlı Aranıyor...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-12 text-amber-200/50">
                  <Music className="w-10 h-10 mx-auto mb-2 opacity-40 text-[#D4AF37]" />
                  <p className="text-sm font-medium">Aramanıza uygun Spotify şarkısı bulunamadı</p>
                </div>
              ) : (
                searchResults.map((track) => {
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
                      onClick={() => !isBlocked && setSelectedTrack(track)}
                      className={`rounded-2xl p-3 flex items-center justify-between border transition-all duration-200 ${
                        isBlocked
                          ? 'glass-panel opacity-60 border-red-500/30'
                          : isSelected
                          ? 'glass-panel-gold border-[#D4AF37] ring-1 ring-[#D4AF37]/50 cursor-pointer'
                          : 'glass-panel border-[#D4AF37]/15 hover:border-[#D4AF37]/35 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <img
                          src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                          alt={track.title}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/logo.png';
                          }}
                          className="w-12 h-12 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="text-sm font-bold text-white truncate">{track.title}</h4>
                            {isExplicitBlocked ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold shrink-0">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                🔞 Küfürlü Şarkı (Mekân Filtresi Aktif)
                              </span>
                            ) : cost === null ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-extrabold shrink-0">
                                <AlertTriangle className="w-3 h-3 text-red-400" />
                                7+ Dk (Eklenemez)
                              </span>
                            ) : null}
                          </div>
                          <p className="text-xs text-amber-200/60 truncate mt-0.5 flex items-center gap-1.5">
                            <span>{track.artist}</span>
                            {durMs > 0 && (
                              <>
                                <span>•</span>
                                <span className="font-semibold text-amber-200/80">⏱️ {formatDuration(durMs)}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2">
                        {isExplicitBlocked ? (
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-red-300/80 text-[10px] font-bold border border-red-500/20">
                            🔞 Sansürlü
                          </span>
                        ) : cost === null ? (
                          <span className="px-2.5 py-1 rounded-xl bg-stone-900/90 text-red-300/80 text-[11px] font-bold border border-red-500/20">
                            {">7 Dk"}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTrack(track);
                              handleConfirmRequest(track);
                            }}
                            disabled={cooldown.active || !canAfford || submittingTrackId === track.id}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs flex items-center gap-1 shadow-md transition-all ${
                              !canAfford || submittingTrackId === track.id
                                ? 'bg-stone-900/80 text-amber-200/40 border border-amber-500/20 cursor-not-allowed'
                                : 'gold-gradient-bg text-stone-950 hover:brightness-110 active:scale-95'
                            }`}
                          >
                            {submittingTrackId === track.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                            {submittingTrackId === track.id ? (
                              <span>Eklenecek...</span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <span>İste (</span>
                                {isHappyHourActive && baseCost !== finalCost && (
                                  <span className="line-through opacity-50 mr-0.5">{baseCost}</span>
                                )}
                                <span className={isHappyHourActive && baseCost !== finalCost ? "text-yellow-100 drop-shadow-md" : ""}>{finalCost} Kredi)</span>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 pt-3 border-t border-[#D4AF37]/20 space-y-2">
            {cooldown.active && (
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-xl p-2.5 flex items-center justify-between text-xs text-amber-200">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
                  <span>30 Saniye Anti-Spam Bekleme Süresi</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {formatCooldown(cooldown.remainingSeconds)}
                </span>
              </div>
            )}

            {selectedTrack && (
              <div className="flex items-center justify-between bg-[#1C130D] rounded-xl p-2.5 border border-[#D4AF37]/20">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={selectedTrack.albumCover || selectedTrack.coverUrl || selectedTrack.album_art || '/logo.png'}
                    alt={selectedTrack.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{selectedTrack.title}</p>
                    <p className="text-[10px] text-amber-200/60 truncate">{selectedTrack.artist}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isHappyHourActive && selectedBaseCost !== selectedFinalCost && (
                    <span className="text-[10px] line-through opacity-50 mr-1 text-white block">{selectedBaseCost} Kredi</span>
                  )}
                  <span className="text-xs font-black text-[#D4AF37] block">{selectedFinalCost} Kredi</span>
                  <span className="text-[9px] text-amber-200/50">Bakiyeniz: {user ? user.credits : 0}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleConfirmRequest()}
              disabled={!selectedTrack || cooldown.active || selectedFinalCost === null}
              className={`w-full py-4 px-6 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all ${
                cooldown.active || !selectedTrack || selectedFinalCost === null
                  ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                  : 'gold-gradient-bg text-stone-950 hover:brightness-110 active:scale-[0.98]'
              }`}
            >
              <Coins className="w-5 h-5 text-stone-950" />
              {cooldown.active ? (
                <span>Bekleme Süresi ({formatCooldown(cooldown.remainingSeconds)})</span>
              ) : (
                <div className="flex items-center gap-1">
                  <span>Seçili Şarkıyı İste (</span>
                  {isHappyHourActive && selectedBaseCost !== selectedFinalCost && (
                    <span className="line-through opacity-50 mr-0.5">{selectedBaseCost}</span>
                  )}
                  <span className={isHappyHourActive && selectedBaseCost !== selectedFinalCost ? "text-yellow-100 drop-shadow-md" : ""}>{selectedFinalCost ?? 10} Kredi)</span>
                </div>
              )}
            </button>

            {/* Spotify Branding Compliance */}
            <div className="flex items-center justify-center gap-1.5 pt-2 pb-1 opacity-60">
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">Powered by</span>
              <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify" className="h-4 object-contain brightness-0 invert" />
            </div>
          </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
