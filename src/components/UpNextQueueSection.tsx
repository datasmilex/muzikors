'use client';

import React, { useState } from 'react';
import { ListMusic, ThumbsUp, Flame, User, QrCode, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/formatters';

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, voteTrack, openProtectedModal, user } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});

  const handleVoteTrack = (trackId: string) => {
    if (votingCooldowns[trackId]) return;

    setVotingCooldowns(prev => ({ ...prev, [trackId]: true }));
    voteTrack(trackId);
    
    setTimeout(() => {
      setVotingCooldowns(prev => ({ ...prev, [trackId]: false }));
    }, 2000);
  };

  const getRequestedByLabel = (track: any) => {
    if (user && track.requestedByUserId === user.id) return 'Sen';
    return track.requestedBy;
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
    <div className="px-4 py-2 pb-32">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-2.5">
          <ListMusic className="w-5 h-5 text-[#D4AF37]" />
          <h3 className="text-base font-black text-amber-100 tracking-wider">
            Sıradaki Şarkılar
          </h3>
          <span className="bg-[#D4AF37] text-black text-xs font-black px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.4)]">
            {filteredQueue.length}
          </span>
        </div>
      </div>

      {/* Info Micro-copy */}
      <div className="px-2 mb-6">
        <p className="text-xs text-amber-200/60 leading-snug font-medium flex items-center gap-2">
          <span className="text-lg drop-shadow-md">💡</span>
          <span>
            <strong className="text-white">1 Beğeni = 1 Kredi.</strong> Sevdiğiniz şarkıları üst sıralara taşıyın.
          </span>
        </p>
      </div>

      {/* Requirement 1: Sleek Empty Queue State Message */}
      {filteredQueue.length === 0 ? (
        <div className="glass-panel-gold rounded-[2rem] p-8 text-center border border-[#D4AF37]/30 flex flex-col items-center justify-center space-y-4 my-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <QrCode className="w-8 h-8 animate-pulse drop-shadow-lg" />
          </div>
          <div className="space-y-2 max-w-[260px]">
            <h4 className="text-base font-black text-white tracking-wide">Sırada Henüz Şarkı Yok</h4>
            <p className="text-xs text-amber-200/60 leading-relaxed font-medium">
              Masadaki QR kodu okutarak veya aşağıdaki butona tıklayarak ilk şarkıyı sen ekle!
            </p>
          </div>
          <button
            onClick={() => openProtectedModal('search', 'Şarkı eklemek için lütfen Google veya Spotify ile giriş yapın')}
            className="mt-4 px-6 py-3 rounded-full gold-gradient-bg text-stone-950 font-black text-sm shadow-[0_10px_20px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            + İlk Şarkıyı Ekle
          </button>
        </div>
      ) : (
        <div className="relative pt-4 space-y-0 flex flex-col">
          {filteredQueue.map((track, index) => {
            // Stack effect logic
            const zIndex = filteredQueue.length - index;
            const isFirst = index === 0;
            
            return (
              <div
                key={track.id}
                className={`relative group transition-all duration-500 ease-out hover:-translate-y-2 hover:z-50 ${!isFirst ? '-mt-4' : ''}`}
                style={{ zIndex }}
              >
                <div className={`glass-panel rounded-3xl p-4 flex items-center justify-between border backdrop-blur-xl shadow-[0_-5px_15px_rgba(0,0,0,0.3),0_10px_30px_rgba(0,0,0,0.5)] ${
                  isFirst
                    ? 'border-[#D4AF37]/50 bg-gradient-to-r from-[#2A1D13] to-[#1C130D]'
                    : 'border-[#D4AF37]/20 bg-[#120C08]/90 hover:border-[#D4AF37]/40'
                }`}>
                  
                  {/* Left: Rank & Artwork & Track Details */}
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 shadow-lg ${
                        isFirst
                          ? 'gold-gradient-bg text-stone-950'
                          : 'bg-black/50 text-amber-200 border border-[#D4AF37]/30'
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
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
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-black truncate ${isFirst ? 'text-base text-white' : 'text-sm text-gray-200'}`}>
                          {track.title}
                        </h4>
                        {isFirst && (
                          <span className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                            <Flame className="w-3 h-3 fill-amber-400 text-amber-400" /> TOP
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#D4AF37] font-semibold truncate mb-1">
                        {track.artist}
                      </p>
                      
                      <div className="flex items-center gap-2 text-[10px] text-amber-200/60 font-medium">
                        <span className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-md">
                          <User className="w-3 h-3 text-[#D4AF37]" />
                          <span className="truncate max-w-[90px]">{getRequestedByLabel(track)}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#D4AF37]" />
                          {formatDuration((track as any).duration_ms || track.durationMs || (track.duration ? track.duration * 1000 : 0))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Votes & Boost Action */}
                  <div className="flex items-center gap-3 pl-3 border-l border-[#D4AF37]/20 shrink-0 ml-2">
                    <div className="text-center min-w-[36px]">
                      <span className="block text-lg font-black text-[#D4AF37] drop-shadow-md">
                        {track.votes}
                      </span>
                      <span className="text-[10px] text-amber-200/50 font-bold uppercase tracking-wider">
                        Oy
                      </span>
                    </div>

                    <button
                      onClick={() => handleVoteTrack(track.id)}
                      disabled={votingCooldowns[track.id]}
                      className={`p-3 rounded-2xl border flex items-center justify-center transition-all duration-300 group ${
                        votingCooldowns[track.id] 
                          ? 'bg-black/50 border-gray-600 text-gray-500 cursor-not-allowed'
                          : 'bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)] active:scale-90 hover:scale-110'
                      }`}
                      title="Şarkıyı Beğen"
                    >
                      <ThumbsUp className={`w-5 h-5 transition-transform ${votingCooldowns[track.id] ? 'fill-transparent' : 'group-hover:-translate-y-1 fill-[#D4AF37]/30'}`} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
