'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Crown, Award, X } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BetaTesterWelcomeModal = () => {
  const { user, setUser, showToast, hasEnteredGateway } = useApp();
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
      
      showToast('Tebrikler! Özel Beta Tester rozetiniz profilinize tanımlandı. 🎉');
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
      showToast('Özel Beta Tester rozetiniz tanımlandı. 🎉');
      setIsVisible(false);
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
      
      <div className="relative w-full max-w-sm bg-[#0d0c11] border border-white/[0.1] rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col items-center p-6 text-center animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-14 h-14 bg-amber-400/10 border border-amber-400/25 rounded-2xl flex items-center justify-center mb-4 text-amber-400 shadow-inner">
          <Award className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-black text-white mb-2 tracking-tight">
          Beta Tester Rozetiniz Hazır!
        </h3>
        
        <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
          Muzikors'un gelişimine katkıda bulunduğunuz için teşekkür ederiz! Özel <span className="text-amber-400 font-bold">Beta Tester</span> rozetini hemen profilinize ekleyin.
        </p>

        <button 
          onClick={handleClaim}
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 text-black font-black text-xs active:scale-95 transition-all shadow-md flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="inline-block animate-spin mr-2">⏳</span>
          ) : (
            <Crown className="w-4 h-4" />
          )}
          <span>Rozeti Al ve Başla</span>
        </button>

        <p className="text-[10px] text-zinc-600 mt-4">
          Rozetinizi Profilinizde ve Akış gönderilerinde adınızın yanında görebilirsiniz.
        </p>
      </div>
    </div>
  );
};
