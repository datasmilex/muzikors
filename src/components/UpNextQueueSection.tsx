'use client';

import React, { useState, useEffect } from 'react';
import { ListMusic, ThumbsUp, Flame, User, Clock, X, QrCode, Music, Store, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName, isVenueOrBackgroundRequester, isBackgroundMusicRequester } from '../utils/formatters';

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, voteTrack, vetoTrack, openProfile, user, showToast } = useApp();
  const [votingCooldowns, setVotingCooldowns] = useState<Record<string, boolean>>({});
  const [vetoingTrackId, setVetoingTrackId] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVeto = async (track: any, e: React.MouseEvent) => {
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
      return isBackgroundMusicRequester(track.requestedBy) ? '☕ Fon Müziği' : '👑 Mekan Sahibi';
    }
    if (!track.requestedBy) return 'Misafir';
    if (track.requestedBy.startsWith('@') || track.requestedBy.includes('.***')) {
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

  const myQueueIndex = filteredQueue.findIndex(t => user && t.requestedByUserId === user.id);
  const myNextTrack = myQueueIndex !== -1 ? filteredQueue[myQueueIndex] : null;
  const myTrackPosition = myQueueIndex + 1;
  const estimatedWaitMins = myTrackPosition * 3;

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
      <div className="px-4 py-3 pb-32">
        {/* User's Next Track Live Countdown Banner */}
        {myNextTrack && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3.5 p-3.5 rounded-2xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/30 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[var(--theme-primary)]/20 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] shrink-0 shadow-inner">
                <Music className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--theme-primary-light)]">
                    Sıradaki Şarkın
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--theme-primary)] text-black text-[9px] font-black">
                    {myTrackPosition}. Sırada
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white truncate mt-0.5">{myNextTrack.title}</h4>
                <p className="text-[10px] text-neutral-400 font-medium flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[var(--theme-primary)]" />
                  <span>Tahmini Çalma: ~{estimatedWaitMins} dk sonra</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-[var(--theme-primary)]" />
            <h3 className="text-sm font-black text-white tracking-wide">
              Sıradaki Şarkılar
            </h3>
            <span className="bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] text-[10px] font-black px-2 py-0.5 rounded-full">
              {filteredQueue.length}
            </span>
          </div>

          {filteredQueue.length > 0 && (
            <button
              onClick={() => setIsExpanded(true)}
              className="text-xs font-bold text-[var(--theme-primary)] hover:text-[var(--theme-primary-light)] flex items-center gap-1 active:scale-95 transition-transform"
            >
              <span>Tümünü Gör</span>
            </button>
          )}
        </div>

        {/* Queue Stack / List */}
        {filteredQueue.length === 0 ? (
          <div className="rounded-2xl p-5 border border-white/[0.08] bg-[var(--theme-card)] backdrop-blur-xl flex items-center gap-4 my-1 shadow-md transition-colors duration-300">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/25 flex items-center justify-center text-[var(--theme-primary)] shadow-inner">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-white tracking-wide">Sırada Şarkı Yok</h4>
              <p className="text-[10px] text-neutral-400 leading-snug mt-0.5">
                Masadaki QR kodu okutarak sıradaki şarkıyı sen seç!
              </p>
            </div>
          </div>
        ) : (
          <div 
            onClick={() => setIsExpanded(true)}
            className="relative w-full h-[95px] cursor-pointer group select-none"
          >
            {filteredQueue.slice(0, 3).map((track, index) => {
              const isFirst = index === 0;
              const scale = 1 - index * 0.04;
              const opacity = 1 - index * 0.35;
              const topOffset = index * 9;
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
                  <div className={`rounded-2xl flex items-center justify-between border backdrop-blur-xl transition-all ${
                    isFirst
                      ? 'p-3 border-[var(--theme-primary)]/30 bg-[var(--theme-card)] shadow-[0_8px_25px_rgba(0,0,0,0.6)]'
                      : 'p-3 border-white/[0.08] bg-[var(--theme-card)]/85 shadow-md'
                  }`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                        isFirst ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'bg-white/10 text-white border border-white/10'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="relative w-10 h-10 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                        <img
                          src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-xs truncate text-white">
                          {track.title}
                        </h4>
                        <p className="text-[10px] text-[var(--theme-primary-light)] font-medium truncate mt-0.5">
                          {track.artist}
                        </p>
                      </div>
                    </div>
                    {isFirst && (
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--theme-primary-light)] pr-1 shrink-0">
                        <span>{track.votes > 900000 ? 0 : track.votes} Oy</span>
                        <Flame className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
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
              transition={{ duration: 0.25 }}
              onClick={() => setIsExpanded(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md h-[85vh] bg-[var(--theme-card)] sm:rounded-3xl rounded-t-[2.5rem] p-5 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.9)] flex flex-col border border-white/[0.1] overflow-hidden"
            >
              {/* Drag Pill */}
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-3 shrink-0" />
              
              <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] shrink-0">
                <div className="flex items-center gap-2.5">
                  <ListMusic className="w-5 h-5 text-[var(--theme-primary)]" />
                  <h2 className="text-lg font-black text-white tracking-tight">Sıradaki Parçalar</h2>
                  <span className="text-xs font-bold text-[var(--theme-primary-light)]">({filteredQueue.length})</span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar pr-1">
                {filteredQueue.map((track, index) => {
                  const isFirst = index === 0;
                  return (
                    <div key={track.id} className="flex flex-col">
                      <div
                        className={`rounded-2xl p-3 flex items-center justify-between border backdrop-blur-xl transition-all ${
                          isFirst
                            ? 'border-[var(--theme-primary)]/40 bg-[var(--theme-card-alt)] shadow-md'
                            : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                            isFirst ? 'bg-[var(--theme-primary)] text-black shadow-sm' : 'bg-white/10 text-white border border-white/10'
                          }`}>
                            {index + 1}
                          </div>
                          
                          <div className="relative w-11 h-11 shrink-0 rounded-xl overflow-hidden border border-white/10 shadow-sm">
                            <img
                              src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                              alt={track.title}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-xs truncate text-white">
                                {track.title}
                              </h4>
                              {isFirst && (
                                <Flame className="w-3.5 h-3.5 text-[var(--theme-primary)] shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[var(--theme-primary-light)] font-medium truncate mt-0.5">
                              {track.artist}
                            </p>
                            <div className="flex items-center gap-1.5 text-[9px] text-neutral-400 font-medium mt-1">
                              {isVenueOrBackgroundRequester(track.requestedBy, track.requestedByUserId) ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--theme-primary)]/10 border border-[var(--theme-primary)]/20 text-[9px] font-bold text-[var(--theme-primary-light)]">
                                  <Store className="w-2.5 h-2.5 text-[var(--theme-primary)] shrink-0" />
                                  <span>{getRequestedByLabel(track)}</span>
                                </span>
                              ) : (
                                <span 
                                  className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isAnonymousTrack(track)) {
                                      showToast('Bu profil gizlidir 🔒');
                                      return;
                                    }
                                    if (track.requestedByUserId) openProfile(track.requestedByUserId);
                                  }}
                                >
                                  <User className="w-2.5 h-2.5 text-neutral-400" />
                                  <span className="truncate max-w-[90px]">{getRequestedByLabel(track)}</span>
                                </span>
                              )}
                              {user && track.requestedByUserId === user.id && !isAnonymousTrack(track) && (
                                <span className="px-1.5 py-0.5 rounded bg-[var(--theme-primary)]/20 text-[var(--theme-primary-light)] text-[8px] font-black border border-[var(--theme-primary)]/30">
                                  Senin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Vote & Veto Actions */}
                        <div className="flex items-center gap-2 pl-2 border-l border-white/[0.08] shrink-0 ml-1">
                          {user?.isPremium && track.requestedByUserId !== user.id && (
                            <button
                              onClick={(e) => handleVeto(track, e)}
                              disabled={vetoingTrackId === track.id}
                              title="Şarkıyı Sıradan Sil (Veto)"
                              className={`p-2 rounded-xl flex items-center justify-center transition-all ${
                                vetoingTrackId === track.id ? 'opacity-50' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 active:scale-90 border border-red-500/20'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {track.isBoosted ? (
                            <div className="text-center min-w-[32px] px-2 py-1 rounded-lg bg-[var(--theme-primary)] shadow-md">
                              <span className="block text-xs font-black text-black">VIP</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-black text-[var(--theme-primary)] min-w-[20px] text-right">
                                {track.votes > 900000 ? 0 : track.votes}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleVoteTrack(track.id); }}
                                disabled={votingCooldowns[track.id]}
                                className={`p-2 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                                  votingCooldowns[track.id] 
                                    ? 'bg-white/[0.02] border-white/10 text-neutral-600 cursor-not-allowed'
                                    : 'bg-[var(--theme-primary)]/10 active:bg-[var(--theme-primary)]/20 border-[var(--theme-primary)]/30 text-[var(--theme-primary)] active:scale-90'
                                }`}
                              >
                                <ThumbsUp className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {track.message && (
                        <div className="mt-1.5 w-full p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] shadow-inner">
                          <p className="text-[11px] text-neutral-300 italic line-clamp-2">
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
