'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Check, Clock, Coins, Loader2, Heart, ExternalLink, Plus, AlertTriangle, Crown, Ban, ChevronDown, ShieldAlert } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';
import { containsProfanity, maskProfanity } from '../utils/profanityFilter';
import { formatDuration, formatUserDisplayName } from '../utils/formatters';
import { isTrackAllowedByVibeGuard, classifyTrackGenres } from '../utils/genreMatcher';

export const MusicSearchModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    requestTrack,
    user,
    activeVenue,
    cooldown,
    showToast,
  } = useApp();

  const maxDailySongs = user?.isPremium ? 5 : 2;
  const usedSongs = user?.daily_songs_count || 0;
  const remainingSongs = Math.max(0, maxDailySongs - usedSongs);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showBlockedSongs, setShowBlockedSongs] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'all' | 'top10' | 'history' | null>('all');
  
  const [isSearching, setIsSearching] = useState(false);
  const [submittingTrackId, setSubmittingTrackId] = useState<string | null>(null);

  const [confirmingTrack, setConfirmingTrack] = useState<Track | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [message, setMessage] = useState('');
  const [estimatedWaitMs, setEstimatedWaitMs] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  const isExplicitFilterActive = activeVenue?.explicit_filter_enabled === true;
  const isVibeGuardActive = Array.isArray(activeVenue?.allowed_genres) && activeVenue.allowed_genres.length > 0;

  const isTrackExplicit = (track: Track) => {
    return (
      track.explicit === true ||
      (track as any).is_explicit === true ||
      containsProfanity(track.title) ||
      containsProfanity(track.artist)
    );
  };

  const getTrackBlockStatus = (track: Track): { isBlocked: boolean; reason?: string; type?: 'explicit' | 'vibe' } => {
    if (isExplicitFilterActive && isTrackExplicit(track)) {
      return { isBlocked: true, reason: 'Sansürsüz Şarkı (Küfürlü)', type: 'explicit' };
    }
    if (isVibeGuardActive) {
      const vibeCheck = isTrackAllowedByVibeGuard(track, activeVenue?.allowed_genres, searchQuery);
      if (!vibeCheck.isAllowed) {
        return { isBlocked: true, reason: vibeCheck.blockedReason || 'Mekân Tarzı Dışı', type: 'vibe' };
      }
    }
    return { isBlocked: false };
  };

  const allowedTracks = searchResults.filter(
    (track) => !getTrackBlockStatus(track).isBlocked
  );

  const blockedTracks = searchResults.filter(
    (track) => getTrackBlockStatus(track).isBlocked
  );

  useEffect(() => {
    if (allowedTracks.length > 0) {
      if (!selectedTrack || !allowedTracks.some(t => t.id === selectedTrack.id)) {
        setSelectedTrack(allowedTracks[0]);
      }
    } else {
      setSelectedTrack(null);
    }
  }, [searchResults, searchQuery, activeVenue?.explicit_filter_enabled, activeVenue?.allowed_genres]);

  // Auto-search real Spotify tracks on mount or query change
  useEffect(() => {
    const isDefaultSearch = searchQuery.trim() === '';
    
    let queryToFetch = searchQuery.trim();
    if (isDefaultSearch) {
      queryToFetch = 'yeni çıkanlar'; // all / default
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
        if (isDefaultSearch && activeTab === 'history') {
          if (!user?.id) {
            setSearchResults([]);
            setIsLoading(false);
            return;
          }
          const { data: histData, error: histErr } = await supabase
            .from('song_requests_log')
            .select('song_name, artist_name, album_cover, spotify_uri, duration_ms, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30);

          if (!histErr && histData && histData.length > 0) {
            const seen = new Set<string>();
            const uniqueHistory: Array<any> = [];
            for (const h of histData) {
              const key = `${(h.song_name || '').trim().toLowerCase()}_${(h.artist_name || '').trim().toLowerCase()}`;
              if (!seen.has(key) && h.song_name) {
                seen.add(key);
                uniqueHistory.push(h);
              }
            }

            const rawTracks: Track[] = uniqueHistory.slice(0, 10).map((h) => {
              const spotifyId = h.spotify_uri?.replace('spotify:track:', '') || '';
              return {
                id: spotifyId || `hist_${Math.random()}`,
                title: h.song_name,
                artist: h.artist_name,
                albumCover: h.album_cover || '',
                coverUrl: h.album_cover || '',
                spotifyUri: h.spotify_uri || '',
                durationMs: h.duration_ms || 210000,
                requestedBy: 'Sen',
                requestedAt: h.created_at,
                votes: 0,
              };
            });

            // Parallel Spotify metadata enrichment for any history song lacking Spotify URI or album cover
            if (activeVenue?.id) {
              const enrichedTracks = await Promise.all(
                rawTracks.map(async (track) => {
                  if (track.spotifyUri && track.albumCover && !track.albumCover.includes('unsplash')) {
                    return track;
                  }
                  try {
                    const searchRes = await supabase.functions.invoke('spotify-search', {
                      body: { q: `${track.title} ${track.artist}`, venueId: activeVenue.id }
                    });
                    const found = searchRes?.data?.tracks?.[0];
                    if (found) {
                      return {
                        ...track,
                        id: found.id || track.id,
                        spotifyUri: found.spotifyUri || (found.id ? `spotify:track:${found.id}` : track.spotifyUri),
                        albumCover: found.albumCover || found.coverUrl || track.albumCover,
                        coverUrl: found.coverUrl || found.albumCover || track.coverUrl,
                        durationMs: found.durationMs || track.durationMs,
                      };
                    }
                  } catch (e) {
                    console.warn('[History track Spotify enrichment warning]', e);
                  }
                  return track;
                })
              );

              setSearchResults(enrichedTracks);
              if (!selectedTrack && enrichedTracks.length > 0) setSelectedTrack(enrichedTracks[0]);
              setIsLoading(false);
              return;
            }

            setSearchResults(rawTracks);
            if (!selectedTrack && rawTracks.length > 0) setSelectedTrack(rawTracks[0]);
            setIsLoading(false);
            return;
          }
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        if (isDefaultSearch && activeTab === 'top10') {
          // TOP 10 ŞARKILAR: RPC üzerinden en çok istenenleri getir
          const { data: topData, error: topError } = await supabase.rpc('get_venue_top_tracks', { p_venue_id: Number(activeVenue.id) });
          if (!topError && topData && topData.length > 0) {
            const topTracks: Track[] = topData.map((t: any) => ({
              id: t.track_id,
              title: t.song_title,
              artist: t.artist_name,
              coverUrl: t.album_cover,
              albumCover: t.album_cover,
              spotifyUri: t.spotify_uri || (t.track_id?.startsWith('spotify:track:') ? t.track_id : ''),
              durationMs: t.duration_ms || 210000,
              requestedBy: `${t.request_count} kez istendi`,
              votes: 0,
            }));
            setSearchResults(topTracks.slice(0, 10));
            if (!selectedTrack) setSelectedTrack(topTracks[0]);
            setIsLoading(false);
            return;
          }
          // Eğer hiç şarkı istenmemişse veya hata varsa listeyi boşalt
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

        console.log(`[MusicSearch] Invoking Edge Function spotify-search`);
        const { data: resData, error: invokeError } = await supabase.functions.invoke('spotify-search', {
          body: { q: queryToFetch, venueId: activeVenue.id }
        });

        if (invokeError) {
          throw new Error(invokeError.message || 'Arama işlemi başarısız');
        }

        const data: any = resData || {};

        if (data.error) {
          throw new Error(data.error);
        }

        const tracks: Track[] = data.tracks ?? [];
        console.log(`[MusicSearch] Got ${tracks.length} tracks for "${queryToFetch}"`);
        const limitedTracks = tracks.slice(0, 10);
        setSearchResults(limitedTracks);
        if (limitedTracks.length > 0 && !selectedTrack) {
          setSelectedTrack(limitedTracks[0]);
        }
      } catch (err: any) {
        // Suppress expected 400 errors if venue hasn't connected Spotify
        if (!err.message?.includes('non-2xx status code')) {
          console.warn('[MusicSearch] Search info:', err.message);
        }
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, activeVenue?.id]);


  

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleConfirmRequest = async (trackToRequest?: Track) => {
    const target = trackToRequest || selectedTrack;
    if (target) {
      const blockStatus = getTrackBlockStatus(target);
      if (blockStatus.isBlocked) {
        showToast(`⚠️ ${blockStatus.reason || 'Bu şarkı mekan kuralları nedeniyle çalınamaz.'}`);
        return;
      }

      const durMs = (target as any).duration_ms || target.durationMs || (target.duration ? target.duration * 1000 : 0);
      const formatted = formatDuration(durMs);

      if (durMs > 420000) {
        showToast(`Bu şarkı 7 dakikadan uzun (${formatted}). Mekan akışını korumak için en fazla 7 dakikalık şarkılar eklenebilir.`);
        return;
      }

      if (!user?.isPremium && durMs > 240000) {
        showToast(`Bu şarkı 4 dakikadan uzun (${formatted}). Standart üyelikte en fazla 4 dakikalık şarkılar eklenebilir. 7 dakikaya kadar şarkı çalmak için Premium'a geçebilirsiniz 👑`);
        return;
      }

      setConfirmingTrack(target);
      setIsAnonymous(false);
      setIsBoosted(false);
      setMessage('');
      
      // Calculate estimated wait time
      if (activeVenue) {
        try {
          const { data, error } = await supabase
            .from('queue')
            .select('duration_ms')
            .eq('venue_id', activeVenue.id)
            .in('status', ['pending', 'queued', 'playing']);
            
          if (!error && data) {
            const totalMs = data.reduce((acc, curr) => acc + (curr.duration_ms || 210000), 0);
            setEstimatedWaitMs(totalMs);
          }
        } catch(e) {
          console.error(e);
        }
      }
    }
  };

  const handleFinalRequest = async () => {
    if (confirmingTrack && !submittingTrackId) {
      if (message.trim().length > 0 && containsProfanity(message)) {
        showToast('Lütfen küfür veya argo içeren kelimeler kullanmayın.');
        return;
      }
      const finalMessage = message.trim().length > 0 ? maskProfanity(message) : undefined;
      setSubmittingTrackId(confirmingTrack.id);
      try {
        const success = await requestTrack(confirmingTrack, isAnonymous, isBoosted, finalMessage);
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
      {activeModal === 'search' && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-md h-[92vh] bg-[var(--theme-card)] sm:rounded-3xl rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] flex flex-col justify-between overflow-hidden border-t sm:border border-white/[0.1]"
          >
            {confirmingTrack ? (
              <div className="flex-1 flex flex-col pt-2 overflow-y-auto custom-scrollbar h-full relative z-10 pb-20">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-[var(--theme-primary)]" />
                    <span className="text-xs font-black text-white uppercase tracking-wider">İsteği Onayla</span>
                  </div>
                  <button
                    onClick={() => setConfirmingTrack(null)}
                    className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
                    aria-label="Geri"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4 pt-4">
                  {/* Track Info Box */}
                  <div className="flex items-center gap-3.5 bg-[var(--theme-card-alt)] rounded-2xl p-3.5 border border-white/[0.08] shadow-md">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 shadow-sm shrink-0">
                      <img src={confirmingTrack.albumCover || confirmingTrack.coverUrl || confirmingTrack.album_art || '/logo.png'} className="w-full h-full object-cover" alt={confirmingTrack.title} />
                    </div>
                    <div className="truncate flex-1 min-w-0">
                      <p className="text-sm font-black text-white truncate">{confirmingTrack.title}</p>
                      <p className="text-xs font-semibold text-[var(--theme-primary-light)] truncate mt-0.5">{confirmingTrack.artist}</p>
                    </div>
                  </div>

                  {/* Anonymous Toggle (VIP Feature) */}
                  <div className="flex items-center justify-between bg-[var(--theme-card-alt)] rounded-2xl p-3.5 border border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white tracking-wide">Hayalet Modu</p>
                        {!user?.isPremium && (
                          <span className="text-[8px] font-black bg-[var(--theme-primary)]/20 text-[var(--theme-primary-light)] border border-[var(--theme-primary)]/30 px-1.5 py-0.5 rounded uppercase">VIP</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {user?.isPremium ? 'Sadece "Anonim" olarak görünürsün' : 'Sadece Premium üyeler için'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!user?.isPremium) {
                          showToast('Hayalet modu sadece Muzikors Premium üyeleri içindir.');
                          return;
                        }
                        setIsAnonymous(!isAnonymous);
                      }}
                      className={`w-11 h-6 rounded-full p-0.5 transition-all flex items-center shadow-inner ${
                        !user?.isPremium ? 'bg-neutral-800 opacity-40 cursor-not-allowed' :
                        isAnonymous ? 'bg-[var(--theme-primary)]' : 'bg-neutral-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${isAnonymous && user?.isPremium ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Priority / Boost Toggle (VIP Feature) */}
                  <div className="flex items-center justify-between bg-[var(--theme-card-alt)] rounded-2xl p-3.5 border border-white/[0.08]">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-white tracking-wide">Şarkıyı Üste Taşı</p>
                        {!user?.isPremium && (
                          <span className="text-[8px] font-black bg-[var(--theme-primary)]/20 text-[var(--theme-primary-light)] border border-[var(--theme-primary)]/30 px-1.5 py-0.5 rounded uppercase">VIP</span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {user?.isPremium ? `Kalan Hak: ${Math.max(1 - (user.daily_boosts_count || 0), 0)} (Sıranın en başına geçer)` : 'Sadece Premium üyeler için'}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!user?.isPremium) {
                          showToast('Üste taşıma sadece Muzikors Premium üyeleri içindir.');
                          return;
                        }
                        if ((user?.daily_boosts_count || 0) >= 1 && !isBoosted) {
                          showToast('Günlük üste taşıma limitinize ulaştınız.');
                          return;
                        }
                        setIsBoosted(!isBoosted);
                      }}
                      className={`w-11 h-6 rounded-full p-0.5 transition-all flex items-center shadow-inner ${
                        !user?.isPremium || (user?.daily_boosts_count || 0) >= 1 && !isBoosted ? 'bg-neutral-800 opacity-40 cursor-not-allowed' :
                        isBoosted ? 'bg-[var(--theme-primary)]' : 'bg-neutral-700'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${isBoosted && user?.isPremium ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Message Input */}
                  <div className="bg-[var(--theme-card-alt)] rounded-2xl p-3.5 border border-white/[0.08] space-y-2">
                    <p className="text-xs font-bold text-white">Not Ekle <span className="text-[10px] text-neutral-400">(İsteğe bağlı)</span></p>
                    <input 
                      type="text" 
                      placeholder="Örn: Masamıza gelsin..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      maxLength={60}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder:text-neutral-500 focus:border-[var(--theme-primary)] focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Estimated Time */}
                  {estimatedWaitMs > 0 && (
                    <div className="flex items-center gap-2 justify-center text-xs text-neutral-400 mt-2">
                      <Clock className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span>Tahmini çalma süresi: <strong className="text-white">~{Math.round(estimatedWaitMs / 60000)} dk sonra</strong></span>
                    </div>
                  )}

                  {/* Consent Text */}
                  <div className="bg-[var(--theme-primary)]/10 rounded-2xl p-3 border border-[var(--theme-primary)]/25 text-[11px] leading-relaxed text-[var(--theme-primary-light)] font-medium">
                    {isAnonymous ? (
                      <p>Şarkı isteğin uygulamada <b className="text-white">Anonim</b> olarak yayınlanacaktır.</p>
                    ) : (
                      <p>Şarkı isteğin uygulamada (<b className="text-white">{formatUserDisplayName(user?.username, user?.name)}</b>) olarak yayınlanacaktır.</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5">
                  <button
                    onClick={handleFinalRequest}
                    disabled={submittingTrackId === confirmingTrack.id}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[var(--theme-primary)] hover:brightness-110 text-black font-black text-xs flex items-center justify-between shadow-md active:scale-95 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      {submittingTrackId === confirmingTrack.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                      <span>{submittingTrackId === confirmingTrack.id ? 'İstek Gönderiliyor...' : 'Onaylıyorum, İsteği Gönder'}</span>
                    </div>
                    {user && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/20 text-black">
                        {remainingSongs}/{maxDailySongs} Hak
                      </span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Header & Search Bar */}
                <div className="shrink-0 space-y-3 relative z-10">
                  <div className="w-10 h-1 rounded-full bg-white/20 mx-auto sm:hidden" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4 text-[var(--theme-primary)]" />
                      <h2 className="text-base font-black text-white tracking-tight">Müzik Arama</h2>
                      {user && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 ${
                          user.isPremium
                            ? 'bg-[var(--theme-primary)]/15 text-[var(--theme-primary-light)] border-[var(--theme-primary)]/30'
                            : 'bg-white/[0.04] text-neutral-300 border-white/10'
                        }`}>
                          {user.isPremium && <Crown className="w-2.5 h-2.5 text-[var(--theme-primary)]" />}
                          {remainingSongs}/{maxDailySongs} Hak
                        </span>
                      )}
                    </div>

                    <button
                      onClick={closeModal}
                      className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
                      aria-label="Kapat"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Search Input */}
                  <div className="relative group">
                    <Search className="w-4 h-4 text-[var(--theme-primary)] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="tour-search-input"
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
                      placeholder="Sanatçı veya şarkı adı..."
                      className="w-full bg-[var(--theme-card-alt)] border border-white/10 rounded-2xl py-3 pl-10 pr-10 text-xs font-semibold text-white placeholder-neutral-500 focus:outline-none focus:border-[var(--theme-primary)] transition-colors shadow-inner"
                    />
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 text-[var(--theme-primary)] animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                    ) : searchQuery ? (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : null}
                  </div>

                  {/* Vibe Guard Active Notice */}
                  {isVibeGuardActive && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <p className="text-[11px] leading-tight font-medium">
                        <strong className="font-bold">Mekân Tarzı (Vibe Guard):</strong> Bu mekanda yalnızca <span className="underline decoration-amber-500/40 font-bold text-white">{activeVenue.allowed_genres?.join(', ')}</span> şarkıları kabul edilmektedir.
                      </p>
                    </div>
                  )}

                  {/* Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none">
                    <button
                      onClick={() => {
                        setActiveTab('all');
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        activeTab === 'all'
                          ? 'bg-[var(--theme-primary)] text-black font-black shadow-sm'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Trendler
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('top10');
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        activeTab === 'top10'
                          ? 'bg-[var(--theme-primary)] text-black font-black shadow-sm'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                      }`}
                    >
                      Mekanın Tercihi
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab('history');
                        setSearchQuery('');
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                        activeTab === 'history'
                          ? 'bg-[var(--theme-primary)] text-black font-black shadow-sm'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>Son İstediklerim</span>
                    </button>
                  </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto my-2 space-y-1.5 pr-1 custom-scrollbar relative z-10">
                  {isLoading ? (
                    <div className="text-center py-16 flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-[var(--theme-primary)] animate-spin" />
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        {activeTab === 'history' ? 'Geçmiş İstekler Yükleniyor...' : 'Şarkılar Aranıyor...'}
                      </p>
                    </div>
                  ) : allowedTracks.length === 0 && blockedTracks.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500">
                      <Music className="w-10 h-10 mx-auto mb-2 opacity-30 text-[var(--theme-primary)]" />
                      <p className="text-xs font-semibold">Sonuç bulunamadı</p>
                    </div>
                  ) : (
                    <>
                      {/* Empty Allowed notice if only blocked tracks exist */}
                      {allowedTracks.length === 0 && blockedTracks.length > 0 && (
                        <div className="text-center py-6 px-4 text-neutral-400 space-y-2 bg-amber-500/[0.03] border border-amber-500/15 rounded-2xl my-2">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                            <ShieldAlert className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-bold text-neutral-200">Mekana Uygun Şarkı Bulunamadı</p>
                          <p className="text-[11px] text-neutral-400 max-w-xs mx-auto">
                            Aramanızla eşleşen {blockedTracks.length} şarkı mekanın müzik tarzı (Vibe Guard) veya sansür kurallarına takıldı.
                          </p>
                        </div>
                      )}

                      {/* Allowed Tracks */}
                      {allowedTracks.map((track) => {
                        const isSelected = selectedTrack?.id === track.id;
                        const durMs = (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0);
                        const isExplicitTrack = isTrackExplicit(track);
                        const isTooLongForFree = !user?.isPremium && durMs > 240000;
                        const isTooLongOverall = durMs > 420000;

                        return (
                          <div
                            key={track.id}
                            onClick={() => {
                              if ((cooldown.active && !user?.isPremium) || submittingTrackId === track.id) return;
                              setSelectedTrack(track);
                            }}
                            className={`rounded-2xl p-2.5 flex items-center justify-between border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--theme-card-alt)] border-[var(--theme-primary)]/50 shadow-sm'
                                : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/[0.06]'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10">
                                <img
                                  src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                />
                                {isSelected && (
                                  <div className="absolute inset-0 bg-[var(--theme-primary)]/50 flex items-center justify-center backdrop-blur-xs">
                                    <Check className="w-4 h-4 text-black stroke-[3]" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="text-xs font-bold truncate text-white">
                                    {track.title}
                                  </h4>
                                  {isExplicitTrack && (
                                    <span className="text-[8px] font-black px-1 py-0.2 rounded bg-neutral-800 text-neutral-400 border border-neutral-700 uppercase" title="Explicit (Sansürsüz İçerik)">
                                      E
                                    </span>
                                  )}
                                  {isTooLongOverall ? (
                                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 uppercase">
                                      &gt;7 dk
                                    </span>
                                  ) : isTooLongForFree ? (
                                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-[var(--theme-primary-light)] border border-amber-500/30 uppercase">
                                      👑 VIP (4+ dk)
                                    </span>
                                  ) : null}
                                </div>
                                <p className="text-[10px] text-neutral-400 font-medium truncate mt-0.5">
                                  {track.artist}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 pl-2 text-right">
                              {durMs > 0 && (
                                <span className={`text-[10px] font-mono font-bold ${isTooLongOverall ? 'text-red-400' : isTooLongForFree ? 'text-[var(--theme-primary-light)]' : 'text-neutral-400'}`}>
                                  {formatDuration(durMs)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}

                      {/* Collapsible Blocked / Filtered Tracks Section */}
                      {blockedTracks.length > 0 && (
                        <div className="pt-2 pb-1 space-y-2">
                          <button
                            type="button"
                            onClick={() => setShowBlockedSongs(prev => !prev)}
                            className="w-full py-2 px-3 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] flex items-center justify-between text-xs text-neutral-400 hover:text-neutral-200 transition-all active:scale-[0.99] cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span className="font-bold text-[11px] text-neutral-300">
                                Mekan Kısıtlamasına Takılanlar ({blockedTracks.length})
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-neutral-500 font-medium">
                              <span>{showBlockedSongs ? 'Gizle' : 'Göster'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showBlockedSongs ? 'rotate-180' : ''}`} />
                            </div>
                          </button>

                          <AnimatePresence>
                            {showBlockedSongs && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-1.5 overflow-hidden"
                              >
                                <div className="px-2.5 py-1 text-[10px] text-neutral-400 flex items-center gap-1.5 bg-amber-500/[0.04] border border-amber-500/10 rounded-xl">
                                  <ShieldAlert className="w-3 h-3 text-amber-400 shrink-0" />
                                  <span>Bu şarkılar mekanın müzik tarzı (Vibe Guard) veya sansür kuralları gereği çalınamaz.</span>
                                </div>
                                {blockedTracks.map((track) => {
                                  const durMs = (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0);
                                  const blockInfo = getTrackBlockStatus(track);
                                  return (
                                    <div
                                      key={track.id}
                                      onClick={() => showToast(`⚠️ ${blockInfo.reason || 'Bu şarkı mekan kuralları nedeniyle çalınamaz.'}`)}
                                      className="rounded-2xl p-2.5 flex items-center justify-between border border-amber-500/15 bg-amber-500/[0.02] hover:bg-amber-500/[0.05] opacity-75 hover:opacity-100 transition-all cursor-not-allowed group"
                                    >
                                      <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-white/10 grayscale">
                                          <img
                                            src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                                            alt={track.title}
                                            className="w-full h-full object-cover"
                                          />
                                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                            {blockInfo.type === 'vibe' ? (
                                              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                                            ) : (
                                              <Ban className="w-3.5 h-3.5 text-rose-400" />
                                            )}
                                          </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-1.5 flex-wrap">
                                            <h4 className="text-xs font-bold truncate text-neutral-300">
                                              {track.title}
                                            </h4>
                                            {blockInfo.type === 'vibe' ? (
                                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase flex items-center gap-0.5">
                                                <ShieldAlert className="w-2.5 h-2.5" /> {blockInfo.reason}
                                              </span>
                                            ) : (
                                              <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase flex items-center gap-0.5">
                                                <Ban className="w-2.5 h-2.5" /> Sansürsüz Şarkı
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-neutral-500 font-medium truncate mt-0.5">
                                            {track.artist}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="shrink-0 pl-2 text-right">
                                        <span className="text-[9px] font-bold text-neutral-500 uppercase">
                                          Kısıtlı
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Bottom Bar */}
                <div className="shrink-0 pt-3 border-t border-white/[0.08] space-y-2 relative z-10">
                  {cooldown.active && !user?.isPremium && (
                    <div className="bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 rounded-xl p-2.5 flex items-center justify-between text-xs text-[var(--theme-primary-light)]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[var(--theme-primary)] animate-spin" />
                        <div>
                          <span className="font-semibold text-xs block">Anti-Spam Bekleme Süresi</span>
                          <span className="text-[9px] text-neutral-400 font-normal">Premium ile bekleme süresi 0 sn ⚡</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[var(--theme-primary-light)] text-sm">
                        {Math.floor(cooldown.remainingSeconds / 60)}:{(cooldown.remainingSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  <button
                    onClick={() => handleConfirmRequest()}
                    disabled={!selectedTrack || (cooldown.active && !user?.isPremium)}
                    className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs flex items-center justify-between transition-all ${
                      (cooldown.active && !user?.isPremium) || !selectedTrack
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-[var(--theme-primary)] hover:brightness-110 text-black active:scale-95 shadow-md cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span>{selectedTrack ? 'Seçili Şarkıyı İste' : 'Listeden Şarkı Seçin'}</span>
                    </div>
                    {(!cooldown.active || user?.isPremium) && selectedTrack && user && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/20 text-black">
                        {remainingSongs}/{maxDailySongs} Hak
                      </span>
                    )}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
