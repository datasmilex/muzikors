'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Compass, Menu, Mic2, Pause, Plus, Share2, Store, Trophy, User } from 'lucide-react';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { useApp } from '../context/AppContext';
import { ModalType, Track } from '../types';
import { getUserDailySongRights, isClaimedTodayTR } from '../lib/timeHelpers';
import { getRequesterLabel, getUpcomingTracks, isAnonymousTrack } from '../utils/queueLabels';
import { QueueRow } from './queue/QueueRow';
import { VetoSheet } from './queue/VetoSheet';
import { EASE_OUT, SPRING_SNAPPY } from '../lib/motion';

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

// ─── 1. ÇALAN ŞARKI ─────────────────────────────────────────────────────────
export const LandscapeNowPlaying: React.FC = () => {
  const { nowPlaying, queue, audioProgress, isPlayingAudio, openModal, activeVenue, user, openProfile, showToast } = useApp();
  const reduceMotion = useReducedMotion();
  const isPaused = activeVenue?.is_paused === true;

  const openSpotify = async () => {
    if (!nowPlaying) return;
    const trackId = (nowPlaying.spotifyUri || nowPlaying.id || '').replace('spotify:track:', '');
    const webUrl = `https://open.spotify.com/track/${trackId}`;
    try {
      if (Capacitor.isNativePlatform()) {
        window.location.href = `spotify:track:${trackId}`;
        setTimeout(() => Browser.open({ url: webUrl }), 800);
      } else {
        window.open(webUrl, '_blank');
      }
    } catch {
      window.open(webUrl, '_blank');
    }
  };

  const card = 'h-full w-full rounded-[24px] bg-[var(--theme-card)] p-4 flex flex-col overflow-hidden';

  if (isPaused) {
    return (
      <div className={`${card} items-center justify-center text-center`}>
        <span className="w-12 h-12 rounded-full bg-white/[0.06] grid place-items-center text-white/70 mb-3">
          <Pause className="w-5 h-5" />
        </span>
        <p className="text-[15px] font-bold">Müzik kısa bir mola verdi</p>
        <p className="text-[12px] text-white/50 mt-1 max-w-[240px]">Yayın başlayınca sıra kaldığı yerden devam eder.</p>
      </div>
    );
  }

  if (!nowPlaying || (nowPlaying as any).isBackgroundMusic === true || nowPlaying.id === 'spotify-bg') {
    const rights = getUserDailySongRights(user);
    return (
      <div className={`${card} items-center justify-center text-center`}>
        <p className="text-[17px] font-bold">{queue.length > 0 ? 'Müzik birazdan başlıyor' : 'Sıranın ilk şarkısını sen seç'}</p>
        <p className="text-[13px] text-white/50 mt-1">
          {queue.length > 0 ? `Sırada ${queue.length} şarkı var.` : 'Seçtiğin şarkı mekânda herkese çalar.'}
        </p>
        <button
          type="button"
          onClick={() => openModal('search')}
          className="mt-4 min-h-[44px] px-5 rounded-2xl bg-[var(--theme-primary)] text-black text-[14px] font-bold active:scale-[0.97] transition-transform"
        >
          Şarkı ara{user ? ` · ${rights.remainingSongs} hak` : ''}
        </button>
      </div>
    );
  }

  const isMusicPlaying = isPlayingAudio && nowPlaying.isPlaying !== false;
  const durationSec = nowPlaying.duration || (nowPlaying.durationMs ? Math.round(nowPlaying.durationMs / 1000) : 180);
  const elapsed = Math.min(durationSec, Math.max(0, audioProgress));
  const progress = durationSec > 0 ? Math.min(100, (elapsed / durationSec) * 100) : 0;
  const albumSrc = nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '';
  const isMine = Boolean(user && nowPlaying.requestedByUserId === user.id);
  const isAnon = isAnonymousTrack(nowPlaying);
  const requester = getRequesterLabel(nowPlaying, user?.id);
  const canOpenProfile = !isAnon && !isMine && Boolean(nowPlaying.requestedByUserId) && requester !== 'Mekân' && requester !== 'Fon listesi';

  return (
    <div className={`${card} relative justify-between`}>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-125 pointer-events-none transition-[background-image] duration-1000"
        style={{ backgroundImage: albumSrc ? `url(${albumSrc})` : undefined }}
      />

      <div className="relative flex items-center justify-between text-[12px] font-semibold text-white/60">
        <span className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isMusicPlaying ? 'bg-[var(--theme-primary)]' : 'bg-white/40'}`} />
          {!isMusicPlaying ? 'Duraklatıldı' : isMine ? 'Senin şarkın çalıyor' : 'Şu an çalıyor'}
        </span>
        <span className="flex items-end gap-[3px] h-3.5" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`w-[3px] rounded-full bg-[var(--theme-primary)] ${isMusicPlaying ? 'eq-bar h-3.5' : 'h-3.5 opacity-40'}`}
              style={isMusicPlaying ? undefined : { transform: `scaleY(${[0.35, 0.8, 0.5, 0.65][i]})`, transformOrigin: 'bottom' }}
            />
          ))}
        </span>
      </div>

      <div className="relative flex items-center gap-4 min-w-0 my-auto">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={nowPlaying.id + albumSrc}
            src={albumSrc}
            alt=""
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-[0_12px_30px_rgba(0,0,0,0.5)]"
          />
        </AnimatePresence>
        <div className="min-w-0">
          <p className="text-[18px] font-bold leading-tight truncate">{nowPlaying.title}</p>
          <p className="text-[14px] text-white/60 truncate mt-0.5">{nowPlaying.artist}</p>
          {canOpenProfile ? (
            <button
              type="button"
              onClick={() => openProfile(nowPlaying.requestedByUserId!)}
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-white/55 hover:text-white"
            >
              <User className="w-3.5 h-3.5" />
              {requester}
            </button>
          ) : (
            <p
              className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-white/55"
              onClick={() => isAnon && showToast('Bu profil gizli.')}
            >
              {requester === 'Mekân' || requester === 'Fon listesi' ? <Store className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              {requester === 'Mekân' ? 'Mekânın seçimi' : requester === 'Fon listesi' ? 'Mekânın fon listesi' : requester}
            </p>
          )}
        </div>
      </div>

      <div className="relative space-y-3">
        <div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--theme-primary)]"
              style={{ width: `${progress}%`, transition: isMusicPlaying ? 'width 1s linear' : 'width 0.3s ease-out' }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/45 mt-1.5 tabular-nums">
            <span>{formatTime(elapsed)}</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <button type="button" onClick={openSpotify} className="min-h-[40px] rounded-xl bg-white/[0.06] text-[12px] font-semibold text-white/85 active:scale-[0.96] transition-transform">
            Spotify
          </button>
          <button
            type="button"
            onClick={() => openModal('lyrics')}
            className="min-h-[40px] rounded-xl bg-white/[0.06] text-[12px] font-semibold text-white/85 active:scale-[0.96] transition-transform inline-flex items-center justify-center gap-1.5"
          >
            <Mic2 className="w-3.5 h-3.5 text-white/60" />
            Sözler
          </button>
          <button
            type="button"
            onClick={() => openModal('story_share')}
            className={`min-h-[40px] rounded-xl text-[12px] font-semibold active:scale-[0.96] transition-transform inline-flex items-center justify-center gap-1.5 ${
              isMine ? 'bg-[rgba(var(--theme-primary-rgb),0.16)] text-[var(--theme-primary-light)]' : 'bg-white/[0.06] text-white/85'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            {isMine ? 'Hikayen' : 'Paylaş'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 2. SIRADAKİ ŞARKILAR ───────────────────────────────────────────────────
export const LandscapeQueue: React.FC = () => {
  const { queue, nowPlaying, user, openModal } = useApp();
  const [vetoTarget, setVetoTarget] = useState<Track | null>(null);
  const closeVeto = useCallback(() => setVetoTarget(null), []);
  const upcoming = useMemo(() => getUpcomingTracks(queue, nowPlaying), [queue, nowPlaying]);
  const myIndex = user ? upcoming.findIndex((t) => t.requestedByUserId === user.id) : -1;

  return (
    <div className="h-full w-full rounded-[24px] bg-[var(--theme-card)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <p className="text-[16px] font-bold">
          Sırada <span className="text-white/40 font-semibold">{upcoming.length}</span>
        </p>
        {myIndex >= 0 && <span className="text-[12px] font-semibold text-[var(--theme-primary-light)]">Senin sıran: {myIndex + 1}</span>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain scrollbar-hide px-4 pb-3">
        {upcoming.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <p className="text-[14px] font-semibold">Sırada şarkı yok</p>
            <p className="text-[12px] text-white/50 mt-1">İlk şarkıyı sen ekle.</p>
            <button
              type="button"
              onClick={() => openModal('search')}
              className="mt-3 min-h-[40px] px-4 rounded-xl bg-white/[0.07] text-[13px] font-semibold active:scale-[0.97] transition-transform"
            >
              Şarkı ara
            </button>
          </div>
        ) : (
          <ul>
            <AnimatePresence initial={false}>
              {upcoming.map((track, index) => (
                <QueueRow key={track.id} track={track} index={index} compact onVeto={setVetoTarget} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <VetoSheet track={vetoTarget} onClose={closeVeto} />
    </div>
  );
};

// ─── 3. SAĞ GEZİNME ŞERİDİ ──────────────────────────────────────────────────
export const LandscapeNavRail: React.FC = () => {
  const { openModal, isVenueActive, activeModal, user, showToast } = useApp();
  const rights = getUserDailySongRights(user);
  const rewardWaiting = Boolean(user) && !isClaimedTodayTR(user?.lastDailyClaim || null);

  const items: { modal: ModalType; label: string; icon: React.ElementType; badge?: boolean }[] = [
    { modal: 'venue_info', label: 'Mekân', icon: Store },
    { modal: 'leaderboard', label: 'Sıralama', icon: Trophy },
    { modal: 'map', label: 'Keşfet', icon: Compass },
    { modal: 'drawer', label: 'Menü', icon: Menu, badge: rewardWaiting },
  ];

  const renderItem = (item: (typeof items)[number]) => {
    const active = activeModal === item.modal;
    const Icon = item.icon;
    return (
      <button
        key={item.modal}
        type="button"
        onClick={() => openModal(item.modal)}
        aria-label={item.label}
        className={`relative w-full py-2 flex flex-col items-center gap-1 rounded-2xl active:scale-95 transition-[transform,color] duration-150 ${
          active ? 'text-white' : 'text-white/50 hover:text-white/80'
        }`}
      >
        {active && <motion.span layoutId="rail-active" transition={SPRING_SNAPPY} className="absolute inset-0 rounded-2xl bg-white/[0.08]" />}
        <span className="relative">
          <Icon className="w-5 h-5" />
          {item.badge && <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-[var(--theme-primary)]" />}
        </span>
        <span className="relative text-[10px] font-semibold">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="h-full w-full rounded-[24px] bg-[var(--theme-card)] flex flex-col items-center justify-between py-3 px-1.5">
      <div className="w-full space-y-1">{items.slice(0, 2).map(renderItem)}</div>
      <button
        type="button"
        onClick={() => (isVenueActive ? openModal('search') : showToast('Bu mekân şu an istek almıyor.'))}
        aria-label="Şarkı iste"
        className="relative w-12 h-12 rounded-full bg-[var(--theme-primary)] text-black grid place-items-center active:scale-90 transition-transform"
      >
        <Plus className="w-6 h-6" strokeWidth={2.75} />
        {user && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[var(--theme-bg)] text-[10px] font-bold text-white grid place-items-center tabular-nums">
            {rights.remainingSongs}
          </span>
        )}
      </button>
      <div className="w-full space-y-1">{items.slice(2).map(renderItem)}</div>
    </div>
  );
};
