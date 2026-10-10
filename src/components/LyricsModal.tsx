'use client';

import React, { useEffect, useState } from 'react';
import { Mic2, Music, Search } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../context/AppContext';
import { Sheet } from './ui/Sheet';
import { EmptyState, btn } from './ui/controls';

const cleanString = (str: string) =>
  str
    .replace(/\(feat\..*?\)/gi, '')
    .replace(/\(with.*?\)/gi, '')
    .replace(/\[.*?\]/g, '')
    .replace(/- .*?Remaster.*?/gi, '')
    .replace(/- .*?Edit.*?/gi, '')
    .replace(/- .*?Live.*?/gi, '')
    .trim();

const openExternal = async (url: string) => {
  if (Capacitor.isNativePlatform()) {
    await Browser.open({ url });
  } else {
    window.open(url, '_blank');
  }
};

export const LyricsModal: React.FC = () => {
  const { activeModal, closeModal, nowPlaying } = useApp();
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInstrumental, setIsInstrumental] = useState(false);

  const isOpen = activeModal === 'lyrics';

  useEffect(() => {
    if (!isOpen || !nowPlaying) return;
    let alive = true;

    const tryFetch = async (track: string, artist: string) => {
      try {
        const url = `https://lrclib.net/api/get?track_name=${encodeURIComponent(track)}&artist_name=${encodeURIComponent(artist)}`;
        const res = await fetch(url);
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('[LRCLIB fetch error]', e);
      }
      return null;
    };

    (async () => {
      setIsLoading(true);
      setLyrics(null);
      setIsInstrumental(false);

      const { title, artist } = nowPlaying;
      let data = await tryFetch(title, artist);
      if (!data) {
        const t = cleanString(title);
        const a = cleanString(artist);
        if (t !== title || a !== artist) data = await tryFetch(t, a);
      }
      if (!alive) return;

      if (data?.instrumental) {
        setIsInstrumental(true);
      } else if (data?.plainLyrics) {
        setLyrics(data.plainLyrics);
      } else if (data?.syncedLyrics) {
        setLyrics(
          data.syncedLyrics
            .split('\n')
            .map((line: string) => line.replace(/\[\d+:\d+\.\d+\]/g, '').trim())
            .filter(Boolean)
            .join('\n')
        );
      }
      setIsLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [isOpen, nowPlaying?.title, nowPlaying?.artist]); // eslint-disable-line react-hooks/exhaustive-deps

  const searchGoogle = () => {
    if (!nowPlaying) return;
    openExternal(`https://www.google.com/search?q=${encodeURIComponent(`${nowPlaying.artist} ${nowPlaying.title} şarkı sözleri`)}`);
  };

  return (
    <Sheet
      open={isOpen && Boolean(nowPlaying)}
      onClose={closeModal}
      title={nowPlaying?.title || 'Şarkı sözleri'}
      subtitle={nowPlaying?.artist}
      height="tall"
      width="md"
      footer={
        <button type="button" onClick={searchGoogle} className={`${btn.secondary} w-full`}>
          <Search className="w-4 h-4 text-white/60" />
          <span>Google&apos;da ara</span>
        </button>
      }
    >
      {isLoading ? (
        <div className="space-y-3 pt-2" aria-label="Sözler yükleniyor">
          {[70, 55, 80, 45, 65, 50, 75, 40].map((w, i) => (
            <div key={i} className="h-4 rounded-full bg-white/[0.06] animate-pulse mx-auto" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : isInstrumental ? (
        <EmptyState icon={<Music className="w-6 h-6" />} title="Enstrümantal parça" text="Bu şarkının sözü yok." />
      ) : lyrics ? (
        <div className="pb-4">
          <p className="whitespace-pre-wrap text-center text-[17px] leading-[1.75] font-medium text-white/85">{lyrics}</p>
          <p className="text-[11px] text-center text-white/30 mt-6">Sözler LRCLIB açık veritabanından</p>
        </div>
      ) : (
        <EmptyState icon={<Mic2 className="w-6 h-6" />} title="Sözler bulunamadı" text="Bu şarkının sözleri veritabanında yok. Google'da aramayı deneyebilirsin." />
      )}
    </Sheet>
  );
};
