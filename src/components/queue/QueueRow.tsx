'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { Track } from '../../types';
import { useApp } from '../../context/AppContext';
import { getRequesterLabel, isAnonymousTrack, trackCover } from '../../utils/queueLabels';
import { triggerHaptic } from '../../../utils/haptics';
import { SPRING_SOFT } from '../../lib/motion';

interface QueueRowProps {
  track: Track;
  index: number;
  /** Şarkıyla birlikte gönderilen notu gösterir */
  showMessage?: boolean;
  /** Verilirse VIP üyelere "sıradan kaldır" düğmesi çıkar */
  onVeto?: (track: Track) => void;
  compact?: boolean;
}

export const QueueRow: React.FC<QueueRowProps> = ({ track, index, showMessage = false, onVeto, compact = false }) => {
  const { user, voteTrack, showToast, openProfile } = useApp();
  const reduceMotion = useReducedMotion();
  const [cooling, setCooling] = useState(false);
  const [pop, setPop] = useState(0);

  const isMine = Boolean(user && track.requestedByUserId === user.id);
  const isAnon = isAnonymousTrack(track);
  const votes = track.votes > 900000 ? 0 : track.votes || 0;
  const label = getRequesterLabel(track, user?.id);
  const canOpenProfile = !isAnon && !isMine && Boolean(track.requestedByUserId) && label !== 'Mekân' && label !== 'Fon listesi';

  const handleVote = () => {
    if (isMine) {
      showToast('Kendi istediğin şarkıya oy veremezsin.');
      return;
    }
    // Giriş yapılmamışsa oy sayılmaz; giriş penceresi açılır
    if (!user) {
      voteTrack(track.id);
      return;
    }
    if (cooling) return;
    setCooling(true);
    setPop((n) => n + 1);
    triggerHaptic('light');
    voteTrack(track.id);
    window.setTimeout(() => setCooling(false), 2000);
  };

  return (
    <motion.li
      layout={!reduceMotion}
      transition={SPRING_SOFT}
      initial={reduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
      className="list-none"
    >
      <div className={`flex items-center gap-3 ${compact ? 'py-1.5' : 'py-2'}`}>
        <span
          className={`w-5 shrink-0 text-center text-[13px] font-semibold tabular-nums ${
            index === 0 ? 'text-[var(--theme-primary)]' : 'text-white/35'
          }`}
        >
          {index + 1}
        </span>

        <img
          src={trackCover(track)}
          alt=""
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = '/logo.png';
          }}
          className={`${compact ? 'w-10 h-10' : 'w-11 h-11'} rounded-xl object-cover bg-white/[0.06] shrink-0`}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-[14px] font-semibold text-white truncate">{track.title}</p>
            {track.isBoosted && (
              <span className="shrink-0 text-[10px] font-bold tracking-wide text-[var(--theme-primary)]">VIP</span>
            )}
          </div>
          <p className="text-[12px] text-white/50 truncate mt-0.5">
            <span>{track.artist}</span>
            <span className="text-white/25"> · </span>
            {canOpenProfile ? (
              <button
                type="button"
                onClick={() => openProfile(track.requestedByUserId!)}
                className="hover:text-white/80 transition-colors"
              >
                {label}
              </button>
            ) : (
              <span className={isMine ? 'text-[var(--theme-primary-light)]' : ''}>{label}</span>
            )}
          </p>
        </div>

        {onVeto && user?.isPremium && !isMine && (
          <button
            type="button"
            onClick={() => onVeto(track)}
            aria-label={`${track.title} şarkısını sıradan kaldır`}
            className="w-10 h-10 shrink-0 grid place-items-center rounded-full text-white/35 hover:text-red-300 active:scale-90 transition-[transform,color] duration-150"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <button
          type="button"
          onClick={handleVote}
          aria-label={isMine ? 'Kendi şarkına oy veremezsin' : `${track.title} şarkısına oy ver, ${votes} oy`}
          className={`relative h-10 min-w-[60px] shrink-0 px-3 rounded-full flex items-center justify-center gap-1.5 text-[13px] font-semibold tabular-nums active:scale-90 transition-[transform,background-color,color] duration-150 ${
            isMine
              ? 'bg-white/[0.03] text-white/25'
              : cooling
                ? 'bg-[rgba(var(--theme-primary-rgb),0.16)] text-[var(--theme-primary-light)]'
                : 'bg-white/[0.07] text-white/85 hover:bg-white/[0.1]'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          <span>{votes}</span>
          {pop > 0 && (
            <span
              key={pop}
              aria-hidden="true"
              className="vote-pop absolute -top-3 right-2 text-[12px] font-bold text-[var(--theme-primary-light)] pointer-events-none"
            >
              +1
            </span>
          )}
        </button>
      </div>

      {showMessage && track.message && (
        <p className="pl-[76px] -mt-1 pb-2 text-[12px] text-white/55 italic line-clamp-2">“{track.message}”</p>
      )}
    </motion.li>
  );
};
