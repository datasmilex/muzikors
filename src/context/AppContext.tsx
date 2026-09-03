'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, ModalType, Track, Venue, CooldownState } from '../types';
import { supabase } from '../lib/supabaseClient';
import { ThemeType, getStoredTheme, applyTheme } from '../lib/theme';
import { formatUserDisplayName } from '../utils/formatters';
import { containsProfanity } from '../utils/profanityFilter';
import { isTrackAllowedByVibeGuard } from '../utils/genreMatcher';
import { getLevelDetails, XP_REWARDS } from '../utils/levelSystem';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { useRouter } from 'next/navigation';

const VENUE_STORAGE_KEY = 'muzikors_active_venue';

interface AppContextType {
  user: UserProfile | null;
  activeModal: ModalType;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
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
  viewingProfileId: string | null;
  openProfile: (userId?: string) => void;

  logout: () => Promise<void>;
  handleIyzicoPayment: (packageId: string) => void;
  iyzicoHtml: string | null;
  requestTrack: (track: Track, isAnonymous?: boolean, isBoosted?: boolean, message?: string) => Promise<boolean>;
  vetoTrack: (trackId: string, isAnonymous?: boolean) => Promise<boolean>;
  voteTrack: (trackId: string) => void;
  addXp: (amount: number, reason?: string) => Promise<void>;
  bindVenueById: (kafeId: string) => void;
  deleteAccount: () => void;
  showToast: (msg: string) => void;
  toggleAudioPlay: () => void;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  pendingRewardTrack: Track | null;
  openRewardedAdModal: (track?: Track | null, options?: { isAnonymous?: boolean; isBoosted?: boolean; message?: string }) => void;
  claimRewardAndQueueTrack: () => Promise<boolean>;
  claimDailyReward: () => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const COOLDOWN_DURATION_SECONDS = 120;
const DEFAULT_CREDITS = 10;

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const [theme, setThemeState] = useState<ThemeType>('velvet');
  const [pendingModal, setPendingModal] = useState<ModalType | null>(null);
  const [loginPromptReason, setLoginPromptReason] = useState<string | null>(null);
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null);
  const [iyzicoHtml, setIyzicoHtml] = useState<string | null>(null);
  const [kafeIdParam, setKafeIdParam] = useState<string | null>(null);
  const [nowPlaying, setNowPlaying] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [pendingRewardTrack, setPendingRewardTrack] = useState<Track | null>(null);
  const [pendingRewardOptions, setPendingRewardOptions] = useState<{ isAnonymous?: boolean; isBoosted?: boolean; message?: string } | null>(null);

  const openRewardedAdModal = useCallback((track?: Track | null, options?: { isAnonymous?: boolean; isBoosted?: boolean; message?: string }) => {
    setPendingRewardTrack(track || null);
    setPendingRewardOptions(options || null);
    setActiveModal('rewarded_ad');
  }, []);

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
  const venueChannelRef = useRef<any>(null);
  const lastNotifiedTrackRef = useRef<string | null>(null);
  const prevTrackIdRef = useRef<string | null>(null);

  // Derived venue state
  const isVenueBound = activeVenue !== null;
  const isVenueActive = activeVenue?.is_active !== false; // true if active or undefined

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // ── "MY SONG IS PLAYING" REALTIME NOTIFICATION & HAPTIC VIBRATION ───────────
  useEffect(() => {
    if (!nowPlaying || !user?.id) return;
    const isMyTrack = nowPlaying.requestedByUserId === user.id || (user.name && nowPlaying.requestedBy && nowPlaying.requestedBy.toLowerCase().includes(user.name.toLowerCase()));
    
    if (isMyTrack && nowPlaying.id && nowPlaying.id !== 'spotify-bg' && lastNotifiedTrackRef.current !== nowPlaying.id) {
      lastNotifiedTrackRef.current = nowPlaying.id;
      
      // Haptic Vibration feedback
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([300, 150, 300]);
        } catch (e) {}
      }

      // Celebratory Toast
      showToast(`🎉 İstediğin Şarkı Başladı! "${nowPlaying.title}" şu an mekanda çalıyor! Arkana yaslan ve keyfini çıkar`);

      // Browser Notification if permitted
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('🎶 İstediğin Şarkı Mekanda Çalıyor!', {
            body: `"${nowPlaying.title} - ${nowPlaying.artist}" şu an başladı!`,
            icon: nowPlaying.albumCover || '/logo.png'
          });
        } catch (e) {}
      }
    }
  }, [nowPlaying?.id, nowPlaying?.title, user?.id, user?.name, showToast]);

  // ── THEME INITIALIZATION & MANAGEMENT ─────────────────────────────────────
  useEffect(() => {
    const saved = getStoredTheme();
    setThemeState(saved);
    applyTheme(saved);
  }, []);

  const setTheme = useCallback((newTheme: ThemeType) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
  }, []);

  // ── PREVENT BODY SCROLL WHEN MODAL IS ACTIVE ──────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (activeModal !== 'none') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModal]);

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
        menu_type: data.menu_type || 'external',
        logo_url: data.logo_url || data.logo || '',
        spotify_client_id: data.spotify_client_id || null,
        has_spotify: !!(data.spotify_refresh_token),
        opening_time: data.opening_time || null,
        closing_time: data.closing_time || null,
        current_track_info: data.current_track_info || null
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

  // ── DEEP LINKING (APP LINKS) ──────────────────────────────────────────────
  useEffect(() => {
    let listener: any = null;
    const setupListener = async () => {
      try {
        listener = await App.addListener('appUrlOpen', async (event) => {
          console.log('[AppUrlOpen] Received raw URL:', event.url);
          
          if (Capacitor.isNativePlatform()) {
            Browser.close().catch(() => {});
          }

          const rawUrl = event.url;

          // ── OAUTH CALLBACK: handle directly here (router.push doesn't update window.location in static export)
          if (rawUrl.includes('auth/callback') || rawUrl.includes('code=') || rawUrl.includes('access_token=')) {
            console.log('[AppUrlOpen] OAuth callback detected, processing...');

            try {
              // Extract query string — works for both muzikors://auth/callback?code=... and https://...?code=...
              const queryStart = rawUrl.indexOf('?');
              const hashStart = rawUrl.indexOf('#');
              
              // Try code flow (PKCE)
              if (queryStart !== -1) {
                const queryString = rawUrl.slice(queryStart + 1);
                const params = new URLSearchParams(queryString);
                const code = params.get('code');
                const errorParam = params.get('error');

                if (errorParam) {
                  console.error('[AppUrlOpen] OAuth error:', params.get('error_description') || errorParam);
                  return;
                }

                if (code) {
                  console.log('[AppUrlOpen] Exchanging code for session...');
                  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
                  if (exchangeError) {
                    console.error('[AppUrlOpen] exchangeCodeForSession error:', exchangeError.message);
                  } else if (data?.session) {
                    console.log('[AppUrlOpen] Session established! User:', data.session.user.email);
                    // onAuthStateChange in AppContext will fire automatically and set the user
                  }
                  return;
                }
              }

              // Try implicit flow (token in hash)
              if (hashStart !== -1) {
                const hashString = rawUrl.slice(hashStart + 1);
                const params = new URLSearchParams(hashString);
                const accessToken = params.get('access_token');
                const refreshToken = params.get('refresh_token');
                
                if (accessToken && refreshToken) {
                  console.log('[AppUrlOpen] Setting session from hash tokens...');
                  const { error: sessionError } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                  });
                  if (sessionError) {
                    console.error('[AppUrlOpen] setSession error:', sessionError.message);
                  } else {
                    console.log('[AppUrlOpen] Session set from hash tokens!');
                  }
                  return;
                }
              }
            } catch (err) {
              console.error('[AppUrlOpen] OAuth processing error:', err);
            }
            return; // Don't route to callback page
          }

          // ── REGULAR DEEP LINKS ──────────────────────────────────────────
          let slug = '';
          if (rawUrl.startsWith('muzikors://')) {
            slug = rawUrl.replace('muzikors://', '/');
          } else if (rawUrl.includes('.com.tr')) {
            slug = rawUrl.split('.com.tr').pop() || '';
          }
          
          console.log('[AppUrlOpen] Computed slug:', slug);
          if (slug) {
            console.log('[AppUrlOpen] Pushing to router:', slug);
            router.push(slug);
          }
        });
      } catch (err) {
        console.warn('[AppUrlOpen] Not running in native capacitor environment', err);
      }
    };
    setupListener();

    return () => {
      if (listener) {
        listener.remove();
      }
    };
  }, [router]);

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
      const googleAvatarUrl = metadata.avatar_url || metadata.picture || '';
      const emailStr = authUser.email || '';

      userIdRef.current = authUser.id;

      // Helper: check if a URL is a Google/OAuth auto-generated photo
      const isGooglePhoto = (url: string) =>
        url.includes('googleusercontent.com') ||
        url.includes('google.com/a/') ||
        url.includes('lh3.google') ||
        url.includes('lh4.google') ||
        url.includes('lh5.google') ||
        url.includes('lh6.google');

      let customAvatarUrl: string = '';
      let dbUsername: string | null = null;
      let dbLastUsernameUpdate: string | null = null;
      let dbProfile: any = {};
      if (supabase) {
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('avatar_url, username, last_username_update, is_premium, is_beta_tester, beta_tester_reward_claimed, avatar_frame, total_songs_requested, daily_songs_count, daily_votes_count, daily_boosts_count, daily_vetoes_count, last_reset_date, premium_until, premium_activated_at, xp, level, daily_liked_songs_xp, last_daily_claim, daily_streak')
          .eq('id', authUser.id)
          .single();
        if (existingProfile) {
          const todayInTurkey = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Istanbul',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          }).format(new Date());

          const isNewDay = !existingProfile.last_reset_date || existingProfile.last_reset_date !== todayInTurkey;
          if (isNewDay) {
            existingProfile.daily_songs_count = 0;
            existingProfile.daily_votes_count = 0;
            existingProfile.daily_boosts_count = 0;
            existingProfile.daily_vetoes_count = 0;
            existingProfile.daily_liked_songs_xp = 0;
            existingProfile.last_reset_date = todayInTurkey;

            // Trigger DB reset in background
            (async () => {
              try {
                await supabase.rpc('check_and_reset_daily_limits_self');
              } catch (e) {
                console.warn('[daily_limits_self]', e);
              }
            })();
          }

          // Check VIP 1-month expiration
          const isPremiumValid = !!existingProfile.is_premium && (!existingProfile.premium_until || new Date(existingProfile.premium_until).getTime() > Date.now());
          if (existingProfile.is_premium && !isPremiumValid) {
            existingProfile.is_premium = false;
          }

          // Only keep the avatar if it is NOT a Google photo
          const raw = existingProfile.avatar_url || '';
          customAvatarUrl = raw && !isGooglePhoto(raw) ? raw : '';
          dbUsername = existingProfile.username || null;
          dbLastUsernameUpdate = existingProfile.last_username_update || null;
          dbProfile = existingProfile;
        }
      }

      if (supabase && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
        // Never store the Google photo — only upsert non-avatar profile fields
        const profileData: any = {
          id: authUser.id,
          full_name: fullName,
          email: emailStr,
          updated_at: new Date().toISOString(),
          // Clear any previously stored Google photo
          ...(customAvatarUrl === '' && { avatar_url: null }),
        };

        try {
          const { error } = await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
          if (error) console.error('[Muzikors Profile Sync Error]:', error.message);
        } catch (err) {
          console.error('[Muzikors Profile Catch Error]:', err);
        }

        // Close login modal after successful sign-in
        const checkVenueAndCredits = async () => {
          if (!authUser) return;
          if (!isVenueBound) return;
        };
        setActiveModal((prev) => (prev === 'login' ? 'none' : prev));
      }

      const totalXp = Number(dbProfile.xp ?? 0);
      const computedLevel = getLevelDetails(totalXp).level;

      setUser((prev) => ({
        ...(prev || ({} as any)),
        id: authUser.id,
        name: fullName,
        username: dbUsername || prev?.username || ('@' + (emailStr.split('@')[0] || 'kullanici')),
        // Use only custom (non-Google) avatar; empty string = show default icon
        avatar: customAvatarUrl,
        email: emailStr,
        totalSongsRequested: (dbProfile.total_songs_requested !== undefined && dbProfile.total_songs_requested !== null) ? Number(dbProfile.total_songs_requested) : (prev?.totalSongsRequested ?? 0),
        last_username_update: dbLastUsernameUpdate || prev?.last_username_update,
        isPremium: dbProfile.is_premium || false,
        is_beta_tester: dbProfile.is_beta_tester ?? prev?.is_beta_tester ?? false,
        beta_tester_reward_claimed: dbProfile.beta_tester_reward_claimed ?? prev?.beta_tester_reward_claimed ?? false,
        xp: totalXp,
        level: computedLevel,
        daily_liked_songs_xp: Number(dbProfile.daily_liked_songs_xp ?? 0),
        lastDailyClaim: dbProfile.last_daily_claim || prev?.lastDailyClaim || null,
        daily_streak: Number(dbProfile.daily_streak ?? prev?.daily_streak ?? 0),
        avatar_frame: dbProfile.avatar_frame || prev?.avatar_frame || 'none',
        premium_until: dbProfile.premium_until || null,
        premium_activated_at: dbProfile.premium_activated_at || null,
        daily_songs_count: dbProfile.daily_songs_count || 0,
        daily_votes_count: dbProfile.daily_votes_count || 0,
        daily_boosts_count: dbProfile.daily_boosts_count || 0,
        daily_vetoes_count: dbProfile.daily_vetoes_count || 0,
        last_reset_date: dbProfile.last_reset_date || null,
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
  }, []);

  // ── MIDNIGHT TURKEY DAILY RESET TICKER ────────────────────────────────────
  useEffect(() => {
    if (!supabase) return;

    const checkDailyReset = () => {
      const todayInTurkey = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Istanbul',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date());

      setUser((prev) => {
        if (!prev) return null;
        if (!prev.last_reset_date || prev.last_reset_date !== todayInTurkey) {
          if (supabase) {
            (async () => {
              try {
                await supabase.rpc('check_and_reset_daily_limits_self');
              } catch (e) {
                console.warn('[daily_limits_self ticker]', e);
              }
            })();
          }
          return {
            ...prev,
            daily_songs_count: 0,
            daily_votes_count: 0,
            daily_boosts_count: 0,
            daily_vetoes_count: 0,
            last_reset_date: todayInTurkey,
          };
        }
        return prev;
      });
    };

    checkDailyReset();
    const interval = setInterval(checkDailyReset, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // ── SUPABASE REALTIME: PROFILES ───────────────────────────────────────────
  useEffect(() => {
    if (!supabase || !user?.id) return;
    const channel = supabase
      .channel(`profiles:${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` }, (payload) => {
        const row = payload.new as any;
        const todayInTurkey = new Intl.DateTimeFormat('en-CA', {
          timeZone: 'Europe/Istanbul',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        }).format(new Date());
        const isNewDay = !row?.last_reset_date || row?.last_reset_date !== todayInTurkey;

        setUser((prev) => {
          if (!prev) return null;
          const updatedXp = typeof row?.xp === 'number' ? row.xp : (prev.xp ?? 0);
          const computedLvl = getLevelDetails(updatedXp).level;
          return {
            ...prev,
            totalSongsRequested: typeof row?.total_songs_requested === 'number' ? row.total_songs_requested : prev.totalSongsRequested,
            lastDailyClaim: row?.last_daily_claim ?? prev.lastDailyClaim,
            username: row?.username ? row.username : prev.username,
            last_username_update: row?.last_username_update ?? prev.last_username_update,
            avatar: row?.avatar_url ?? prev.avatar,
            xp: updatedXp,
            level: computedLvl,
            daily_liked_songs_xp: isNewDay ? 0 : (typeof row?.daily_liked_songs_xp === 'number' ? row.daily_liked_songs_xp : (prev.daily_liked_songs_xp ?? 0)),
            daily_streak: typeof row?.daily_streak === 'number' ? row.daily_streak : (prev.daily_streak ?? 0),
            avatar_frame: row?.avatar_frame ?? prev.avatar_frame,
            is_beta_tester: row?.is_beta_tester ?? prev.is_beta_tester,
            beta_tester_reward_claimed: row?.beta_tester_reward_claimed ?? prev.beta_tester_reward_claimed,
            isPremium: (row?.is_premium !== undefined)
              ? (!!row.is_premium && (!row?.premium_until || new Date(row.premium_until).getTime() > Date.now()))
              : prev.isPremium,
            premium_until: row?.premium_until !== undefined ? row.premium_until : prev.premium_until,
            premium_activated_at: row?.premium_activated_at !== undefined ? row.premium_activated_at : prev.premium_activated_at,
            daily_songs_count: isNewDay ? 0 : (typeof row?.daily_songs_count === 'number' ? row.daily_songs_count : prev.daily_songs_count),
            daily_votes_count: isNewDay ? 0 : (typeof row?.daily_votes_count === 'number' ? row.daily_votes_count : prev.daily_votes_count),
            daily_boosts_count: isNewDay ? 0 : (typeof row?.daily_boosts_count === 'number' ? row.daily_boosts_count : prev.daily_boosts_count),
            daily_vetoes_count: isNewDay ? 0 : (typeof row?.daily_vetoes_count === 'number' ? row.daily_vetoes_count : prev.daily_vetoes_count),
            last_reset_date: isNewDay ? todayInTurkey : (row?.last_reset_date ?? prev.last_reset_date),
          };
        });

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
        let venueData: any = null;
        try {
          const { data: vData, error: venueError } = await supabase
            .from('venues')
            .select('id, venue_name, explicit_filter_enabled, allowed_genres, current_track_info, is_paused')
            .eq('id', targetVenueId)
            .maybeSingle();

          if (vData) {
            venueData = vData;
          } else if (venueError) {
            console.warn('[Venue fetch fallback]', venueError.message);
            const { data: fallbackData } = await supabase
              .from('venues')
              .select('id, venue_name, current_track_info')
              .eq('id', targetVenueId)
              .maybeSingle();
            venueData = fallbackData;
          }
        } catch (vErr) {
          console.error('[Venue fetch exception]', vErr);
        }

        if (venueData) {
          setActiveVenue(prev => prev ? {
            ...prev,
            is_paused: venueData.is_paused === true,
            explicit_filter_enabled: venueData.explicit_filter_enabled,
            allowed_genres: venueData.allowed_genres,
            current_track_info: venueData.current_track_info
          } : null);
        }

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
              continue;
            }
          }
          validRows.push(r);
        }

        const playingRow = validRows.find((r) => r.status === 'playing');
        const upcomingRows = validRows.filter((r) => r.id !== playingRow?.id && (r.status === 'queued' || r.status === 'pending'));


        const toTrack = (r: any): Track => {
          const cover = r.album_cover || '';
          const isAnon = r.is_anonymous === true || r.requested_by_name === 'Anonim';
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
            votes: r.votes ?? 0,
            requestedBy: r.requested_by_name || 'Misafir',
            requestedByUserId: r.requested_by_user_id,
            isAnonymous: isAnon,
            is_anonymous: isAnon,
            requestedAt: 'Sirada',
            startedAt: r.started_at,
            isPlaying: r.status === 'playing',
            isBoosted: r.is_boosted || false,
            message: r.message || undefined
          };
        };

        // PRIMARY SOURCE OF TRUTH FOR NOW PLAYING: venues.current_track_info
        if (venueData?.current_track_info) {
          const trackInfo = venueData.current_track_info;
          const trackDurationMs = trackInfo.duration_ms || (trackInfo.duration ? trackInfo.duration * 1000 : (playingRow?.duration_ms || 210000));
          const trackDurationSec = Math.round(trackDurationMs / 1000);
          const isPlaying = trackInfo.is_playing !== false && venueData.is_paused !== true;
          const isNowPlayingAnon = playingRow?.is_anonymous === true || trackInfo.requested_by_name === 'Anonim';
          const currentTrackKey = trackInfo.spotify_track_id || trackInfo.song_title || 'live-track';

          // Calculate elapsed seconds accurately
          let computedSec = 0;
          if (trackInfo.progress_ms !== undefined && trackInfo.progress_ms !== null) {
            if (!isPlaying) {
              computedSec = Math.floor(trackInfo.progress_ms / 1000);
            } else if (trackInfo.updated_at) {
              const msSinceSave = Math.max(0, Date.now() - new Date(trackInfo.updated_at).getTime());
              computedSec = Math.floor((trackInfo.progress_ms + msSinceSave) / 1000);
            } else {
              computedSec = Math.floor(trackInfo.progress_ms / 1000);
            }
          } else if (trackInfo.started_at) {
            if (isPlaying) {
              computedSec = Math.max(0, Math.floor((Date.now() - new Date(trackInfo.started_at).getTime()) / 1000));
            }
          }

          setAudioProgress(prev => {
            // Track change: jump to new track start
            if (prevTrackIdRef.current !== currentTrackKey) {
              prevTrackIdRef.current = currentTrackKey;
              return Math.min(trackDurationSec, Math.max(0, computedSec));
            }
            // Paused: freeze at computedSec
            if (!isPlaying) {
              return Math.min(trackDurationSec, Math.max(0, computedSec));
            }
            // Playing: only snap if drift is large (> 3 seconds) to prevent jumping back and forth
            if (Math.abs(prev - computedSec) > 3) {
              return Math.min(trackDurationSec, Math.max(0, computedSec));
            }
            return prev;
          });

          setNowPlaying(prev => {
            const trackTitle = trackInfo.song_title || trackInfo.title;
            const trackArtist = trackInfo.artist || 'Bilinmeyen Sanatçı';
            const trackCover = trackInfo.album_cover || trackInfo.album_art || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80';
            const isSameTrack = prev?.title === trackTitle || prev?.id === trackInfo.spotify_track_id;
            return {
              id: trackInfo.spotify_track_id || playingRow?.id || 'live-track',
              title: trackTitle || prev?.title || 'Bilinmeyen Şarkı',
              artist: trackArtist,
              albumCover: trackCover,
              coverUrl: trackCover,
              album_art: trackCover,
              spotifyUri: trackInfo.spotify_track_id ? `spotify:track:${trackInfo.spotify_track_id}` : '',
              durationMs: trackDurationMs,
              duration: trackDurationSec,
              votes: playingRow?.votes ?? prev?.votes ?? 0,
              requestedBy: (isSameTrack && prev?.requestedByUserId) ? prev.requestedBy : (trackInfo.requested_by_name || 'Mekan Fon Müziği'),
              requestedByUserId: (isSameTrack && prev?.requestedByUserId) ? prev.requestedByUserId : (trackInfo.requested_by_user_id || undefined),
              isAnonymous: isNowPlayingAnon,
              is_anonymous: isNowPlayingAnon,
              requestedAt: 'Canli',
              startedAt: trackInfo.started_at || null,
              isPlaying: isPlaying,
            };
          });
          setIsPlayingAudio(isPlaying);
        } else if (playingRow) {
          // Fallback if current_track_info is not yet available but we have a playing queue item
          const parsed = toTrack(playingRow);
          setNowPlaying({ ...parsed, requestedAt: 'Canli' });
          if (parsed.startedAt) {
            const elapsed = Math.max(0, Math.floor((Date.now() - new Date(parsed.startedAt).getTime()) / 1000));
            setAudioProgress(Math.min(parsed.duration || 180, elapsed));
          }
          setIsPlayingAudio(true);
        } else {
          setNowPlaying(null);
          setIsPlayingAudio(false);
          setAudioProgress(0);
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
                    current_track_info: row.current_track_info ?? prev.current_track_info,
                  }
                : null
            );
            // Auto re-sync player state if the venue track info changes
            fetchQueue();
          }
        }
      )
      .on('broadcast', { event: 'track_changed' }, ({ payload }) => {
        if (payload) {
          fetchQueue();
        }
      })
      .on('broadcast', { event: 'playback_state' }, ({ payload }) => {
        if (payload) {
          setLivePlaybackState(payload);
          const isPlaying = payload.is_playing === true;
          setIsPlayingAudio(isPlaying);

          const trackTitle = payload.song_title || payload.title;
          const trackArtist = payload.artist;
          const trackCover = payload.album_cover || payload.album_art;

          if (trackTitle && trackTitle.trim().length > 0) {
            setNowPlaying(prev => {
              if (prev && prev.title === trackTitle && prev.artist === trackArtist) {
                return { ...prev, isPlaying };
              }
              const durMs = payload.duration_ms || 210000;
              return {
                id: payload.spotify_track_id || prev?.id || 'live-track',
                title: trackTitle,
                artist: trackArtist || 'Bilinmeyen Sanatçı',
                albumCover: trackCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
                coverUrl: trackCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
                album_art: trackCover || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&q=80',
                spotifyUri: payload.spotify_track_id ? `spotify:track:${payload.spotify_track_id}` : '',
                durationMs: durMs,
                duration: Math.round(durMs / 1000),
                votes: payload.votes ?? prev?.votes ?? 0,
                requestedBy: payload.requested_by_name || prev?.requestedBy || 'Mekan Fon Müziği',
                requestedByUserId: payload.requested_by_user_id || prev?.requestedByUserId,
                isAnonymous: prev?.isAnonymous ?? false,
                is_anonymous: prev?.is_anonymous ?? false,
                requestedAt: 'Canli',
                startedAt: prev?.startedAt || undefined,
                isPlaying: isPlaying,
              };
            });
          }

          if (payload.progress_ms !== undefined) {
            const durSec = Math.round((payload.duration_ms || 210000) / 1000);
            const targetSec = Math.min(durSec, Math.max(0, Math.floor(payload.progress_ms / 1000)));

            setAudioProgress(prev => {
              if (!isPlaying || Math.abs(prev - targetSec) > 2) {
                return targetSec;
              }
              return prev;
            });
          }
        }
      })
      .on('broadcast', { event: 'veto_event' }, ({ payload }) => {
        if (payload && user && payload.targetUserId === user.id) {
          showToast(`Şarkınız (${payload.songName}) ${payload.deleterName} tarafından sıradan çıkarıldı. Şarkı hakkınız iade edildi.`);
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
      
    venueChannelRef.current = venueChannel;

    const fallbackInterval = setInterval(() => {
      fetchQueue();
    }, 3000);

    return () => {
      clearInterval(fallbackInterval);
      supabase.removeChannel(venueChannel);
    };
  }, [activeVenue?.id]); // Re-subscribe when venue changes

  // Update nowPlaying when livePlaybackState changes
  useEffect(() => {
    if (!livePlaybackState) return;
    
    setNowPlaying((prev) => {
      const isSameTrack = prev?.title === livePlaybackState.title;
      if (!prev || prev.id === 'spotify-bg' || isSameTrack) {
        return {
          ...(prev || ({} as any)),
          id: prev?.id && prev.id !== 'spotify-bg' ? prev.id : 'spotify-bg',
          title: livePlaybackState.title || prev?.title || 'Mekan Fon Müziği',
          artist: livePlaybackState.artist || prev?.artist || 'Muzikors Yayın',
          album: prev?.album || '',
          albumCover: livePlaybackState.album_art || prev?.albumCover || '',
          coverUrl: livePlaybackState.album_art || prev?.coverUrl || '',
          album_art: livePlaybackState.album_art || (prev as any)?.album_art || '',
          durationMs: livePlaybackState.duration_ms || prev?.durationMs || 210000,
          duration: Math.round((livePlaybackState.duration_ms || 210000) / 1000),
          votes: (livePlaybackState as any).votes || prev?.votes || 0,
          requestedBy: (livePlaybackState as any).requested_by_name || prev?.requestedBy || 'Mekan Fon Müziği',
          requestedByUserId: (livePlaybackState as any).requested_by_user_id || prev?.requestedByUserId || undefined,
          requestedAt: prev?.requestedAt || 'Canli',
          isPlaying: livePlaybackState.is_playing === true,
        };
      }
      return prev;
    });
    setIsPlayingAudio(livePlaybackState.is_playing === true);
  }, [livePlaybackState]);

  // ── LIVE AUDIO PROGRESS TICKER (Runs strictly when playing, freezes when paused) ──
  useEffect(() => {
    if (!nowPlaying) {
      setAudioProgress(0);
      return;
    }

    // Freeze progress if paused!
    const isPlaying = isPlayingAudio && nowPlaying.isPlaying !== false && activeVenue?.is_paused !== true;
    if (!isPlaying) {
      return;
    }

    const trackDurationSec = nowPlaying.duration || (nowPlaying.durationMs ? Math.round(nowPlaying.durationMs / 1000) : 180);

    const timer = setInterval(() => {
      setAudioProgress((prev) => {
        if (prev >= trackDurationSec) return trackDurationSec;
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nowPlaying?.id, nowPlaying?.title, nowPlaying?.isPlaying, isPlayingAudio, activeVenue?.is_paused, nowPlaying?.duration, nowPlaying?.durationMs]);

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
  const closeModal = useCallback(() => {
    setActiveModal('none');
    setViewingProfileId(null);
    setPendingModal(null);
    setLoginPromptReason(null);
  }, []);

  const openProfile = useCallback((id?: string) => {
    setViewingProfileId(id || user?.id || null);
    setActiveModal('profile');
  }, [user?.id]);

  const openProtectedModal = useCallback((modal: ModalType, reason?: string) => {
    if (!user) { setPendingModal(modal); setLoginPromptReason(reason || 'Devam etmek icin giris yapin'); setActiveModal('login'); return; }
    setActiveModal(modal);
  }, [user]);

  const loginWithProvider = useCallback(async (provider: 'google') => {
    if (!supabase) return;
    const isNative = Capacitor.isNativePlatform();
    const redirectUrl = isNative 
      ? 'muzikors://auth/callback' 
      : 'https://muzikors.com.tr/auth/callback';
      
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { 
            redirectTo: redirectUrl,
            skipBrowserRedirect: isNative
          },
        });
        
        if (error) { 
          console.error('[OAuth Google]', error); 
          showToast('Giris yapilamadi.'); 
          return;
        }

        if (isNative && data?.url) {
          await Browser.open({ url: data.url });
        }
    } catch (err) { console.error('[OAuth]', err); showToast('Giris yapilamadi.'); }
  }, [showToast]);

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null); userIdRef.current = null;
    showToast('Cikis yapildi.'); closeModal();
  }, [showToast, closeModal]);

  const handleIyzicoPayment = useCallback(async (packageId: string) => {
    showToast('Ödeme sistemi devre dışı bırakılmıştır.');
  }, [showToast]);

  // ── ADD XP FUNCTION ──────────────────────────────────────────────────────
  const addXp = useCallback(async (amount: number, reason?: string) => {
    if (!user || !user.id || amount <= 0) return;

    const currentXp = Number(user.xp || 0);
    const newTotalXp = currentXp + amount;
    const oldLevelInfo = getLevelDetails(currentXp);
    const newLevelInfo = getLevelDetails(newTotalXp);

    setUser((prev) => prev ? {
      ...prev,
      xp: newTotalXp,
      level: newLevelInfo.level
    } : null);

    if (newLevelInfo.level > oldLevelInfo.level) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.7 }, colors: ['#D4AF37', '#10B981', '#38BDF8'] });
      showToast(`🎉 Tebrikler! Seviye Atladın: ${newLevelInfo.fullTitle} (Lv. ${newLevelInfo.level})`);
    } else if (reason) {
      showToast(`✨ +${amount} XP (${reason})`);
    }

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            xp: newTotalXp,
            level: newLevelInfo.level
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('[addXp sync error]', err);
      }
    }
  }, [user, showToast, supabase]);

  // ── REQUEST TRACK: with venue isolation + financial split ─────────────────
  const requestTrack = useCallback(async (track: Track, isAnonymous?: boolean, isBoosted?: boolean, message?: string): Promise<boolean> => {
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

    const isExplicit = track.explicit === true || (track as any).is_explicit === true || containsProfanity(track.title) || containsProfanity(track.artist);
    if (activeVenue.explicit_filter_enabled === true && isExplicit) {
      showToast('Bu mekanda küfürlü / sansürsüz şarkı talebi engellenmiştir.');
      return false;
    }

    // Vibe Guard check
    const vibeCheck = isTrackAllowedByVibeGuard(track, activeVenue.allowed_genres);
    if (!vibeCheck.isAllowed) {
      showToast(`Bu mekanda ${vibeCheck.blockedReason || 'bu müzik tarzı'} kısıtlanmıştır.`);
      return false;
    }

    // Anti-spam cooldown check (Standard: 4 minutes, Premium: 0s)
    if (cooldown.active && !user?.isPremium && cooldown.remainingSeconds > 0) {
      const m = Math.floor(cooldown.remainingSeconds / 60);
      const s = cooldown.remainingSeconds % 60;
      showToast(`Anti-Spam aktif! Tekrar şarkı eklemek için ${m > 0 ? `${m} dk ` : ''}${s} sn bekleyin. (Premium ile bekleme süresi 0 sn ⚡)`);
      return false;
    }

    const venueId = parseInt(activeVenue.id, 10);
    let targetSpotifyUri = track.spotifyUri || (track.id && !track.id.startsWith('hist_') && !track.id.startsWith('top_') ? `spotify:track:${track.id}` : '');

    // Fallback: If targetSpotifyUri is missing or invalid, resolve from Spotify
    if (!targetSpotifyUri || !targetSpotifyUri.startsWith('spotify:track:')) {
      try {
        const { data: searchRes } = await supabase.functions.invoke('spotify-search', {
          body: { q: `${track.title} ${track.artist}`, venueId: activeVenue.id }
        });
        const found = searchRes?.tracks?.[0];
        if (found?.id) {
          targetSpotifyUri = found.spotifyUri || `spotify:track:${found.id}`;
          track.spotifyUri = targetSpotifyUri;
          if (found.albumCover || found.coverUrl) {
            track.albumCover = found.albumCover || found.coverUrl;
            track.coverUrl = found.coverUrl || found.albumCover;
          }
          if (found.durationMs) {
            track.durationMs = found.durationMs;
          }
        }
      } catch (searchErr) {
        console.warn('[requestTrack Spotify fallback error]', searchErr);
      }
    }

    if (!targetSpotifyUri) {
      targetSpotifyUri = `spotify:track:${track.id}`;
    }

    // ── SONG DURATION CHECK (Standard max 4 mins / 240s, Premium max 7 mins / 420s) ──
    const songDurationMs = track.durationMs ?? (track.duration ? track.duration * 1000 : 210000);
    const songDurationSec = Math.round(songDurationMs / 1000);
    const durMins = Math.floor(songDurationSec / 60);
    const durSecs = songDurationSec % 60;
    const durFormatted = `${durMins}:${durSecs < 10 ? '0' : ''}${durSecs}`;

    if (user?.isPremium) {
      if (songDurationMs > 420000) {
        showToast(`Bu şarkı 7 dakikadan uzun (${durFormatted}). Mekan akışını korumak için en fazla 7 dakikalık şarkılar eklenebilir.`);
        return false;
      }
    } else {
      if (songDurationMs > 240000) {
        showToast(`Bu şarkı 4 dakikadan uzun (${durFormatted}). Standart üyelikte en fazla 4 dakikalık şarkılar eklenebilir. 7 dakikaya kadar şarkı çalmak için Premium'a geçebilirsiniz 👑`);
        return false;
      }
    }

    // ── 1-HOUR DUPLICATE GUARD FOR SAME VENUE ──────────────────────────────
    if (supabase) {
      // 1. Check if already queued/playing
      const { data: existingTrack } = await supabase
        .from('queue')
        .select('id, status')
        .eq('venue_id', venueId)
        .eq('spotify_uri', targetSpotifyUri)
        .in('status', ['pending', 'queued', 'playing'])
        .maybeSingle();

      if (existingTrack) {
        showToast('Bu şarkı şu an zaten sırada veya çalıyor!');
        return false;
      }

      // 2. Check if requested in this venue within the last 1 hour
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: recentLog } = await supabase
        .from('song_requests_log')
        .select('created_at, song_name')
        .eq('venue_id', venueId)
        .eq('spotify_uri', targetSpotifyUri)
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recentLog?.created_at) {
        const diffMs = (new Date(recentLog.created_at).getTime() + 60 * 60 * 1000) - Date.now();
        const remainingMins = Math.max(1, Math.ceil(diffMs / (60 * 1000)));
        showToast(`"${track.title}" bu mekanda kısa süre önce çalındı/istendi. Müzik çeşitliliğini korumak için ${remainingMins} dakika sonra tekrar isteyebilirsiniz 🎵`);
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
    
    // Name Masking & Username Logic
    let requestedByName = 'Müşteri';
    if (isAnonymous && user?.isPremium) {
      requestedByName = 'Anonim';
    } else if (user) {
      requestedByName = formatUserDisplayName(user.username, user.name);
    }

    if (user?.isPremium && !isAnonymous) {
      requestedByName += ' VIP';
    }

    try {
      if (supabase && user) {
        const { data, error: rpcErr } = await supabase.rpc('request_track_acid', {
          p_venue_id: Number(venueId),
          p_song_name: track.title,
          p_artist_name: track.artist,
          p_album_cover: track.albumCover || track.coverUrl || track.album_art || '',
          p_spotify_uri: targetSpotifyUri,
          p_duration_ms: songDurationMs,
          p_requested_by_name: requestedByName,
          p_is_anonymous: isAnonymous || false,
          p_is_boosted: isBoosted || false,
          p_message: message || null
        });

        if (rpcErr) {
          console.error('[requestTrack RPC Error]', rpcErr.message);
          
          // Limit notification / Rewarded Ad trigger logic
          if (rpcErr.message.toLowerCase().includes('limit')) {
            setPendingRewardTrack(track);
            setPendingRewardOptions({ isAnonymous, isBoosted, message });
            setActiveModal('rewarded_ad');
            return false;
          } else {
            showToast(rpcErr.message || 'Şarkı eklenemedi.');
          }
          return false;
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
      requestedByUserId: isAnonymous ? undefined : user?.id,
      requestedByAvatar: isAnonymous ? '' : (user?.avatar || ''),
      requestedAt: 'Simdi',
      startedAt: undefined,
    };

    setQueue((prev) => [...prev, newTrack]);
    setUser((prev) => prev ? {
      ...prev,
      totalSongsRequested: (prev.totalSongsRequested || 0) + 1,
      daily_songs_count: (prev.daily_songs_count || 0) + 1,
      daily_boosts_count: isBoosted ? (prev.daily_boosts_count || 0) + 1 : (prev.daily_boosts_count || 0)
    } : null);

    // Award XP for requesting a song
    const xpEarned = isBoosted ? (XP_REWARDS.REQUEST_SONG + XP_REWARDS.BOOST_SONG) : XP_REWARDS.REQUEST_SONG;
    addXp(xpEarned, isBoosted ? 'Şarkı İsteği & VIP Boost' : 'Şarkı İsteği');

    // Cooldown logic: 0s for Premium, 4 minutes (240s) for Free users
    if (user?.isPremium) {
      setCooldown({ active: false, remainingSeconds: 0, lastRequestedAt: Date.now() });
    } else {
      setCooldown({ active: true, remainingSeconds: 240, lastRequestedAt: Date.now() });
    }

    confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 }, colors: ['#D4AF37', '#FFFFFF', '#FCEFD5'] });
    showToast(`"${track.title}" sıraya eklendi!`);
    closeModal();
    return true;
  }, [user, cooldown, nowPlaying, activeVenue, openProtectedModal, openModal, showToast, closeModal, supabase, addXp]);

  // ── CLAIM REWARD & QUEUE TRACK (AdMob Callback) ─────────────────────────
  const claimRewardAndQueueTrack = useCallback(async (): Promise<boolean> => {
    if (!activeVenue) {
      showToast('Bir mekana bağlı değilsiniz.');
      closeModal();
      return false;
    }

    const trackToQueue = pendingRewardTrack;
    const options = pendingRewardOptions;

    // If there is a pending track from limit exhaustion
    if (trackToQueue) {
      const newTrack: Track = {
        ...trackToQueue,
        id: `req-${Date.now()}`,
        votes: 0,
        requestedBy: options?.isAnonymous ? 'Anonim Müşteri' : (user?.name || 'Müşteri'),
        requestedByUserId: options?.isAnonymous ? undefined : user?.id,
        requestedByAvatar: options?.isAnonymous ? '' : (user?.avatar || ''),
        requestedAt: 'Şimdi',
        startedAt: undefined,
      };

      // Also attempt direct insertion into venue queue via Supabase
      if (supabase && activeVenue?.id) {
        try {
          await supabase.from('queue').insert({
            venue_id: Number(activeVenue.id),
            song_name: trackToQueue.title,
            artist_name: trackToQueue.artist,
            album_cover: trackToQueue.albumCover || trackToQueue.coverUrl || trackToQueue.album_art || '',
            spotify_uri: trackToQueue.spotifyUri || '',
            duration_ms: trackToQueue.durationMs ?? (trackToQueue.duration ? trackToQueue.duration * 1000 : 210000),
            requested_by_name: options?.isAnonymous ? 'Anonim' : (user?.name || 'Müşteri'),
            requested_by_user_id: options?.isAnonymous ? null : (user?.id || null),
            is_boosted: options?.isBoosted || false,
            message: options?.message || null,
          });
        } catch (e) {
          console.warn('[claimRewardAndQueueTrack DB insert]', e);
        }
      }

      setQueue((prev) => [...prev, newTrack]);
      addXp(XP_REWARDS.REQUEST_SONG, 'Şarkı İsteği');
      setPendingRewardTrack(null);
      setPendingRewardOptions(null);
      closeModal();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.8 }, colors: ['#D4AF37', '#FFFFFF', '#38BDF8'] });
      showToast(`"${trackToQueue.title}" reklam izlenerek sıraya eklendi! 🎉`);
      return true;
    }

    // General reward (e.g. from Drawer menu)
    if (user) {
      setUser((prev) => prev ? { ...prev, daily_songs_count: Math.max(0, (prev.daily_songs_count || 1) - 1) } : null);
    }
    closeModal();
    showToast('Tebrikler! +1 ek şarkı istek hakkı kazandınız. 🎵');
    return true;
  }, [pendingRewardTrack, pendingRewardOptions, activeVenue, user, supabase, closeModal, showToast, addXp]);

  // ── VETO TRACK ────────────────────────────────────────────────────────
  const vetoTrack = useCallback(async (trackId: string, isAnonymous?: boolean): Promise<boolean> => {
    if (!user?.isPremium) {
      showToast('Sadece Premium üyeler şarkı silebilir.');
      return false;
    }
    try {
      if (supabase) {
        const { data, error: rpcErr } = await supabase.rpc('veto_track', {
          p_queue_id: trackId,
          p_is_anonymous: isAnonymous || false
        });

        if (rpcErr) {
          showToast(rpcErr.message || 'Şarkı silinemedi.');
          return false;
        }

        const dataPayload = data as any;
        
        // Broadcast veto event to target user
        if (venueChannelRef.current && dataPayload && dataPayload.owner_id) {
          venueChannelRef.current.send({
            type: 'broadcast',
            event: 'veto_event',
            payload: {
              targetUserId: dataPayload.owner_id,
              songName: dataPayload.song_name,
              deleterName: dataPayload.deleter_name,
            }
          });
        }

        showToast('Şarkı başarıyla sıradan silindi.');
        // Update user daily vetoes count locally
        setUser((prev) => prev ? { ...prev, daily_vetoes_count: (prev.daily_vetoes_count || 0) + 1 } : null);
        // Remove locally immediately for better UX
        setQueue(prev => prev.filter(q => q.id !== trackId));
        return true;
      }
    } catch (err: any) {
      showToast('Bir hata oluştu.');
    }
    return false;
  }, [supabase, user, showToast]);

  const voteTrack = useCallback(async (trackId: string) => {
    if (!user) {
      openProtectedModal('search', 'Şarkıya oy vermek için lütfen giriş yapın.');
      return;
    }

    // 1. Self-vote check (User cannot upvote their own requested track)
    const targetTrack = queue.find((t) => t.id === trackId);
    if (targetTrack && targetTrack.requestedByUserId === user.id) {
      showToast('Kendi açtığınız şarkıya oy veremezsiniz!');
      return;
    }

    const maxDailyVotes = user.isPremium ? 15 : 5;
    const currentDailyVotes = user.daily_votes_count || 0;

    if (currentDailyVotes >= maxDailyVotes) {
      if (!user.isPremium) {
        showToast('Günlük 5 beğeni hakkınız doldu. 15 beğeni hakkı için Premium’a geçebilirsiniz!');
        openModal('premium');
      } else {
        showToast('Günlük 15 beğeni hakkınızı doldurdunuz. Yarın tekrar oy verebilirsiniz.');
      }
      return;
    }

    try {
      const newDailyVotes = currentDailyVotes + 1;
      const remainingVotes = maxDailyVotes - newDailyVotes;

      if (supabase) {
        // 1. Increment queue votes
        const { data: voteData } = await supabase.from('queue').select('votes').eq('id', trackId).single();
        const updatedVotes = (voteData?.votes ?? 0) + 1;
        await supabase.from('queue').update({ votes: updatedVotes }).eq('id', trackId);

        // 2. Update user daily_votes_count in profiles
        await supabase.from('profiles').update({ daily_votes_count: newDailyVotes }).eq('id', user.id);

        // 3. Log user vote in song_user_votes
        try {
          const { data: existingVote } = await supabase
            .from('song_user_votes')
            .select('vote_count')
            .eq('user_id', user.id)
            .eq('song_id', trackId)
            .maybeSingle();

          const count = (existingVote?.vote_count ?? 0) + 1;
          await supabase.from('song_user_votes').upsert(
            { user_id: user.id, song_id: trackId, vote_count: count },
            { onConflict: 'user_id,song_id' }
          );
        } catch (vErr) {
          console.warn('[song_user_votes log]', vErr);
        }

        // 4. Award XP to the song requester (if they exist and haven't exceeded daily cap of 100 XP)
        if (targetTrack?.requestedByUserId) {
          try {
            const requesterId = targetTrack.requestedByUserId;
            const { data: reqProfile } = await supabase
              .from('profiles')
              .select('xp, level, daily_liked_songs_xp')
              .eq('id', requesterId)
              .maybeSingle();

            if (reqProfile) {
              const currentDailyLikedXp = Number(reqProfile.daily_liked_songs_xp || 0);
              if (currentDailyLikedXp < XP_REWARDS.MAX_DAILY_RECEIVED_LIKE_XP) {
                const xpToAdd = Math.min(XP_REWARDS.RECEIVE_LIKE, XP_REWARDS.MAX_DAILY_RECEIVED_LIKE_XP - currentDailyLikedXp);
                const newReqTotalXp = Number(reqProfile.xp || 0) + xpToAdd;
                const newReqLevel = getLevelDetails(newReqTotalXp).level;

                await supabase
                  .from('profiles')
                  .update({
                    xp: newReqTotalXp,
                    level: newReqLevel,
                    daily_liked_songs_xp: currentDailyLikedXp + xpToAdd
                  })
                  .eq('id', requesterId);
              }
            }
          } catch (xpErr) {
            console.warn('[voteTrack requester XP error]', xpErr);
          }
        }
      }

      // 5. Award +2 XP to the voter
      addXp(XP_REWARDS.GIVE_LIKE, 'Şarkı Beğenme');

      // Update local context states
      setUser((prev) => prev ? { ...prev, daily_votes_count: newDailyVotes } : null);
      setQueue((prev) => [...prev].map((t) => t.id === trackId ? { ...t, votes: t.votes + 1 } : t).sort((a, b) => b.votes - a.votes));

      showToast(`Şarkı beğenildi! (Kalan beğeni hakkınız: ${remainingVotes}/${maxDailyVotes})`);
    } catch (err) {
      console.error('[voteTrack exception]', err);
      showToast('Oylama sırasında bir hata oluştu.');
    }
  }, [user, queue, openProtectedModal, openModal, showToast, addXp, supabase]);

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

  // ── CLAIM DAILY REWARD ──────────────────────────────────────────────────
  const claimDailyReward = useCallback(async (): Promise<boolean> => {
    if (!user || !user.id) {
      openProtectedModal('daily_reward', 'Günlük ödülü toplamak için giriş yapmalısınız.');
      return false;
    }

    const todayTR = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date());

    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yesterdayTR = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(d);

    if (user.lastDailyClaim === todayTR) {
      showToast('Günün ödülünü zaten aldınız! Yarın tekrar bekleriz.');
      return false;
    }

    // Determine streak: consecutive day check
    const currentStreak = user.lastDailyClaim === yesterdayTR ? ((user.daily_streak || 0) + 1) : 1;
    // Base +5 XP, +2 XP for each consecutive day
    const earnedXp = 5 + (currentStreak - 1) * 2;

    await addXp(earnedXp, `${currentStreak}. Gün Giriş Bonusu`);

    setUser((prev) => prev ? {
      ...prev,
      lastDailyClaim: todayTR,
      daily_streak: currentStreak,
    } : null);

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            last_daily_claim: todayTR,
            daily_streak: currentStreak,
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('[claimDailyReward DB update]', err);
      }
    }

    confetti({ particleCount: 90, spread: 70, origin: { y: 0.7 }, colors: ['#D4AF37', '#10B981', '#38BDF8', '#F59E0B'] });
    showToast(`🎉 Günlük Ödül: +${earnedXp} XP (${currentStreak}. Gün Serisi) ve +1 Şarkı Hakkı!`);
    return true;
  }, [user, addXp, openProtectedModal, showToast, supabase]);

  const toggleAudioPlay = useCallback(() => setIsPlayingAudio((p) => !p), []);

  return (
    <AppContext.Provider value={{
      user, setUser, activeModal, theme, setTheme, activeVenue, kafeIdParam,
      isVenueBound, isVenueActive,
      nowPlaying, queue,
      cooldown, toastMessage, loginPromptReason, audioProgress, isPlayingAudio,
      openModal, openProtectedModal, closeModal, viewingProfileId, openProfile, loginWithProvider, logout,
      handleIyzicoPayment, iyzicoHtml, requestTrack, vetoTrack, voteTrack, addXp, bindVenueById, deleteAccount, showToast, toggleAudioPlay,
      hasEnteredGateway, setHasEnteredGateway,
      pendingRewardTrack, openRewardedAdModal, claimRewardAndQueueTrack, claimDailyReward
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
