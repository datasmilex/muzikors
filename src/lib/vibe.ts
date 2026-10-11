'use client';

import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { Track, VibeVerdict } from '../types';

/** Mekânın müşterilere görünen tarz bilgisi (Vibe Guard). */
export interface VenueVibeInfo {
  enabled: boolean;
  mode: 'strict' | 'balanced' | 'flexible';
  outside_policy: 'approval' | 'block';
  approval_minutes: number;
  description: string | null;
  styles: string[];
  library_tracks: number;
}

const SPOTIFY_ID = /^[A-Za-z0-9]{22}$/;
const infoCache = new Map<string, { at: number; info: VenueVibeInfo }>();

export function spotifyIdOf(track: Pick<Track, 'id' | 'spotifyUri'>): string | null {
  const fromUri = track.spotifyUri?.replace('spotify:track:', '') ?? '';
  if (SPOTIFY_ID.test(fromUri)) return fromUri;
  return SPOTIFY_ID.test(track.id) ? track.id : null;
}

export async function fetchVibeInfo(venueId: string, fresh = false): Promise<VenueVibeInfo | null> {
  const cached = infoCache.get(venueId);
  if (!fresh && cached && Date.now() - cached.at < 60_000) return cached.info;
  const { data, error } = await supabase.rpc('vibe_public_info', { p_venue_id: Number(venueId) });
  if (error || !data) return cached?.info ?? null;
  infoCache.set(venueId, { at: Date.now(), info: data as VenueVibeInfo });
  return data as VenueVibeInfo;
}

/** Arama penceresi her açıldığında mekânın güncel tarz bilgisini getirir. */
export function useVibeInfo(venueId: string | null | undefined, open: boolean) {
  const [info, setInfo] = useState<VenueVibeInfo | null>(() => (venueId ? infoCache.get(venueId)?.info ?? null : null));

  useEffect(() => {
    if (!venueId || !open) return;
    let cancelled = false;
    fetchVibeInfo(venueId, true).then((next) => {
      if (!cancelled) setInfo(next);
    });
    return () => {
      cancelled = true;
    };
  }, [venueId, open]);

  return venueId ? info : null;
}

interface LibraryRow {
  id: string;
  title: string;
  artist: string;
  artistIds: string[];
  cover: string | null;
  duration_ms: number | null;
  explicit: boolean;
}

function libraryRowToTrack(t: LibraryRow): Track {
  const cover = t.cover || '';
  const durMs = t.duration_ms || 210000;
  return {
    id: t.id,
    title: t.title,
    artist: t.artist,
    artistIds: t.artistIds,
    albumCover: cover,
    coverUrl: cover,
    album_art: cover,
    spotifyUri: `spotify:track:${t.id}`,
    durationMs: durMs,
    duration: Math.round(durMs / 1000),
    explicit: Boolean(t.explicit),
    votes: 0,
    requestedBy: '',
    requestedAt: '',
    vibe: { verdict: 'allow', reason: 'in_library' },
  };
}

/** Mekânın listesindeki (şu an geçerli) şarkılar; engellenenler sunucuda ayıklanır. */
export async function fetchLibraryPage(venueId: string, offset = 0, limit = 40): Promise<{ total: number; tracks: Track[] }> {
  const { data, error } = await supabase.rpc('vibe_library_page', {
    p_venue_id: Number(venueId),
    p_query: null,
    p_limit: limit,
    p_offset: offset,
  });
  if (error || !data) return { total: 0, tracks: [] };
  return { total: data.total ?? 0, tracks: ((data.tracks ?? []) as LibraryRow[]).map(libraryRowToTrack) };
}

/**
 * Veritabanından gelen listelere (geçmiş, favoriler) mekânın kararını ve eksik
 * kapak/süre bilgisini ekler. Spotify kimliği olmayanlar olduğu gibi kalır.
 */
export async function attachVerdicts(venueId: string, tracks: Track[]): Promise<Track[]> {
  const ids = Array.from(new Set(tracks.map(spotifyIdOf).filter((x): x is string => Boolean(x)))).slice(0, 20);
  if (ids.length === 0) return tracks;
  try {
    const { data } = await supabase.functions.invoke('spotify-search', { body: { ids, venueId } });
    const found = new Map<string, Track>(((data?.tracks ?? []) as Track[]).map((t) => [t.id, t]));
    return tracks.map((track) => {
      const id = spotifyIdOf(track);
      const hit = id ? found.get(id) : undefined;
      if (!hit) return track;
      const cover = track.albumCover && !track.albumCover.includes('unsplash') ? track.albumCover : hit.albumCover || track.albumCover;
      return {
        ...track,
        id: hit.id,
        spotifyUri: hit.spotifyUri,
        albumCover: cover,
        coverUrl: cover,
        durationMs: hit.durationMs || track.durationMs,
        explicit: hit.explicit ?? track.explicit,
        artistIds: hit.artistIds,
        vibe: hit.vibe ?? null,
      };
    });
  } catch {
    return tracks;
  }
}

export async function suggestToVenue(venueId: string, trackId: string): Promise<{ ok: boolean; message: string }> {
  const { data, error } = await supabase.rpc('vibe_suggest', { p_venue_id: Number(venueId), p_track_id: trackId });
  if (error) return { ok: false, message: 'Öneri gönderilemedi. Biraz sonra tekrar dene.' };
  if (!data?.success) return { ok: false, message: data?.error || 'Öneri gönderilemedi.' };
  return { ok: true, message: data.already ? 'Bu şarkıyı bugün zaten önerdin.' : 'Önerin mekâna iletildi.' };
}

export function isApproval(vibe?: VibeVerdict | null) {
  return vibe?.verdict === 'approval';
}

export function isBlocked(vibe?: VibeVerdict | null) {
  return vibe?.verdict === 'block';
}

/** Müşteriye mekânın kuralını tek cümleyle anlatır. */
export function vibeRuleSummary(info: VenueVibeInfo | null): string {
  if (!info?.enabled) return 'Bu mekânda her tarzdan şarkı isteyebilirsin.';
  if (info.mode === 'flexible') return 'Her tarzdan şarkı isteyebilirsin; mekânın engellediği birkaç sanatçı ve şarkı dışında.';
  if (info.mode === 'strict') {
    return info.outside_policy === 'approval'
      ? 'Mekânın listesindeki şarkılar hemen sıraya girer; listede olmayanlar mekân onayına düşer.'
      : 'Yalnızca mekânın listesindeki şarkılar çalınır.';
  }
  return info.outside_policy === 'approval'
    ? 'Mekânın listesindeki sanatçılar hemen sıraya girer; diğerleri mekân onayına düşer.'
    : 'Yalnızca mekânın listesindeki sanatçılar çalınır.';
}

/** Engellenen şarkı, kural mekânın listesinden kaynaklanıyorsa önerilebilir. */
export function canSuggest(vibe?: VibeVerdict | null) {
  return vibe?.verdict === 'block' && ['not_in_library', 'not_in_list', 'unknown', 'year', 'category'].includes(vibe.reason);
}
