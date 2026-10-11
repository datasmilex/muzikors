'use client';

import React, { useState } from 'react';
import { BookOpen, Check, ChevronRight, Clock, Copy, ExternalLink, ShieldCheck, Store, Wifi } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Sheet } from './ui/Sheet';
import { groupCard, groupRow, sectionLabel } from './ui/controls';
import { useVibeInfo, vibeRuleSummary } from '../lib/vibe';

const formatTime = (t?: string | null) => (t ? t.slice(0, 5) : null);

function isOpenNow(opening: string, closing: string) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = opening.split(':').map(Number);
  const [ch, cm] = closing.split(':').map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;
  return close > open ? current >= open && current < close : current >= open || current < close;
}

export const VenueInfoModal: React.FC = () => {
  const { activeModal, closeModal, openModal, activeVenue, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  const venue = activeVenue as any;
  const wifiName: string = venue?.wifi_name || venue?.wifi_ssid || '';
  const wifiPass: string = venue?.wifi_password || venue?.wifi_pass || '';
  const menuUrl: string = venue?.menu_link || venue?.menu_url || '';
  const isNativeMenu = venue?.menu_type === 'native';
  const hasMenu = isNativeMenu || Boolean(menuUrl.trim());
  const vibe = useVibeInfo(activeVenue?.id, activeModal === 'venue_info');
  const styles: string[] = vibe?.enabled ? vibe.styles : [];
  const opening = formatTime(venue?.opening_time);
  const closing = formatTime(venue?.closing_time);
  const openNow = opening && closing ? isOpenNow(opening, closing) : null;
  const address = venue?.full_address || venue?.address || [venue?.district, venue?.city].filter(Boolean).join(', ');

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(wifiPass);
      setCopied(true);
      showToast('Wi-Fi şifresi kopyalandı');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Kopyalanamadı');
    }
  };

  return (
    <Sheet open={activeModal === 'venue_info' && Boolean(activeVenue)} onClose={closeModal} width="md" ariaLabel="Mekân bilgileri">
      {venue && (
        <div className="space-y-6 pb-2">
          <div className="flex items-center gap-4 pt-1">
            <span className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-white/[0.06] grid place-items-center">
              {venue.logo_url?.trim() ? (
                <img src={venue.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-7 h-7 text-white/50" />
              )}
            </span>
            <div className="min-w-0">
              <h2 className="text-[20px] font-bold tracking-tight truncate">{venue.venue_name || venue.name}</h2>
              {address && <p className="text-[13px] text-white/50 truncate mt-0.5">{address}</p>}
            </div>
          </div>

          {hasMenu &&
            (isNativeMenu ? (
              <button
                type="button"
                onClick={() => openModal('menu')}
                className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 min-h-[56px] text-left active:scale-[0.98] transition-transform duration-150"
              >
                <BookOpen className="w-5 h-5 text-white/70" />
                <span className="flex-1 text-[15px] font-semibold">Menüyü görüntüle</span>
                <ChevronRight className="w-4 h-4 text-white/30" />
              </button>
            ) : (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 min-h-[56px] active:scale-[0.98] transition-transform duration-150"
              >
                <BookOpen className="w-5 h-5 text-white/70" />
                <span className="flex-1 text-[15px] font-semibold">Menüyü görüntüle</span>
                <ExternalLink className="w-4 h-4 text-white/30" />
              </a>
            ))}

          {(wifiName || wifiPass) && (
            <div>
              <p className={sectionLabel}>Wi-Fi</p>
              <div className={groupCard}>
                {wifiName && (
                  <div className={groupRow}>
                    <Wifi className="w-[18px] h-[18px] text-white/55" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] text-white/45">Ağ adı</span>
                      <span className="block text-[15px] font-medium truncate">{wifiName}</span>
                    </span>
                  </div>
                )}
                {wifiPass && (
                  <button type="button" onClick={copyPassword} className={groupRow}>
                    <span className="w-[18px]" />
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] text-white/45">Şifre · kopyalamak için dokun</span>
                      <span className="block text-[15px] font-medium font-mono truncate">{wifiPass}</span>
                    </span>
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-white/40" />}
                  </button>
                )}
              </div>
            </div>
          )}

          <div>
            <p className={sectionLabel}>Bilgiler</p>
            <div className={groupCard}>
              {opening && closing && (
                <div className={groupRow}>
                  <Clock className="w-[18px] h-[18px] text-white/55" />
                  <span className="flex-1 text-[15px] font-medium tabular-nums">
                    {opening} – {closing}
                  </span>
                  {openNow !== null && (
                    <span className={`text-[13px] font-semibold ${openNow ? 'text-emerald-400' : 'text-white/40'}`}>
                      {openNow ? 'Açık' : 'Kapalı'}
                    </span>
                  )}
                </div>
              )}
              <div className={`${groupRow} items-start`}>
                <ShieldCheck className="w-[18px] h-[18px] text-white/55 mt-0.5" />
                <span className="flex-1 min-w-0">
                  <span className="block text-[15px] font-medium">Müzik tarzı</span>
                  {vibe?.enabled && vibe.description && (
                    <span className="block text-[13px] text-white/75 mt-0.5 leading-relaxed">{vibe.description}</span>
                  )}
                  <span className="block text-[13px] text-white/50 mt-0.5 leading-relaxed">{vibeRuleSummary(vibe)}</span>
                  {styles.length > 0 && (
                    <span className="flex flex-wrap gap-1.5 mt-2.5">
                      {styles.map((style) => (
                        <span key={style} className="px-2.5 py-1 rounded-full bg-white/[0.07] text-[12px] font-medium text-white/80">
                          {style}
                        </span>
                      ))}
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
};
