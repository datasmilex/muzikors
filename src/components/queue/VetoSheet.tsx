'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Track } from '../../types';
import { useApp } from '../../context/AppContext';
import { Sheet } from '../ui/Sheet';
import { Switch, btn } from '../ui/controls';
import { trackCover } from '../../utils/queueLabels';

/** VIP üyelerin günde bir şarkıyı sıradan kaldırma onayı */
export const VetoSheet: React.FC<{ track: Track | null; onClose: () => void }> = ({ track, onClose }) => {
  const { vetoTrack, registerBackHandler } = useApp();
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const onCloseRef = useRef(onClose);
  const trackId = track?.id;

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Android geri tuşu önce bu pencereyi kapatır
  useEffect(() => {
    if (!trackId) return;
    setAnonymous(false);
    return registerBackHandler(() => {
      onCloseRef.current();
      return true;
    });
  }, [trackId, registerBackHandler]);

  const confirm = async () => {
    if (!track || busy) return;
    setBusy(true);
    const ok = await vetoTrack(track.id, anonymous);
    setBusy(false);
    if (ok) onClose();
  };

  return (
    <Sheet
      open={Boolean(track)}
      onClose={onClose}
      title="Şarkıyı sıradan kaldır"
      width="sm"
      footer={
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" onClick={onClose} className={btn.secondary}>
            Vazgeç
          </button>
          <button type="button" onClick={confirm} disabled={busy} className={btn.danger}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>Kaldır</span>
          </button>
        </div>
      }
    >
      {track && (
        <div className="space-y-4 pb-1">
          <div className="flex items-center gap-3">
            <img src={trackCover(track)} alt="" className="w-14 h-14 rounded-xl object-cover bg-white/[0.06]" />
            <div className="min-w-0">
              <p className="text-[15px] font-semibold truncate">{track.title}</p>
              <p className="text-[13px] text-white/50 truncate">{track.artist}</p>
            </div>
          </div>
          <p className="text-[13px] text-white/55 leading-relaxed">
            VIP üyeler günde bir şarkıyı sıradan kaldırabilir. VIP üyelerin istekleri kaldırılamaz.
          </p>
          <div className="flex items-center justify-between gap-4 rounded-2xl bg-white/[0.04] px-4 py-3">
            <div>
              <p className="text-[14px] font-semibold">İsmimi gizle</p>
              <p className="text-[12px] text-white/50">Şarkı sahibine adın gösterilmez</p>
            </div>
            <Switch checked={anonymous} onChange={setAnonymous} label="İsmimi gizle" />
          </div>
        </div>
      )}
    </Sheet>
  );
};
