'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { Check, ExternalLink } from 'lucide-react';

export interface EntranceAnnouncement {
  id: string;
  version: number;
  is_active: boolean;
  title: string;
  message: string;
  badge_text: string;
  badge_type: 'update' | 'announcement' | 'campaign';
  image_url?: string;
  action_button_text?: string;
  action_url?: string;
  dismiss_button_text?: string;
  created_at: string;
  updated_at: string;
  sent_by?: string;
}

const STORAGE_KEY = 'muzikors_seen_entrance_announcement_id';

export const EntranceAnnouncementModal: React.FC = () => {
  const { registerBackHandler } = useApp();
  const [announcement, setAnnouncement] = useState<EntranceAnnouncement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkEntranceAnnouncement() {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'entrance_announcement')
          .maybeSingle();

        if (error || !data?.value) return;

        const val = data.value as EntranceAnnouncement;
        if (!val || !val.is_active || !val.id) return;

        // Check if user has already acknowledged this exact announcement ID
        const seenId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (seenId === val.id) {
          // Already acknowledged, do not show
          return;
        }

        if (isMounted) {
          setAnnouncement(val);
          // Small delay for smooth entry after initial splash/paint
          const timer = setTimeout(() => {
            if (isMounted) setIsVisible(true);
          }, 800);
          return () => clearTimeout(timer);
        }
      } catch (err) {
        console.error('[EntranceAnnouncement] check error:', err);
      }
    }

    checkEntranceAnnouncement();

    return () => {
      isMounted = false;
    };
  }, []);

  // Hardware back button handler on Android
  useEffect(() => {
    if (isVisible) {
      return registerBackHandler(() => {
        handleDismiss();
        return true;
      });
    }
  }, [isVisible, registerBackHandler]);

  const handleDismiss = () => {
    if (announcement?.id && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, announcement.id);
    }
    setIsVisible(false);
  };

  const handleAction = () => {
    if (!announcement) return;
    handleDismiss();

    if (announcement.action_url) {
      if (announcement.action_url.startsWith('http://') || announcement.action_url.startsWith('https://')) {
        window.open(announcement.action_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = announcement.action_url;
      }
    }
  };

  if (!announcement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
          {/* Backdrop with deliberate blur and dark tone - conscious dismissal required */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Frame Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-sm bg-[var(--theme-card)] border border-white/[0.12] rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] text-white space-y-4 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Badge (Anti-Slop, Pure Typography) */}
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border shadow-sm ${
                announcement.badge_type === 'update'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : announcement.badge_type === 'campaign'
                  ? 'bg-[var(--gold-primary)]/15 text-[var(--gold-primary)] border-[var(--gold-primary)]/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  announcement.badge_type === 'update'
                    ? 'bg-emerald-400'
                    : announcement.badge_type === 'campaign'
                    ? 'bg-[var(--gold-primary)]'
                    : 'bg-amber-400'
                }`} />
                {announcement.badge_text || 'Duyuru'}
              </span>
            </div>

            {/* Optional Banner Image */}
            {announcement.image_url && (
              <div className="rounded-2xl overflow-hidden border border-white/10 max-h-44 bg-black/40 shadow-inner">
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className="w-full h-36 object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Title & Message */}
            <div className="text-center space-y-2 px-1">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                {announcement.title}
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed max-h-48 overflow-y-auto pr-1 whitespace-pre-line">
                {announcement.message}
              </p>
            </div>

            {/* Action & Dismiss Buttons */}
            <div className="space-y-2.5 pt-2">
              {announcement.action_button_text && announcement.action_url && (
                <button
                  type="button"
                  onClick={handleAction}
                  className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/15 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer shadow-sm"
                >
                  <span>{announcement.action_button_text}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                </button>
              )}

              <button
                type="button"
                onClick={handleDismiss}
                className="w-full min-h-[44px] py-3.5 px-5 rounded-2xl bg-[var(--gold-primary)] text-black font-black text-xs flex items-center justify-center gap-2 hover:brightness-110 transition shadow-lg shadow-[var(--gold-primary)]/20 active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{announcement.dismiss_button_text || 'Anladım'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
