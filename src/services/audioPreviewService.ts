'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Track } from '../types';

// In-memory cache for preview URLs across user session
const previewCache = new Map<string, string | null>();

function cleanSongTitle(title: string): string {
  return title
    .replace(/\s*-\s*.*remaster.*$/i, '')
    .replace(/\s*\([^)]*remaster[^)]*\)/i, '')
    .replace(/\s*\([^)]*feat[^)]*\)/i, '')
    .replace(/\s*\[[^\]]*\]/g, '')
    .trim();
}

function getPrimaryArtist(artist: string): string {
  return artist.split(/[,&/]/)[0].trim();
}

/**
 * Resolves a 30-second audio preview URL for any track.
 * Priority:
 * 1. track.preview_url / track.previewUrl (if provided by Spotify)
 * 2. In-memory cache
 * 3. iTunes Search API (fast, free, global CDN, no auth needed)
 */
export async function getTrackPreviewUrl(track: Track): Promise<string | null> {
  // 1. Direct preview URL if Spotify returned one
  if (track.preview_url && track.preview_url.startsWith('http')) {
    return track.preview_url;
  }
  if (track.previewUrl && track.previewUrl.startsWith('http')) {
    return track.previewUrl;
  }

  const cacheKey = `${track.title.toLowerCase().trim()}:::${track.artist.toLowerCase().trim()}`;
  if (previewCache.has(cacheKey)) {
    return previewCache.get(cacheKey) ?? null;
  }

  // 2. Fetch from iTunes Search API
  try {
    const primaryTerm = `${track.title} ${track.artist}`.trim();
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(primaryTerm)}&entity=song&limit=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(itunesUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const preview = data.results?.[0]?.previewUrl;
      if (preview && typeof preview === 'string') {
        previewCache.set(cacheKey, preview);
        return preview;
      }
    }

    // Secondary fallback with cleaned title and primary artist
    const cleanedTitle = cleanSongTitle(track.title);
    const primaryArtist = getPrimaryArtist(track.artist);
    if (cleanedTitle !== track.title || primaryArtist !== track.artist) {
      const fallbackTerm = `${cleanedTitle} ${primaryArtist}`.trim();
      const fallbackUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(fallbackTerm)}&entity=song&limit=1`;
      
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 3500);

      const res2 = await fetch(fallbackUrl, { signal: controller2.signal });
      clearTimeout(timeoutId2);

      if (res2.ok) {
        const data2 = await res2.json();
        const preview2 = data2.results?.[0]?.previewUrl;
        if (preview2 && typeof preview2 === 'string') {
          previewCache.set(cacheKey, preview2);
          return preview2;
        }
      }
    }
  } catch (err) {
    console.warn('[audioPreviewService] Error fetching preview:', err);
  }

  // Cache null result so we don't repeat failed network lookups
  previewCache.set(cacheKey, null);
  return null;
}

export interface UseAudioPreviewReturn {
  playingTrackId: string | null;
  loadingTrackId: string | null;
  togglePreview: (track: Track, onUnavailable?: () => void) => Promise<void>;
  stopPreview: () => void;
  isPlaying: (trackId: string) => boolean;
  isLoading: (trackId: string) => boolean;
}

/**
 * Custom hook to safely manage single-track in-app audio preview.
 * Ensures zero interference with cafe Spotify playback, zero leaks, and automatic cleanup.
 */
export function useAudioPreview(): UseAudioPreviewReturn {
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [loadingTrackId, setLoadingTrackId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  // Stop and release audio
  const stopPreview = useCallback(() => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
      } catch (_) {}
    }
    currentUrlRef.current = null;
    setPlayingTrackId(null);
    setLoadingTrackId(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPreview();
    };
  }, [stopPreview]);

  const togglePreview = useCallback(async (track: Track, onUnavailable?: () => void) => {
    // If clicking the track that is already playing, pause it
    if (playingTrackId === track.id) {
      stopPreview();
      return;
    }

    // Stop current track immediately
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.src = '';
      } catch (_) {}
    }

    setPlayingTrackId(null);
    setLoadingTrackId(track.id);

    try {
      const previewUrl = await getTrackPreviewUrl(track);

      if (!previewUrl) {
        setLoadingTrackId(null);
        if (onUnavailable) {
          onUnavailable();
        }
        return;
      }

      // Initialize audio element if needed
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = previewUrl;
      audio.preload = 'auto';
      audio.volume = 0.9;
      currentUrlRef.current = previewUrl;

      audio.onended = () => {
        setPlayingTrackId(null);
        setLoadingTrackId(null);
      };

      audio.onerror = () => {
        setPlayingTrackId(null);
        setLoadingTrackId(null);
        if (onUnavailable) {
          onUnavailable();
        }
      };

      audio.oncanplay = () => {
        setLoadingTrackId(null);
      };

      // Play audio
      await audio.play();
      setPlayingTrackId(track.id);
      setLoadingTrackId(null);
    } catch (err: any) {
      console.warn('[useAudioPreview] Playback error:', err);
      stopPreview();
      if (onUnavailable) {
        onUnavailable();
      }
    }
  }, [playingTrackId, stopPreview]);

  const isPlaying = useCallback((trackId: string) => {
    return playingTrackId === trackId;
  }, [playingTrackId]);

  const isLoading = useCallback((trackId: string) => {
    return loadingTrackId === trackId;
  }, [loadingTrackId]);

  return {
    playingTrackId,
    loadingTrackId,
    togglePreview,
    stopPreview,
    isPlaying,
    isLoading,
  };
}
