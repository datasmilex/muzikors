'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Disc, Disc3, User, Pause, Store, Mic2, Share2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';
import { getUserDailySongRights } from '../lib/timeHelpers';
import { triggerHaptic } from '../../utils/haptics';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

const DEFAULT_BG_TITLE = 'Mekan Fon Müziği';

export const NowPlayingSection: React.FC = () => {
  const { nowPlaying, queue, audioProgress, isPlayingAudio, openModal, activeVenue, user, openProfile, showToast } = useApp();
  const reduceMotion = useReducedMotion();

  // "Senin şarkın çalıyor" kutlaması: kullanıcının şarkısı çalmaya başladığı an bir kez
  const [celebrating, setCelebrating] = useState(false);
  const celebratedTrackRef = useRef<string | null>(null);
  const isMyTrack = !!(user && nowPlaying && nowPlaying.requestedByUserId === user.id);

  useEffect(() => {
    if (!nowPlaying || !isMyTrack || !isPlayingAudio) return;
    if (celebratedTrackRef.current === nowPlaying.id) return;
    celebratedTrackRef.current = nowPlaying.id;
    setCelebrating(true);
    triggerHaptic('success');
    const timer = setTimeout(() => setCelebrating(false), 2600);
    return () => clearTimeout(timer);
  }, [nowPlaying?.id, isMyTrack, isPlayingAudio]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isPaused = activeVenue?.is_paused === true;

  // If venue playback is paused by cafe admin
  if (isPaused) {
    return (
      <div className="px-4 pt-2">
        <div className="rounded-[28px] px-6 py-9 bg-[var(--theme-card)] text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-white/[0.06] grid place-items-center text-white/70 mb-4">
            <Pause className="w-6 h-6" />
          </div>
          <h3 className="text-[17px] font-bold">Müzik kısa bir mola verdi</h3>
          <p className="text-[13px] text-white/55 mt-1.5 max-w-[270px] leading-relaxed">
            Mekân yayını geçici olarak durdurdu. Yayın başlayınca sıradaki şarkılar kaldığı yerden devam eder.
          </p>
        </div>
      </div>
    );
  }

  const songRights = getUserDailySongRights(user);
  const albumSrc = nowPlaying ? nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '' : '';
  const isBgMusicTrack = !!nowPlaying && ((nowPlaying as any).isBackgroundMusic === true || nowPlaying.id === 'spotify-bg');
  // Fon listesinden çalan şarkı da adı ve kapağı biliniyorsa gösterilir
  const hasVisibleTrack = !!nowPlaying && (!isBgMusicTrack || (!!albumSrc && !!nowPlaying.title && nowPlaying.title !== DEFAULT_BG_TITLE));

  // Boş durum: sıraya ilk şarkıyı eklemeye davet
  if (!nowPlaying || !hasVisibleTrack) {
    return (
      <div className="px-4 pt-2">
        <div className="rounded-[28px] px-6 py-9 bg-[var(--theme-card)] text-center flex flex-col items-center">
          <div className="relative w-24 h-24 mb-5" aria-hidden="true">
            <span className="ring-out absolute inset-0 rounded-full border border-[var(--theme-primary)]/40" />
            <span className="ring-out-delayed absolute inset-0 rounded-full border border-[var(--theme-primary)]/40" />
            <div className="relative w-24 h-24 rounded-full bg-white/[0.05] grid place-items-center">
              <Disc3 className="spin-slow w-11 h-11 text-[var(--theme-primary)]" strokeWidth={1.5} />
            </div>
          </div>
          <h3 className="text-[19px] font-bold tracking-tight">
            {queue.length > 0 ? 'Müzik birazdan başlıyor' : 'Sıranın ilk şarkısını sen seç'}
          </h3>
          <p className="text-[13px] text-white/55 mt-1.5 max-w-[260px] leading-relaxed">
            {queue.length > 0
              ? `Sırada ${queue.length} şarkı var. Sen de ekle, sıra sana gelsin.`
              : 'Seçtiğin şarkı mekânın hoparlörlerinden herkese çalar.'}
          </p>
          <button
            onClick={() => openModal('search')}
            className="mt-6 min-h-[48px] px-6 rounded-2xl bg-[var(--theme-primary)] text-black font-bold text-[15px] active:scale-[0.97] transition-transform duration-150 flex items-center gap-2"
          >
            <Search className="w-4 h-4" strokeWidth={2.5} />
            <span>Şarkı ara</span>
            {user && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-black/15 text-[11px] font-bold tabular-nums">
                {songRights.remainingSongs} hak
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  const isMusicPlaying = isPlayingAudio && nowPlaying.isPlaying !== false && !isPaused;
  const durationSec = nowPlaying.duration || (nowPlaying.durationMs ? Math.round(nowPlaying.durationMs / 1000) : 180);
  const currentElapsed = Math.min(durationSec, Math.max(0, audioProgress));
  const progressPercent = durationSec > 0 ? Math.min(100, (currentElapsed / durationSec) * 100) : 0;

  return (
    <div className="relative w-full px-4 pt-2 pb-2">
      {/* Kapaktan taşan renk halesi */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 -top-6 h-[380px] bg-cover bg-center blur-3xl opacity-25 pointer-events-none scale-125 transition-[background-image,opacity] duration-1000 [mask-image:radial-gradient(ellipse_at_center,black_15%,transparent_65%)]"
        style={{ backgroundImage: albumSrc ? `url(${albumSrc})` : undefined }}
      />

      {/* Main Elevated Player Card */}
      <div className="relative z-10 w-full rounded-[28px] bg-[rgba(var(--theme-card-rgb),0.78)] backdrop-blur-xl border border-white/[0.06] p-5 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.7)] flex flex-col items-center overflow-hidden">

        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between mb-4">
          {!isMusicPlaying ? (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-white/50" />
              <span>Duraklatıldı</span>
            </div>
          ) : isMyTrack ? (
            <div className="inline-flex items-center gap-2 text-xs font-bold text-[var(--theme-primary-light)] tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
              <span>Senin şarkın çalıyor</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--theme-primary-light)] tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
              <span>Şu an çalıyor</span>
            </div>
          )}

          {/* Ekolayzer: yalnızca müzik çalarken oynar */}
          <div className="flex items-end gap-[3px] h-4 px-1" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`w-[3px] rounded-full bg-[var(--theme-primary)] ${isMusicPlaying ? 'eq-bar' : 'block h-4 opacity-40'}`}
                style={isMusicPlaying ? undefined : { transform: `scaleY(${[0.35, 0.8, 0.5, 0.65][i]})`, transformOrigin: 'bottom' }}
              />
            ))}
          </div>
        </div>

        {/* Albüm kapağı: şarkı değişince yumuşak geçiş, çalarken hafifçe nefes alır */}
        <div className="relative w-56 h-56 sm:w-60 sm:h-60 mb-5 shrink-0">
          <div
            aria-hidden="true"
            className="absolute inset-4 rounded-3xl bg-[var(--theme-primary)] opacity-25 blur-2xl transition-colors duration-1000"
          />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={nowPlaying.id + albumSrc}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.88, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0"
            >
              <div
                className={`w-full h-full rounded-3xl overflow-hidden border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.6)] transition-[transform,filter] duration-700 ${
                  isMusicPlaying ? 'cover-breathe' : 'scale-[0.96] grayscale-[35%]'
                }`}
              >
                <img
                  src={albumSrc}
                  alt={nowPlaying.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Track Title & Artist */}
        <div className="text-center w-full max-w-sm mb-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={nowPlaying.id + nowPlaying.title}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <h2 className="text-2xl font-black text-white truncate tracking-tight leading-tight">
                {nowPlaying.title}
              </h2>
              <p className="text-[15px] text-white/65 font-medium truncate mt-1">
                {nowPlaying.artist}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Requester Badge */}
          {(() => {
            const isVenue = isVenueOrBackgroundRequester(nowPlaying.requestedBy, nowPlaying.requestedByUserId);
            const isBgMusic = isBackgroundMusicRequester(nowPlaying.requestedBy) || isBgMusicTrack;

            if (isVenue || isBgMusic) {
              return (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-white/[0.05] text-[12px] text-white/60">
                  {isBgMusic ? (
                    <>
                      <Disc className="w-3.5 h-3.5 text-white/50" />
                      <span className="font-medium tracking-wide">Mekânın fon listesi</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-3.5 h-3.5 text-white/50" />
                      <span className="font-medium tracking-wide">Mekânın seçimi</span>
                    </>
                  )}
                </div>
              );
            }

            const isAnon =
              nowPlaying.isAnonymous === true ||
              nowPlaying.is_anonymous === true ||
              nowPlaying.requestedBy === 'Anonim' ||
              nowPlaying.requestedBy?.trim().toLowerCase() === 'anonim' ||
              nowPlaying.requestedBy?.startsWith('Anonim');

            return (
              <div
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-3 rounded-full bg-white/[0.05] text-[12px] text-white/60 cursor-pointer hover:bg-white/10 active:scale-95 transition-all"
                onClick={() => {
                  if (isAnon) {
                    showToast('Bu profil gizlidir.');
                    return;
                  }
                  if (nowPlaying.requestedByUserId) {
                    openProfile(nowPlaying.requestedByUserId);
                  }
                }}
              >
                <User className="w-3 h-3 text-white/45" />
                <span className="truncate flex items-center gap-1">
                  İsteyen: <strong className="text-white font-semibold">
                    {(isMyTrack && !isAnon)
                      ? 'Sen'
                      : isAnon
                        ? 'Anonim'
                        : (nowPlaying.requestedBy.startsWith('@') || nowPlaying.requestedBy.includes('.***'))
                          ? nowPlaying.requestedBy.replace(' VIP', '')
                          : formatUserDisplayName(null, nowPlaying.requestedBy.replace(' VIP', ''))}
                  </strong>
                  {(nowPlaying.requestedBy?.includes('VIP') || (isMyTrack && user?.isPremium && !isAnon)) && (
                    <span className="text-[8px] font-black bg-[var(--theme-primary)] text-black px-1.5 py-0.5 rounded uppercase ml-1">VIP</span>
                  )}
                </span>
              </div>
            );
          })()}
        </div>

        {/* İlerleme çubuğu: saniye saniye zıplamak yerine akar */}
        <div className="w-full max-w-sm px-1 mb-4">
          <div className="relative w-full h-1.5 bg-white/10 rounded-full">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[var(--theme-primary)] ease-linear"
              style={{ width: `${progressPercent}%`, transition: isMusicPlaying ? 'width 1s linear' : 'width 0.3s ease-out' }}
            >
              <span
                aria-hidden="true"
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--theme-primary-light)] shadow-[0_0_10px_var(--theme-glow)]"
              />
            </div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-semibold text-neutral-400 mt-2 tabular-nums">
            <span>{formatTime(currentElapsed)}</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>

        {/* Hızlı eylemler: eşit genişlikte, nötr */}
        <div className="w-full max-w-sm grid grid-cols-3 gap-2">
          <button
            onClick={handleOpenSpotify}
            className="min-h-[44px] rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] active:scale-[0.96] transition-[transform,background-color] duration-150 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white/85"
          >
            <svg className="w-4 h-4 shrink-0 text-[#1DB954]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.52 17.34c-.24.36-.66.48-1.02.24-2.82-1.74-6.36-2.1-10.56-1.14-.42.12-.78-.18-.9-.54-.12-.42.18-.78.54-.9 4.56-1.02 8.52-.6 11.64 1.32.42.18.48.66.3 1.02zm1.44-3.3c-.3.42-.84.6-1.26.3-3.24-1.98-8.16-2.58-11.94-1.38-.48.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15 10.56 18.72 12.84c.36.18.54.78.24 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.3c-.6.18-1.2-.18-1.38-.72-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.62.54.3.72 1.02.42 1.56-.3.42-1.02.6-1.56.3z" />
            </svg>
            <span>Spotify</span>
          </button>
          <button
            onClick={() => openModal('lyrics')}
            className="min-h-[44px] rounded-2xl bg-white/[0.06] hover:bg-white/[0.09] active:scale-[0.96] transition-[transform,background-color] duration-150 flex items-center justify-center gap-1.5 text-[13px] font-semibold text-white/85"
          >
            <Mic2 className="w-4 h-4 shrink-0 text-white/60" />
            <span>Sözler</span>
          </button>
          <button
            onClick={() => openModal('story_share')}
            className={`min-h-[44px] rounded-2xl active:scale-[0.96] transition-[transform,background-color] duration-150 flex items-center justify-center gap-1.5 text-[13px] font-semibold ${
              isMyTrack
                ? 'bg-[rgba(var(--theme-primary-rgb),0.16)] text-[var(--theme-primary-light)]'
                : 'bg-white/[0.06] hover:bg-white/[0.09] text-white/85'
            }`}
          >
            <Share2 className={`w-4 h-4 shrink-0 ${isMyTrack ? '' : 'text-white/60'}`} />
            <span>{isMyTrack ? 'Hikayen' : 'Paylaş'}</span>
          </button>
        </div>

        {/* Kutlama: kullanıcının şarkısı çalmaya başladığında kapak rengiyle dalga */}
        <AnimatePresence>
          {celebrating && (
            <motion.div
              key="celebrate"
              role="status"
              aria-live="polite"
              initial={reduceMotion ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 38%)' }}
              animate={reduceMotion ? { opacity: 1 } : { clipPath: 'circle(150% at 50% 38%)' }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-20 rounded-3xl bg-[var(--theme-primary)] flex flex-col items-center justify-center text-center px-6 cursor-pointer"
              onClick={() => setCelebrating(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: reduceMotion ? 0 : 0.25, duration: 0.4 }}
              >
                <p className="text-xs font-black uppercase tracking-[0.2em] text-black/60">Şimdi herkes dinliyor</p>
                <p className="text-3xl font-black text-black mt-2 leading-tight">Şarkın çalıyor</p>
                <p className="text-sm font-bold text-black/75 mt-2 truncate max-w-[260px]">{nowPlaying.title}</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
