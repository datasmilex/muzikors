'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SPRING_SNAPPY } from '../../lib/motion';

// Uygulama genelinde tekrar eden düğme ve satır stilleri. Vurgu rengi (tema rengi)
// yalnızca ana eylemde kullanılır; geri kalanı nötr tonlardadır.

export const btn = {
  primary:
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl bg-[var(--theme-primary)] text-black text-[15px] font-bold active:scale-[0.97] transition-[transform,opacity] duration-150 disabled:opacity-45 disabled:active:scale-100',
  secondary:
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl bg-white/[0.07] hover:bg-white/[0.1] text-white text-[15px] font-semibold active:scale-[0.97] transition-[transform,background-color] duration-150 disabled:opacity-45',
  quiet:
    'inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 rounded-xl text-white/70 hover:text-white text-sm font-semibold active:scale-[0.97] transition-[transform,color] duration-150',
  danger:
    'inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-2xl bg-red-500/[0.12] hover:bg-red-500/[0.18] text-red-300 text-[15px] font-semibold active:scale-[0.97] transition-[transform,background-color] duration-150 disabled:opacity-45',
};

/** Grup içindeki satırlar için kart zemini (kart içinde kart yok; satırlar ince çizgiyle ayrılır) */
export const groupCard = 'rounded-2xl bg-white/[0.04] divide-y divide-white/[0.06] overflow-hidden';
export const groupRow =
  'w-full min-h-[52px] flex items-center gap-3 px-4 py-3 text-left active:bg-white/[0.05] transition-colors duration-150';
export const sectionLabel = 'text-[12px] font-semibold text-white/45 px-1 mb-2';
export const inputBase =
  'w-full h-12 rounded-2xl bg-white/[0.06] border border-transparent focus:border-white/20 px-4 text-[15px] text-white placeholder:text-white/35 outline-none transition-colors duration-150';

interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

/** Kayan göstergeli sekme seçici */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  className = '',
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedOption<T>[];
  layoutId: string;
  className?: string;
}) {
  return (
    <div role="tablist" className={`flex p-1 rounded-2xl bg-white/[0.05] ${className}`}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={`relative flex-1 min-w-0 h-10 px-2 rounded-xl text-[13px] font-semibold transition-colors duration-200 ${
              active ? 'text-white' : 'text-white/50 hover:text-white/80'
            }`}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-white/[0.11]"
                transition={SPRING_SNAPPY}
              />
            )}
            <span className="relative z-10 inline-flex items-center justify-center gap-1.5 truncate">
              {option.icon}
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Açma-kapama düğmesi. `dimmed` kilitli özellikleri soluk gösterir ama tıklamayı engellemez. */
export const Switch: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  dimmed?: boolean;
}> = ({ checked, onChange, label, dimmed = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={`relative w-[52px] h-8 shrink-0 rounded-full transition-colors duration-200 ${
      checked ? 'bg-[var(--theme-primary)]' : 'bg-white/[0.14]'
    } ${dimmed ? 'opacity-40' : ''}`}
  >
    <motion.span
      className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.35)]"
      animate={{ x: checked ? 20 : 0 }}
      transition={SPRING_SNAPPY}
    />
  </button>
);

/** Yükleniyor durumunda gösterilen yumuşak iskelet satırları */
export const SkeletonRows: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className="space-y-2" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-2">
        <div className="w-11 h-11 rounded-xl bg-white/[0.06] animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-2/3 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="h-2.5 w-1/3 rounded-full bg-white/[0.05] animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

/** Boş durum: ikon, başlık ve kısa açıklama */
export const EmptyState: React.FC<{ icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }> = ({
  icon,
  title,
  text,
  action,
}) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    <div className="w-12 h-12 rounded-2xl bg-white/[0.06] grid place-items-center text-white/50 mb-3">{icon}</div>
    <p className="text-[15px] font-semibold text-white">{title}</p>
    {text && <p className="text-[13px] text-white/50 mt-1 max-w-[280px] leading-relaxed">{text}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);
