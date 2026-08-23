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
          className="relative w-full max-w-sm rounded-[2rem] bg-[#120C08] border border-[#D4AF37]/40 p-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] glass-panel-gold overflow-hidden"
        >
          {/* Decorative Glow Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#D4AF37]/15 blur-3xl rounded-full pointer-events-none" />

          {/* Close button */}
          {!isLoadingAd && (
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/5 active:bg-white/10 text-zinc-400 active:text-white transition-colors"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {isCompleted ? (
            <div className="py-8 space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <CheckCircle2 className="w-10 h-10" />
              </motion.div>
              <h3 className="text-xl font-black text-white tracking-tight">Ödülün Tanımlandı! 🎉</h3>
              <p className="text-xs text-amber-200/70 font-medium">
                {pendingRewardTrack
                  ? `"${pendingRewardTrack.title}" sıraya ekleniyor...`
                  : '+1 ek şarkı hakkı hesabına eklendi!'}
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header Icon */}
              <div className="w-14 h-14 rounded-2xl gold-gradient-bg flex items-center justify-center mx-auto text-stone-950 font-black shadow-[0_5px_20px_rgba(212,175,55,0.4)]">
                {isNative ? <Gift className="w-7 h-7 stroke-[2.5]" /> : <Smartphone className="w-7 h-7 stroke-[2.5]" />}
              </div>

              {/* Title & Description */}
              <div>
                <h3 className="text-xl font-black text-white tracking-tight">
                  Günlük Şarkı Hakkın Doldu! 🎵
                </h3>
                <p className="text-xs text-amber-200/70 mt-1.5 leading-relaxed">
                  {isNative ? (
                    pendingRewardTrack ? (
                      <>
                        Seçtiğin <b className="text-white">"{pendingRewardTrack.title}"</b> şarkısını çalmak için kısa bir video reklam izleyebilirsin.
                      </>
                    ) : (
                      'Kısa bir ödüllü video izleyerek anında +1 ek şarkı istek hakkı kazanabilirsin.'
                    )
                  ) : (
                    'Reklam izleyerek ücretsiz şarkı hakkı kazanmak için **Muzikors Mobil Uygulaması** gereklidir.'
                  )}
                </p>
              </div>

              {/* Track Preview Card if track is pending */}
              {pendingRewardTrack && (
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/50 border border-[#D4AF37]/20 text-left shadow-inner">
                  {pendingRewardTrack.albumCover || pendingRewardTrack.coverUrl ? (
                    <img
                      src={pendingRewardTrack.albumCover || pendingRewardTrack.coverUrl}
                      alt={pendingRewardTrack.title}
                      className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 shadow-md"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <Music className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-black text-white truncate">{pendingRewardTrack.title}</h4>
                    <p className="text-xs text-amber-200/60 truncate">{pendingRewardTrack.artist}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5 pt-2">
                {isNative ? (
                  <button
                    onClick={handleWatchAd}
                    disabled={isLoadingAd}
                    className="w-full py-3.5 px-4 rounded-xl gold-gradient-bg text-stone-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_5px_20px_rgba(212,175,55,0.35)] active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingAd ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Reklam Yükleniyor...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 fill-current stroke-none" />
                        <span>Reklamı İzle & Şarkıyı Çal</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleWatchAd}
                    className="w-full py-3.5 px-4 rounded-xl gold-gradient-bg text-stone-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_5px_20px_rgba(212,175,55,0.35)] active:scale-95 transition-all cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 stroke-[2.5]" />
                    <span>Reklam İzlemek İçin Uygulamayı İndir</span>
                    <ExternalLink className="w-4 h-4 ml-0.5 opacity-80" />
                  </button>
                )}

                <button
                  onClick={() => {
                    closeModal();
                    openModal('premium');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-white/5 border border-[#D4AF37]/30 text-[#D4AF37] font-bold text-xs flex items-center justify-center gap-2 active:bg-white/10 active:scale-95 transition-all shadow-inner"
                >
                  <Crown className="w-4 h-4 text-[#D4AF37]" />
                  <span>Premium'a Geç (Reklamsız & 5 İstek)</span>
                </button>
              </div>

              <div className="text-[10px] text-amber-200/40 font-medium">
                {isNative
                  ? 'Ödüllü reklam tamamlandığında şarkınız otomatik sıraya girer.'
                  : 'Mobil uygulamamız ile sınırsız ödüllü reklam fırsatından yararlanabilirsiniz.'}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
