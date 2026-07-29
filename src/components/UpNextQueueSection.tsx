'use client';

import React, { useState } from 'react';
import { ListMusic, ThumbsUp, Flame, User, QrCode, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/formatters';

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, voteTrack, openProtectedModal } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});

  const handleVoteTrack = (trackId: string) => {
    if (votingCooldowns[trackId]) return;

    setVotingCooldowns(prev => ({ ...prev, [trackId]: true }));
    voteTrack(trackId);
    
    setTimeout(() => {
      setVotingCooldowns(prev => ({ ...prev, [trackId]: false }));
    }, 2000);
  };

  // Strict visual filtering: only show pending/queued tracks
  const filteredQueue = queue.filter(track => {
    if (track.isPlaying) return false;
    if ((track as any).status === 'playing') return false;
    
    // Hide if it matches the Currently Playing track
    if (nowPlaying) {
      if (track.id === nowPlaying.id) return false;
      if (track.spotifyUri && track.spotifyUri === nowPlaying.spotifyUri) return false;
    }
    
    return true;
  });

  return (
    <div className="px-4 py-2 pb-28">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <ListMusic className="w-4 h-4 text-[#D4AF37]" />
          <h3 className="text-sm font-bold text-amber-100 tracking-wide">
            Sıradaki Şarkılar
          </h3>
          <span className="bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-[11px] font-bold px-2 py-0.5 rounded-full">
            {filteredQueue.length}
          </span>
        </div>

        <span className="text-[11px] text-amber-200/60 font-medium">
          Beğen ve Sıranı Öne Al
        </span>
      </div>

      {/* Info Micro-copy */}
      <div className="px-1.5 mb-4">
        <p className="text-[11px] text-gray-400/80 leading-snug flex items-start gap-1.5">
          <span className="text-[13px] opacity-90">💡</span>
          <span>
            <strong className="text-gray-300 font-medium">1 Beğeni = 1 Kredi.</strong> Sevdiğiniz şarkıları üst sıralara taşıyın.
          </span>
        </p>
      </div>

      {/* Requirement 1: Sleek Empty Queue State Message */}
      {filteredQueue.length === 0 ? (
        <div className="glass-panel rounded-2xl p-6 text-center border border-[#D4AF37]/25 flex flex-col items-center justify-center space-y-3 my-1 bg-gradient-to-b from-[#1C130D]/90 to-[#120C08]/90">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
            <QrCode className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1 max-w-[260px]">
            <h4 className="text-xs font-bold text-amber-100">Sırada Henüz Şarkı Yok</h4>
            <p className="text-[11px] text-amber-200/60 leading-relaxed">
              Masadaki QR kodu okutarak veya aşağıdaki butona tıklayarak ilk şarkıyı sen ekle!
            </p>
          </div>
          <button
            onClick={() => openProtectedModal('search', 'Şarkı eklemek için lütfen Google veya Spotify ile giriş yapın')}
            className="px-4 py-2 rounded-xl gold-gradient-bg text-stone-950 font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95 transition-all"
          >
            + İlk Şarkıyı Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
          {filteredQueue.map((track, index) => (
            <div
              key={track.id}
              className={`glass-panel rounded-2xl p-3 flex items-center justify-between border transition-all duration-300 ${
                index === 0
                  ? 'border-[#D4AF37]/45 bg-gradient-to-r from-[#241911]/90 to-[#1C130D]/90 shadow-md'
                  : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/30'
              }`}
            >
              {/* Left: Rank & Artwork & Track Details */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                    index === 0
                      ? 'gold-gradient-bg text-stone-950 font-black shadow-sm'
                      : 'bg-[#120C08] text-amber-200/70 border border-[#D4AF37]/20'
                  }`}
                >
                  #{index + 1}
                </div>

                <img
                  src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                  alt={track.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                  className="w-12 h-12 rounded-xl object-cover border border-[#D4AF37]/30 shrink-0"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {track.title}
                    </h4>
                    {index === 0 && (
                      <span className="flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                        <Flame className="w-2.5 h-2.5 fill-amber-400 text-amber-400" /> TOP
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-amber-200/60 truncate mt-0.5">
                    {track.artist}
                  </p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-200/50 mt-1">
                    <User className="w-2.5 h-2.5 text-[#D4AF37]" />
                    <span className="truncate max-w-[80px]">{track.requestedBy}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-amber-200/80 font-bold">
                      <Clock className="w-2.5 h-2.5 text-[#D4AF37]" />
                      {formatDuration((track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Votes & Boost Action */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#D4AF37]/15 shrink-0">
                <div className="text-center min-w-[32px]">
                  <span className="block text-xs font-extrabold text-[#D4AF37]">
                    {track.votes}
                  </span>
                  <span className="text-[9px] text-amber-200/50 font-medium">
                    Oy
                  </span>
                </div>

                <button
                  onClick={() => handleVoteTrack(track.id)}
                  disabled={votingCooldowns[track.id]}
                  className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all group ${
                    votingCooldowns[track.id] 
                      ? 'bg-[#1C130D] border-gray-600 text-gray-500 cursor-not-allowed'
                      : 'bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 border-[#D4AF37]/30 text-[#D4AF37] active:scale-95'
                  }`}
                  title="Şarkıyı Beğen"
                >
                  <ThumbsUp className={`w-4 h-4 transition-transform ${votingCooldowns[track.id] ? 'fill-transparent' : 'group-hover:scale-110 fill-[#D4AF37]/20'}`} />
                  <span className={`text-xs font-bold ${votingCooldowns[track.id] ? 'text-gray-500' : 'text-amber-200'}`}>
                    {votingCooldowns[track.id] ? 'Bekleyin' : 'Beğen'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
