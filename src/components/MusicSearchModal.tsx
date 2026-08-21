'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music, Check, Clock, Coins, Loader2, Heart, ExternalLink, Plus, AlertTriangle, Crown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';
import { containsProfanity, maskProfanity } from '../utils/profanityFilter';
import { formatDuration, formatUserDisplayName } from '../utils/formatters';

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
  
  const [activeTab, setActiveTab] = useState<'all' | 'top10' | 'global' | 'history' | null>('all');
  
  const [isSearching, setIsSearching] = useState(false);
  const [submittingTrackId, setSubmittingTrackId] = useState<string | null>(null);

  const [confirmingTrack, setConfirmingTrack] = useState<Track | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [message, setMessage] = useState('');
  const [estimatedWaitMs, setEstimatedWaitMs] = useState<number>(0);

  const [isLoading, setIsLoading] = useState(false);

  // Auto-search real Spotify tracks on mount or query change
  useEffect(() => {
    const isDefaultSearch = searchQuery.trim() === '';
    
    let queryToFetch = searchQuery.trim();
    if (isDefaultSearch) {
      if (activeTab === 'global') {
        queryToFetch = 'top hits';
      } else {
        queryToFetch = 'yeni çıkanlar'; // all / default
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
        if (isDefaultSearch && activeTab === 'history') {
          if (!user?.id) {
            setSearchResults([]);
            setIsLoading(false);
            return;
          }
          const { data: histData, error: histErr } = await supabase
            .from('queue')
            .select('song_name, artist_name, album_cover, spotify_uri, duration_ms, created_at')
            .eq('requested_by_user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(25);

          if (!histErr && histData && histData.length > 0) {
            const seen = new Set<string>();
            const uniqueTracks: Track[] = [];
            for (const h of histData) {
              const key = h.spotify_uri || `${h.song_name}_${h.artist_name}`;
              if (!seen.has(key)) {
                seen.add(key);
                uniqueTracks.push({
                  id: h.spotify_uri || `hist_${Math.random()}`,
                  title: h.song_name,
                  artist: h.artist_name,
                  albumCover: h.album_cover,
                  coverUrl: h.album_cover,
                  spotifyUri: h.spotify_uri,
                  durationMs: h.duration_ms,
                  requestedBy: 'Sen',
                  requestedAt: h.created_at,
                  votes: 0,
                });
              }
            }
            setSearchResults(uniqueTracks);
            if (!selectedTrack && uniqueTracks.length > 0) setSelectedTrack(uniqueTracks[0]);
            setIsLoading(false);
            return;
          }
          setSearchResults([]);
          setIsLoading(false);
          return;
        }

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
        setSearchResults(tracks);
        if (tracks.length > 0 && !selectedTrack) {
          setSelectedTrack(tracks[0]);
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
      {activeModal === 'search' && (<>

      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Bottom Sheet / Modal Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md h-[92vh] bg-[#120C08] sm:rounded-3xl rounded-t-3xl p-4 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30"
        >
          {/* Decorative Glow */}

          {confirmingTrack ? (
            <div className="flex-1 flex flex-col pt-4 overflow-y-auto custom-scrollbar h-full relative z-10 px-2 pb-24">
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setConfirmingTrack(null)}
                  className="p-2 rounded-full bg-white/5 border border-transparent active:border-[#D4AF37]/30 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
                  aria-label="Geri"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-6 pt-2">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-orange-500/10 border border-orange-500/20 mx-auto flex items-center justify-center shadow-inner">
                    <AlertTriangle className="w-8 h-8 text-[#E5A93C] drop-shadow-md" />
                  </div>
                  <h2 className="text-xl font-black text-white tracking-tight">Şarkı İsteğini Onayla</h2>
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

                {/* Anonymous Toggle (VIP Feature) */}
                <div className="flex items-center justify-between bg-[#1A1A1A]/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white tracking-wide">Hayalet Modu</p>
                      {!user?.isPremium && (
                        <span className="text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 px-1.5 py-0.5 rounded uppercase">VIP</span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-200/50 mt-1 font-semibold uppercase tracking-wider">
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
                    className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner ${
                      !user?.isPremium ? 'bg-gray-800 opacity-50 cursor-not-allowed' :
                      isAnonymous ? 'bg-[#D4AF37]' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isAnonymous && user?.isPremium ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Priority / Boost Toggle (VIP Feature) */}
                <div className="flex items-center justify-between bg-[#1A1A1A]/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-white tracking-wide">Şarkıyı Üste Taşı</p>
                      {!user?.isPremium && (
                        <span className="text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 px-1.5 py-0.5 rounded uppercase">VIP</span>
                      )}
                    </div>
                    <p className="text-[10px] text-amber-200/50 mt-1 font-semibold uppercase tracking-wider">
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
                    className={`w-12 h-6 rounded-full p-1 transition-all flex items-center shadow-inner ${
                      !user?.isPremium || (user?.daily_boosts_count || 0) >= 1 && !isBoosted ? 'bg-gray-800 opacity-50 cursor-not-allowed' :
                      isBoosted ? 'bg-[#D4AF37]' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isBoosted && user?.isPremium ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Message Input */}
                <div className="bg-[#1A1A1A]/60 rounded-2xl p-4 border border-white/5 shadow-inner space-y-2">
                  <p className="text-sm font-bold text-white tracking-wide">Not Ekle <span className="text-xs font-normal text-zinc-500">(İsteğe bağlı)</span></p>
                  <input 
                    type="text" 
                    placeholder="Örn: Ayşe'nin doğum günü için..." 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={60}
                    className="w-full bg-[#120C08] border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#D4AF37]/50 focus:outline-none transition-colors"
                  />
                </div>

                {/* Estimated Time */}
                {estimatedWaitMs > 0 && (
                  <div className="flex items-center gap-2 justify-center text-xs text-zinc-400 mt-2">
                    <Clock className="w-4 h-4 text-[#D4AF37]" />
                    <span>Sıranın tahmini bekleme süresi: <strong className="text-white">{Math.round(estimatedWaitMs / 60000)} dakika</strong></span>
                  </div>
                )}

                {/* Consent Text */}
                <div className="bg-amber-900/10 rounded-2xl p-4 border border-amber-500/20 text-xs leading-relaxed text-amber-100/80 font-medium">
                  {isAnonymous ? (
                    <p>"Şarkı isteğin uygulamada ve sıra listesinde <b className="text-white">Anonim Müşteri</b> olarak görünecektir. Onaylıyor musun?"</p>
                  ) : (
                    <p>"Şarkı isteğinle birlikte ismin <b className="text-white">{formatUserDisplayName(user?.username, user?.name)}</b> olarak uygulamada yayınlanacaktır. KVKK kapsamında isminin görünmesini onaylıyor musun?"</p>
                  )}
                </div>

                {/* Vibe Guard Friendly Request */}
                {activeVenue?.allowed_genres && activeVenue.allowed_genres.length > 0 && (
                  <div className="bg-[#D4AF37]/10 rounded-2xl p-4 border border-[#D4AF37]/25 text-[11px] leading-relaxed text-amber-200/90 mt-4">
                    <p>
                      <b className="text-[#D4AF37]">🎵 Küçük Bir Rica:</b> Mekânın müzik konsepti ve ambiyansı ağırlıklı olarak <span className="font-black text-white">{activeVenue.allowed_genres.join(', ')}</span> tarzındadır. Mekandaki herkesin keyif alması için bu tarza yakın parçalar seçmenizi rica ederiz. Keyifli dinlemeler! ✨
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 mt-6">
                <button
                  onClick={handleFinalRequest}
                  disabled={submittingTrackId === confirmingTrack.id}
                  className="w-full py-4 px-5 rounded-[1.5rem] gold-gradient-bg text-stone-950 font-black text-base flex items-center justify-between shadow-[0_10px_30px_rgba(212,175,55,0.3)] active:brightness-110 active:scale-95 transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    {submittingTrackId === confirmingTrack.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5 stroke-[3] group-active:scale-95 transition-transform" />}
                    <span>{submittingTrackId === confirmingTrack.id ? 'İstek Gönderiliyor...' : 'Onaylıyorum, İsteği Gönder'}</span>
                  </div>
                  {user && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-stone-950/20 text-stone-950 border border-stone-950/15">
                      {remainingSongs}/{maxDailySongs} Hak
                    </span>
                  )}
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
                {user && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border flex items-center gap-1 shadow-sm ${
                    user.isPremium
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40 shadow-[0_0_10px_rgba(212,175,55,0.25)]'
                      : 'bg-white/10 text-zinc-300 border-white/15'
                  }`}>
                    {user.isPremium && <Crown className="w-3 h-3 text-[#D4AF37]" />}
                    {remainingSongs}/{maxDailySongs} Hak
                  </span>
                )}
              </div>

              <button
                onClick={closeModal}
                className="p-2 rounded-full bg-white/5 border border-transparent active:border-[#D4AF37]/30 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
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
                    placeholder="Sanatçı veya şarkı adı yazın (örn: Sezen Aksu)..."
                    className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/30 rounded-[1.5rem] py-4 pl-12 pr-12 text-sm font-semibold text-white placeholder-amber-200/30 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-[#1C130D] focus:ring-4 focus:ring-[#D4AF37]/10 transition-all shadow-inner"
                  />
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 text-[#D4AF37] animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
                  ) : searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-200/50 active:text-white transition-colors"
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
                        : 'bg-white/5 text-gray-400 border border-white/5 active:border-[#D4AF37]/30 active:text-white'
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
                        : 'bg-white/5 text-gray-400 border border-white/5 active:border-[#D4AF37]/30 active:text-white'
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
                        : 'bg-white/5 text-gray-400 border border-white/5 active:border-[#D4AF37]/30 active:text-white'
                    }`}
                  >
                    Global Hits
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('history');
                      setSearchQuery('');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all snap-start flex items-center gap-1.5 ${
                      activeTab === 'history'
                        ? 'gold-gradient-bg text-stone-950 shadow-[0_5px_15px_rgba(212,175,55,0.3)] scale-105'
                        : 'bg-white/5 text-gray-400 border border-white/5 active:border-[#D4AF37]/30 active:text-white'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Son İstediklerim</span>
                  </button>
                </div>
              </div>
            </div>

          {/* Search Track Results List */}
          <div className="flex-1 overflow-y-auto my-2 space-y-0 flex flex-col pt-2 pr-1 custom-scrollbar relative z-10">
              {isLoading ? (
                <div className="text-center py-16 text-amber-200/60 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-widest">
                    {activeTab === 'history' ? 'Geçmiş İstekleriniz Yükleniyor...' : 'Spotify Müzikleri Aranıyor...'}
                  </p>
                </div>
              ) : searchResults.length === 0 ? (
                activeTab === 'history' ? (
                  <div className="text-center py-16 text-amber-200/40">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
                    <p className="text-sm font-bold text-white">Henüz geçmiş istek kaydınız yok</p>
                    <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                      Beğendiğiniz şarkıları aratarak ilk isteğinizi yapın, sık çaldırdıklarınız burada biriksin!
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-16 text-amber-200/40">
                    <Music className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#D4AF37]" />
                    <p className="text-sm font-semibold">Aramanıza uygun Spotify şarkısı bulunamadı</p>
                  </div>
                )
              ) : (
                searchResults.map((track, idx) => {
                  const zIndex = searchResults.length - idx;
                  const isSelected = selectedTrack?.id === track.id;
                  const durMs = (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0);
                  const isExplicitFilterActive = activeVenue?.explicit_filter_enabled === true;
                  const isExplicitTrack = track.explicit === true || (track as any).is_explicit === true;
                  const isExplicitBlocked = isExplicitFilterActive && isExplicitTrack;
                  
                  const isBlocked = isExplicitBlocked;
                                    return (
                    <div 
                      key={track.id}
                      className={`relative group transition-all duration-300 active:-translate-y-1 ${idx !== 0 ? 'mt-1.5' : ''}`}
                      style={{ zIndex }}
                    >
                      <div
                        onClick={() => {
                          if (isBlocked || cooldown.active || submittingTrackId === track.id) return;
                          setSelectedTrack(track);
                        }}
                        className={`rounded-[1.2rem] p-2 flex items-center justify-between border transition-all duration-300 ${
                          isBlocked
                            ? 'bg-black/40 opacity-50 border-red-500/10'
                            : 'bg-white/5 border-white/5 active:border-[#D4AF37]/30 active:bg-[#1C130D]/60 active:shadow-[0_4px_15px_rgba(212,175,55,0.1)] cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                          {/* Compact Album Cover */}
                          <div className="relative w-11 h-11 rounded-[0.7rem] overflow-hidden shrink-0 shadow-md border border-white/10 group-active:border-[#D4AF37]/40 transition-colors">
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
                              <div className="absolute inset-0 bg-[#D4AF37]/30 flex items-center justify-center backdrop-blur-sm">
                                <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />
                              </div>
                            )}
                          </div>
                          
                          {/* Title & Artist - Single Column */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <h4 className={`text-[13px] font-black truncate leading-tight ${isSelected ? 'text-white' : 'text-gray-100'}`}>
                                {track.title}
                              </h4>
                              {isExplicitBlocked ? (
                                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                              ) : null}
                            </div>
                            <p className="text-[11px] font-semibold text-gray-400 truncate mt-0.5 leading-tight">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        {/* Right side: Cost Info */}
                        <div className="flex flex-col items-end justify-center shrink-0 pr-2">
                          {isExplicitBlocked ? (
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-400/10 px-2 py-1 rounded-md">Engelli</span>
                          ) : (
                            <div className="flex flex-col items-end gap-0.5">
                              
                              {durMs > 0 && (
                                <span className="text-[9px] font-semibold text-gray-500 tracking-wider">
                                  {formatDuration(durMs)}
                                </span>
                              )}
                              
                              {submittingTrackId === track.id && (
                                <Loader2 className="w-3 h-3 text-[#D4AF37] animate-spin mt-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          {/* Bottom Action Bar */}
          <div className="shrink-0 pt-3 border-t border-[#D4AF37]/20 space-y-3 relative z-10 bg-transparent">
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
              <div className="flex items-center justify-between bg-black/35 rounded-[1.5rem] p-3.5 border border-[#D4AF37]/30 shadow-lg backdrop-blur-sm">
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
              </div>
            )}

            <button
              onClick={() => handleConfirmRequest()}
              disabled={!selectedTrack || cooldown.active}
              className={`w-full py-4 px-5 rounded-[1.5rem] font-black text-base flex items-center justify-between shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-300 group ${
                cooldown.active || !selectedTrack
                  ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800 shadow-none'
                  : 'gold-gradient-bg text-stone-950 active:brightness-110 active:scale-95'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Music className={`w-5 h-5 ${cooldown.active || !selectedTrack ? 'text-zinc-600' : 'text-stone-950 group-active:scale-95 transition-transform'}`} />
                {cooldown.active ? (
                  <span>Bekleme Süresi ({formatCooldown(cooldown.remainingSeconds)})</span>
                ) : (
                  <span>Seçili Şarkıyı İste</span>
                )}
              </div>
              {!cooldown.active && selectedTrack && user && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full bg-stone-950/20 text-stone-950 border border-stone-950/15">
                  {remainingSongs}/{maxDailySongs} Hak
                </span>
              )}
            </button>
          </div>
            </>
          )}
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
