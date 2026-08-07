'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Crown, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BetaTesterWelcomeModal = () => {
  const { user, showToast, hasEnteredGateway } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user || !hasEnteredGateway) return;
    
    const tutorialCompleted = localStorage.getItem('muzikors_tutorial_completed') === 'true';
    if (!tutorialCompleted) return;

    if (user.is_beta_tester && !user.beta_tester_reward_claimed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasEnteredGateway]);

  const handleClaim = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('claim_beta_tester_reward');
      if (error) throw error;
      
      if (data?.success) {
        showToast('Tebrikler! 300 Beta Kredisi hesabınıza eklendi. 🎉');
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#D4AF37', '#9333EA', '#FFFFFF']
        });
        setIsVisible(false);
      } else {
        showToast(data?.error || 'Ödül zaten alınmış.');
        setIsVisible(false);
      }
    } catch (err) {
      console.error('Beta tester claim error:', err);
      showToast('Ödül alınırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsVisible(false)}
      />
      
      <div className="relative w-full max-w-sm bg-[#120C08] border border-purple-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] flex flex-col items-center p-6 text-center animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-fuchsia-500 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
          <Sparkles className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-fuchsia-400 mb-2">
          Beta Tester Oldunuz!
        </h3>
        
        <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
          Muzikors'un gelişimine katkıda bulunduğunuz için teşekkür ederiz. 
          Özel beta tester rozetiniz ve <strong className="text-[#D4AF37]">300 Kredi</strong> hediyeniz hazır!
        </p>

        <button 
          onClick={handleClaim}
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold rounded-xl active:scale-95 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            'Alınıyor...'
          ) : (
            <>
              <Crown className="w-5 h-5" />
              Hediyemi Al
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-600 mt-4">
          Rozetinizi Profil {'>'} Başarımlar sekmesinden görüntüleyebilirsiniz.
        </p>
      </div>
    </div>
  );
};
