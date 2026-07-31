'use client';

import React from 'react';
import { Play, Disc, User, Volume2, Music } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { FloatingEmojis, EmojiReaction } from './FloatingEmojis';

export const NowPlayingSection: React.FC = () => {
  const { nowPlaying, audioProgress, isPlayingAudio, openProtectedModal, activeVenue, user } = useApp();
  const [reactions, setReactions] = React.useState<EmojiReaction[]>([]);

  React.useEffect(() => {
    if (!activeVenue || !nowPlaying || nowPlaying.id === 'spotify-bg') return;

    const channel = supabase.channel(`track_reactions_${activeVenue.id}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'track_reactions',
        filter: `venue_id=eq.${activeVenue.id}`
      }, (payload) => {
        // Only show if it's the current track
        if (payload.new.track_id === nowPlaying.id) {
          const newReaction: EmojiReaction = {
            id: payload.new.id || Math.random().toString(),
            emoji: payload.new.reaction,
            x: 20 + Math.random() * 60, // random x position between 20% and 80%
          };
          setReactions(prev => [...prev, newReaction]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeVenue, nowPlaying]);

  const handleSendReaction = async (emoji: string) => {
    if (!activeVenue || !nowPlaying || nowPlaying.id === 'spotify-bg') return;

    // Ekranda hemen göster (Optimistic UI)
    const optimisticReaction: EmojiReaction = {
      id: Math.random().toString(),
      emoji,
      x: 20 + Math.random() * 60,
    };
    setReactions(prev => [...prev, optimisticReaction]);

    // Veritabanına yaz
    await supabase.from('track_reactions').insert({
      venue_id: activeVenue.id,
      track_id: nowPlaying.id,
      user_id: user?.id || null,
      reaction: emoji
    });
  };

  const removeReaction = (id: string) => {
    setReactions(prev => prev.filter(r => r.id !== id));
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
            className="py-2.5 px-5 rounded-2xl gold-gradient-bg text-stone-950 font-black text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
          >
            + Sıraya İlk Şarkıyı Ekle
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
    <div className="px-4 py-1.5 relative">
      <FloatingEmojis reactions={reactions} onComplete={removeReaction} />
      <div className="glass-panel-gold rounded-3xl p-4 border border-[#D4AF37]/35 relative overflow-hidden shadow-2xl">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Section Header Badge */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Disc className={`w-4 h-4 text-[#D4AF37] ${isPlayingAudio ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            <span className="text-xs font-bold tracking-wider gold-gradient-text uppercase">
              Şu An Çalıyor
            </span>
          </div>

          <span className="text-[10px] font-mono font-bold text-amber-200/60 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-[#D4AF37]" /> Kesintisiz Hoparlör Yayını
          </span>
        </div>

        {/* Hero Track Card Content */}
        <div className="flex gap-3.5 items-center">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-xl shrink-0 group">
            <img
              src={nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || ''}
              alt={nowPlaying.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full gold-gradient-bg border border-stone-950 flex items-center justify-center text-stone-950 shadow-md">
              <Play className="w-2.5 h-2.5 fill-stone-950 ml-0.5" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-white truncate tracking-tight leading-snug">
              {nowPlaying.title}
            </h2>
            <p className="text-xs text-amber-200/70 font-medium truncate mt-0.5">
              {nowPlaying.artist}
            </p>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#120C08]/80 border border-[#D4AF37]/25 text-[10px] text-amber-200 mt-1.5">
              <User className="w-2.5 h-2.5 text-[#D4AF37]" />
              <span className="truncate">İsteyen: <strong className="text-white font-semibold">{(user && nowPlaying.requestedByUserId === user.id) ? 'Sen' : nowPlaying.requestedBy}</strong></span>
            </div>
          </div>
        </div>

        {/* Live Soundwave Equalizer & Pulsating Status Badge */}
        <div className="mt-3 pt-2.5 border-t border-[#D4AF37]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-1 h-3.5 px-2 py-0.5 bg-[#1C130D]/80 rounded-full border border-[#D4AF37]/30 shadow-inner">
              <span className={`w-0.5 bg-[#D4AF37] rounded-full animate-pulse ${isPlayingAudio ? 'h-3' : 'h-1.5'}`} style={{ animationDuration: '0.6s' }} />
              <span className={`w-0.5 bg-[#E5A93B] rounded-full animate-pulse ${isPlayingAudio ? 'h-3.5' : 'h-2'}`} style={{ animationDuration: '0.9s' }} />
              <span className={`w-0.5 bg-[#D4AF37] rounded-full animate-pulse ${isPlayingAudio ? 'h-2.5' : 'h-1'}`} style={{ animationDuration: '0.7s' }} />
              <span className={`w-0.5 bg-[#E5A93B] rounded-full animate-pulse ${isPlayingAudio ? 'h-3' : 'h-2'}`} style={{ animationDuration: '0.8s' }} />
            </div>
            <span className="text-[10px] font-extrabold tracking-wider text-amber-200/90 font-mono">
              CANLI SES AKIŞI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold tracking-wider shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CANLI</span>
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <span className="text-[8px] text-gray-400 font-medium tracking-wide">Powered by</span>
              <img src="https://storage.googleapis.com/pr-newsroom-wp/1/2018/11/Spotify_Logo_RGB_Green.png" alt="Spotify" className="h-3 object-contain brightness-0 invert" />
            </div>
          </div>
        </div>

        {/* EMOJI REACTIONS */}
        {nowPlaying.id !== 'spotify-bg' && (
          <div className="mt-3 flex items-center justify-center gap-4">
            {['🔥', '❤️', '👏', '😍', '💃'].map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="text-2xl hover:scale-125 active:scale-95 transition-transform drop-shadow-lg"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
