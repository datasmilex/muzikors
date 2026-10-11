'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Hourglass, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Track } from '../types';
import { getUpcomingTracks } from '../utils/queueLabels';
import { QueueRow } from './queue/QueueRow';
import { VetoSheet } from './queue/VetoSheet';
import { Sheet } from './ui/Sheet';
import { EASE_OUT } from '../lib/motion';

// Ana ekranda ilk birkaç şarkı oylanabilir biçimde görünür; tamamı ayrı pencerede.
const INLINE_COUNT = 5;

export const UpNextQueueSection: React.FC = () => {
  const { queue, nowPlaying, user, openModal, audioProgress, registerBackHandler, pendingApprovals } = useApp();
  const [showAll, setShowAll] = useState(false);
  const [vetoTarget, setVetoTarget] = useState<Track | null>(null);

  const upcoming = useMemo(() => getUpcomingTracks(queue, nowPlaying), [queue, nowPlaying]);
  const visible = upcoming.slice(0, INLINE_COUNT);

  const closeAll = useCallback(() => setShowAll(false), []);
  const closeVeto = useCallback(() => setVetoTarget(null), []);

  useEffect(() => {
    if (!showAll) return;
    return registerBackHandler(() => {
      setShowAll(false);
      return true;
    });
  }, [showAll, registerBackHandler]);

  // Kullanıcının sıradaki şarkısı ve yaklaşık bekleme süresi
  const myIndex = user ? upcoming.findIndex((t) => t.requestedByUserId === user.id) : -1;
  let waitMinutes: number | null = null;
  if (myIndex >= 0) {
    const nowDurationSec = nowPlaying ? nowPlaying.duration || Math.round((nowPlaying.durationMs || 210000) / 1000) : 0;
    const remainingNowMs = Math.max(0, nowDurationSec - audioProgress) * 1000;
    const aheadMs = upcoming.slice(0, myIndex).reduce((sum, t) => sum + (t.durationMs || (t.duration ? t.duration * 1000 : 210000)), 0);
    waitMinutes = Math.max(1, Math.round((remainingNowMs + aheadMs) / 60000));
  }

  if (!nowPlaying && upcoming.length === 0 && pendingApprovals.length === 0) {
    return <div className="pb-36" />;
  }

  // Ekran zaten her saniye yenileniyor (çalma ilerlemesi); geri sayım buradan hesaplanır
  const remaining = (iso: string | null) => {
    if (!iso) return null;
    const sec = Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000));
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
  };

  return (
    <section className="px-4 pt-5 pb-36" aria-label="Sıradaki şarkılar">
      <AnimatePresence initial={false}>
        {pendingApprovals.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: EASE_OUT } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="mb-3 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
              {p.cover ? (
                <img src={p.cover} alt="" className="w-9 h-9 shrink-0 rounded-lg object-cover bg-white/[0.06]" />
              ) : (
                <span className="w-9 h-9 shrink-0 rounded-lg bg-white/[0.06] grid place-items-center">
                  <Hourglass className="w-4 h-4 text-white/50" />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-white/50 flex items-center gap-1">
                  <Hourglass className="w-3 h-3" /> Mekân onayı bekleniyor
                </p>
                <p className="text-[14px] font-semibold truncate">{p.title}</p>
              </div>
              {remaining(p.expiresAt) && <span className="text-[12px] text-white/50 shrink-0 tabular-nums">{remaining(p.expiresAt)}</span>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {myIndex >= 0 && (
          <motion.div
            key="my-next"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto', transition: { duration: 0.3, ease: EASE_OUT } }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            className="overflow-hidden"
          >
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3">
              <span className="w-9 h-9 shrink-0 rounded-full bg-[rgba(var(--theme-primary-rgb),0.15)] text-[var(--theme-primary)] grid place-items-center text-[14px] font-bold tabular-nums">
                {myIndex + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[12px] text-white/50">Sıradaki şarkın</p>
                <p className="text-[14px] font-semibold truncate">{upcoming[myIndex].title}</p>
              </div>
              {waitMinutes !== null && <span className="text-[12px] text-white/50 shrink-0">yaklaşık {waitMinutes} dk</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mb-1 px-1">
        <h3 className="text-[17px] font-bold tracking-tight">Sırada</h3>
        {upcoming.length > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="min-h-[44px] px-2 -mr-2 text-[13px] font-semibold text-white/55 hover:text-white transition-colors"
          >
            Tümü ({upcoming.length})
          </button>
        )}
      </div>

      {upcoming.length === 0 ? (
        <button
          type="button"
          onClick={() => openModal('search')}
          className="w-full mt-1 flex items-center gap-3.5 rounded-2xl border border-dashed border-white/[0.12] px-4 py-4 text-left active:scale-[0.98] transition-transform duration-150"
        >
          <span className="w-10 h-10 shrink-0 rounded-full bg-white/[0.06] grid place-items-center text-white/80">
            <Plus className="w-5 h-5" />
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] font-semibold">Sıra boş, sıradaki sen ol</span>
            <span className="block text-[12px] text-white/50 mt-0.5">Bu şarkı bitince seninki çalsın.</span>
          </span>
        </button>
      ) : (
        <ul>
          <AnimatePresence initial={false}>
            {visible.map((track, index) => (
              <QueueRow key={track.id} track={track} index={index} onVeto={setVetoTarget} />
            ))}
          </AnimatePresence>
        </ul>
      )}

      {upcoming.length > INLINE_COUNT && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="w-full mt-2 min-h-[44px] rounded-2xl bg-white/[0.05] text-[13px] font-semibold text-white/70 active:scale-[0.98] transition-transform duration-150"
        >
          {upcoming.length - INLINE_COUNT} şarkı daha
        </button>
      )}

      <Sheet open={showAll} onClose={closeAll} title="Sıradaki şarkılar" subtitle={`${upcoming.length} şarkı`} height="tall">
        <ul className="pb-2">
          <AnimatePresence initial={false}>
            {upcoming.map((track, index) => (
              <QueueRow key={track.id} track={track} index={index} showMessage onVeto={setVetoTarget} />
            ))}
          </AnimatePresence>
        </ul>
      </Sheet>

      <VetoSheet track={vetoTarget} onClose={closeVeto} />
    </section>
  );
};
