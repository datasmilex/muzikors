'use client';

import React, { useState, useEffect } from 'react';
import { ListMusic, ThumbsUp, Flame, User, Clock, Coins, X, QrCode, Sparkles, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatDuration, formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, voteTrack, vetoTrack, openProfile, user, showToast } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});
  const [vetoingTrackId, setVetoingTrackId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVeto = async (track: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (vetoingTrackId) return;
    
    // Check local limits immediately for UX, actual check in RPC
    if (!user?.isPremium) {
      showToast('Sadece Premium üyeler şarkı silebilir.');
      return;
    }
    
    if (track.requestedByUserId === user.id) {
      showToast('Kendi şarkınızı silemezsiniz.');
      return;
    }

    const isAnonymous = window.confirm('Şarkıyı silerken isminizi gizlemek ister misiniz? (Anonim Veto)');
    setVetoingTrackId(track.id);
    await vetoTrack(track.id, isAnonymous);
    setVetoingTrackId(null);
  };

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
    if (isVenueOrBackgroundRequester(track.requestedBy, track.requestedByUserId)) {
      return isBackgroundMusicRequester(track.requestedBy) ? '☕ Fon Müziği' : '👑 Mekan Sahibi';
    }
    if (!track.requestedBy) return 'Misafir';
    if (track.requestedBy.startsWith('@') || track.requestedBy === 'Anonim' || track.requestedBy === 'Anonim Müşteri') {
      return track.requestedBy;
    }
    if (track.requestedBy.includes('.***')) {
      return track.requestedBy;
    }
    return formatUserDisplayName(null, track.requestedBy);
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

  // Calculate user's active song in queue
  const myQueueIndex = filteredQueue.findIndex(t => user && t.requestedByUserId === user.id);
  const myNextTrack = myQueueIndex !== -1 ? filteredQueue[myQueueIndex] : null;
  const myTrackPosition = myQueueIndex + 1;
  const estimatedWaitMins = myTrackPosition * 3;

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
        {/* User's Next Track Live Countdown Banner */}
        {myNextTrack && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3.5 p-3.5 rounded-2xl bg-gradient-to-r from-[#2A1D13] via-[#1C130D] to-[#120C08] border border-[#D4AF37]/50 shadow-[0_0_20px_rgba(212,175,55,0.2)] flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-inner">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Sıradaki Şarkın
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-stone-950 text-[9px] font-black shadow-sm">
                    {myTrackPosition}. Sırada
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">{myNextTrack.title}</h4>
                <p className="text-[10px] text-amber-200/70 font-semibold flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  <span>Tahmini Çalma: ~{estimatedWaitMins} dk sonra</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

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
                  {/* Minified view message badge */}
                  {track.message && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-600 text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Mesajlı
                    </div>
                  )}
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
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                    <div key={track.id} className="flex flex-col">
                      <div
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
                          <div className="flex items-center gap-2 text-[10px] text-amber-200/60 font-medium">
                            {isVenueOrBackgroundRequester(track.requestedBy, track.requestedByUserId) ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/20 border border-[#D4AF37]/60 text-[9px] font-extrabold text-amber-100 shadow-[0_0_10px_rgba(212,175,55,0.25)] uppercase tracking-wide">
                                <Store className="w-2.5 h-2.5 text-[#D4AF37] shrink-0" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-100 font-extrabold">
                                  {getRequestedByLabel(track)}
                                </span>
                              </span>
                            ) : (
                              <span 
                                className="flex items-center gap-1 cursor-pointer hover:text-amber-100 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (track.requestedByUserId) openProfile(track.requestedByUserId);
                                }}
                              >
                                <User className="w-3 h-3 text-[#D4AF37]/80" />
                                <span className="truncate max-w-[100px]">{getRequestedByLabel(track)}</span>
                              </span>
                            )}
                            {user && track.requestedByUserId === user.id && (
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black border border-amber-500/40">
                                ✨ Senin İsteğin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pl-2 border-l border-[#D4AF37]/20 shrink-0 ml-1">
                        
                        {/* Veto Button for Premium Users */}
                        {user?.isPremium && track.requestedByUserId !== user.id && (
                          <button
                            onClick={(e) => handleVeto(track, e)}
                            disabled={vetoingTrackId === track.id}
                            title="Şarkıyı Sıradan Sil (Veto)"
                            className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                              vetoingTrackId === track.id ? 'opacity-50' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-90 border border-red-500/20'
                            }`}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}

                        {track.isBoosted ? (
                          <div className="text-center min-w-[32px] px-2 py-1 rounded-lg bg-gradient-to-br from-[#D4AF37] to-amber-500 shadow-md">
                            <span className="block text-xs font-black text-black">VIP</span>
                            <span className="text-[7px] text-black/80 font-bold uppercase tracking-widest leading-none">Boost</span>
                          </div>
                        ) : (
                          <>
                            <div className="text-center min-w-[32px]">
                              <span className="block text-sm font-black text-[#D4AF37] drop-shadow-md">
                                {track.votes > 900000 ? 0 : track.votes}
                              </span>
                              <span className="text-[8px] text-amber-200/50 font-bold uppercase tracking-widest">
                                Oy
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleVoteTrack(track.id); }}
                              disabled={votingCooldowns[track.id]}
                              className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-300 group ${
                                votingCooldowns[track.id] 
                                  ? 'bg-black/50 border-gray-600 text-gray-500 cursor-not-allowed'
                                  : 'bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 border-[#D4AF37]/30 text-[#D4AF37] active:scale-90'
                              }`}
                            >
                              <ThumbsUp className={`w-4 h-4 transition-transform ${votingCooldowns[track.id] ? 'fill-transparent' : 'group-active:-translate-y-0.5 fill-[#D4AF37]/30'}`} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Track Message */}
                    {track.message && (
                      <div className="mt-2 w-full p-2.5 rounded-xl bg-amber-900/20 border border-amber-500/20 flex flex-col justify-center shadow-inner">
                        <p className="text-xs text-amber-100/90 italic line-clamp-2">
                          &ldquo;{track.message}&rdquo;
                        </p>
                      </div>
                    )}
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
