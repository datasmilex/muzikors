import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Tv, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { containsBadWords } from '../lib/badWordsFilter';
import { supabase } from '../lib/supabaseClient';

export const TvShoutoutModal: React.FC = () => {
  const { 
    activeModal, 
    closeModal, 
    activeVenue, 
    user, 
    showToast, 
    setUser
  } = useApp();
  
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  

  const maxLength = 100;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    if (text.length > maxLength) {
      showToast(`Mesajınız ${maxLength} karakterden uzun olamaz.`);
      return;
    }

    if (containsBadWords(text)) {
      showToast('Lütfen mesajınızda genel ahlaka aykırı ifadeler kullanmayın.');
      return;
    }

    if (!user) {
      showToast('Lütfen önce giriş yapın.');
      return;
    }

    if (!activeVenue) {
      showToast('Lütfen önce bir mekana bağlanın.');
      return;
    }

    if (!activeVenue.is_tv_active) {
      showToast('Bu mekanda TV Ekran Modu şu an aktif değil.');
      return;
    }

    if (user.credits + (user.promo_credits || 0) < 20) {
      showToast('TV mesajı için yeterli krediniz (20) bulunmuyor.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const numericVenueId = Number(activeVenue.id);
      if (isNaN(numericVenueId) || numericVenueId <= 0) {
        showToast("Geçersiz mekan kimliği.");
        return;
      }

      const { data, error } = await supabase.rpc('send_tv_shoutout', {
        p_venue_id: numericVenueId,
        p_message: text.trim(),
        p_user_name: user.name || 'Müşteri',
        p_is_anonymous: isAnonymous
      });

      if (error) {
        console.error('RPC Error details:', error);
        showToast(error.message || 'Mesaj gönderilemedi.');
        return;
      }

      setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - 20) } : prev);
      showToast('Mesajınız TV ekranına gönderildi!');
      closeModal();
      setText('');
    } catch (err) {
      console.error(err);
      showToast('Mesaj gönderilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {activeModal === 'tvShoutout' && (<>

      <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />
        
        <motion.div 
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-md h-auto sm:rounded-3xl rounded-t-3xl p-5 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] overflow-hidden glass-panel-gold border border-[#D4AF37]/30 bg-[#120C08]"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <Tv className="w-6 h-6 drop-shadow-md" />
              <h3 className="font-black text-xl text-white tracking-tight">TV Ekranına Mesaj</h3>
            </div>
            <button 
              onClick={closeModal}
              className="p-2 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 hover:rotate-90 transition-all duration-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5 relative z-10">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mekandakilere bir mesaj gönderin..."
                className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/20 rounded-2xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-[#D4AF37]/60 focus:bg-black/60 resize-none h-28 text-base shadow-inner transition-all duration-300"
                maxLength={maxLength}
              />
              <div className={`absolute bottom-3 right-3 text-xs font-bold ${text.length >= maxLength ? 'text-red-400' : 'text-[#D4AF37]/50'}`}>
                {text.length}/{maxLength}
              </div>
            </div>

            <label className="flex items-center justify-between cursor-pointer p-4 bg-[#1A1A1A]/50 rounded-2xl border border-white/5 hover:border-[#D4AF37]/20 hover:bg-[#1A1A1A]/80 transition-all shadow-sm group">
              <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">İsmimi gizle (Anonim)</span>
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <div className="w-12 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] shadow-inner"></div>
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="w-full py-4 mt-2 rounded-[1.5rem] font-black text-lg flex items-center justify-center gap-3 gold-gradient-bg text-black shadow-[0_10px_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 hover:scale-[1.02] transition-all group"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  <span>Gönder (20 🪙)</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
