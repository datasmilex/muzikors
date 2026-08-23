'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { X, Check, Crown, Ghost, ThumbsUp, Music, ArrowUpCircle, ShieldOff } from 'lucide-react';

export const PremiumModal: React.FC = () => {
  const { activeModal, closeModal, user, showToast } = useApp();

  if (activeModal !== 'premium') return null;

  const handleSubscribe = () => {
    // For now, bypass Google Pay
    showToast('Ödeme sistemi yakında aktif edilecektir (Google Pay entegrasyonu test aşamasında).');
  };

  const benefits = [
    {
      icon: <Music className="w-5 h-5 text-[#D4AF37]" />,
      title: "5 Şarkı Hakkı",
      description: "Her gün 5 farklı şarkı ekleme özgürlüğü."
    },
    {
      icon: <ArrowUpCircle className="w-5 h-5 text-emerald-400" />,
      title: "Şarkıyı Üste Taşı (Boost)",
      description: "Günde 1 kez şarkınızı sıranın en başına geçirin."
    },
    {
      icon: <ShieldOff className="w-5 h-5 text-red-400" />,
      title: "Şarkı Veto Etme",
      description: "Günde 1 kez sevmediğiniz bir şarkıyı sıradan silin (Sadece ücretsiz üyelerin şarkıları). Şarkılarınızın veto edilmesine izin vermeyin!"
    },
    {
      icon: <ThumbsUp className="w-5 h-5 text-blue-400" />,
      title: "15 Beğeni Hakkı",
      description: "Şarkılara daha fazla oy verin, favorilerinizi destekleyin."
    },
    {
      icon: <Ghost className="w-5 h-5 text-gray-300" />,
      title: "Hayalet Modu",
      description: "İsminiz görünmeden, 'Anonim' olarak şarkı ekleyin ve silin."
    },
    {
      icon: <Check className="w-5 h-5 text-sky-400" />,
      title: "VIP Doğrulama Rozeti",
      description: "Profilde, akışta ve liderlik tablosunda isminizin yanında sarı tik."
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
          <div className="relative h-48 bg-gradient-to-br from-amber-900 to-[#120C08] p-6 flex flex-col items-center justify-center overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37] via-[#120C08] to-[#120C08]" />
            <Crown className="w-16 h-16 text-[#D4AF37] mb-2 drop-shadow-[0_0_15px_rgba(212,175,55,0.8)]" />
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 drop-shadow-sm text-center tracking-tight">
              Muzikors Premium
            </h2>
            <p className="text-amber-200/70 text-xs font-semibold uppercase tracking-widest mt-1">
              Sınırları Kaldır, Kontrolü Eline Al
            </p>
            
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 bg-black/40 rounded-full text-white/50 hover:text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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

          <div className="p-5 bg-gradient-to-t from-black to-transparent pt-8">
            <button
              onClick={handleSubscribe}
              className="w-full py-4 rounded-2xl font-black text-lg bg-gradient-to-r from-yellow-500 via-[#D4AF37] to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Crown className="w-5 h-5 fill-black" />
              <span>Sadece 60 TL / Ay</span>
            </button>
            <p className="text-[10px] text-center text-zinc-500 mt-3 px-4">
              Abonelikleriniz Google Play hesabınız üzerinden yönetilir. İstediğiniz zaman iptal edebilirsiniz.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
