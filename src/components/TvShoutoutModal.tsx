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

  if (activeModal !== 'tvShoutout') return null;

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

    if (user.credits < 20) {
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

      setUser(prev => prev ? { ...prev, credits: prev.credits - 20 } : prev);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="w-full max-w-sm bg-gradient-to-br from-[#26190F] to-[#120C08] border border-[#D4AF37]/30 rounded-2xl p-5 relative overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Tv className="w-5 h-5" />
              <h3 className="font-bold text-lg">TV&apos;ye Mesaj Gönder</h3>
            </div>
            <button 
              onClick={closeModal}
              className="p-1.5 bg-white/5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Mekandakilere bir mesaj gönderin..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37]/50 resize-none h-24 text-sm"
                maxLength={maxLength}
              />
              <div className={`absolute bottom-2 right-2 text-xs ${text.length >= maxLength ? 'text-red-400' : 'text-white/40'}`}>
                {text.length}/{maxLength}
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer p-3 bg-black/20 rounded-xl border border-white/5 hover:bg-black/30 transition-colors">
              <div className="relative flex items-center">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <div className="w-10 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
              </div>
              <span className="text-sm font-medium text-white/80">İsmim ekranda gizlensin (Anonim)</span>
            </label>

            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 gold-gradient-bg text-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 active:scale-95 transition-all"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Gönder (20 🪙)</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
