'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { X, Check, Crown, Ghost, ThumbsUp, Music, ArrowUpCircle, ShieldOff, Loader2, RefreshCw } from 'lucide-react';
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
          showToast('Tebrikler! Muzikors Premium başarıyla aktif edildi! 👑');
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
      icon: <Music className="w-5 h-5 text-[#D4AF37]" />,
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
      icon: <Check className="w-5 h-5 text-amber-400" />,
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
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={closeModal}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-md bg-[#120C08] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 flex flex-col max-h-[90vh]"
        >
          {/* Header Graphic */}
          <div className="relative h-48 bg-gradient-to-br from-amber-900 via-[#1C130D] to-[#120C08] p-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37] via-[#120C08] to-[#120C08]" />
            <Crown className="w-14 h-14 text-[#D4AF37] mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
            <h2 className="text-2xl sm:text-3xl font-black text-white drop-shadow-sm text-center tracking-tight">
              Muzikors Premium
            </h2>
            
            {/* Free Trial Highlight Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 shadow-inner">
              <span className="text-[11px] font-black text-amber-200 uppercase tracking-wide">
                🎁 İlk 3 Gün Tamamen Ücretsiz!
              </span>
            </div>
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white/50 hover:text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Benefits list */}
          <div className="p-5 overflow-y-auto custom-scrollbar">
            <div className="space-y-3">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex gap-4 items-start bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="p-2 rounded-xl bg-black/40 shadow-inner mt-0.5">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-0.5">{benefit.title}</h3>
                    <p className="text-xs text-zinc-400 leading-snug">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer & Subscribe CTA */}
          <div className="p-5 bg-gradient-to-t from-black to-transparent pt-4">
            <button
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full py-4 rounded-2xl font-black text-base sm:text-lg bg-gradient-to-r from-yellow-500 via-[#D4AF37] to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>İşleniyor...</span>
                </>
              ) : (
                <>
                  <Crown className="w-5 h-5 fill-black" />
                  <span>3 Gün Ücretsiz Dene</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-between mt-3 px-2 text-[10px] text-zinc-400">
              <span>Deneme sonrası 60 TL / Ay</span>
              <button
                onClick={handleRestore}
                className="text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Geri Yükle
              </button>
            </div>

            <p className="text-[9px] text-center text-zinc-500 mt-2">
              Aboneliğinizi Google Play üzerinden dilediğiniz zaman tek tıkla iptal edebilirsiniz.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
