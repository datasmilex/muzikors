'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Crown, Gift, CheckCircle2, Music, Loader2, Smartphone, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { admobService } from '../services/admobService';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.muzikors.app';

export const RewardedAdModal: React.FC = () => {
  const {
    activeModal,
    closeModal,
    openModal,
    showToast,
    pendingRewardTrack,
    claimRewardAndQueueTrack,
  } = useApp();

  const [isLoadingAd, setIsLoadingAd] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    setIsNative(Capacitor.isNativePlatform());
  }, []);

  useEffect(() => {
    if (activeModal === 'rewarded_ad') {
      setIsCompleted(false);
      setIsLoadingAd(false);
      // Pre-initialize AdMob when modal opens on mobile
      if (Capacitor.isNativePlatform()) {
        admobService.initialize().catch(() => {});
      }
    }
  }, [activeModal]);

  if (activeModal !== 'rewarded_ad') return null;

  const handleRewardSuccess = async () => {
    setIsCompleted(true);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFFFFF', '#38BDF8', '#10B981'],
    });

    setTimeout(async () => {
      await claimRewardAndQueueTrack();
    }, 800);
  };

  const handleWatchAd = async () => {
    // If on web, redirect to Play Store / App download
    if (!Capacitor.isNativePlatform()) {
      window.open(PLAY_STORE_URL, '_blank');
      return;
    }

    // Android / iOS native AdMob
    setIsLoadingAd(true);
    try {
      await admobService.showRewardedAd(
        () => {
          // On Reward
          handleRewardSuccess();
        },
        () => {
          // On Dismissed
          setIsLoadingAd(false);
        },
        (errMsg) => {
          // On Error
          setIsLoadingAd(false);
          showToast(errMsg || 'Reklam başlatılamadı. Lütfen tekrar deneyin.');
        }
      );
    } catch (err: any) {
      setIsLoadingAd(false);
      showToast(err?.message || 'Reklam yüklenemedi.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !isLoadingAd && closeModal()}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm rounded-3xl bg-[var(--theme-card)] border border-white/[0.1] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Close button */}
          {!isLoadingAd && (
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {isCompleted ? (
            <div className="py-6 space-y-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="my-2 flex items-center justify-center mx-auto text-emerald-400"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-base font-bold text-white tracking-tight">Ödülün Tanımlandı</h3>
              <p className="text-xs text-neutral-300">
                {pendingRewardTrack
                  ? `"${pendingRewardTrack.title}" sıraya ekleniyor...`
                  : '+1 ek şarkı hakkı hesabına eklendi.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header Icon */}
              <div className="my-2 flex items-center justify-center mx-auto text-[var(--theme-primary)]">
                {isNative ? <Gift className="w-8 h-8" /> : <Smartphone className="w-8 h-8" />}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Günlük Şarkı Hakkın Doldu
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                  {isNative ? (
                    pendingRewardTrack ? (
                      <>
                        Seçtiğin <strong className="text-white">"{pendingRewardTrack.title}"</strong> şarkısını çalmak için kısa bir video reklam izleyebilirsin.
                      </>
                    ) : (
                      'Kısa bir ödüllü video izleyerek anında +1 ek şarkı istek hakkı kazanabilirsin.'
                    )
                  ) : (
                    'Reklam izleyerek ücretsiz şarkı hakkı kazanmak için Muzikors mobil uygulaması gereklidir.'
                  )}
                </p>
              </div>

              {/* Track Preview Card if track is pending */}
              {pendingRewardTrack && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08] text-left">
                  {pendingRewardTrack.albumCover || pendingRewardTrack.coverUrl ? (
                    <img
                      src={pendingRewardTrack.albumCover || pendingRewardTrack.coverUrl}
                      alt={pendingRewardTrack.title}
                      className="w-10 h-10 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center text-[var(--theme-primary)] shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-white truncate">{pendingRewardTrack.title}</h4>
                    <p className="text-[10px] text-neutral-400 truncate">{pendingRewardTrack.artist}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2 pt-1">
                {isNative ? (
                  <button
                    onClick={handleWatchAd}
                    disabled={isLoadingAd}
                    className="w-full py-3 px-4 rounded-2xl bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoadingAd ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reklam Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current stroke-none" />
                        <span>Reklamı İzle & Şarkıyı Çal</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleWatchAd}
                    className="w-full py-3 px-4 rounded-2xl bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Uygulamayı İndir & İzle</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>
                )}

                <button
                  onClick={() => {
                    closeModal();
                    openModal('premium');
                  }}
                  className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Crown className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
                  <span>Premium'a Geç (Reklamsız)</span>
                </button>
              </div>

              <p className="text-[10px] text-neutral-500 font-medium">
                {isNative
                  ? 'Ödüllü reklam tamamlandığında şarkınız otomatik sıraya girer.'
                  : 'Mobil uygulamamız ile sınırsız ödüllü reklam fırsatından yararlanabilirsiniz.'}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
