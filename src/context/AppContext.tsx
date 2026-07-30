'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, ModalType, Track, Venue, CooldownState } from '../types';
import { CREDIT_PACKAGES } from '../data/mockData';
import { supabase } from '../lib/supabaseClient';
import { getSongCreditCost } from '../utils/formatters';

const VENUE_STORAGE_KEY = 'muzikors_active_venue';

interface AppContextType {
  user: UserProfile | null;
  activeModal: ModalType;
  activeVenue: Venue | null;
  kafeIdParam: string | null;
  isVenueBound: boolean;
  isVenueActive: boolean;
  hasEnteredGateway: boolean;
  setHasEnteredGateway: (val: boolean) => void;
  nowPlaying: Track | null;
  queue: Track[];
  cooldown: CooldownState;
  toastMessage: string | null;
  loginPromptReason: string | null;
  audioProgress: number;
  isPlayingAudio: boolean;
  loginWithProvider: (provider: 'google') => Promise<void>;
  openModal: (modal: ModalType) => void;
  openProtectedModal: (modal: ModalType, reason?: string) => void;
  closeModal: () => void;

  logout: () => Promise<void>;
  topUpCredits: (packageId: string) => void;
  requestTrack: (track: Track, isAnonymous?: boolean) => Promise<boolean>;
  voteTrack: (trackId: string) => void;
  bindVenueById: (kafeId: string) => void;
  deleteAccount: () => void;
  showToast: (msg: string) => void;
  toggleAudioPlay: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const COOLDOWN_DURATION_SECONDS = 30;
const DEFAULT_CREDITS = 10;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [pendingModal, setPendingModal] = useState<ModalType | null>(null);
  const [loginPromptReason, setLoginPromptReason] = useState<string | null>(null);
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
  const [kafeIdParam, setKafeIdParam] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [hasEnteredGateway, setHasEnteredGateway] = useState<boolean>(false);
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [livePlaybackState, setLivePlaybackState] = useState<{
    title: string;
    artist: string;
    album_art: string;
    progress_ms: number;
    duration_ms: number;
    is_playing: boolean;
    updated_at: number;
  } | null>(null);
  const [cooldown, setCooldown] = useState<CooldownState>({
    active: false,
    remainingSeconds: 0,
    lastRequestedAt: null,
  });

  const userIdRef = useRef<string | null>(null);

  // Derived venue state
  const isVenueBound = activeVenue !== null;
  const isVenueActive = activeVenue?.is_active !== false; // true if active or undefined

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // ── FETCH PROFILE STATS & CREDITS DIRECTLY FROM DB ─────────────────────────
  const fetchProfileCredits = useCallback(async (userId: string): Promise<{ real: number, promo: number }> => {
    if (!supabase) return { real: 0, promo: 0 };
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits, promo_credits, lifetime_credits, total_songs_requested, last_daily_claim')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Credits] DB fetch error:', error.message);
        return { real: 0, promo: 0 };
      }

      setUser((prev) =>
        prev
          ? {
              ...prev,
              credits: data?.credits ?? prev.credits,
              promo_credits: data?.promo_credits ?? prev.promo_credits,
              lifetimeCredits: data?.lifetime_credits ?? prev.lifetimeCredits,
              totalSongsRequested: data?.total_songs_requested ?? prev.totalSongsRequested,
              lastDailyClaim: data?.last_daily_claim ?? prev.lastDailyClaim,
            }
          : null
      );

      return {
        real: typeof data?.credits === 'number' ? data.credits : 0,
        promo: typeof data?.promo_credits === 'number' ? data.promo_credits : 0
      };
    } catch (err) {
      console.error('[Credits] Unexpected error:', err);
      return { real: 0, promo: 0 };
    }
  }, []);

  // ── BIND VENUE: fetch from Supabase, persist to localStorage ─────────────
  const bindVenueById = useCallback(async (kafeId: string | number) => {
    if (!supabase) return;
    try {
      const rawStr = String(kafeId ?? '').trim();
      const parsedVenueId = rawStr ? parseInt(rawStr, 10) : null;

      if (!parsedVenueId || isNaN(parsedVenueId) || parsedVenueId <= 0) {
        console.warn('[Venue] Invalid parsed venue ID:', kafeId);
        setActiveVenue(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(VENUE_STORAGE_KEY);
        }
        showToast('Bir mekana bağlı değilsiniz.');
        return;
      }

      // Query Supabase using maybeSingle() to safely handle no rows without throwing errors
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .eq('id', parsedVenueId)
        .maybeSingle();

      if (error || !data) {
        console.error('[Venue] Not found in DB for parsed id:', parsedVenueId, error?.message);
        setActiveVenue(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem(VENUE_STORAGE_KEY);
        }
        showToast('Bir mekana bağlı değilsiniz.');
        return;
      }

      // Safe property check for is_active
      const isActive = data.is_active ?? true;

      const venue: Venue = {
        id: String(data.id),
        name: data.venue_name || `Mekan #${data.id}`,
        venue_name: data.venue_name,
        address: data.full_address || data.district || '',
        city: data.city || '',
        district: data.district || '',
        distance: '',
        logo: 'bar',
        coverImage: '',
        activeListeners: 0,
        currentSongTitle: '',
        currentSongArtist: '',
        slug: data.slug,
        is_active: isActive,
        is_tv_active: data.is_tv_active === true,
        is_paused: data.is_paused === true,
        explicit_filter_enabled: data.explicit_filter_enabled === true,
        allowed_genres: data.allowed_genres || [],
        full_address: data.full_address,
        contact_phone: data.contact_phone,
        total_earnings: data.total_earnings,
        wifi_name: data.wifi_name || data.wifi_ssid || '',
        wifi_password: data.wifi_password || data.wifi_pass || '',
        menu_link: data.menu_link || data.menu_url || '',
        logo_url: data.logo_url || data.logo || '',
        spotify_client_id: data.spotify_client_id || null,
        has_spotify: !!(data.spotify_refresh_token),
        opening_time: data.opening_time || null,
        closing_time: data.closing_time || null,
      };

      setActiveVenue(venue);

      // Persist to localStorage for page refreshes
      if (typeof window !== 'undefined') {
        localStorage.setItem(VENUE_STORAGE_KEY, JSON.stringify(venue));
      }

      if (isActive === false) {
        showToast(`${data.venue_name} şu an hizmet vermemektedir.`);
      } else {
        showToast(`${data.venue_name} mekanına başarıyla bağlandınız!`);
      }
    } catch (err) {
      console.error('[Venue] bindVenueById exception:', err);
      setActiveVenue(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(VENUE_STORAGE_KEY);
      }
      showToast('Bir mekana bağlı değilsiniz.');
    }
  }, [showToast]);

  // ── ONBOARDING ────────────────────────────────────────────────────────────
  useEffect(() => {
    const seen = sessionStorage.getItem('muzikors_onboarding_shown');
    if (!seen && !user) {
      setActiveModal('howitworks');
      sessionStorage.setItem('muzikors_onboarding_shown', 'true');
    }
  }, [user]);

  // ── URL PARAMS + LOCALSTORAGE VENUE RESTORE ───────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const searchParams = new URLSearchParams(window.location.search);
    const rawV = searchParams.get('v') || searchParams.get('venue') || searchParams.get('kafe_id') || searchParams.get('venue_id');
    const authError = searchParams.get('error');

    if (authError) {
      showToast('Giriş yapılamadı. Lütfen tekrar deneyin.');
      setUser(null);
    }

    const paymentStatus = searchParams.get('payment');
    if (paymentStatus === 'success') {
      const amount = searchParams.get('amount') || '';
      showToast(`Ödeme başarılı! +${amount} Kredi hesabınıza eklendi.`);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.7 }, colors: ['#D4AF37', '#E5A93B', '#FFFFFF'] });
      // Remove params to prevent re-triggering on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (paymentStatus === 'failed') {
      showToast('Ödeme işlemi başarısız oldu veya iptal edildi.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (rawV) {
      const parsedVenueId = parseInt(rawV.trim(), 10);
      if (parsedVenueId && !isNaN(parsedVenueId) && parsedVenueId > 0) {
        setKafeIdParam(String(parsedVenueId));
        bindVenueById(parsedVenueId);
      } else {
        showToast('Bir mekana bağlı değilsiniz.');
        setActiveVenue(null);
        localStorage.removeItem(VENUE_STORAGE_KEY);
      }
    } else {
      // Restore venue from localStorage if no URL param
      const stored = localStorage.getItem(VENUE_STORAGE_KEY);
      if (stored) {
        try {
          const parsed: Venue = JSON.parse(stored);
          if (parsed && parsed.id) {
            setActiveVenue(parsed);
            // KÖK NEDEN ÇÖZÜMÜ 1: Sadece localStorage'dan okuma, arkadan güncelini de çek!
            bindVenueById(parsed.id);
          }
        } catch {
          localStorage.removeItem(VENUE_STORAGE_KEY);
        }
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── AUTH SESSION HANDLER ──────────────────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const handleSession = async (session: any, event?: string) => {
      if (!session?.user || !session.user.id) { setUser(null); userIdRef.current = null; return; }

      const authUser = session.user;
      const metadata = authUser.user_metadata || {};
      const fullName = metadata.full_name || metadata.name || authUser.email?.split('@')[0] || 'Kullanıcı';
      const avatarUrl = metadata.avatar_url || metadata.picture || '';
      const emailStr = authUser.email || '';

      userIdRef.current = authUser.id;

      if (supabase && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        const profileData = {
          id: authUser.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          email: emailStr,
          updated_at: new Date().toISOString()
        };

        try {
          const { error } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
          if (error) console.error('[Muzikors Profile Sync Error]:', error.message);
        } catch (err) {
          console.error('[Muzikors Profile Catch Error]:', err);
        }
      }

      const liveCredits = await fetchProfileCredits(authUser.id);

      setUser((prev) => ({
        id: authUser.id,
        name: fullName,
        username: '@' + (emailStr.split('@')[0] || 'kullanici'),
        email: emailStr,
        avatar: authUser.user_metadata?.avatar_url || prev?.avatar || avatarUrl,
        credits: liveCredits.real,
        promo_credits: liveCredits.promo,
        totalSongsRequested: prev?.totalSongsRequested ?? 0,
        lifetimeCredits: prev?.lifetimeCredits ?? liveCredits.real,
        loginMethod: 'google',
      }));


    };

    supabase.auth.getSession().then(({ data: { session } }) => handleSession(session, 'INITIAL_SESSION'));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        userIdRef.current = null;
      } else {
        handleSession(session, event);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfileCredits]);

  // ── SUPABASE REALTIME: PROFILES ───────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !user?.id) return;
    const channel = supabase
      .channel(`profiles:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        const row = payload.new as any;
        setUser((prev) =>
          prev
            ? {
                ...prev,
                credits: typeof row?.credits === 'number' ? row.credits : prev.credits,
                totalSongsRequested: typeof row?.total_songs_requested === 'number' ? row.total_songs_requested : prev.totalSongsRequested,
                lifetimeCredits: typeof row?.lifetime_credits === 'number' ? row.lifetime_credits : prev.lifetimeCredits,
                lastDailyClaim: row?.last_daily_claim ?? prev.lastDailyClaim,
              }
            : null
        );

      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // ── SUPABASE REALTIME: SONG QUEUE (venue-isolated) ────────────────────────
  useEffect(() => {
    if (!supabase) return;

    // Helper: get target integer venue_id from activeVenue or localStorage
    const getActiveVenueIntId = (): number | null => {
      if (activeVenue?.id) {
        const p = parseInt(activeVenue.id, 10);
        if (!isNaN(p)) return p;
      }
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(VENUE_STORAGE_KEY);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (parsed?.id) {
              const pid = parseInt(parsed.id, 10);
              if (!isNaN(pid)) return pid;
            }
          } catch {}
        }
      }
      return null;
    };

    const targetVenueId = getActiveVenueIntId();

    // If user is not bound to a cafe, clear queue state and DO NOT query global queue
    if (!targetVenueId) {
      setNowPlaying(null);
      setQueue([]);
      return;
    }

    const fetchQueue = async () => {
      try {
        const { data: venueData, error: venueError } = await supabase
          .from('venues')
          .select('id, venue_name, explicit_filter_enabled, allowed_genres, current_track_info')
          .eq('id', targetVenueId)
          .single();

        const { data, error } = await supabase
          .from('queue')
          .select('*')
          .eq('venue_id', targetVenueId)
          .in('status', ['playing', 'pending', 'queued'])
          .order('votes', { ascending: false })
          .order('created_at', { ascending: true });

        if (error) { console.error('[Queue fetch error]', error.message); }
        const rawData = data || [];

        // Filter finished songs or zombie tracks
        const validRows: any[] = [];
        for (const r of rawData) {
          if (r.status === 'playing' && r.started_at) {
            const elapsedMs = Date.now() - new Date(r.started_at).getTime();
            const durationMs = r.duration_ms ?? 210000;
            if (elapsedMs >= durationMs) {
              // User App MUST NEVER mutate DB state. We simply hide it from UI if it's stuck.
              continue;
            }
          }
          validRows.push(r);
        }

        let playingRow = validRows.find((r) => r.status === 'playing');
        let upcomingRows = validRows.filter((r) => r.id !== playingRow?.id && (r.status === 'queued' || r.status === 'pending'));


        const toTrack = (r: any): Track => {
          const cover = r.album_cover || '';
          return {
            id: r.id,
            title: r.song_name || r.song_title || '',
            artist: r.artist_name || r.artist || '',
            album: '',
            albumCover: cover,
            coverUrl: cover,
            album_art: cover,
            spotifyUri: r.spotify_uri,
            durationMs: r.duration_ms ?? 210000,
            duration: Math.round((r.duration_ms ?? 210000) / 1000),
            creditCost: r.credits_spent ?? 10,
            votes: r.votes ?? 0,
            requestedBy: r.requested_by_name || 'Misafir',
            requestedAt: 'Sirada',
            startedAt: r.started_at,
            isPlaying: r.status === 'playing',
          };
        };

        // PRIMARY SOURCE OF TRUTH FOR NOW PLAYING: venues.current_track_info
        if (venueData?.current_track_info) {
          const trackInfo = venueData.current_track_info;
          setNowPlaying({
            id: trackInfo.spotify_track_id || playingRow?.id || 'live-track',
            title: trackInfo.song_title || 'Bilinmeyen Şarkı',
            artist: trackInfo.artist || 'Bilinmeyen Sanatçı',
            albumCover: trackInfo.album_cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
            coverUrl: trackInfo.album_cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
            album_art: trackInfo.album_cover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
            spotifyUri: trackInfo.spotify_track_id ? `spotify:track:${trackInfo.spotify_track_id}` : '',
            durationMs: 210000,
            duration: 210,
            creditCost: playingRow?.credits_spent ?? 0,
            votes: playingRow?.votes ?? 0,
            requestedBy: trackInfo.requested_by_name || 'Mekan Listesi',
            requestedAt: 'Canli',
            isPlaying: true,
          });
          setIsPlayingAudio(true);
        } else if (playingRow) {
          // Fallback if current_track_info is not yet available but we have a playing queue item
          setNowPlaying({ ...toTrack(playingRow), requestedAt: 'Canli' });
          setIsPlayingAudio(true);
        } else {
          setNowPlaying(null);
          setIsPlayingAudio(false);
        }

        setQueue(upcomingRows.map(toTrack));
      } catch (err) {
        console.error('[Queue fetch exception]', err);
        setNowPlaying(null); setQueue([]);
      }
    };

    fetchQueue();

    // Unified zero-latency realtime channel for venue state, queue events, and playback broadcast
    const venueChannel = supabase
      .channel(`realtime_venue_${targetVenueId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'venues',
          filter: `id=eq.${targetVenueId}`,
        },
        (payload) => {
          if (payload.new) {
            const row = payload.new as any;
            setActiveVenue((prev) =>
              prev
                ? {
                    ...prev,
                    is_active: row.is_active ?? prev.is_active,
                    is_tv_active: row.is_tv_active ?? prev.is_tv_active,
                    is_paused: row.is_paused === true,
                    explicit_filter_enabled: row.explicit_filter_enabled === true,
                    allowed_genres: row.allowed_genres ?? prev.allowed_genres,
                    current_track_info: row.current_track_info,
                  }
                : null
            );
            // Auto re-sync player state if the venue track info changes
            fetchQueue();
          }
        }
      )
      .on('broadcast', { event: 'playback_state' }, ({ payload }) => {
        if (payload) {
          setLivePlaybackState(payload);
        }
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue',
          filter: `venue_id=eq.${targetVenueId}`,
        },
        () => {
          fetchQueue(); // Instant refresh on skip, pause, or new song request
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Venue and Queue channel active.');
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          console.warn(`[Realtime] Connection issue: ${status}. Fallback interval will keep syncing.`);
        }
      });

    const fallbackInterval = setInterval(() => {
      fetchQueue();
    }, 3000);

    return () => {
      clearInterval(fallbackInterval);
      supabase.removeChannel(venueChannel);
    };
  }, [activeVenue?.id]); // Re-subscribe when venue changes

  // Update nowPlaying when livePlaybackState changes if no Muzikors queue song is active
  useEffect(() => {
    if (!livePlaybackState) return;
    if (!nowPlaying || nowPlaying.id === 'spotify-bg') {
      setNowPlaying({
        id: 'spotify-bg',
        title: livePlaybackState.title || 'Mekan Fon Müziği',
        artist: livePlaybackState.artist || 'Muzikors Yayın',
        album: '',
        albumCover: livePlaybackState.album_art || '',
        coverUrl: livePlaybackState.album_art || '',
        album_art: livePlaybackState.album_art || '',
        durationMs: livePlaybackState.duration_ms || 210000,
        duration: Math.round((livePlaybackState.duration_ms || 210000) / 1000),
        creditCost: 0,
        votes: 0,
        requestedBy: 'Mekan Fon Müziği',
        requestedAt: 'Canli',
        isPlaying: livePlaybackState.is_playing,
      });
      setIsPlayingAudio(livePlaybackState.is_playing);
    }
  }, [livePlaybackState]);

  // ── AUDIO PROGRESS TIMER & HARD DELETE FINISHED SONGS ────────────────────
  useEffect(() => {
    if (!isPlayingAudio || !nowPlaying) return;

    const timer = setInterval(() => {
      let elapsedSec = 0;

      if (nowPlaying.id === 'spotify-bg' && livePlaybackState) {
        const elapsedMs = livePlaybackState.progress_ms + (livePlaybackState.is_playing ? Date.now() - livePlaybackState.updated_at : 0);
        elapsedSec = Math.min(Math.round(livePlaybackState.duration_ms / 1000), Math.floor(elapsedMs / 1000));
      } else if (nowPlaying.startedAt) {
        const elapsedMs = Math.max(0, Date.now() - new Date(nowPlaying.startedAt).getTime());
        elapsedSec = Math.floor(elapsedMs / 1000);
      } else {
        setAudioProgress((prev) => prev + 1);
        return;
      }

      setAudioProgress(elapsedSec);
      const trackDurationSec = nowPlaying.duration ?? 180;

      if (nowPlaying.id !== 'spotify-bg' && elapsedSec >= trackDurationSec) {
        // User App NEVER transitions queue state. It only visually clears the active playback
        // until Realtime syncs the true state from Kafe Paneli or Spotify API.
        setNowPlaying(null);
        setIsPlayingAudio(false);
        setAudioProgress(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlayingAudio, nowPlaying, queue, livePlaybackState]);

  // ── COOLDOWN TIMER ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!cooldown.active || cooldown.remainingSeconds <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev.remainingSeconds <= 1) return { active: false, remainingSeconds: 0, lastRequestedAt: prev.lastRequestedAt };
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown.active, cooldown.remainingSeconds]);

  const openModal = useCallback((modal: ModalType) => { setLoginPromptReason(null); setActiveModal(modal); }, []);
  const openProtectedModal = useCallback((modal: ModalType, reason?: string) => {
    if (!user) { setPendingModal(modal); setLoginPromptReason(reason || 'Devam etmek icin giris yapin'); setActiveModal('login'); return; }
    setActiveModal(modal);
  }, [user]);
  const closeModal = useCallback(() => { setActiveModal('none'); setPendingModal(null); setLoginPromptReason(null); }, []);

  const loginWithProvider = useCallback(async (provider: 'google') => {
    if (!supabase) return;
    const redirectUrl = 'https://muzikors.com.tr/auth/callback';
    try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: redirectUrl },
        });
        if (error) { console.error('[OAuth Google]', error); showToast('Giris yapilamadi.'); }
    } catch (err) { console.error('[OAuth]', err); showToast('Giris yapilamadi.'); }
  }, [showToast]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null); userIdRef.current = null;
    showToast('Cikis yapildi.'); closeModal();
  }, [showToast, closeModal]);

  const topUpCredits = useCallback(async (packageId: string) => {
    if (!user) { openProtectedModal('topup'); return; }
    const pkg = CREDIT_PACKAGES.find((p) => p.id === packageId);
    if (!pkg) return;
    const totalAdded = pkg.credits + pkg.bonusCredits;
    
    if (!activeVenue) {
      showToast('Kredi yüklemek için önce bir mekânın QR kodunu okutmalısınız.');
      return;
    }

    try {
      showToast('Güvenli ödeme sayfasına yönlendiriliyorsunuz...');
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          venueId: activeVenue.id,
          packageId: pkg.id,
          amount: pkg.priceTL,
          creditAmount: totalAdded,
          userId: user.id
        })
      });
      const data = await response.json();
      if (data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl; // Redirect to iyzico
      } else {
        showToast('Ödeme başlatılamadı: ' + (data.error || 'Bilinmeyen hata'));
      }
    } catch (err) {
      showToast('Ödeme sistemiyle bağlantı kurulamadı.');
    }
  }, [user, activeVenue, openProtectedModal, showToast]);

  const getGuestDeviceId = () => {
    let guestId = localStorage.getItem('muzikors_guest_id');
    if (!guestId) {
      guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('muzikors_guest_id', guestId);
    }
    return guestId;
  };

  // ── REQUEST TRACK: with venue isolation + financial split ─────────────────
  const requestTrack = useCallback(async (track: Track, isAnonymous?: boolean): Promise<boolean> => {
    // Venue guard
    if (!activeVenue) {
      showToast('Şarkı istemek için önce bir QR kod okutun!');
      return false;
    }
    if (activeVenue.is_active === false) {
      showToast('Bu mekan şu an hizmet vermemektedir.');
      return false;
    }

    // Spotify guard: venue must have a connected Spotify account
    if (activeVenue.has_spotify === false) {
      showToast('Bu mekan henüz Spotify hesabını bağlamamış. Şarkı eklenemiyor.');
      return false;
    }

    if (activeVenue.explicit_filter_enabled === true && (track.explicit === true || (track as any).is_explicit === true)) {
      showToast('Bu mekanda küfürlü / sansürsüz şarkı talebi engellenmiştir.');
      return false;
    }

    const trackDurationMs = (track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 210000);
    const requiredCredits = getSongCreditCost(trackDurationMs);

    if (requiredCredits === null) {
      showToast('7 dakikadan uzun sarkilar mekan akisi icin eklenemez!');
      return false;
    }

    if (cooldown.active) {
      const m = Math.floor(cooldown.remainingSeconds / 60); const s = cooldown.remainingSeconds % 60;
      showToast(`Anti-Spam aktif! ${m}:${s < 10 ? '0' : ''}${s} bekleyin.`); return false;
    }

    let liveReal = 0;
    let livePromo = 0;
    if (user) {
      const balances = await fetchProfileCredits(user.id);
      liveReal = balances.real;
      livePromo = balances.promo;
    }

    if (requiredCredits > 0 && liveReal < requiredCredits && livePromo < requiredCredits) {
      if (!user) {
        openProtectedModal('search', 'Şarkı eklemek için giriş yapın (Ücretli Şarkı)');
        return false;
      }
      showToast(`Bu şarkı için ${requiredCredits} kredi gerekiyor. Yetersiz bakiye!`);
      openModal('topup'); return false;
    }



    const venueId = parseInt(activeVenue.id, 10);
    const targetSpotifyUri = track.spotifyUri || `spotify:track:${track.id}`;

    // ── DUPLICATE TRACK CHECK ────────────────────────────────────────────
    if (supabase) {
      const { data: existingTrack } = await supabase
        .from('queue')
        .select('id, status')
        .eq('venue_id', venueId)
        .eq('spotify_uri', targetSpotifyUri)
        .in('status', ['pending', 'queued', 'playing'])
        .maybeSingle();

      if (existingTrack) {
        showToast('Bu şarkı zaten sırada veya çalıyor!');
        return false;
      }
    }

    // ── FRONTEND TIMEZONE & CLOSING CHECK ────────────────────────────────
    if (activeVenue.opening_time && activeVenue.closing_time) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentTotal = currentHours * 60 + currentMinutes;

      const [openH, openM] = activeVenue.opening_time.split(':').map(Number);
      const [closeH, closeM] = activeVenue.closing_time.split(':').map(Number);
      
      const openTotal = openH * 60 + openM;
      let closeTotal = closeH * 60 + closeM;
      let checkTotal = currentTotal;

      // Gece yarısını aşan kapanış saatleri için (örn. 10:00 - 02:00)
      if (closeTotal <= openTotal) {
        closeTotal += 24 * 60; // Kapanışa 1 tam gün ekle
        
        // Eğer şu an saat gece yarısını geçmişse (örn 01:00) ve açılış saatinden küçükse
        // Kontrol edilen saati de ertesi güne taşı (24 saat ekle)
        if (currentTotal < openTotal) {
          checkTotal += 24 * 60;
        }
      }

      // 1. Kapalı mı kontrolü
      if (checkTotal < openTotal || checkTotal >= closeTotal) {
        showToast('Mekan şu an kapalı. Çalışma saatleri dışında istek gönderemezsiniz.');
        return false;
      }

      // 2. Kapanmak üzere kontrolü (Son 45 dakika)
      const minutesUntilClose = closeTotal - checkTotal;
      if (minutesUntilClose <= 45) {
        showToast('Mekan kapanmak üzere, yarın görüşürüz.');
        return false;
      }
    }

    // ── QUEUE LIMIT CHECK ────────────────────────────────────────────────
    if (supabase) {
      const songDurationMs = track.durationMs ?? (track.duration ? track.duration * 1000 : 210000);
      const { data: limitCheck, error: limitErr } = await supabase.rpc('check_queue_availability', {
        p_venue_id: venueId,
        p_new_song_duration_ms: songDurationMs
      });

      if (!limitErr && limitCheck) {
        if (!limitCheck.allowed) {
          if (limitCheck.reason === 'queue_full') {
            showToast('Sıra çok dolu, şarkınız kapanıştan önce çalınamayacağı için alınamadı.');
          } else if (limitCheck.reason === 'closed_now') {
            showToast('Mekan şu an kapalı.');
          } else {
            showToast('Mekan şu an istek kabul etmiyor.');
          }
          return false;
        }
      }
    }

    const requestUserId = user?.id || null;
    
    // Name Masking Logic
    let requestedByName = 'Müşteri';
    if (isAnonymous) {
      requestedByName = 'Anonim Müşteri';
    } else if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length > 1) {
        const lastName = parts.pop();
        requestedByName = `${parts.join(' ')} ${lastName?.charAt(0)}.***`;
      } else {
        requestedByName = `${user.name.charAt(0)}.***`;
      }
    }

    try {
      if (supabase && user) {
        const { data, error: rpcErr } = await supabase.rpc('request_track_acid', {
          p_venue_id: Number(venueId),
          p_song_name: track.title,
          p_artist_name: track.artist,
          p_album_cover: track.albumCover || track.coverUrl || track.album_art || '',
          p_spotify_uri: targetSpotifyUri,
          p_duration_ms: track.durationMs ?? (track.duration ? track.duration * 1000 : 210000),
          p_credits_spent: requiredCredits,
          p_requested_by_name: requestedByName,
          p_is_anonymous: isAnonymous || false
        });

        if (rpcErr) {
          console.error('[requestTrack RPC Error]', rpcErr.message);
          showToast(rpcErr.message || 'Şarkı eklenemedi.');
          return false;
        }

        // Fetch fresh credits after successful ACID transaction
        if (user) {
          await fetchProfileCredits(user.id);
        }
      }
    } catch (err: any) {
      console.error('[requestTrack Catch Error]', err);
      showToast(err?.message || 'Bir hata oluştu.');
      return false;
    }

    const newTrack: Track = {
      ...track,
      id: `req-${Date.now()}`,
      votes: 0,
      requestedBy: isAnonymous ? 'Anonim Müşteri' : (user?.name || 'Müşteri'),
      requestedByAvatar: isAnonymous ? '' : (user?.avatar || ''),
      requestedAt: 'Simdi',
      startedAt: undefined,
    };

    setQueue((prev) => [...prev, newTrack]);
    setCooldown({ active: true, remainingSeconds: 30, lastRequestedAt: Date.now() });
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#FFFFFF', '#FCEFD5'] });
    showToast(`"${track.title}" siraya eklendi!`); closeModal(); return true;
  }, [user, cooldown, nowPlaying, activeVenue, fetchProfileCredits, openProtectedModal, openModal, showToast, closeModal, supabase]);

  const voteTrack = useCallback(async (trackId: string) => {
    if (!user) { openProtectedModal('search', 'Oy vermek icin giris yapin'); return; }

    try {
      let currentVotesForUser = 0;
      if (supabase) {
        const { data: userVoteRow, error: voteFetchErr } = await supabase
          .from('song_user_votes')
          .select('vote_count')
          .eq('user_id', user.id)
          .eq('song_id', trackId)
          .maybeSingle();
        
        if (voteFetchErr) {
          console.error('[voteTrack fetch]', voteFetchErr.message);
        }

        currentVotesForUser = userVoteRow?.vote_count ?? 0;
      }

      if (currentVotesForUser >= 5) {
        showToast('Bu şarkıyı en fazla 5 kez beğenebilirsiniz.');
        return;
      }

      const balances = await fetchProfileCredits(user.id);
      if (balances.real < 1 && balances.promo < 1) { showToast('Yetersiz kredi!'); openModal('topup'); return; }

      let newReal = balances.real;
      let newPromo = balances.promo;
      let usedPromo = false;

      if (balances.promo >= 1) {
        newPromo -= 1;
        usedPromo = true;
      } else {
        newReal -= 1;
        usedPromo = false;
      }

      const newVotesForUser = currentVotesForUser + 1;

      if (supabase) {
        if (usedPromo) {
          await supabase.from('profiles').update({ promo_credits: newPromo }).eq('id', user.id);
          setUser(prev => prev ? { ...prev, promo_credits: newPromo } : null);
        } else {
          await supabase.from('profiles').update({ credits: newReal }).eq('id', user.id);
          setUser(prev => prev ? { ...prev, credits: newReal } : null);
        }
        
        const { error: upsertErr } = await supabase.from('song_user_votes').upsert(
          { user_id: user.id, song_id: trackId, vote_count: newVotesForUser },
          { onConflict: 'user_id,song_id' }
        );
        if (upsertErr) {
          console.error('[voteTrack upsert]', upsertErr.message);
        }
        
        const { data: voteData } = await supabase.from('queue').select('votes').eq('id', trackId).single();
        if (voteData) {
          await supabase.from('queue').update({ votes: (voteData.votes ?? 1) + 1 }).eq('id', trackId);
        }
      }


      setQueue((prev) => [...prev].map((t) => t.id === trackId ? { ...t, votes: t.votes + 1 } : t).sort((a, b) => b.votes - a.votes));
      showToast(`Şarkı beğenildi! (Oy hakkınız: ${newVotesForUser}/5)`);
    } catch (err) {
      console.error('[voteTrack exception]', err);
      showToast('Oylama sirasinda bir hata olustu.');
    }
  }, [user, fetchProfileCredits, openProtectedModal, openModal, showToast]);

  const deleteAccount = useCallback(async () => {
    if (!supabase || !user) return;
    try {
      const { error } = await supabase.rpc('delete_user_account');
      if (error) {
        console.error('Hesap silme hatası:', error);
        showToast('Hesap silinirken bir hata oluştu: ' + error.message);
        return;
      }
      
      // 2. Clear all local state, storage, and Supabase auth session
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      setUser(null);
      showToast('Hesabınız ve tüm verileriniz başarıyla silindi.');
      
      // 3. Force hard redirect to home page so state resets completely
      if (typeof window !== 'undefined') {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('[deleteAccount error]', error);
      showToast('Beklenmeyen bir hata oluştu.');
    }
  }, [user, showToast, supabase]);

  const toggleAudioPlay = useCallback(() => setIsPlayingAudio((p) => !p), []);

  return (
    <AppContext.Provider value={{
      user, setUser, activeModal, activeVenue, kafeIdParam,
      isVenueBound, isVenueActive,
      nowPlaying, queue,
      cooldown, toastMessage, loginPromptReason, audioProgress, isPlayingAudio,
      openModal, openProtectedModal, closeModal, loginWithProvider, logout,
      topUpCredits, requestTrack, voteTrack, bindVenueById, deleteAccount, showToast, toggleAudioPlay,
      hasEnteredGateway, setHasEnteredGateway
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
