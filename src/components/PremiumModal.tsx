'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import {
  X,
  Check,
  Crown,
  Ghost,
  ThumbsUp,
  Music,
  ArrowUpCircle,
  ShieldOff,
  Loader2,
  RefreshCw,
  Zap,
} from 'lucide-react';
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
          showToast('Tebrikler! Satın alım başarıyla tamamlandı.');
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

  const handleSubscribeBireysel = async () => {
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
    setIsProcessing(true);
    try {
      await iapService.restore();
      await refreshUser();
      showToast('Abonelikleriniz kontrol edildi.');
    } catch (e: any) {
      showToast(e.message || 'Geri yükleme başarısız oldu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const bireyselBenefits = [
    {
      icon: <ShieldOff className="w-5 h-5 text-amber-400" />,
      title: "Reklamsız Kesintisiz Deneyim",
      description: "Hiçbir video veya arayüz reklamı görmeden doğrudan müziğinize odaklanın."
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Öncelikli İstek Sıralaması",
      description: "Şarkı istekleriniz standart kullanıcıların önüne geçerek sırada öne çıkar."
    },
    {
      icon: <Ghost className="w-5 h-5 text-amber-400" />,
      title: "Hayalet Modu",
      description: "Şarkı isteklerinizi ve oylarınızı isterseniz anonim olarak gönderin."
    },
    {
      icon: <ThumbsUp className="w-5 h-5 text-amber-400" />,
      title: "Çifte Oy Gücü",
      description: "Sıradaki parçalara verdiğiniz her oy 2 katı ağırlıkla değerlendirilir."
    },
    {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      title: "Özel VIP Rozeti",
      description: "Profilinizde ve mekan sıralamasında altın renkli VIP statüsüyle görünün."
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 landscape:p-2 selection:bg-amber-400 selection:text-black">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={closeModal}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg landscape:max-w-2xl bg-neutral-950 text-white rounded-xl overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.95)] border border-white/10 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="relative p-5 pb-4 border-b border-white/[0.08] bg-neutral-900/60">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight uppercase">
                  Muzikors VIP
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Kafelerde ve mekanlarda müziği kontrol etmenin ayrıcalıklı yolu
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {/* Free Trial Badge */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                  İlk 3 Gün Ücretsiz Deneme
                </span>
              </div>
              <span className="text-[11px] text-neutral-400">Sonrasında 60 TL / Ay</span>
            </div>

            {/* Benefits List */}
            <div className="space-y-2">
              {bireyselBenefits.map((b, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 items-start bg-neutral-900/40 p-2.5 rounded-lg border border-white/5"
                >
                  <div className="shrink-0 mt-0.5">{b.icon}</div>
                  <div>
                    <h3 className="text-xs font-bold text-white mb-0.5">{b.title}</h3>
                    <p className="text-[11px] text-neutral-400 leading-snug">{b.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubscribeBireysel}
                disabled={isProcessing}
                className="w-full py-3 rounded-lg font-black text-xs bg-amber-400 text-black hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-amber-400/20"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>İşlem Yapılıyor...</span>
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 fill-black" />
                    <span>3 Gün Ücretsiz Denemeyi Başlat</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-neutral-400">
                <span>Google Play ile dilediğiniz an iptal</span>
                <button
                  type="button"
                  onClick={handleRestore}
                  className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  Satın Alımı Geri Yükle
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
