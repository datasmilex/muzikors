'use client';

import React, { useEffect, useState } from 'react';
import { FlaskConical, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { Sheet } from './ui/Sheet';
import { btn } from './ui/controls';
import { triggerHaptic } from '../../utils/haptics';

export const BetaTesterWelcomeModal = () => {
  const { user, setUser, showToast, hasEnteredGateway, registerBackHandler } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    return registerBackHandler(() => {
      setIsVisible(false);
      return true;
    });
  }, [isVisible, registerBackHandler]);

  useEffect(() => {
    if (!user || !hasEnteredGateway) return;
    const tutorialCompleted = localStorage.getItem('muzikors_tutorial_completed') === 'true';
    if (!tutorialCompleted) return;

    if (user.is_beta_tester && !user.beta_tester_reward_claimed) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, hasEnteredGateway]);

  const markClaimed = () => setUser((prev) => (prev ? { ...prev, beta_tester_reward_claimed: true } : null));

  const handleClaim = async () => {
    if (!user) {
      setIsVisible(false);
      return;
    }
    setIsLoading(true);
    try {
      await supabase.from('profiles').update({ beta_tester_reward_claimed: true }).eq('id', user.id);
      try {
        await supabase.rpc('claim_beta_tester_reward');
      } catch (rpcErr) {
        console.warn('[BetaTesterClaim RPC ignored]', rpcErr);
      }
      markClaimed();
      triggerHaptic('success');
      showToast('Beta tester rozetin profiline eklendi.');
    } catch (err) {
      console.error('Beta tester claim error:', err);
      // Kullanıcı pencerede mahsur kalmasın
      markClaimed();
      showToast('Beta tester rozetin profiline eklendi.');
    } finally {
      setIsLoading(false);
      setIsVisible(false);
    }
  };

  return (
    <Sheet open={isVisible} onClose={() => setIsVisible(false)} width="sm" ariaLabel="Beta tester rozeti">
      <div className="text-center pt-1 pb-1">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(var(--theme-primary-rgb),0.14)] text-[var(--theme-primary)] grid place-items-center mb-4">
          <FlaskConical className="w-7 h-7" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight">Beta tester rozetin hazır</h2>
        <p className="text-[14px] text-white/60 mt-2 leading-relaxed max-w-[300px] mx-auto">
          Muzikors&apos;un gelişimine katkın için teşekkürler. Rozetin profilinde ve sıralamada adının yanında görünecek.
        </p>
        <button type="button" onClick={handleClaim} disabled={isLoading} className={`${btn.primary} w-full mt-6`}>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Rozeti al
        </button>
      </div>
    </Sheet>
  );
};
