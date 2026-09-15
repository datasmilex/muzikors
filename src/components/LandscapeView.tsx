'use client';

import React, { useState } from 'react';
import {
  Store,
  Map,
  Plus,
  MessageCircle,
  Trophy,
  Disc,
  User,
  Volume2,
  Music,
  ExternalLink,
  Mic2,
  ListMusic,
  ThumbsUp,
  Flame,
  Clock,
  Trash2,
  Crown,
  X,
  ShieldCheck,
  Loader2,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';
import { getUserDailySongRights } from '../lib/timeHelpers';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Track } from '../types';

// ─── 1. NOW PLAYING COMPONENT (LANDSCAPE COMPACT STUDIO) ─────────────────────
export const LandscapeNowPlaying: React.FC = () => {
  const { nowPlaying, audioProgress, isPlayingAudio, openProtectedModal, openModal, activeVenue, user, openProfile, showToast } = useApp();

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

  if (isPaused) {
    return (
      <div className="h-full w-full rounded-2xl p-4 border border-[var(--theme-primary)]/30 bg-[var(--theme-card)]/90 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] animate-pulse shadow-md">
          <Volume2 className="w-6 h-6" />
        </div>
        <div>
          <span className="px-2.5 py-0.5 rounded-full bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] text-[9px] font-black uppercase tracking-wider">
            Yayın Duraklatıldı
          </span>
          <h3 className="text-sm font-bold text-white mt-1">Müzik Durduruldu</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5 leading-snug">
            Mekan yöneticisi yayını geçici olarak duraklattı.
          </p>
        </div>
      </div>
    );
  }

  const songRights = getUserDailySongRights(user);

  if (!nowPlaying || (nowPlaying as any).isBackgroundMusic === true || nowPlaying.id === 'spotify-bg') {
    return (
      <div className="h-full w-full rounded-2xl p-4 border border-white/[0.08] bg-[var(--theme-card)]/90 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center text-center space-y-2.5">
        <div className="w-12 h-12 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)] shadow-inner">
          <Music className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-white">Mekânda Fon Müziği Çalıyor</h3>
          <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-0.5 leading-tight">
            Sıraya ilk şarkıyı sen ekle!
          </p>
        </div>
        <button
          onClick={() => openProtectedModal('search', 'Şarkı eklemek için giriş yapın')}
          className="py-2.5 px-4 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 text-black font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5"
        >
          <span>+ Şarkı İste</span>
          {user && (
            <span className="px-1.5 py-0.2 rounded-full bg-black/20 text-black text-[9px] font-black">
              {songRights.display}
            </span>
          )}
        </button>
      </div>
    );
  }

  const isMusicPlaying = isPlayingAudio && nowPlaying.isPlaying !== false && !isPaused;
  const durationSec = nowPlaying.duration || (nowPlaying.durationMs ? Math.round(nowPlaying.durationMs / 1000) : 180);
  const currentElapsed = Math.min(durationSec, Math.max(0, audioProgress));
  const progressPercent = durationSec > 0 ? Math.min(100, (currentElapsed / durationSec) * 100) : 0;
  const albumSrc = nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '';

  const isVenue = isVenueOrBackgroundRequester(nowPlaying.requestedBy, nowPlaying.requestedByUserId);
  const isBgMusic = isBackgroundMusicRequester(nowPlaying.requestedBy) || (nowPlaying as any).isBackgroundMusic === true;
  const isAnon =
    nowPlaying.isAnonymous === true ||
    nowPlaying.is_anonymous === true ||
    nowPlaying.requestedBy === 'Anonim' ||
    nowPlaying.requestedBy?.trim().toLowerCase() === 'anonim' ||
    nowPlaying.requestedBy?.startsWith('Anonim');

  return (
    <div className="relative h-full w-full rounded-2xl bg-[var(--theme-card)]/95 border border-white/[0.1] p-3.5 shadow-2xl backdrop-blur-2xl flex flex-col justify-between overflow-hidden">
      {/* Ambient Artwork Glow */}
      <div
        className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 pointer-events-none scale-125 transition-all duration-1000"
        style={{ backgroundImage: albumSrc ? `url(${albumSrc})` : undefined }}
      />

      {/* Top Status & Equalizer Bar */}
      <div className="relative z-10 w-full flex items-center justify-between mb-1">
        {!isMusicPlaying ? (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-400">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>Duraklatıldı</span>
          </div>
        ) : user && nowPlaying.requestedByUserId === user.id ? (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[var(--theme-primary)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse" />
            <span>Senin Şarkın</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Şu An Çalıyor</span>
          </div>
        )}

        <div className="flex items-center gap-1 h-3.5 px-1" aria-hidden="true">
          <span className={`w-0.5 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-1' : 'h-1 opacity-40'}`} />
          <span className={`w-0.5 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-2' : 'h-2.5 opacity-40'}`} />
          <span className={`w-0.5 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-3' : 'h-1.5 opacity-40'}`} />
          <span className={`w-0.5 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-4' : 'h-2 opacity-40'}`} />
        </div>
      </div>

      {/* Middle Row: Album Artwork + Track Details */}
      <div className="relative z-10 flex items-center gap-3 min-w-0 my-auto">
        {/* Album Artwork */}
        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-white/15 shadow-lg shrink-0 group">
          <img
            src={albumSrc}
            alt={nowPlaying.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Track Title, Artist & Requester */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h2 className="text-sm sm:text-base font-black text-white truncate tracking-tight leading-snug">
            {nowPlaying.title}
          </h2>
          <p className="text-xs font-bold text-[var(--theme-primary-light)] truncate mt-0.5">
            {nowPlaying.artist}
          </p>

          {/* Requester Tag */}
          <div className="mt-1.5 flex items-center">
            {isVenue || isBgMusic ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/10 text-[10px] text-neutral-300">
                {isBgMusic ? <Disc className="w-3 h-3 text-neutral-400" /> : <Store className="w-3 h-3 text-[var(--theme-primary)]" />}
                <span className="truncate">{isBgMusic ? 'Fon Listesi' : 'Mekan Sahibi'}</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (isAnon) {
                    showToast('Bu profil gizlidir.');
                    return;
                  }
                  if (nowPlaying.requestedByUserId) {
                    openProfile(nowPlaying.requestedByUserId);
                  }
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.05] hover:bg-white/10 border border-white/10 text-[10px] text-neutral-300 active:scale-95 transition-all truncate max-w-full"
              >
                <User className="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
                <span className="truncate">
                  {user && nowPlaying.requestedByUserId === user.id && !isAnon
                    ? 'Sen'
                    : isAnon
                    ? 'Anonim'
                    : formatUserDisplayName(null, nowPlaying.requestedBy?.replace(' VIP', ''))}
                </span>
                {(nowPlaying.requestedBy?.includes('VIP') || (user && nowPlaying.requestedByUserId === user.id && user.isPremium && !isAnon)) && (
                  <span className="text-[7px] font-black bg-[var(--theme-primary)] text-black px-1 rounded uppercase shrink-0">VIP</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Area: Progress Bar + Quick Buttons */}
      <div className="relative z-10 w-full space-y-2 mt-1">
        {/* Progress bar */}
        <div>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-[var(--theme-primary)] rounded-full transition-all duration-300 ease-linear shadow-[0_0_6px_var(--theme-glow)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-semibold text-neutral-400 mt-1">
            <span>{formatTime(currentElapsed)}</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleOpenSpotify}
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-[#1DB954]/10 hover:bg-[#1DB954]/20 active:bg-[#1DB954]/30 border border-[#1DB954]/30 text-[#1DB954] active:scale-95 transition-all flex items-center justify-center gap-1 text-[10px] font-bold"
          >
            <ExternalLink className="w-3 h-3 shrink-0" />
            <span className="truncate">Spotify</span>
          </button>

          <button
            onClick={() => openModal('lyrics')}
            className="flex-1 py-1.5 px-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1 text-[10px] font-bold"
          >
            <Mic2 className="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
            <span className="truncate">Sözler</span>
          </button>

          <button
            onClick={() => openModal('story_share')}
            className={`flex-1 py-1.5 px-1.5 rounded-lg border active:scale-95 transition-all flex items-center justify-center gap-1 text-[10px] font-bold ${
              user && nowPlaying.requestedByUserId === user.id
                ? 'bg-[var(--theme-primary)]/15 hover:bg-[var(--theme-primary)]/25 active:bg-[var(--theme-primary)]/30 border-[var(--theme-primary)]/40 text-[var(--theme-primary-light)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border-white/10 text-neutral-200'
            }`}
            title="Şarkıyı Instagram, WhatsApp veya X'te Paylaş"
          >
            <Share2 className="w-3 h-3 text-[var(--theme-primary)] shrink-0" />
            <span className="truncate">{user && nowPlaying.requestedByUserId === user.id ? 'Hikayen' : 'Paylaş'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── 2. UP NEXT QUEUE COMPONENT (LANDSCAPE SCROLLABLE LIST) ──────────────────
export const LandscapeQueue: React.FC = () => {
  const { queue, nowPlaying, voteTrack, vetoTrack, openProfile, user, showToast, openProtectedModal } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});
  const [vetoingTrackId, setVetoingTrackId] = useState<string | null>(null);
  const [trackToVeto, setTrackToVeto] = useState<Track | null>(null);
  const [isVetoAnonymous, setIsVetoAnonymous] = useState(false);

  const handleVoteTrack = (trackId: string) => {
    if (votingCooldowns[trackId]) return;
    setVotingCooldowns((prev) => ({ ...prev, [trackId]: true }));
    voteTrack(trackId);
    setTimeout(() => {
      setVotingCooldowns((prev) => ({ ...prev, [trackId]: false }));
    }, 2000);
  };

  const handleVeto = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vetoingTrackId) return;

    if (!user?.isPremium) {
      showToast('Sadece Premium üyeler şarkı silebilir.');
      return;
    }

    if (track.requestedByUserId === user.id) {
      showToast('Kendi şarkınızı silemezsiniz.');
      return;
    }

    setTrackToVeto(track);
    setIsVetoAnonymous(false);
  };

  const confirmExecuteVeto = async () => {
    if (!trackToVeto || vetoingTrackId) return;
    const target = trackToVeto;
    setVetoingTrackId(target.id);
    try {
      await vetoTrack(target.id, isVetoAnonymous);
      showToast(`"${target.title}" şarkısı sıradan kaldırıldı.`);
      setTrackToVeto(null);
    } catch (err: any) {
      showToast('Şarkı kaldırılamadı: ' + (err?.message || 'Lütfen tekrar deneyin.'));
    } finally {
      setVetoingTrackId(null);
    }
  };

  const isAnonymousTrack = (track: any) => {
    return (
      track.isAnonymous === true ||
      track.is_anonymous === true ||
      track.requestedBy === 'Anonim' ||
      track.requestedBy === 'Anonim Müşteri' ||
      track.requestedBy?.trim().toLowerCase() === 'anonim' ||
      track.requestedBy?.startsWith('Anonim')
    );
  };

  const getRequestedByLabel = (track: any) => {
    const isAnon = isAnonymousTrack(track);
    if (user && track.requestedByUserId === user.id && !isAnon) return 'Sen';
    if (isAnon) return 'Anonim';
    if (isVenueOrBackgroundRequester(track.requestedBy, track.requestedByUserId)) {
      return isBackgroundMusicRequester(track.requestedBy) ? 'Fon Listesi' : 'Mekan Sahibi';
    }
    if (!track.requestedBy) return 'Misafir';
    if (track.requestedBy.startsWith('@') || track.requestedBy.includes('.***')) {
      return track.requestedBy;
    }
    return formatUserDisplayName(null, track.requestedBy);
  };

  const filteredQueue = queue.filter((track) => {
    if (track.isPlaying) return false;
    if ((track as any).status === 'playing') return false;
    if (nowPlaying) {
      if (track.id === nowPlaying.id) return false;
      if (track.spotifyUri && track.spotifyUri === nowPlaying.spotifyUri) return false;
    }
    return true;
  });

  const myQueueIndex = filteredQueue.findIndex((t) => user && t.requestedByUserId === user.id);
  const myTrackPosition = myQueueIndex !== -1 ? myQueueIndex + 1 : null;

  return (
    <div className="h-full w-full rounded-2xl bg-[var(--theme-card)]/90 border border-white/[0.1] p-3 flex flex-col overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[var(--theme-primary)]" />
          <h3 className="text-xs font-bold text-white tracking-tight">Sıradaki Şarkılar</h3>
          <span className="px-1.5 py-0.2 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-bold text-neutral-300">
            {filteredQueue.length}
          </span>
        </div>

        {myTrackPosition !== null && (
          <span className="text-[10px] font-black text-amber-400 px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            Senin Sıran: #{myTrackPosition}
          </span>
        )}
      </div>

      {/* Scrollable Song List */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pt-2 pr-1 custom-scrollbar">
        {filteredQueue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-neutral-500">
            <Music className="w-8 h-8 mx-auto mb-1.5 opacity-30 text-[var(--theme-primary)]" />
            <p className="text-xs font-semibold text-neutral-400">Sırada bekleyen şarkı yok</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">İlk şarkıyı sen ekle ve çalsın!</p>
            <button
              onClick={() => openProtectedModal('search', 'Şarkı eklemek için giriş yapın')}
              className="mt-3 px-3 py-1.5 rounded-xl bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] text-xs font-bold active:scale-95 transition-all"
            >
              + Şarkı İste
            </button>
          </div>
        ) : (
          filteredQueue.map((track, idx) => {
            const isMySong = Boolean(user && track.requestedByUserId === user.id);
            const isAnon = isAnonymousTrack(track);

            return (
              <div
                key={track.id || idx}
                className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                  isMySong
                    ? 'bg-[var(--theme-card-alt)] border-[var(--theme-primary)]/40 shadow-sm'
                    : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                }`}
              >
                {/* Left: Queue Position & Cover */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-[11px] font-black text-neutral-500 w-4 text-center shrink-0">
                    {idx + 1}
                  </span>

                  <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-black/40">
                    <img
                      src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                      alt={track.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = '/logo.png';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-white truncate leading-tight">
                        {track.title}
                      </p>
                      {(track.isBoosted || (track as any).is_boosted) && (
                        <span className="text-[8px] font-black bg-[var(--theme-primary)] text-black px-1 rounded uppercase shrink-0">
                          VIP
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                      {track.artist}
                    </p>
                  </div>
                </div>

                {/* Right: Requester + Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (isAnon) {
                        showToast('Bu profil gizlidir.');
                        return;
                      }
                      if (track.requestedByUserId) {
                        openProfile(track.requestedByUserId);
                      }
                    }}
                    className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[9px] text-neutral-300 max-w-[90px] truncate"
                  >
                    <User className="w-2.5 h-2.5 text-[var(--theme-primary)] shrink-0" />
                    <span className="truncate">{getRequestedByLabel(track)}</span>
                  </button>

                  {/* Veto Action for Premium */}
                  {user?.isPremium && track.requestedByUserId !== user.id && (
                    <button
                      onClick={(e) => handleVeto(track, e)}
                      disabled={vetoingTrackId === track.id}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 active:scale-90 transition-all"
                      title="Şarkıyı Sil (Veto)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Upvote Button */}
                  <button
                    onClick={() => {
                      if (isMySong) {
                        showToast('Kendi istediğiniz şarkıya oy veremezsiniz');
                        return;
                      }
                      handleVoteTrack(track.id);
                    }}
                    disabled={votingCooldowns[track.id]}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-bold transition-all ${
                      isMySong
                        ? 'bg-white/[0.04] border-white/10 text-neutral-500 opacity-60 active:scale-95'
                        : 'bg-[var(--theme-primary)]/10 hover:bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] active:scale-95'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-[11px] font-black">{track.votes || 0}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* In-App Veto Confirmation Sheet for Landscape */}
      <AnimatePresence>
        {trackToVeto && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-sm rounded-3xl bg-[var(--theme-card)] border border-white/[0.12] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.95)] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Şarkıyı Sıradan Kaldır</h4>
                    <p className="text-[10px] text-neutral-400">Premium Veto Yetkisi</p>
                  </div>
                </div>
                <button
                  onClick={() => setTrackToVeto(null)}
                  className="p-1.5 rounded-full bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                <img
                  src={trackToVeto.albumCover || trackToVeto.coverUrl || trackToVeto.album_art || '/logo.png'}
                  alt={trackToVeto.title}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{trackToVeto.title}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{trackToVeto.artist}</p>
                </div>
              </div>

              {/* Anonymous Toggle */}
              <label className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] cursor-pointer hover:bg-white/[0.05] transition-colors">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-[var(--theme-primary)]" />
                  <div>
                    <span className="text-xs font-semibold text-white block">Anonim Veto</span>
                    <span className="text-[10px] text-neutral-400">İsminiz istek sahibine bildirilmez</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isVetoAnonymous}
                  onChange={(e) => setIsVetoAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-[var(--theme-primary)] rounded cursor-pointer"
                />
              </label>

              {/* Buttons */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  onClick={() => setTrackToVeto(null)}
                  disabled={vetoingTrackId === trackToVeto.id}
                  className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/10 text-neutral-300 font-semibold text-xs active:scale-95 transition-all text-center"
                >
                  Vazgeç
                </button>
                <button
                  onClick={confirmExecuteVeto}
                  disabled={vetoingTrackId === trackToVeto.id}
                  className="py-3 px-4 rounded-xl bg-red-500/90 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                >
                  {vetoingTrackId === trackToVeto.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kaldır</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── 3. FAR RIGHT 5-BUTTON NAV RAIL (LANDSCAPE DOCK) ─────────────────────────
export const LandscapeNavRail: React.FC = () => {
  const { openModal, isVenueBound, activeModal, user } = useApp();
  const songRights = getUserDailySongRights(user);
  const remainingSongs = songRights.remainingSongs;

  return (
    <div className="h-full w-full bg-[var(--theme-card)]/95 border-l border-white/[0.1] backdrop-blur-2xl flex flex-col items-center justify-around py-2 px-1 shadow-2xl z-20">
      {/* 1. Mekan Bilgisi */}
      <button
        onClick={() => openModal('venue_info')}
        disabled={!isVenueBound}
        className={`flex flex-col items-center justify-center w-full py-1.5 rounded-xl transition-all ${
          activeModal === 'venue_info'
            ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
            : 'text-neutral-400 hover:text-white'
        } ${!isVenueBound ? 'opacity-30 cursor-not-allowed' : 'active:scale-90'}`}
        title="Mekan Bilgisi"
      >
        <Store className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'venue_info' ? 2.5 : 2} />
        <span className="text-[9px] font-bold tracking-tight">Mekan</span>
        {activeModal === 'venue_info' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
      </button>

      {/* 2. Harita / Keşfet */}
      <button
        onClick={() => openModal('map')}
        className={`flex flex-col items-center justify-center w-full py-1.5 rounded-xl transition-all ${
          activeModal === 'map'
            ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
            : 'text-neutral-400 hover:text-white'
        } active:scale-90`}
        title="Harita"
      >
        <Map className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'map' ? 2.5 : 2} />
        <span className="text-[9px] font-bold tracking-tight">Harita</span>
        {activeModal === 'map' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
      </button>

      {/* 3. Centerpiece Action Button: Şarkı İste (FAB) */}
      <div className="flex flex-col items-center my-0.5 relative">
        <button
          onClick={() => openModal('search')}
          disabled={!isVenueBound}
          className={`relative flex items-center justify-center w-11 h-11 rounded-2xl theme-fab-gradient theme-glow-shadow active:scale-95 transition-all ${
            !isVenueBound ? 'opacity-40 cursor-not-allowed grayscale' : 'hover:scale-105'
          }`}
          title="Şarkı İste"
        >
          <Plus className="w-6 h-6 text-black stroke-[3]" />
          {user && isVenueBound && (
            <span className="absolute -top-1.5 -right-1 px-1 rounded-full bg-[var(--theme-bg)] border border-[var(--theme-primary)]/60 text-[8px] font-black text-[var(--theme-primary-light)] shadow-sm">
              {remainingSongs}
            </span>
          )}
        </button>
        <span className="text-[8px] font-black text-[var(--theme-primary)] uppercase tracking-wider mt-0.5">
          İstek
        </span>
      </div>

      {/* 4. Sıralama / Liderlik Tablosu */}
      <button
        onClick={() => openModal('leaderboard')}
        className={`flex flex-col items-center justify-center w-full py-1.5 rounded-xl transition-all ${
          activeModal === 'leaderboard'
            ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
            : 'text-neutral-400 hover:text-white'
        } active:scale-90`}
        title="Sıralama"
      >
        <Trophy className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'leaderboard' ? 2.5 : 2} />
        <span className="text-[9px] font-bold tracking-tight">Sıralama</span>
        {activeModal === 'leaderboard' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
      </button>

      {/* 5. Profil */}
      <button
        onClick={() => openModal(user ? 'profile' : 'login')}
        className={`flex flex-col items-center justify-center w-full py-1.5 rounded-xl transition-all ${
          activeModal === 'profile'
            ? 'text-[var(--theme-primary)] bg-[var(--theme-primary)]/10'
            : 'text-neutral-400 hover:text-white'
        } active:scale-90`}
        title="Profil"
      >
        <User className="w-5 h-5 mb-0.5" strokeWidth={activeModal === 'profile' ? 2.5 : 2} />
        <span className="text-[9px] font-bold tracking-tight">Profil</span>
        {activeModal === 'profile' && <span className="w-1 h-1 rounded-full bg-[var(--theme-primary)] mt-0.5" />}
      </button>
    </div>
  );
};
