'use client';

import React from 'react';
import { Play, Disc, User, Volume2, Music, Store, ExternalLink, Mic2, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';
import { getUserDailySongRights } from '../lib/timeHelpers';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';

export const NowPlayingSection: React.FC = () => {
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

  // If venue playback is paused by cafe admin
  if (isPaused) {
    return (
      <div className="px-4 py-3">
        <div className="rounded-3xl p-6 border border-[var(--theme-primary)]/30 bg-[var(--theme-card)]/90 backdrop-blur-xl relative overflow-hidden shadow-2xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] shadow-lg animate-pulse">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] text-[10px] font-black uppercase tracking-wider">
              Canlı Yayın Duraklatıldı
            </span>
            <h3 className="text-base font-bold text-white mt-2">
              Müzik Yayıncı Tarafından Durduruldu
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[260px] mx-auto leading-relaxed">
              Mekan yöneticisi yayını geçici olarak duraklattı. Akış başlatıldığında şarkınız çalmaya devam edecektir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const songRights = getUserDailySongRights(user);

  // If no user track is currently playing or if it is Spotify background music
  if (!nowPlaying || (nowPlaying as any).isBackgroundMusic === true || nowPlaying.id === 'spotify-bg') {
    return (
      <div className="px-4 py-3">
        <div className="rounded-3xl p-6 border border-white/[0.08] bg-[var(--theme-card)]/90 backdrop-blur-2xl relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] text-center flex flex-col items-center justify-center space-y-3.5">
          <div className="w-16 h-16 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)] shadow-inner">
            <Music className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Mekânda Fon Müziği Çalıyor</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-[250px] mx-auto leading-relaxed">
              Sıraya ilk şarkıyı sen ekle ve salonda favori parçanın sesini duyur!
            </p>
          </div>
          <button
            onClick={() => openProtectedModal('search', 'Şarkı eklemek için lütfen Google veya Spotify ile giriş yapın')}
            className="py-3 px-6 rounded-2xl bg-[var(--theme-primary)] hover:opacity-90 text-black font-black text-xs shadow-md active:scale-95 transition-all flex items-center gap-2"
          >
            <span>+ Sıraya İlk Şarkıyı Ekle</span>
            {user && (
              <span className="px-2 py-0.5 rounded-full bg-black/20 text-black text-[10px] font-black">
                {songRights.display}
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
  const albumSrc = nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '';

  return (
    <div className="relative w-full px-4 pt-2 pb-2 overflow-hidden">
      {/* Ambient Artwork Glow with smooth gradient fade */}
      <div 
        className="absolute inset-0 bg-cover bg-center blur-3xl opacity-10 pointer-events-none scale-110 transition-all duration-1000 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_60%)]"
        style={{ backgroundImage: albumSrc ? `url(${albumSrc})` : undefined }}
      />
      
      {/* Main Elevated Player Card */}
      <div className="relative z-10 w-full rounded-3xl bg-[var(--theme-card)] border border-white/[0.08] p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.85)] flex flex-col items-center transition-all duration-300">
        
        {/* Top Status Header */}
        <div className="w-full flex items-center justify-between mb-4">
          {!isMusicPlaying ? (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Duraklatıldı</span>
            </div>
          ) : user && nowPlaying.requestedByUserId === user.id ? (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--theme-primary)] tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[var(--theme-primary)] animate-pulse" />
              <span>Senin Şarkın</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Şu An Çalıyor</span>
            </div>
          )}

          {/* Equalizer Waveform Indicator */}
          <div className="flex items-center gap-1 h-4 px-1" aria-hidden="true">
            <span className={`w-1 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-1' : 'h-1.5 opacity-40'}`} />
            <span className={`w-1 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-2' : 'h-3.5 opacity-40'}`} />
            <span className={`w-1 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-3' : 'h-2 opacity-40'}`} />
            <span className={`w-1 bg-[var(--theme-primary)] rounded-full transition-all ${isMusicPlaying ? 'animate-bar-4' : 'h-3 opacity-40'}`} />
          </div>
        </div>

        {/* Hero Album Art with Vinyl Reflection */}
        <div className="relative w-40 h-40 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.8)] mb-4 group shrink-0">
          <img
            src={albumSrc}
            alt={nowPlaying.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-full h-full object-cover group-active:scale-95 transition-transform duration-500 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Track Title & Artist */}
        <div className="text-center w-full max-w-sm mb-3">
          <h2 className="text-lg sm:text-xl font-black text-white truncate tracking-tight leading-tight">
            {nowPlaying.title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--theme-primary-light)] font-bold truncate mt-1">
            {nowPlaying.artist}
          </p>

          {/* Requester Badge */}
          {(() => {
            const isVenue = isVenueOrBackgroundRequester(nowPlaying.requestedBy, nowPlaying.requestedByUserId);
            const isBgMusic = isBackgroundMusicRequester(nowPlaying.requestedBy) || (nowPlaying as any).isBackgroundMusic === true;

            if (isVenue || isBgMusic) {
              return (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-neutral-300">
                  {isBgMusic ? (
                    <>
                      <Disc className="w-3.5 h-3.5 text-neutral-400" />
                      <span className="font-medium tracking-wide">Mekan Fon Listesi</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                      <span className="font-semibold text-white tracking-wide">Mekan Sahibi</span>
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
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-white/[0.04] border border-white/10 text-[11px] text-neutral-300 cursor-pointer hover:bg-white/10 active:scale-95 transition-all"
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
                <User className="w-3 h-3 text-[var(--theme-primary)]" />
                <span className="truncate flex items-center gap-1">
                  İsteyen: <strong className="text-white font-semibold">
                    {(user && nowPlaying.requestedByUserId === user.id && !isAnon) 
                      ? 'Sen' 
                      : isAnon
                        ? 'Anonim'
                        : (nowPlaying.requestedBy.startsWith('@') || nowPlaying.requestedBy.includes('.***'))
                          ? nowPlaying.requestedBy.replace(' VIP', '')
                          : formatUserDisplayName(null, nowPlaying.requestedBy.replace(' VIP', ''))}
                  </strong>
                  {(nowPlaying.requestedBy?.includes('VIP') || (user && nowPlaying.requestedByUserId === user.id && user.isPremium && !isAnon)) && (
                    <span className="text-[8px] font-black bg-[var(--theme-primary)] text-black px-1.5 py-0.5 rounded uppercase ml-1">VIP</span>
                  )}
                </span>
              </div>
            );
          })()}
        </div>

        {/* Live Audio Progress Bar */}
        <div className="w-full max-w-sm px-2 mb-3">
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative">
            <div 
              className="h-full bg-[var(--theme-primary)] rounded-full transition-all duration-300 ease-linear shadow-[0_0_8px_var(--theme-glow)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400 mt-1.5">
            <span>{formatTime(currentElapsed)}</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="w-full max-w-sm flex items-center gap-2 pt-1">
          {/* Spotify Direct Link */}
          <button
            onClick={handleOpenSpotify}
            className="flex-1 py-2 px-2 rounded-xl bg-[#1DB954]/10 hover:bg-[#1DB954]/20 active:bg-[#1DB954]/30 border border-[#1DB954]/30 text-[#1DB954] active:scale-95 transition-all flex items-center justify-center gap-1 text-xs font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Spotify</span>
          </button>

          {/* Lyrics Modal Trigger */}
          <button
            onClick={() => openModal('lyrics')}
            className="flex-1 py-2 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-1 text-xs font-bold"
          >
            <Mic2 className="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
            <span className="truncate">Sözler</span>
          </button>

          {/* Story Share Trigger */}
          <button
            onClick={() => openModal('story_share')}
            className={`flex-1 py-2 px-2 rounded-xl border active:scale-95 transition-all flex items-center justify-center gap-1 text-xs font-bold ${
              user && nowPlaying.requestedByUserId === user.id
                ? 'bg-[var(--theme-primary)]/15 hover:bg-[var(--theme-primary)]/25 active:bg-[var(--theme-primary)]/30 border-[var(--theme-primary)]/40 text-[var(--theme-primary-light)]'
                : 'bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border-white/10 text-neutral-200'
            }`}
            title="Şarkıyı Instagram, WhatsApp veya X'te Paylaş"
          >
            <Share2 className="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
            <span className="truncate">{user && nowPlaying.requestedByUserId === user.id ? 'Hikayen' : 'Paylaş'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
