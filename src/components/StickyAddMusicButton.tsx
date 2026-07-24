'use client';

import React from 'react';
import { Plus, Music2, Clock, QrCode } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StickyAddMusicButton: React.FC = () => {
  const { openProtectedModal, cooldown, isVenueBound, isVenueActive, showToast } = useApp();

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleClick = () => {
    if (!isVenueBound) {
      showToast('Şarkı istemek için lütfen masadaki QR kodu okutun!');
      return;
    }
    if (!isVenueActive) {
      showToast('Bu mekan şu an hizmet vermemektedir.');
      return;
    }
    openProtectedModal('search', 'Şarkı eklemek için lütfen Google ile giriş yapın');
  };

  // No-venue state: show QR prompt banner instead of music button
  if (!isVenueBound) {
    return (
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-auto">
        <button
          onClick={handleClick}
          className="w-full py-4 px-6 rounded-2xl bg-zinc-900/95 border border-[#D4AF37]/30 text-amber-200 font-semibold text-sm flex items-center justify-center gap-3 shadow-2xl shadow-black/40 hover:brightness-110 active:scale-[0.98] transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-amber-300">QR Kod Gerekli</p>
            <p className="text-[10px] text-zinc-400">Şarkı istemek için masadaki QR kodu okutun</p>
          </div>
        </button>
      </div>
    );
  }

  // Venue inactive state
  if (!isVenueActive) {
    return (
      <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-auto">
        <div className="w-full py-4 px-6 rounded-2xl bg-red-950/80 border border-red-500/30 text-red-300 font-semibold text-sm flex items-center justify-center gap-3 shadow-2xl">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-xs">Bu mekan şu an hizmet vermemektedir.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 left-0 right-0 z-40 px-4 max-w-md mx-auto pointer-events-auto">
      <button
        onClick={handleClick}
        className={`w-full py-4 px-6 rounded-2xl gold-gradient-bg text-stone-950 font-black text-base flex items-center justify-center gap-3 shadow-2xl shadow-amber-500/20 hover:brightness-110 active:scale-[0.98] transition-all border border-amber-300/40 relative overflow-hidden ${
          cooldown.active ? 'opacity-95' : 'pulse-gold'
        }`}
      >
        {/* Shimmer sweep effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />

        {cooldown.active ? (
          <>
            <div className="w-7 h-7 rounded-full bg-stone-950/20 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-stone-950 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="tracking-wide">MÜZİK EKLE</span>
              <span className="bg-stone-950/80 text-amber-300 font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                ⏱️ {formatCooldown(cooldown.remainingSeconds)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-7 h-7 rounded-full bg-stone-950/20 flex items-center justify-center shrink-0">
              <Plus className="w-5 h-5 text-stone-950 stroke-[3]" />
            </div>
            <span className="tracking-wider uppercase text-stone-950 font-black">
              + Müzik Ekle
            </span>
            <Music2 className="w-5 h-5 text-stone-950/80 ml-auto" />
          </>
        )}
      </button>
    </div>
  );
};
