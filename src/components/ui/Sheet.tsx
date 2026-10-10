'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { ChevronLeft, X } from 'lucide-react';
import { EASE_IN, EASE_OUT, SPRING_SHEET } from '../../lib/motion';
import { useIsLandscape } from '../../lib/useMediaQuery';

// Tüm açılır pencerelerin ortak kabuğu. Dikey ekranda alttan kayar ve aşağı
// sürüklenerek kapatılabilir; yatay ekranda ortada açılır.

// Escape tuşu yalnızca en üstteki pencereyi kapatır
const openStack: string[] = [];
let scrollLocks = 0;

function lockScroll() {
  if (scrollLocks++ === 0) document.body.style.overflow = 'hidden';
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = '';
}

type SheetWidth = 'sm' | 'md' | 'lg' | 'xl';

const WIDTH: Record<SheetWidth, string> = {
  sm: 'landscape:max-w-sm',
  md: 'landscape:max-w-lg',
  lg: 'landscape:max-w-2xl',
  xl: 'landscape:max-w-4xl',
};

export interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Verilirse başlığın solunda geri oku çıkar */
  onBack?: () => void;
  headerRight?: React.ReactNode;
  /** Başlığın altında kaydırılmayan alan (arama kutusu, sekmeler) */
  toolbar?: React.ReactNode;
  /** Altta sabit kalan alan (ana buton) */
  footer?: React.ReactNode;
  /** 'tall': ekranın büyük kısmını kaplar (listeler, arama) */
  height?: 'auto' | 'tall';
  width?: SheetWidth;
  /** false: arka plana dokunarak, sürükleyerek veya Escape ile kapanmaz */
  dismissible?: boolean;
  hideClose?: boolean;
  bodyClassName?: string;
  ariaLabel?: string;
  children: React.ReactNode;
}

const HeaderButton: React.FC<{ label: string; onClick: () => void; children: React.ReactNode }> = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    onPointerDown={(e) => e.stopPropagation()}
    aria-label={label}
    className="w-11 h-11 shrink-0 grid place-items-center rounded-full text-white/70 hover:text-white active:scale-95 transition-[transform,color] duration-150"
  >
    <span className="w-9 h-9 grid place-items-center rounded-full bg-white/[0.07]">{children}</span>
  </button>
);

export const Sheet: React.FC<SheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  onBack,
  headerRight,
  toolbar,
  footer,
  height = 'auto',
  width = 'md',
  dismissible = true,
  hideClose = false,
  bodyClassName = '',
  ariaLabel,
  children,
}) => {
  const [mounted, setMounted] = useState(false);
  const isLandscape = useIsLandscape();
  const reduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const id = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    openStack.push(id);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && dismissible && openStack[openStack.length - 1] === id) {
        onCloseRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    // Ekran okuyucular pencerenin açıldığını duysun
    const focusTimer = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 60);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener('keydown', onKey);
      const index = openStack.lastIndexOf(id);
      if (index !== -1) openStack.splice(index, 1);
      unlockScroll();
    };
  }, [open, id, dismissible]);

  if (!mounted) return null;

  const canDrag = dismissible && !isLandscape && !reduceMotion;
  const hasHeader = Boolean(title || subtitle || onBack || headerRight || !hideClose);

  const panelMotion = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.12 } },
      }
    : isLandscape
      ? {
          initial: { opacity: 0, y: 14, scale: 0.98 },
          animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: EASE_OUT } },
          exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: 0.16, ease: EASE_IN } },
        }
      : {
          initial: { y: '100%' },
          animate: { y: 0, transition: SPRING_SHEET },
          exit: { y: '100%', transition: { duration: 0.24, ease: EASE_IN } },
        };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-[100] flex justify-center items-end landscape:items-center landscape:p-4">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.28, ease: EASE_OUT } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            onClick={dismissible ? onClose : undefined}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel || (typeof title === 'string' ? title : undefined)}
            tabIndex={-1}
            data-height={height}
            className={`sheet-panel relative w-full max-w-md ${WIDTH[width]} flex flex-col bg-[var(--theme-card)] text-white rounded-t-[28px] landscape:rounded-[24px] border border-b-0 landscape:border-b border-white/[0.07] shadow-[0_-10px_40px_rgba(0,0,0,0.45)] outline-none overflow-hidden`}
            {...panelMotion}
            drag={canDrag ? 'y' : false}
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.04, bottom: 0.85 }}
            dragMomentum={false}
            onDragEnd={(_, info) => {
              if (info.offset.y > 110 || info.velocity.y > 650) onClose();
            }}
          >
            <div
              className={`shrink-0 ${canDrag ? 'touch-none' : ''}`}
              onPointerDown={canDrag ? (e) => dragControls.start(e) : undefined}
            >
              <div className="flex justify-center pt-2.5 landscape:hidden" aria-hidden="true">
                <span className="h-1 w-9 rounded-full bg-white/20" />
              </div>

              {hasHeader && (
                <div className="flex items-center gap-1 px-3 pt-1 pb-2 landscape:pt-3 min-h-[52px]">
                  {onBack ? (
                    <HeaderButton label="Geri" onClick={onBack}>
                      <ChevronLeft className="w-5 h-5" />
                    </HeaderButton>
                  ) : (
                    <span className="w-2 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0 px-1">
                    {title && <h2 className="text-[17px] font-bold leading-tight tracking-tight truncate">{title}</h2>}
                    {subtitle && <p className="text-[12px] text-white/50 truncate mt-0.5">{subtitle}</p>}
                  </div>
                  {headerRight}
                  {!hideClose && (
                    <HeaderButton label="Kapat" onClick={onClose}>
                      <X className="w-[18px] h-[18px]" />
                    </HeaderButton>
                  )}
                </div>
              )}
            </div>

            {toolbar && <div className="shrink-0 px-5 pb-3">{toolbar}</div>}

            <div className={`flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 ${footer ? 'pb-4' : 'sheet-pad-bottom'} ${bodyClassName}`}>
              {children}
            </div>

            {footer && (
              <div className="shrink-0 px-5 pt-3 sheet-pad-bottom border-t border-white/[0.06]">{footer}</div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
