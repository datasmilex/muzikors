'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Crown, Award, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BetaTesterWelcomeModal = () => {
  const { user, setUser, showToast, hasEnteredGateway, registerBackHandler } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible) {
      return registerBackHandler(() => {
        setIsVisible(false);
        return true;
      });
    }
  }, [isVisible, registerBackHandler]);

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
    if (!user) {
      setIsVisible(false);
      return;
    }
    setIsLoading(true);
    
    try {
      // 1. Direct Supabase profile update
      await supabase
        .from('profiles')
        .update({ beta_tester_reward_claimed: true })
        .eq('id', user.id);

      // 2. Safe RPC call if configured on database
      try {
        await supabase.rpc('claim_beta_tester_reward');
      } catch (rpcErr) {
        console.warn('[BetaTesterClaim RPC ignored]', rpcErr);
      }

      // 3. Update local user context state
      setUser(prev => prev ? {
        ...prev,
        beta_tester_reward_claimed: true,
      } : null);
      
      showToast('Tebrikler! Özel Beta Tester rozetiniz profilinize tanımlandı.');
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#9333EA', '#FFFFFF']
      });
      setIsVisible(false);
    } catch (err) {
      console.error('Beta tester claim error:', err);
      // Ensure user is never trapped in modal
      setUser(prev => prev ? {
        ...prev,
        beta_tester_reward_claimed: true,
      } : null);
      showToast('Özel Beta Tester rozetiniz tanımlandı.');
      setIsVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 landscape:p-2">
      <div 
        className="absolute inset-0 bg-black/85"
        style={{ willChange: 'opacity' }}
        onClick={() => setIsVisible(false)}
      />
      
      <div className="relative w-full max-w-sm landscape:max-w-md max-h-[96vh] bg-[var(--theme-card)] border border-white/[0.1] rounded-3xl landscape:rounded-2xl overflow-y-auto custom-scrollbar shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center p-6 landscape:p-4 text-center">
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="my-2 landscape:my-1 flex items-center justify-center text-[var(--theme-primary)]">
          <Award className="w-10 h-10 landscape:w-8 landscape:h-8 stroke-[1.75]" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-white mb-2 landscape:mb-1 tracking-tight">
          Beta Tester Rozetiniz Hazır
        </h3>
        
        <p className="text-xs text-neutral-400 mb-5 landscape:mb-3 leading-relaxed">
          Muzikors'un gelişimine katkıda bulunduğunuz için teşekkür ederiz! Özel <span className="text-[var(--theme-primary-light)] font-bold">Beta Tester</span> rozetini hemen profilinize ekleyin.
        </p>

        <button 
          onClick={handleClaim}
          disabled={isLoading}
          className="w-full py-3.5 landscape:py-2.5 px-6 rounded-2xl bg-[var(--theme-primary)] text-black font-black text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-black" />
          ) : (
            <Crown className="w-4 h-4" />
          )}
          <span>Rozeti Al ve Başla</span>
        </button>

        <p className="text-[10px] text-zinc-500 mt-4 landscape:mt-2">
          Rozetinizi Profilinizde ve Akış gönderilerinde adınızın yanında görebilirsiniz.
        </p>
      </div>
    </div>
  );
};
