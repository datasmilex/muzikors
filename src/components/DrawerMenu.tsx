'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronRight,
  Crown,
  Gift,
  HelpCircle,
  Info,
  LogOut,
  MessageCircle,
  ShieldCheck,
  Store,
  Tag,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isClaimedTodayTR } from '../lib/timeHelpers';
import { ModalType } from '../types';
import { THEMES } from '../lib/theme';
import { Sheet } from './ui/Sheet';
import { btn, groupCard, groupRow, sectionLabel } from './ui/controls';
import { SPRING_SNAPPY } from '../lib/motion';

// "Menü" penceresi: hesap, kısayollar, tema ve kurumsal bağlantılar.
export const DrawerMenu: React.FC = () => {
  const { activeModal, closeModal, openModal, openProtectedModal, user, logout, theme, setTheme } = useApp();

  const rewardWaiting = Boolean(user) && !isClaimedTodayTR(user?.lastDailyClaim || null);

  const go = (modal: ModalType, isProtected = false) => {
    if (isProtected && !user) {
      openProtectedModal(modal, 'Bu bölüm için giriş yapman gerekiyor.');
      return;
    }
    openModal(modal);
  };

  const tiles: { label: string; hint: string; icon: React.ReactNode; modal: ModalType; isProtected?: boolean; dot?: boolean; accent?: boolean }[] = [
    { label: 'Muzikors VIP', hint: 'Daha fazla şarkı', icon: <Crown className="w-5 h-5" />, modal: 'premium', accent: true },
    { label: 'Günlük ödül', hint: rewardWaiting ? 'Bugünkü ödülün hazır' : 'Seriyi koru', icon: <Gift className="w-5 h-5" />, modal: 'daily_reward', isProtected: true, dot: rewardWaiting },
    { label: 'Kampanyalar', hint: 'Fırsatlar', icon: <Tag className="w-5 h-5" />, modal: 'campaigns' },
    { label: 'Nasıl çalışır?', hint: '3 adımda', icon: <HelpCircle className="w-5 h-5" />, modal: 'howitworks' },
  ];

  const links: { label: string; icon: React.ReactNode; modal: ModalType }[] = [
    { label: 'Hakkımızda', icon: <Info className="w-[18px] h-[18px]" />, modal: 'about' },
    { label: 'İletişim ve destek', icon: <MessageCircle className="w-[18px] h-[18px]" />, modal: 'contact' },
    { label: 'Mekânınız için Muzikors', icon: <Store className="w-[18px] h-[18px]" />, modal: 'partners' },
    { label: 'Yasal metinler', icon: <ShieldCheck className="w-[18px] h-[18px]" />, modal: 'terms' },
  ];

  const hasCustomAvatar = Boolean(user?.avatar && !user.avatar.includes('googleusercontent'));

  return (
    <Sheet open={activeModal === 'drawer'} onClose={closeModal} title="Menü" width="md">
      <div className="space-y-6 pb-2">
        {/* Hesap */}
        {user ? (
          <button
            type="button"
            onClick={() => openModal('profile')}
            className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3.5 text-left active:scale-[0.98] transition-transform duration-150"
          >
            <span className="w-12 h-12 rounded-full overflow-hidden bg-white/[0.06] grid place-items-center shrink-0">
              {hasCustomAvatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-white/60" />
              )}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[15px] font-semibold truncate">{user.name}</span>
              <span className="block text-[12px] text-white/50 mt-0.5">{user.isPremium ? 'VIP üye' : 'Standart üye'} · Profili gör</span>
            </span>
            <ChevronRight className="w-4 h-4 text-white/30 shrink-0" />
          </button>
        ) : (
          <div className="rounded-2xl bg-white/[0.04] px-4 py-4">
            <p className="text-[15px] font-semibold">Giriş yap, şarkını iste</p>
            <p className="text-[13px] text-white/50 mt-0.5">Şarkı istemek ve oy vermek için hesap gerekir.</p>
            <button type="button" onClick={() => openModal('login')} className={`${btn.primary} w-full mt-3`}>
              Giriş yap
            </button>
          </div>
        )}

        {/* Kısayollar */}
        <div className="grid grid-cols-2 gap-2.5">
          {tiles.map((tile) => (
            <button
              key={tile.label}
              type="button"
              onClick={() => go(tile.modal, tile.isProtected)}
              className="relative rounded-2xl bg-white/[0.04] p-4 text-left active:scale-[0.97] transition-transform duration-150"
            >
              <span className={`${tile.accent ? 'text-[var(--theme-primary)]' : 'text-white/70'} block`}>{tile.icon}</span>
              <span className="block text-[14px] font-semibold mt-3">{tile.label}</span>
              <span className="block text-[12px] text-white/45 mt-0.5 truncate">{tile.hint}</span>
              {tile.dot && <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--theme-primary)]" />}
            </button>
          ))}
        </div>

        {/* Tema */}
        <div>
          <p className={sectionLabel}>Görünüm</p>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((t) => {
              const selected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  aria-label={`${t.name} teması`}
                  aria-pressed={selected}
                  className="flex flex-col items-center gap-1.5 py-1 active:scale-95 transition-transform duration-150"
                >
                  <span className="relative w-11 h-11 rounded-full grid place-items-center">
                    {selected && (
                      <motion.span
                        layoutId="theme-ring"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-full ring-2 ring-white/80"
                      />
                    )}
                    <span className="w-9 h-9 rounded-full grid place-items-center" style={{ background: t.previewColor || t.accentColor }}>
                      {selected && (
                        <Check className={`w-4 h-4 ${t.id === 'crema' || t.id === 'monochrome' ? 'text-black' : 'text-white'}`} strokeWidth={3} />
                      )}
                    </span>
                  </span>
                  <span className={`text-[11px] leading-tight text-center ${selected ? 'text-white' : 'text-white/45'}`}>{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Kurumsal */}
        <div className={groupCard}>
          {links.map((link) => (
            <button key={link.label} type="button" onClick={() => go(link.modal)} className={groupRow}>
              <span className="text-white/55">{link.icon}</span>
              <span className="flex-1 text-[14px] font-medium">{link.label}</span>
              <ChevronRight className="w-4 h-4 text-white/25" />
            </button>
          ))}
        </div>

        {user && (
          <button type="button" onClick={logout} className={`${btn.quiet} w-full text-red-300/90 hover:text-red-300`}>
            <LogOut className="w-4 h-4" />
            Çıkış yap
          </button>
        )}
      </div>
    </Sheet>
  );
};
