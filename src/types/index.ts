export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  albumCover?: string;
  coverUrl?: string;
  album_art?: string;
  duration?: number; // in seconds
  durationMs?: number;
  spotifyUri?: string;
  votes: number;
  requestedBy: string;
  requestedByUserId?: string;
  requestedByAvatar?: string;
  requestedAt: string;
  startedAt?: string;
  isPlaying?: boolean;
  spotifyUrl?: string;
  explicit?: boolean;
  is_explicit?: boolean;
  isBoosted?: boolean;
  isAnonymous?: boolean;
  is_anonymous?: boolean;
  message?: string;
  preview_url?: string | null;
  previewUrl?: string | null;
  /** Spotify sanatçı kimlikleri (arama sonuçlarında gelir) */
  artistIds?: string[];
  /** Mekânın Vibe Guard kararı; sunucu her aramada döner, istekte yeniden doğrular */
  vibe?: VibeVerdict | null;
}

export interface VibeVerdict {
  verdict: 'allow' | 'approval' | 'block';
  reason: string;
  message?: string;
}

/** Kullanıcının mekân onayı bekleyen isteği */
export interface PendingApproval {
  id: string;
  title: string;
  artist: string;
  cover: string;
  expiresAt: string | null;
}

export interface Venue {
  id: string;           // Supabase integer id (stored as string)
  name: string;         // mapped from venue_name
  venue_name?: string;  // raw Supabase field
  address: string;
  city: string;
  district: string;
  distance: string;
  logo: string;
  coverImage: string;
  activeListeners: number;
  currentSongTitle: string;
  currentSongArtist: string;
  slug?: string;
  is_active?: boolean;
  is_tv_active?: boolean;
  is_paused?: boolean;
  explicit_filter_enabled?: boolean;
  allowed_genres?: string[];
  full_address?: string;
  contact_phone?: string;
  contact_email?: string;
  logo_url?: string;
  menu_link?: string;
  menu_type?: 'external' | 'native';
  wifi_name?: string;
  wifi_password?: string;
  terms_accepted?: boolean;
  total_earnings?: number;
  latitude?: number;
  longitude?: number;
  computedDistance?: number;
  spotify_client_id?: string | null;
  has_spotify?: boolean;
  opening_time?: string | null;
  closing_time?: string | null;
  current_track_info?: {
    song_title?: string;
    artist?: string;
    album_cover?: string;
    spotify_track_id?: string;
    requested_by_name?: string;
    is_playing?: boolean;
    title?: string;
    [key: string]: any;
  } | null;
}

export interface MenuCategory {
  id: string;
  venue_id: number;
  name: string;
  order_index: number;
  created_at: string;
}

export interface MenuItem {
  id: string;
  venue_id: number;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  order_index: number;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  totalSongsRequested: number;
  isSpotifyConnected?: boolean;
  loginMethod: 'google' | 'spotify' | 'apple';
  lastDailyClaim?: string;
  isPremium?: boolean;
  daily_free_votes?: number;
  last_username_update?: string;
  xp?: number;
  level?: number;
  daily_liked_songs_xp?: number;
  daily_streak?: number;
  avatar_frame?: string;
  is_beta_tester?: boolean;
  beta_tester_reward_claimed?: boolean;
  daily_songs_count?: number;
  daily_votes_count?: number;
  daily_boosts_count?: number;
  daily_vetoes_count?: number;
  last_reset_date?: string;
  premium_until?: string | null;
  premium_activated_at?: string | null;
  extra_song_credits?: number;
}

export type ModalType = 
  | 'none' 
  | 'login' 
  | 'search' 
  | 'profile' 
  | 'drawer' 
  | 'qr' 
  | 'map' 
  | 'howitworks' 
  | 'about' 
  | 'partners' 
  | 'contact' 
  | 'campaigns'
  | 'terms'
  | 'kvkk'
  | 'consent'
  | 'cookie'
  | 'daily_reward'
  | 'premium'
  | 'venue_info'
  | 'leaderboard'
  | 'lyrics'
  | 'menu'
  | 'story_share';

export interface CooldownState {
  active: boolean;
  remainingSeconds: number;
  lastRequestedAt: number | null;
}
