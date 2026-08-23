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
          transition={{ duration: 0.25 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md h-[88vh] bg-[#120C08] sm:rounded-3xl rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.2)] flex flex-col border border-[#D4AF37]/40 glass-panel-gold overflow-hidden"
        >
          {/* Top Grab Bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-b-xl" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 pt-2 border-b border-[#D4AF37]/20 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                <Mic2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Şarkı Sözleri</span>
                </h2>
                <p className="text-[11px] text-amber-200/60 font-medium line-clamp-1">
                  {nowPlaying?.title} • {nowPlaying?.artist}
                </p>
              </div>
            </div>
            
            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-white/5 border border-transparent active:border-[#D4AF37]/30 text-zinc-400 active:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto py-5 px-2 custom-scrollbar space-y-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3 py-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#D4AF37]" />
                <span className="text-xs font-bold text-amber-200/60 uppercase tracking-widest">Sözler aranıyor...</span>
              </div>
            ) : isInstrumental ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-[#D4AF37]">
                  <Music className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Enstrümantal Eser</h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Bu parça enstrümantal olarak işaretlenmiş, söz bulunmamaktadır.
                </p>
              </div>
            ) : lyrics ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-black/40 border border-white/5 backdrop-blur-sm">
                  <pre className="text-sm font-medium text-amber-50/90 leading-loose whitespace-pre-wrap font-sans text-center tracking-wide">
                    {lyrics}
                  </pre>
                </div>
                <p className="text-[10px] text-center text-zinc-500">
                  Şarkı sözleri LRCLIB açık veri tabanından sağlanmaktadır.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-zinc-500">
                  <Search className="w-7 h-7 text-amber-200/50" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Sözler Bulunamadı</h3>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    Bu şarkının sözleri otomatik veritabanında yer almıyor. Google'da tek tıkla arayabilirsiniz.
                  </p>
                </div>
                <button
                  onClick={handleSearchGoogle}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-[#D4AF37]/50 text-amber-200 font-bold text-xs active:scale-95 transition-all shadow-md"
                >
                  <Search className="w-4 h-4 text-[#D4AF37]" />
                  Google'da Şarkı Sözü Ara
                </button>
              </div>
            )}
          </div>

          {/* Footer Quick Actions */}
          <div className="pt-3 border-t border-[#D4AF37]/20 flex items-center gap-2.5 shrink-0">
            <button
              onClick={handleOpenSpotify}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 border border-[#1DB954]/40 text-[#1DB954] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Spotify'da Aç / Favorile</span>
            </button>
            <button
              onClick={handleSearchGoogle}
              className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              title="Google'da Ara"
            >
              <Search className="w-4 h-4 text-amber-200/70" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
