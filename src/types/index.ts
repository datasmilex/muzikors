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
  creditCost: number;
  votes: number;
  requestedBy: string;
  requestedByAvatar?: string;
  requestedAt: string;
  startedAt?: string;
  isPlaying?: boolean;
  spotifyUrl?: string;
  explicit?: boolean;
  is_explicit?: boolean;
  genres?: string[];
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
    song_title: string;
    artist: string;
    album_cover: string;
    spotify_track_id: string;
    requested_by_name: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  credits: number;
  totalSongsRequested: number;
  lifetimeCredits?: number;
  isSpotifyConnected?: boolean;
  loginMethod: 'google' | 'spotify';
  lastDailyClaim?: string;
}

export interface CreditPackage {
  id: string;
  credits: number;
  bonusCredits: number;
  priceTL: number;
  oldPriceTL?: number;
  isPopular?: boolean;
  badge?: string;
  description: string;
}

export type ModalType = 
  | 'none' 
  | 'login' 
  | 'topup' 
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
  | 'daily_reward'
  | 'tvShoutout'
  | 'venue_info';

export interface CooldownState {
  active: boolean;
  remainingSeconds: number;
  lastRequestedAt: number | null;
}
