'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { ExternalLink } from 'lucide-react';
import { Sheet } from './ui/Sheet';
import { btn } from './ui/controls';

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

  const badgeColor =
    announcement?.badge_type === 'update' ? 'bg-emerald-400' : 'bg-[var(--theme-primary)]';

  // Duyuru bilinçli olarak kapatılmalı: arka plana dokunmak veya sürüklemek kapatmaz
  return (
    <Sheet open={isVisible && Boolean(announcement)} onClose={handleDismiss} dismissible={false} hideClose width="sm" ariaLabel={announcement?.title || 'Duyuru'}>
      {announcement && (
        <div className="pb-1">
          <span className="inline-flex items-center gap-2 px-3 h-7 rounded-full bg-white/[0.07] text-[12px] font-semibold text-white/75">
            <span className={`w-1.5 h-1.5 rounded-full ${badgeColor}`} />
            {announcement.badge_text || 'Duyuru'}
          </span>

          {announcement.image_url && (
            <img
              src={announcement.image_url}
              alt=""
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
              className="w-full h-40 object-cover rounded-2xl mt-4 bg-white/[0.04]"
            />
          )}

          <h3 className="text-[20px] font-bold tracking-tight mt-4 leading-snug">{announcement.title}</h3>
          <p className="text-[14px] text-white/65 leading-relaxed mt-2 whitespace-pre-line max-h-56 overflow-y-auto">{announcement.message}</p>

          <div className="mt-6 space-y-2.5">
            <button type="button" onClick={handleDismiss} className={`${btn.primary} w-full`}>
              {announcement.dismiss_button_text || 'Anladım'}
            </button>
            {announcement.action_button_text && announcement.action_url && (
              <button type="button" onClick={handleAction} className={`${btn.secondary} w-full`}>
                <span>{announcement.action_button_text}</span>
                <ExternalLink className="w-4 h-4 text-white/50" />
              </button>
            )}
          </div>
        </div>
      )}
    </Sheet>
  );
};
