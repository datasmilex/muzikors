'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { X, Check, Crown, Ghost, ThumbsUp, Music, ArrowUpCircle, ShieldOff, Loader2, RefreshCw, Zap, Clock } from 'lucide-react';
import { iapService } from '../services/iapService';

export const PremiumModal: React.FC = () => {
  const { activeModal, closeModal, user, setUser, showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUser((prev: any) => ({
          ...prev,
          isPremium: data.is_premium === true,
          premium_until: data.premium_until || null,
          premium_activated_at: data.premium_activated_at || null,
        }));
      }
    } catch (e) {
      console.error('[PremiumModal refreshUser error]', e);
    }
  };

  useEffect(() => {
    if (activeModal === 'premium') {
      iapService.initialize(
        async () => {
          showToast('Tebrikler! Muzikors Premium başarıyla aktif edildi.');
          await refreshUser();
          closeModal();
        },
        (err) => {
          showToast(err || 'Ödeme tamamlanamadı.');
        }
      );
    }
  }, [activeModal, closeModal, showToast]);

  if (activeModal !== 'premium') return null;

  const handleSubscribe = async () => {
    if (!user) {
      showToast('Abonelik başlatmak için lütfen önce giriş yapın.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await iapService.subscribe();
      if (!res.success && res.message) {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast(e.message || 'Ödeme başlatılamadı.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    showToast('Satın alımlar kontrol ediliyor...');
    try {
      await iapService.restore();
      await refreshUser();
    } catch (e) {
      showToast('Satın alım geri yüklenemedi.');
    }
  };

  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Bekleme Süresi Yok (0 sn Cooldown)",
      description: "Standart 4 dakikalık bekleme süresi olmadan arka arkaya dilediğiniz gibi şarkı ekleyin."
    },
    {
      icon: <Clock className="w-5 h-5 text-sky-400" />,
      title: "7 Dakikaya Kadar Şarkı Açabilme",
      description: "Standart 4 dakika sınırı yerine 7 dakikaya kadar epik parçaları ve konser kayıtlarını çalın."
    },
    {
      icon: <Music className="w-5 h-5 text-[var(--theme-primary)]" />,
      title: "Günlük 5 Şarkı İsteme Hakkı",
      description: "Standart 2 şarkı yerine her gün 5 farklı şarkı ekleme özgürlüğü."
    },
    {
      icon: <ArrowUpCircle className="w-5 h-5 text-emerald-400" />,
      title: "Günde 1 VIP Boost (Sıranın Başına Geç)",
      description: "Günde 1 kez şarkınızı anında sıranın en başına fırlatın."
    },
    {
      icon: <ShieldOff className="w-5 h-5 text-red-400" />,
      title: "Şarkı Veto Yetkisi",
      description: "Günde 1 kez beğenmediğiniz şarkıyı sıradan silme yetkisi."
    },
    {
      icon: <ThumbsUp className="w-5 h-5 text-blue-400" />,
      title: "15 Beğeni / Oy Hakkı",
      description: "Şarkılara daha fazla oy verin, favorilerinizi destekleyin."
    },
    {
      icon: <Ghost className="w-5 h-5 text-gray-300" />,
      title: "Hayalet Modu",
      description: "İsminiz görünmeden tamamen 'Anonim' olarak şarkı ekleyin."
    },
    {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      title: "VIP Rozeti & Özel Profil",
      description: "Profilde, akışta ve liderlik tablosunda özel VIP statüsü."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
          onClick={closeModal}
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-[var(--theme-card)] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-white/[0.1] flex flex-col max-h-[90vh]"
        >
          {/* Header Graphic */}
          <div className="relative p-6 pb-4 flex flex-col items-center justify-center text-center border-b border-white/[0.08] bg-[var(--theme-card)]">
            <div className="my-2">
              <Crown className="w-10 h-10 text-[var(--theme-primary)]" strokeWidth={1.75} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Muzikors Premium
            </h2>
            
            {/* Free Trial Highlight Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2.5 rounded-full bg-white/[0.04] border border-white/10">
              <span className="text-[10px] font-bold text-[var(--theme-primary-light)] uppercase tracking-wider">
                İlk 3 Gün Ücretsiz Deneme
              </span>
            </div>

            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-1.5 bg-white/[0.05] hover:bg-white/[0.1] rounded-full text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Benefits list */}
          <div className="p-5 overflow-y-auto custom-scrollbar space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-white/[0.02] p-3 rounded-2xl border border-white/[0.05]">
                <div className="shrink-0 mt-0.5">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white mb-0.5">{benefit.title}</h3>
                  <p className="text-[10px] text-neutral-400 leading-snug">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Footer & Subscribe CTA */}
          <div className="p-5 border-t border-white/[0.08] bg-[var(--theme-card)]">
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl font-black text-xs bg-[var(--theme-primary)] text-black shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" />
                  <span>3 Gün Ücretsiz Başlat</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between mt-3 px-1 text-[10px] text-neutral-400">
              <span>Deneme sonrası 60 TL / Ay</span>
              <button
                onClick={handleRestore}
                className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Satın Alımı Geri Yükle
              </button>
            </div>

            <p className="text-[9px] text-center text-neutral-500 mt-2">
              Aboneliğinizi Google Play üzerinden dilediğiniz an iptal edebilirsiniz.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
