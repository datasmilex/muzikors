'use client';

import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { ArrowUpToLine, Clock, Crown, Ghost, Loader2, Music, ThumbsUp, Timer, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { iapService, PREMIUM_PRODUCT_ID } from '../services/iapService';
import { Sheet } from './ui/Sheet';
import { btn } from './ui/controls';

// Yalnızca gerçekten çalışan ayrıcalıklar listelenir (limitler veritabanında uygulanır).
const BENEFITS = [
  { icon: Music, title: 'Günde 5 şarkı', text: 'Standart üyelikte günde 2 şarkı.' },
  { icon: Clock, title: 'Beklemeden iste', text: 'İstekler arasında 4 dakika bekleme yok.' },
  { icon: Timer, title: '7 dakikaya kadar şarkılar', text: 'Standart üyelikte en fazla 4 dakika.' },
  { icon: ThumbsUp, title: 'Günde 15 oy', text: 'Standart üyelikte günde 5 oy.' },
  { icon: ArrowUpToLine, title: 'Sıranın başına geç', text: 'Günde bir şarkını sıranın en önüne taşı.' },
  { icon: Trash2, title: 'Sıradan şarkı kaldır', text: 'Günde bir şarkıyı sıradan çıkar (VIP istekleri hariç).' },
  { icon: Ghost, title: 'Hayalet modu', text: 'İsteklerini adın görünmeden gönder.' },
];

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) : null;

export const PremiumModal: React.FC = () => {
  const { activeModal, closeModal, user, setUser, showToast } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const isOpen = activeModal === 'premium';

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_premium, premium_until, premium_activated_at')
        .eq('id', user.id)
        .single();
      if (data) {
        setUser((prev) =>
          prev
            ? {
                ...prev,
                isPremium: data.is_premium === true,
                premium_until: data.premium_until || null,
                premium_activated_at: data.premium_activated_at || null,
              }
            : prev
        );
      }
    } catch (e) {
      console.error('[PremiumModal refreshUser error]', e);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    iapService.initialize(
      async () => {
        showToast('VIP üyeliğin başladı.');
        await refreshUser();
        closeModal();
      },
      (err) => {
        showToast(err || 'Ödeme tamamlanamadı.');
      }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (!user) {
      showToast('Abonelik için önce giriş yapman gerekiyor.');
      return;
    }
    setIsProcessing(true);
    try {
      const res = await iapService.subscribe();
      if (!res.success && res.message) showToast(res.message);
    } catch (e: any) {
      showToast(e?.message || 'Ödeme başlatılamadı.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      await iapService.restore();
      await refreshUser();
      showToast('Satın alımların kontrol edildi.');
    } catch (e: any) {
      showToast(e?.message || 'Geri yükleme başarısız oldu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const manageUrl =
    Capacitor.getPlatform() === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : `https://play.google.com/store/account/subscriptions?package=com.muzikors.app&sku=${PREMIUM_PRODUCT_ID}`;

  const isVip = Boolean(user?.isPremium);
  const until = formatDate(user?.premium_until);

  return (
    <Sheet
      open={isOpen}
      onClose={closeModal}
      width="md"
      ariaLabel="Muzikors VIP"
      footer={
        isVip ? (
          <a href={manageUrl} target="_blank" rel="noreferrer" className={`${btn.secondary} w-full`}>
            Aboneliği yönet
          </a>
        ) : (
          <div>
            <button type="button" onClick={handleSubscribe} disabled={isProcessing} className={`${btn.primary} w-full`}>
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crown className="w-4 h-4" />}
              <span>{isProcessing ? 'Bekleniyor…' : '3 gün ücretsiz dene'}</span>
            </button>
            <div className="flex items-center justify-between mt-2 px-1 text-[12px] text-white/45">
              <span>Sonra 60 TL / ay · istediğin an iptal</span>
              <button type="button" onClick={handleRestore} className="min-h-[36px] font-semibold text-white/70 hover:text-white">
                Geri yükle
              </button>
            </div>
          </div>
        )
      }
    >
      <div className="text-center pt-1 pb-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(var(--theme-primary-rgb),0.14)] text-[var(--theme-primary)] grid place-items-center mb-3">
          <Crown className="w-7 h-7" />
        </div>
        <h2 className="text-[22px] font-bold tracking-tight">Muzikors VIP</h2>
        <p className="text-[14px] text-white/55 mt-1">
          {isVip ? (until ? `Üyeliğin aktif · ${until} tarihine kadar` : 'Üyeliğin aktif') : 'Mekânın müziğinde daha çok söz hakkı.'}
        </p>
      </div>

      <ul className="space-y-1 pb-2">
        {BENEFITS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-3.5 py-2.5">
            <span className="w-9 h-9 shrink-0 rounded-xl bg-white/[0.06] grid place-items-center text-white/75">
              <Icon className="w-[18px] h-[18px]" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold">{title}</span>
              <span className="block text-[13px] text-white/50 mt-0.5">{text}</span>
            </span>
          </li>
        ))}
      </ul>

      {!isVip && (
        <p className="text-[11px] leading-relaxed text-white/35 pb-2">
          Ödeme {Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play'} hesabından alınır. Deneme bitmeden iptal etmezsen abonelik aylık yenilenir.{' '}
          <a href="/legal/sales" target="_blank" rel="noreferrer" className="underline underline-offset-2">
            Abonelik koşulları
          </a>
        </p>
      )}
    </Sheet>
  );
};
