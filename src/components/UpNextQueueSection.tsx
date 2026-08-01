'use client';

import React, { useState, useEffect } from 'react';
import { ListMusic, ThumbsUp, Flame, User, Clock, Coins, X, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatDuration } from '../utils/formatters';

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, voteTrack, openProtectedModal, user } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});
  const [isExpanded, setIsExpanded] = useState(false);

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

  const filteredQueue = queue.filter(track => {
    if (track.isPlaying) return false;
    if ((track as any).status === 'playing') return false;
    if (nowPlaying) {
      if (track.id === nowPlaying.id) return false;
      if (track.spotifyUri && track.spotifyUri === nowPlaying.spotifyUri) return false;
    }
    return true;
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isExpanded) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isExpanded]);

  return (
    <>
      <div className="px-4 py-2 pb-32">
        <div className="flex items-center justify-between mb-4 px-2">
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

        {filteredQueue.length === 0 ? (
          <div className="bg-black/30 backdrop-blur-md rounded-2xl p-4 border border-white/5 flex items-center gap-4 my-2 shadow-sm">
            <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
              <QrCode className="w-6 h-6 animate-pulse drop-shadow-lg" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black text-white tracking-wide truncate">Sırada Henüz Şarkı Yok</h4>
              <p className="text-[10px] text-amber-200/60 font-medium leading-snug mt-0.5">
                Masadaki QR kodu okutarak sıradaki şarkıyı sen seç!
              </p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsExpanded(true)}
            className="relative w-full h-[90px] cursor-pointer group"
          >
            {filteredQueue.slice(0, 3).map((track, index) => {
              const isFirst = index === 0;
              const scale = 1 - index * 0.05;
              const opacity = 1 - index * 0.4;
              const topOffset = index * 8;
              const zIndex = 10 - index;

              return (
                <div
                  key={track.id}
                  className="absolute left-0 right-0 mx-auto transition-all duration-300 group-active:scale-95"
                  style={{
                    zIndex,
                    transform: `scale(${scale}) translateY(${topOffset}px)`,
                    opacity,
                  }}
                >
                  <div className={`rounded-2xl flex items-center justify-between border backdrop-blur-md ${
                    isFirst
                      ? 'p-3 border-[#D4AF37]/50 bg-gradient-to-r from-[#241911] to-[#1C130D] shadow-lg'
                      : 'p-3 border-white/5 bg-[#1A1A1A]/80 shadow-md'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                        isFirst ? 'gold-gradient-bg text-stone-950' : 'bg-black/50 text-amber-200'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                        <img
                          src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-black text-xs truncate ${isFirst ? 'text-white' : 'text-gray-200'}`}>
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-[#D4AF37] font-semibold truncate">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    {isFirst && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-200/50 pr-2">
                        Tümünü Gör <ListMusic className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Expanded Modal Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-end sm:justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-2xl"
            />
            
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-[85vh] bg-[#120C08] sm:rounded-3xl rounded-t-[2.5rem] p-4 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] flex flex-col border border-[#D4AF37]/30 glass-panel-gold overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-white/20 rounded-b-xl" />
              
              <div className="flex items-center justify-between pb-4 pt-2 border-b border-[#D4AF37]/20 shrink-0">
                <div className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="text-xl font-black text-white tracking-tight">Tüm Liste</h2>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-full bg-white/5 border border-transparent active:border-[#D4AF37]/30 active:bg-white/10 active:rotate-90 text-zinc-400 active:text-white transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-2.5 custom-scrollbar pr-1">
                {filteredQueue.map((track, index) => {
                  const isFirst = index === 0;
                  return (
                    <div
                      key={track.id}
                      className={`rounded-2xl p-3 flex items-center justify-between border backdrop-blur-md transition-all ${
                        isFirst
                          ? 'border-[#D4AF37]/50 bg-gradient-to-r from-[#241911] to-[#1C130D] shadow-[0_8px_20px_rgba(212,175,55,0.15)]'
                          : 'border-white/5 bg-[#1A1A1A]/60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-[11px] shrink-0 shadow-lg ${
                          isFirst ? 'gold-gradient-bg text-stone-950 scale-110' : 'bg-black/50 text-amber-200 border border-[#D4AF37]/30'
                        }`}>
                          {index + 1}
                        </div>
                        
                        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden border border-[#D4AF37]/30 shadow-md">
                          <img
                            src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h4 className={`font-black text-sm truncate ${isFirst ? 'text-white' : 'text-gray-200'}`}>
                              {track.title}
                            </h4>
                            {isFirst && (
                              <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#D4AF37] font-semibold truncate mb-0.5">
                            {track.artist}
                          </p>
                          <div className="flex items-center gap-2 text-[9px] text-amber-200/60 font-medium">
                            <span className="flex items-center gap-1">
                              <User className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[80px]">{getRequestedByLabel(track)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 border-l border-[#D4AF37]/20 shrink-0 ml-1">
                        <div className="text-center min-w-[32px]">
                          <span className="block text-sm font-black text-[#D4AF37] drop-shadow-md">
                            {track.votes}
                          </span>
                          <span className="text-[8px] text-amber-200/50 font-bold uppercase tracking-widest">
                            Oy
                          </span>
                        </div>
                        <button
                          onClick={() => handleVoteTrack(track.id)}
                          disabled={votingCooldowns[track.id]}
                          className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-300 group ${
                            votingCooldowns[track.id] 
                              ? 'bg-black/50 border-gray-600 text-gray-500 cursor-not-allowed'
                              : 'bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] active:scale-90'
                          }`}
                        >
                          <ThumbsUp className={`w-4 h-4 transition-transform ${votingCooldowns[track.id] ? 'fill-transparent' : 'group-active:-translate-y-0.5 fill-[#D4AF37]/30'}`} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
