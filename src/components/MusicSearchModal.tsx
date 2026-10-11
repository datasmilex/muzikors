'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpToLine, Check, ChevronDown, Clock, Ghost, Hourglass, Loader2, Music, Pause, Play, Plus, Search, Send, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Track } from '../types';
import { containsProfanity, maskProfanity } from '../utils/profanityFilter';
import { formatDuration, formatUserDisplayName } from '../utils/formatters';
import { getUserDailySongRights } from '../lib/timeHelpers';
import { useAudioPreview } from '../services/audioPreviewService';
import { attachVerdicts, canSuggest, fetchLibraryPage, spotifyIdOf, suggestToVenue, useVibeInfo, vibeRuleSummary } from '../lib/vibe';
import { Sheet } from './ui/Sheet';
import { EmptyState, SkeletonRows, Switch, btn, groupCard, groupRow, inputBase, sectionLabel } from './ui/controls';
import { EASE_OUT } from '../lib/motion';
import { trackCover } from '../utils/queueLabels';

type SearchTab = 'library' | 'all' | 'top10' | 'history';

const BASE_TABS: { value: SearchTab; label: string }[] = [
  { value: 'all', label: 'Trendler' },
  { value: 'top10', label: 'Mekânın favorileri' },
  { value: 'history', label: 'Son isteklerim' },
];

const LIBRARY_PAGE = 40;

const trackDurationMs = (track: Track) =>
  (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0);

/** Önizleme çalarken dönen küçük ekolayzer */
const PlayingBars: React.FC = () => (
  <span className="flex items-end gap-[2px] h-3" aria-hidden="true">
    {[0, 1, 2].map((i) => (
      <span key={i} className="eq-bar w-[2px] h-3 rounded-full bg-[var(--theme-primary)]" />
    ))}
  </span>
);

export const MusicSearchModal: React.FC = () => {
  const { activeModal, closeModal, requestTrack, user, activeVenue, cooldown, showToast, registerBackHandler } = useApp();

  const rights = getUserDailySongRights(user);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [libraryTotal, setLibraryTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showBlocked, setShowBlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab | null>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [suggested, setSuggested] = useState<Set<string>>(new Set());
  const userPickedTab = useRef(false);

  const [confirmingTrack, setConfirmingTrack] = useState<Track | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isBoosted, setIsBoosted] = useState(false);
  const [message, setMessage] = useState('');
  const [estimatedWaitMs, setEstimatedWaitMs] = useState(0);

  const audioPreview = useAudioPreview();
  const isOpen = activeModal === 'search';
  const isPremium = Boolean(user?.isPremium);
  const cooldownBlocks = cooldown.active && !isPremium && cooldown.remainingSeconds > 0;

  const vibe = useVibeInfo(activeVenue?.id, isOpen);
  const hasLibrary = Boolean(vibe?.enabled && vibe.library_tracks > 0);
  const tabs = hasLibrary ? [{ value: 'library' as SearchTab, label: 'Mekânın listesi' }, ...BASE_TABS] : BASE_TABS;

  useEffect(() => {
    if (!isOpen) {
      audioPreview.stopPreview();
      userPickedTab.current = false;
    }
  }, [isOpen, audioPreview]);

  // Mekânın listesi varsa, kullanıcı başka bir sekme seçmediyse oradan başlanır
  useEffect(() => {
    if (!isOpen) return;
    if (hasLibrary && !userPickedTab.current && activeTab === 'all' && searchQuery.trim() === '') setActiveTab('library');
    if (!hasLibrary && activeTab === 'library') setActiveTab('all');
  }, [isOpen, hasLibrary]); // eslint-disable-line react-hooks/exhaustive-deps

  // Onay adımındayken Android geri tuşu arama listesine döner
  useEffect(() => {
    if (!confirmingTrack) return;
    return registerBackHandler(() => {
      audioPreview.stopPreview();
      setConfirmingTrack(null);
      return true;
    });
  }, [confirmingTrack, registerBackHandler, audioPreview]);

  const hasSpotify = Boolean(
    activeVenue?.has_spotify || activeVenue?.current_track_info?.spotify_track_id || (activeVenue as any)?.spotify_refresh_token
  );
  const isExplicitFilterActive = activeVenue?.explicit_filter_enabled === true;

  const isTrackExplicit = (track: Track) => track.explicit === true || (track as any).is_explicit === true;

  // Karar sunucudan gelir (Vibe Guard, Spotify'ın sansürsüz etiketi dahil). Kararı olmayan
  // eski kayıtlarda yalnızca Spotify etiketi ve başlıktaki açık küfür kontrol edilir.
  const getBlockStatus = (track: Track): { blocked: boolean; reason?: string } => {
    if (track.vibe) {
      return track.vibe.verdict === 'block'
        ? { blocked: true, reason: track.vibe.message || 'Mekânın müzik tarzına uymuyor.' }
        : { blocked: false };
    }
    if (isExplicitFilterActive && (isTrackExplicit(track) || containsProfanity(track.title))) {
      return { blocked: true, reason: 'Bu mekânda sansürsüz (küfürlü) şarkılar çalınmıyor.' };
    }
    return { blocked: false };
  };

  const allowedTracks = searchResults.filter((t) => !getBlockStatus(t).blocked);
  const blockedTracks = searchResults.filter((t) => getBlockStatus(t).blocked);

  // Arama: boşken mekânın listesi / trendler / favoriler / geçmiş; yazarken 800 ms gecikmeyle Spotify
  useEffect(() => {
    const isDefaultSearch = searchQuery.trim() === '';
    const queryToFetch = isDefaultSearch ? 'yeni çıkanlar' : searchQuery.trim();

    if (!activeVenue?.id) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }
    if (!hasSpotify && activeTab !== 'history' && activeTab !== 'top10' && activeTab !== 'library') {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        if (isDefaultSearch && activeTab === 'library') {
          const page = await fetchLibraryPage(activeVenue.id, 0, LIBRARY_PAGE);
          setLibraryTotal(page.total);
          setSearchResults(page.tracks);
          return;
        }

        if (isDefaultSearch && activeTab === 'history') {
          if (!user?.id) {
            setSearchResults([]);
            return;
          }
          const { data: histData, error: histErr } = await supabase
            .from('song_requests_log')
            .select('song_name, artist_name, album_cover, spotify_uri, duration_ms, created_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(30);

          if (histErr || !histData?.length) {
            setSearchResults([]);
            return;
          }

          const seen = new Set<string>();
          const unique = histData.filter((h: any) => {
            const key = `${(h.song_name || '').trim().toLowerCase()}_${(h.artist_name || '').trim().toLowerCase()}`;
            if (!h.song_name || seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          const rawTracks: Track[] = unique.slice(0, 10).map((h: any) => ({
            id: h.spotify_uri?.replace('spotify:track:', '') || `hist_${Math.random()}`,
            title: h.song_name,
            artist: h.artist_name,
            albumCover: h.album_cover || '',
            coverUrl: h.album_cover || '',
            spotifyUri: h.spotify_uri || '',
            durationMs: h.duration_ms || 210000,
            requestedBy: 'Sen',
            requestedAt: h.created_at,
            votes: 0,
          }));

          // Mekânın kararı ve eksik kapaklar tek istekle tamamlanır
          setSearchResults(hasSpotify ? await attachVerdicts(activeVenue.id, rawTracks) : rawTracks);
          return;
        }

        if (isDefaultSearch && activeTab === 'top10') {
          const { data: topData, error: topError } = await supabase.rpc('get_venue_top_tracks', { p_venue_id: Number(activeVenue.id) });
          if (!topError && topData?.length) {
            const rawTracks: Track[] = topData.slice(0, 10).map((t: any) => ({
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
            setSearchResults(hasSpotify ? await attachVerdicts(activeVenue.id, rawTracks) : rawTracks);
          } else {
            setSearchResults([]);
          }
          return;
        }

        if (!hasSpotify) {
          setSearchResults([]);
          return;
        }

        const { data: resData, error: invokeError } = await supabase.functions.invoke('spotify-search', {
          body: { q: queryToFetch, venueId: activeVenue.id },
        });
        if (invokeError) throw new Error(invokeError.message || 'Arama başarısız');
        const data: any = resData || {};
        if (data.error) throw new Error(data.error);
        setSearchResults((data.tracks ?? []).slice(0, 10));
      } catch (err: any) {
        if (!err?.message?.includes('non-2xx status code')) console.warn('[MusicSearch]', err?.message);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, isDefaultSearch ? 10 : 800);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, activeVenue?.id, hasSpotify]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMoreLibrary = async () => {
    if (!activeVenue?.id || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await fetchLibraryPage(activeVenue.id, searchResults.length, LIBRARY_PAGE);
      setLibraryTotal(page.total);
      setSearchResults((prev) => {
        const ids = new Set(prev.map((t) => t.id));
        return [...prev, ...page.tracks.filter((t) => !ids.has(t.id))];
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const close = () => {
    audioPreview.stopPreview();
    setConfirmingTrack(null);
    closeModal();
  };

  const backToSearch = () => {
    audioPreview.stopPreview();
    setConfirmingTrack(null);
  };

  const selectTrack = async (track: Track) => {
    audioPreview.stopPreview();
    const block = getBlockStatus(track);
    if (block.blocked) {
      showToast(block.reason || 'Bu şarkı mekân kuralları nedeniyle çalınamıyor.');
      return;
    }
    const durMs = trackDurationMs(track);
    if (durMs > 420000) {
      showToast(`Bu şarkı 7 dakikadan uzun (${formatDuration(durMs)}). En fazla 7 dakikalık şarkılar eklenebilir.`);
      return;
    }
    if (!isPremium && durMs > 240000) {
      showToast(`Bu şarkı 4 dakikadan uzun (${formatDuration(durMs)}). 7 dakikaya kadar şarkılar VIP üyelere açık.`);
      return;
    }

    setConfirmingTrack(track);
    setIsAnonymous(false);
    setIsBoosted(false);
    setMessage('');
    setEstimatedWaitMs(0);

    if (activeVenue) {
      try {
        const { data, error } = await supabase
          .from('queue')
          .select('duration_ms')
          .eq('venue_id', activeVenue.id)
          .in('status', ['pending', 'queued', 'playing']);
        if (!error && data) setEstimatedWaitMs(data.reduce((acc, row) => acc + (row.duration_ms || 210000), 0));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const suggest = async (track: Track) => {
    if (!user) {
      showToast('Önermek için giriş yapman gerekiyor.');
      return;
    }
    const id = spotifyIdOf(track);
    if (!activeVenue?.id || !id) return;
    const res = await suggestToVenue(activeVenue.id, id);
    showToast(res.message);
    if (res.ok) setSuggested((prev) => new Set(prev).add(track.id));
  };

  const submit = async () => {
    if (!confirmingTrack || submitting) return;
    audioPreview.stopPreview();
    if (message.trim() && containsProfanity(message)) {
      showToast('Notunda küfür veya argo kullanma lütfen.');
      return;
    }
    setSubmitting(true);
    try {
      const ok = await requestTrack(confirmingTrack, isAnonymous, isBoosted, message.trim() ? maskProfanity(message) : undefined);
      if (ok) setConfirmingTrack(null);
    } finally {
      setSubmitting(false);
    }
  };

  const togglePreview = (track: Track) =>
    audioPreview.togglePreview(track, () => showToast('Bu şarkının önizlemesi bulunamadı.'));

  const renderPreview = (track: Track, large = false) => {
    const playing = audioPreview.isPlaying(track.id);
    const loading = audioPreview.isLoading(track.id);
    return (
      <button
        type="button"
        onClick={() => togglePreview(track)}
        aria-label={playing ? 'Önizlemeyi durdur' : '30 saniye önizle'}
        className={`${large ? 'w-12 h-12' : 'w-11 h-11'} shrink-0 rounded-full grid place-items-center active:scale-90 transition-[transform,background-color] duration-150 ${
          playing ? 'bg-[var(--theme-primary)] text-black' : 'bg-white/[0.07] text-white/80 hover:bg-white/[0.1]'
        }`}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : playing ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
      </button>
    );
  };

  const remainingLabel = `${rights.remainingSongs}/${rights.baseMaxDailySongs} hak`;
  const cooldownText = `${Math.floor(cooldown.remainingSeconds / 60)}:${String(cooldown.remainingSeconds % 60).padStart(2, '0')}`;
  const boostLeft = Math.max(0, 1 - (user?.daily_boosts_count || 0));
  const confirmNeedsApproval = confirmingTrack?.vibe?.verdict === 'approval';
  const approvalMinutes = vibe?.approval_minutes ?? 10;

  const toolbar = confirmingTrack ? undefined : (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          id="tour-search-input"
          type="search"
          enterKeyHint="search"
          value={searchQuery}
          onChange={(e) => {
            audioPreview.stopPreview();
            setSearchQuery(e.target.value);
            if (e.target.value.trim() !== '') setActiveTab(null);
            else if (activeTab === null) setActiveTab(hasLibrary ? 'library' : 'all');
          }}
          placeholder="Şarkı veya sanatçı ara"
          className={`${inputBase} pl-11 pr-11`}
        />
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-white/50 animate-spin absolute right-4 top-1/2 -translate-y-1/2" />
        ) : searchQuery ? (
          <button
            type="button"
            onClick={() => {
              audioPreview.stopPreview();
              setSearchQuery('');
              setActiveTab(hasLibrary ? 'library' : 'all');
            }}
            aria-label="Aramayı temizle"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center text-white/50"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-5 px-5">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => {
              audioPreview.stopPreview();
              userPickedTab.current = true;
              setActiveTab(tab.value);
              setSearchQuery('');
            }}
            className={`shrink-0 h-9 px-4 rounded-full text-[13px] font-semibold transition-colors duration-150 ${
              activeTab === tab.value ? 'bg-white text-black' : 'bg-white/[0.06] text-white/65 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {vibe?.enabled && (
        <div className="flex items-start gap-2 text-[12px] text-white/50 leading-snug px-1">
          <ShieldCheck className="w-4 h-4 shrink-0 text-white/40 mt-px" />
          <span className="min-w-0">
            {(vibe.styles.length > 0 || vibe.description) && (
              <span className="block text-white/70">
                {vibe.styles.length > 0 && `Bu mekânın tarzı: ${vibe.styles.join(' · ')}`}
                {vibe.styles.length > 0 && vibe.description ? '. ' : ''}
                {vibe.description}
              </span>
            )}
            <span className="block">{vibeRuleSummary(vibe)}</span>
          </span>
        </div>
      )}
    </div>
  );

  const footer = confirmingTrack ? (
    <button type="button" onClick={submit} disabled={submitting || cooldownBlocks} className={`${btn.primary} w-full`}>
      {submitting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : cooldownBlocks ? (
        <Clock className="w-4 h-4" />
      ) : confirmNeedsApproval ? (
        <Send className="w-4 h-4" />
      ) : (
        <Plus className="w-5 h-5" strokeWidth={2.5} />
      )}
      <span>
        {cooldownBlocks ? `${cooldownText} sonra gönderebilirsin` : !user ? 'Giriş yap ve gönder' : confirmNeedsApproval ? 'Mekânın onayına gönder' : 'Sıraya ekle'}
      </span>
      {user && !cooldownBlocks && <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-[12px] font-bold tabular-nums">{remainingLabel}</span>}
    </button>
  ) : cooldownBlocks ? (
    <div className="flex items-center gap-3 min-h-[44px] text-[13px]">
      <Clock className="w-4 h-4 text-white/50" />
      <span className="flex-1 text-white/60">Bir sonraki isteğine kalan süre</span>
      <span className="font-semibold tabular-nums">{cooldownText}</span>
    </div>
  ) : undefined;

  const emptyTitle =
    activeTab === 'history' ? 'Henüz isteğin yok' : activeTab === 'top10' ? 'Henüz favori yok' : activeTab === 'library' ? 'Liste şu an boş' : 'Sonuç bulunamadı';
  const emptyText =
    activeTab === 'history'
      ? 'İstediğin şarkılar burada görünecek.'
      : activeTab === 'top10'
        ? 'Bu mekânda en çok istenen şarkılar burada görünecek.'
        : activeTab === 'library'
          ? 'Mekânın bu saatte geçerli listesi yok. Arama yaparak şarkı isteyebilirsin.'
          : 'Farklı bir şarkı veya sanatçı adı dene.';

  return (
    <Sheet
      open={isOpen}
      onClose={close}
      title={confirmingTrack ? 'İsteği gönder' : 'Şarkı iste'}
      onBack={confirmingTrack ? backToSearch : undefined}
      headerRight={
        user && !confirmingTrack ? (
          <span className="mr-1 px-2.5 h-7 rounded-full bg-white/[0.07] text-[12px] font-semibold text-white/80 grid place-items-center tabular-nums">
            {remainingLabel}
          </span>
        ) : undefined
      }
      toolbar={toolbar}
      footer={footer}
      height="tall"
      width="lg"
    >
      <AnimatePresence mode="wait" initial={false}>
        {confirmingTrack ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
            exit={{ opacity: 0, x: 28, transition: { duration: 0.16 } }}
            className="space-y-5 pb-2"
          >
            <div className="flex items-center gap-4 pt-1">
              <img src={trackCover(confirmingTrack)} alt="" className="w-[72px] h-[72px] rounded-2xl object-cover bg-white/[0.06] shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[17px] font-bold truncate">{confirmingTrack.title}</p>
                <p className="text-[14px] text-white/55 truncate">{confirmingTrack.artist}</p>
                <p className="text-[12px] text-white/40 mt-0.5 flex items-center gap-2">
                  {trackDurationMs(confirmingTrack) > 0 && <span>{formatDuration(trackDurationMs(confirmingTrack))}</span>}
                  {audioPreview.isPlaying(confirmingTrack.id) && <PlayingBars />}
                </p>
              </div>
              {renderPreview(confirmingTrack, true)}
            </div>

            {confirmNeedsApproval && (
              <div className="flex items-start gap-3 rounded-2xl bg-white/[0.05] px-4 py-3">
                <Hourglass className="w-[18px] h-[18px] text-white/55 shrink-0 mt-0.5" />
                <p className="text-[13px] text-white/70 leading-relaxed">
                  Bu şarkı mekânın listesinde yok. Mekân onaylarsa sıraya girer; onaylamazsa ya da {approvalMinutes} dakika içinde karar vermezse
                  şarkı hakkın iade edilir.
                </p>
              </div>
            )}

            {estimatedWaitMs > 0 && (
              <p className="flex items-center gap-2 text-[13px] text-white/55">
                <Clock className="w-4 h-4 text-white/40" />
                {confirmNeedsApproval ? 'Onaylanırsa yaklaşık' : 'Yaklaşık'} {Math.max(1, Math.round(estimatedWaitMs / 60000))} dakika sonra çalar
              </p>
            )}

            <div className={groupCard}>
              <div className={groupRow}>
                <Ghost className="w-[18px] h-[18px] text-white/55" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold">Hayalet modu</span>
                  <span className="block text-[12px] text-white/45">{isPremium ? 'Adın yerine "Anonim" görünür' : 'VIP üyelere özel'}</span>
                </span>
                <Switch
                  checked={isAnonymous}
                  dimmed={!isPremium}
                  label="Hayalet modu"
                  onChange={(next) => {
                    if (!isPremium) {
                      showToast('Hayalet modu VIP üyelere özel.');
                      return;
                    }
                    setIsAnonymous(next);
                  }}
                />
              </div>
              <div className={groupRow}>
                <ArrowUpToLine className="w-[18px] h-[18px] text-white/55" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[14px] font-semibold">Sıranın başına taşı</span>
                  <span className="block text-[12px] text-white/45">{isPremium ? `Bugün ${boostLeft} hakkın var` : 'VIP üyelere özel'}</span>
                </span>
                <Switch
                  checked={isBoosted}
                  dimmed={!isPremium || (boostLeft === 0 && !isBoosted)}
                  label="Sıranın başına taşı"
                  onChange={(next) => {
                    if (!isPremium) {
                      showToast('Sıranın başına taşıma VIP üyelere özel.');
                      return;
                    }
                    if (next && boostLeft === 0) {
                      showToast('Bugünkü öne taşıma hakkını kullandın.');
                      return;
                    }
                    setIsBoosted(next);
                  }}
                />
              </div>
            </div>

            <label className="block">
              <span className={sectionLabel}>Not ekle (isteğe bağlı)</span>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={60}
                placeholder="Örn: 5 numaralı masadan sevgiler"
                className={inputBase}
              />
            </label>

            <p className="text-[12px] text-white/45 leading-relaxed">
              {!user
                ? 'Göndermek için giriş yapman istenecek.'
                : isAnonymous
                  ? 'İsteğin "Anonim" olarak görünecek.'
                  : `İsteğin ${formatUserDisplayName(user.username, user.name)} adıyla görünecek.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0, transition: { duration: 0.3, ease: EASE_OUT } }}
            exit={{ opacity: 0, x: -28, transition: { duration: 0.16 } }}
            className="pb-2"
          >
            {isLoading ? (
              <SkeletonRows count={7} />
            ) : !hasSpotify && activeTab !== 'history' && activeTab !== 'top10' && activeTab !== 'library' ? (
              <EmptyState
                icon={<Music className="w-6 h-6" />}
                title="Mekân müzik çaları bağlı değil"
                text="Mekân Spotify bağlantısını tamamlayınca şarkı arayıp isteyebileceksin."
              />
            ) : searchResults.length === 0 ? (
              <EmptyState icon={<Search className="w-6 h-6" />} title={emptyTitle} text={emptyText} />
            ) : (
              <>
                {allowedTracks.length === 0 && (
                  <p className="text-[13px] text-white/55 leading-relaxed py-3">
                    Aramana uyan {blockedTracks.length} şarkı mekânın kurallarına takıldı.
                    {hasLibrary ? ' Mekânın listesine göz atabilir ya da başka bir şarkı deneyebilirsin.' : ' Başka bir şarkı dene.'}
                  </p>
                )}

                <ul className="landscape:grid landscape:grid-cols-2 landscape:gap-x-6">
                  {allowedTracks.map((track) => {
                    const durMs = trackDurationMs(track);
                    const tooLongOverall = durMs > 420000;
                    const tooLongForFree = !isPremium && durMs > 240000;
                    const needsApproval = track.vibe?.verdict === 'approval';
                    return (
                      <li key={track.id} className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => selectTrack(track)}
                          className="flex-1 min-w-0 flex items-center gap-3 py-2 -ml-2 pl-2 rounded-2xl text-left active:bg-white/[0.05] transition-colors duration-150"
                        >
                          <img src={trackCover(track)} alt="" loading="lazy" className="w-12 h-12 rounded-xl object-cover bg-white/[0.06] shrink-0" />
                          <span className="flex-1 min-w-0">
                            <span className="flex items-center gap-1.5">
                              <span className="text-[15px] font-semibold truncate">{track.title}</span>
                              {isTrackExplicit(track) && (
                                <span className="shrink-0 w-4 h-4 rounded-[4px] bg-white/[0.15] text-[9px] font-bold grid place-items-center text-white/70" title="Sansürsüz">
                                  E
                                </span>
                              )}
                              {audioPreview.isPlaying(track.id) && <PlayingBars />}
                            </span>
                            <span className="block text-[13px] text-white/50 truncate">
                              {track.artist}
                              {durMs > 0 && ` · ${formatDuration(durMs)}`}
                            </span>
                            {needsApproval && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-white/45 mt-0.5">
                                <Hourglass className="w-3 h-3" /> Mekân onayına düşer
                              </span>
                            )}
                            {(tooLongOverall || tooLongForFree) && (
                              <span className={`block text-[11px] font-semibold mt-0.5 ${tooLongOverall ? 'text-red-300/90' : 'text-[var(--theme-primary-light)]'}`}>
                                {tooLongOverall ? '7 dakikadan uzun' : '4 dakikadan uzun · VIP'}
                              </span>
                            )}
                          </span>
                        </button>
                        {renderPreview(track)}
                      </li>
                    );
                  })}
                </ul>

                {activeTab === 'library' && searchQuery.trim() === '' && searchResults.length < libraryTotal && (
                  <button
                    type="button"
                    onClick={loadMoreLibrary}
                    disabled={loadingMore}
                    className="w-full mt-2 min-h-[44px] rounded-2xl bg-white/[0.05] text-[13px] font-semibold text-white/70 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150"
                  >
                    {loadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
                    {libraryTotal - searchResults.length} şarkı daha
                  </button>
                )}

                {blockedTracks.length > 0 && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowBlocked((v) => !v)}
                      aria-expanded={showBlocked}
                      className="w-full flex items-center gap-2 min-h-[44px] text-[13px] font-semibold text-white/50 hover:text-white/80"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span className="flex-1 text-left">Mekân kurallarına takılan {blockedTracks.length} şarkı</span>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showBlocked ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {showBlocked && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1, transition: { duration: 0.26, ease: EASE_OUT } }}
                          exit={{ height: 0, opacity: 0, transition: { duration: 0.18 } }}
                          className="overflow-hidden"
                        >
                          {blockedTracks.map((track) => {
                            const reason = getBlockStatus(track).reason;
                            const suggestable = canSuggest(track.vibe);
                            const done = suggested.has(track.id);
                            return (
                              <li key={track.id} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => showToast(reason || 'Bu şarkı mekân kuralları nedeniyle çalınamıyor.')}
                                  className="flex-1 min-w-0 flex items-center gap-3 py-2 text-left opacity-55"
                                >
                                  <img src={trackCover(track)} alt="" loading="lazy" className="w-12 h-12 rounded-xl object-cover grayscale shrink-0" />
                                  <span className="flex-1 min-w-0">
                                    <span className="block text-[15px] font-semibold truncate">{track.title}</span>
                                    <span className="block text-[12px] text-white/50 truncate">{reason}</span>
                                  </span>
                                </button>
                                {suggestable && (
                                  <button
                                    type="button"
                                    onClick={() => !done && suggest(track)}
                                    disabled={done}
                                    aria-label={done ? 'Önerildi' : `${track.title} şarkısını mekâna öner`}
                                    className="shrink-0 min-h-[44px] px-3 rounded-full bg-white/[0.06] text-[12px] font-semibold text-white/70 flex items-center gap-1.5 active:scale-95 transition-transform duration-150 disabled:opacity-60"
                                  >
                                    {done ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                                    {done ? 'Önerildi' : 'Öner'}
                                  </button>
                                )}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
};
