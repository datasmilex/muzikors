'use client';

import React from 'react';
import { Play, Disc, User, Volume2, Music, Store, Radio, ExternalLink, Mic2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';
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
      <div className="px-4 py-2">
        <div className="glass-panel-gold rounded-3xl p-5 border-2 border-amber-500/60 bg-amber-500/10 relative overflow-hidden shadow-2xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-amber-500/20 border-2 border-amber-500/50 flex items-center justify-center text-amber-400 shadow-lg animate-pulse">
            <Volume2 className="w-7 h-7" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-extrabold uppercase tracking-wider">
              Canlı Yayın Duraklatıldı
            </span>
            <h3 className="text-base font-black text-white mt-2">
              Müzik Yayıncı Tarafından Durduruldu
            </h3>
            <p className="text-xs text-amber-200/70 mt-1 max-w-[260px] mx-auto">
              Mekan yöneticisi yayını geçici olarak duraklattı. Akış başlatıldığında şarkınız çalmaya devam edecektir.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const maxDailySongs = user?.isPremium ? 5 : 2;
  const usedSongs = user?.daily_songs_count || 0;
  const remainingSongs = Math.max(0, maxDailySongs - usedSongs);

  // If no user track is currently playing or if it is Spotify background music
  if (!nowPlaying || (nowPlaying as any).isBackgroundMusic === true || nowPlaying.id === 'spotify-bg') {
    return (
      <div className="px-4 py-2">
        <div className="glass-panel-gold rounded-3xl p-5 border border-[#D4AF37]/35 relative overflow-hidden shadow-2xl text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#1C130D] border-2 border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg">
            <Music className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Şu an mekânda fon müziği çalıyor</h3>
            <p className="text-xs text-amber-200/60 mt-0.5 max-w-[240px] mx-auto">
              Sıraya ilk şarkıyı sen ekle ve tüm salonda müziğin sesini duyur!
            </p>
          </div>
          <button
            onClick={() => openProtectedModal('search', 'Şarkı eklemek için lütfen Google veya Spotify ile giriş yapın')}
            className="py-2.5 px-5 rounded-2xl gold-gradient-bg text-stone-950 font-black text-xs shadow-lg active:brightness-110 active:scale-95 transition-all flex items-center gap-2"
          >
            <span>+ Sıraya İlk Şarkıyı Ekle</span>
            {user && (
              <span className="px-2 py-0.5 rounded-full bg-stone-950/20 text-stone-950 text-[10px] font-black border border-stone-950/15">
                {remainingSongs}/{maxDailySongs} Hak
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  const durationSec = nowPlaying.duration || 180;
  let currentElapsed = audioProgress;

  if (nowPlaying.id !== 'spotify-bg' && nowPlaying.startedAt) {
    const elapsedMs = Math.max(0, Date.now() - new Date(nowPlaying.startedAt).getTime());
    currentElapsed = Math.min(durationSec, Math.floor(elapsedMs / 1000));
  } else if (nowPlaying.id !== 'spotify-bg' && !nowPlaying.startedAt) {
    currentElapsed = 0;
  } else {
    currentElapsed = Math.min(durationSec, audioProgress);
  }

  const progressPercent = durationSec > 0 ? Math.min(100, (currentElapsed / durationSec) * 100) : 0;

  return (
    <div className="relative w-full overflow-hidden mb-2">
      {/* Cinematic Mesh Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#D4AF37]/20 via-[#120C08]/80 to-[#120C08] z-0 blur-2xl opacity-70 pointer-events-none" />
      
      <div className="relative z-10 px-4 pt-4 pb-2 flex flex-col items-center">
        {/* Header Badge */}
        {user && nowPlaying.requestedByUserId === user.id ? (
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 mb-3 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-500/20 to-amber-500/30 border border-[#D4AF37] backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse">
            <Music className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] font-black tracking-wider text-amber-200 uppercase">
              Senin Şarkın Çalıyor!
            </span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full bg-black/40 border border-[#D4AF37]/30 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Disc className={`w-3 h-3 text-[#D4AF37] ${isPlayingAudio ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-[9px] font-black tracking-[0.2em] gold-gradient-text uppercase">
              Şu An Çalıyor
            </span>
          </div>
        )}

        {/* Hero Album Art */}
        <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-[1.5rem] overflow-hidden border border-[#D4AF37]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.3)] mb-4 group">
          <img
            src={nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || ''}
            alt={nowPlaying.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            className="w-full h-full object-cover group-active:scale-95 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full gold-gradient-bg border-2 border-stone-950 flex items-center justify-center text-stone-950 shadow-xl backdrop-blur-md">
            <Play className="w-3 h-3 fill-stone-950 ml-0.5" />
          </div>
        </div>

        {/* Track Info (Compact Typography) */}
        <div className="text-center w-full max-w-xs mb-4">
          <h2 className="text-lg sm:text-xl font-black text-white truncate tracking-tight leading-tight drop-shadow-md">
            {nowPlaying.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#D4AF37] font-semibold truncate mt-0.5 drop-shadow-sm opacity-90">
            {nowPlaying.artist}
          </p>
          
          {/* Requester Badge */}
          {(() => {
            const isVenue = isVenueOrBackgroundRequester(nowPlaying.requestedBy, nowPlaying.requestedByUserId);
            const isBgMusic = isBackgroundMusicRequester(nowPlaying.requestedBy) || (nowPlaying as any).isBackgroundMusic === true;

            if (isVenue || isBgMusic) {
              return (
                <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-gradient-to-r from-amber-500/20 via-[#2A1D13] to-amber-500/20 border border-[#D4AF37]/70 text-[10px] text-amber-100 backdrop-blur-md shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                  <Store className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="tracking-wider flex items-center gap-1.5 font-bold uppercase">
                    <span className="text-amber-200/70 text-[9px]">Seçim:</span>
                    <strong className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 font-extrabold tracking-widest text-[10px]">
                      {isBgMusic ? '☕ Mekan Fon Müziği' : '👑 Mekan Sahibi'}
                    </strong>
                  </span>
                </div>
              );
            }

            return (
              <div 
                className="inline-flex items-center justify-center gap-1.5 px-2.5 py-0.5 mt-2 rounded-full bg-white/5 border border-white/10 text-[9px] text-amber-100 backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors"
                onClick={() => {
                  if (nowPlaying.requestedByUserId) openProfile(nowPlaying.requestedByUserId);
                }}
              >
                <User className="w-2.5 h-2.5 text-[#D4AF37]" />
                <span className="truncate tracking-wide flex items-center gap-1">
                  İsteyen: <strong className="text-white">
                    {(user && nowPlaying.requestedByUserId === user.id) 
                      ? 'Sen' 
                      : (nowPlaying.requestedBy.startsWith('@') || nowPlaying.requestedBy.includes('.***') || nowPlaying.requestedBy === 'Anonim')
                        ? nowPlaying.requestedBy.replace(' VIP', '')
                        : formatUserDisplayName(null, nowPlaying.requestedBy.replace(' VIP', ''))}
                  </strong>
                  {(nowPlaying.requestedBy.includes('VIP') || (user && nowPlaying.requestedByUserId === user.id && user.isPremium)) && (
                    <span className="text-[8px] font-black bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 px-1 py-0.5 rounded-[3px] uppercase ml-0.5 leading-none shadow-[0_0_5px_rgba(212,175,55,0.4)]">VIP</span>
                  )}
                </span>
              </div>
            );
          })()}

          {/* Action Buttons: 🟢 Spotify'da Aç & 📜 Şarkı Sözleri */}
          <div className="w-full flex items-center justify-center gap-2 mt-3 mb-1">
            {/* 🟢 Spotify'da Aç */}
            <button
              onClick={handleOpenSpotify}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#1DB954]/15 hover:bg-[#1DB954]/25 active:bg-[#1DB954]/30 border border-[#1DB954]/40 text-[#1DB954] active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm group"
              title="Spotify'da Aç / Favorilere Ekle"
            >
              <ExternalLink className="w-3 h-3 group-hover:scale-110 transition-transform text-[#1DB954]" />
              <span className="text-[10px] font-black tracking-tight">Spotify'da Aç</span>
            </button>

            {/* 📜 Şarkı Sözleri */}
            <button
              onClick={() => openModal('lyrics')}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 active:bg-[#D4AF37]/30 border border-[#D4AF37]/40 text-amber-200 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm group"
              title="Şarkı Sözlerini Gör"
            >
              <Mic2 className="w-3 h-3 text-[#D4AF37] group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-black tracking-tight">Şarkı Sözleri</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
