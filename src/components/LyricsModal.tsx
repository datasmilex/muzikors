'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic2, Search, ExternalLink, Loader2, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const LyricsModal: React.FC = () => {
  const { activeModal, closeModal, nowPlaying, showToast } = useApp();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const cleanString = (str: string) => {
    return str
      .replace(/\(feat\..*?\)/gi, '')
      .replace(/\(with.*?\)/gi, '')
      .replace(/\[.*?\]/g, '')
      .replace(/- .*?Remaster.*?/gi, '')
      .replace(/- .*?Edit.*?/gi, '')
      .replace(/- .*?Live.*?/gi, '')
      .trim();
  };

  useEffect(() => {
    if (activeModal !== 'lyrics' || !nowPlaying) return;

    let isMounted = true;
    const fetchLyrics = async () => {
      setIsLoading(true);
      setLyrics(null);
      setIsInstrumental(false);
      setFetchError(false);

      const title = nowPlaying.title;
      const artist = nowPlaying.artist;

      const tryFetch = async (trackName: string, artistName: string) => {
        try {
          const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(trackName)}&artist_name=${encodeURIComponent(artistName)}`;
          const res = await fetch(url, { headers: { 'User-Agent': 'Muzikors/1.0 (https://muzikors.com.tr)' } });
          if (res.ok) {
            const data = await res.json();
            return data;
          }
        } catch (e) {
          console.warn('[LRCLIB fetch error]', e);
        }
        return null;
      };

      // 1. Try exact match
      let data = await tryFetch(title, artist);

      // 2. If not found, try cleaned title
      if (!data) {
        const cleanedTitle = cleanString(title);
        const cleanedArtist = cleanString(artist);
        if (cleanedTitle !== title || cleanedArtist !== artist) {
          data = await tryFetch(cleanedTitle, cleanedArtist);
        }
      }

      if (!isMounted) return;

      if (data) {
        if (data.instrumental) {
          setIsInstrumental(true);
        } else if (data.plainLyrics) {
          setLyrics(data.plainLyrics);
        } else if (data.syncedLyrics) {
          // Strip timestamp tags [00:12.34]
          const plain = data.syncedLyrics
            .split('\n')
            .map((line: string) => line.replace(/\[\d+:\d+\.\d+\]/g, '').trim())
            .filter(Boolean)
            .join('\n');
          setLyrics(plain);
        } else {
          setFetchError(true);
        }
      } else {
        setFetchError(true);
      }

      setIsLoading(false);
    };

    fetchLyrics();

    return () => {
      isMounted = false;
    };
  }, [activeModal, nowPlaying?.title, nowPlaying?.artist]);

  if (activeModal !== 'lyrics') return null;

  const handleOpenSpotify = async () => {
    if (!nowPlaying) return;
    const trackId = (nowPlaying.spotifyUri || nowPlaying.id || '').replace('spotify:track:', '');
    const spotifyAppUrl = `spotify:track:${trackId}`;
    const spotifyWebUrl = `https://open.spotify.com/track/${trackId}`;

    showToast('Spotify açılıyor...');

    try {
      if (Capacitor.isNativePlatform()) {
        window.location.href = spotifyAppUrl;
        setTimeout(async () => {
          await Browser.open({ url: spotifyWebUrl });
        }, 800);
      } else {
        window.open(spotifyWebUrl, '_blank');
      }
    } catch (e) {
      window.open(spotifyWebUrl, '_blank');
    }
  };

  const handleSearchGoogle = async () => {
    if (!nowPlaying) return;
    const query = `${nowPlaying.artist} ${nowPlaying.title} şarkı sözleri`;
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url: searchUrl });
    } else {
      window.open(searchUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex flex-col items-center justify-end sm:justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 280 }}
          className="relative w-full max-w-md h-[86vh] bg-[#0d0c11] sm:rounded-3xl rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_60px_rgba(0,0,0,0.95)] flex flex-col border-t sm:border border-white/[0.1] overflow-hidden"
        >
          {/* Handle */}
          <div className="flex justify-center pt-0 pb-2 shrink-0">
            <div className="w-12 h-1 bg-white/20 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between pb-3 pt-1 border-b border-white/[0.08] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center text-amber-400">
                <Mic2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white tracking-tight">
                  Şarkı Sözleri
                </h2>
                <p className="text-[10px] text-neutral-400 font-medium truncate">
                  {nowPlaying?.title} • {nowPlaying?.artist}
                </p>
              </div>
            </div>
            
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-4 px-1 custom-scrollbar space-y-3">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Sözler aranıyor...</span>
              </div>
            ) : isInstrumental ? (
              <div className="text-center py-16 space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/25 flex items-center justify-center mx-auto text-amber-400">
                  <Music className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">Enstrümantal Eser</h3>
                <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                  Bu parça enstrümantal olarak işaretlenmiş, söz bulunmuyor.
                </p>
              </div>
            ) : lyrics ? (
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#141318] border border-white/[0.06]">
                  <pre className="text-xs font-medium text-neutral-200 leading-relaxed whitespace-pre-wrap font-sans text-center tracking-wide">
                    {lyrics}
                  </pre>
                </div>
                <p className="text-[9px] text-center text-neutral-500">
                  Şarkı sözleri LRCLIB açık veri tabanından sağlanmaktadır.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white mb-0.5">Sözler Bulunamadı</h3>
                  <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                    Bu şarkının sözleri otomatik veritabanında bulunamadı.
                  </p>
                </div>
                <button
                  onClick={handleSearchGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 font-bold text-xs active:scale-95 transition-all shadow-sm"
                >
                  <Search className="w-3.5 h-3.5" />
                  Google&apos;da Ara
                </button>
              </div>
            )}
          </div>

          {/* Footer Quick Actions */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center gap-2 shrink-0">
            <button
              onClick={handleOpenSpotify}
              className="flex-1 py-3 px-4 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/30 text-[#1DB954] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Spotify&apos;da Aç</span>
            </button>
            <button
              onClick={handleSearchGoogle}
              className="py-3 px-4 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              title="Google'da Ara"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
