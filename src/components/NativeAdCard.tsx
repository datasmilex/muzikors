'use client';

import React from 'react';
import { ExternalLink, Music2, Crown, Compass, Volume2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ADMOB_NATIVE_AD_UNIT_ID = 'ca-app-pub-6907017256187136/3608277325';
export const ADSENSE_CLIENT_ID = 'ca-pub-6907017256187136';
export const ADSENSE_SLOT_ID = '3608277325';

interface NativeAdCardProps {
  variantIndex?: number;
}

const BACKUP_CREATIVES = [
  {
    title: 'Muzikors VIP Club & Sınırsız Müzik',
    sponsor: 'Muzikors Official',
    description: 'Kafede çalan şarkılara anında oy ver, sıradaki parçayı sen belirle. Reklamsız ve 5 kat hızlı müzik deneyimi!',
    ctaText: 'Premium’a Geç',
    actionType: 'premium' as const,
    icon: Crown,
    badge: 'Öne Çıkan',
  },
  {
    title: 'Şehrindeki En Popüler Kafeler',
    sponsor: 'Muzikors Keşfet',
    description: 'Canlı müzik çalan, DJ performansları olan ve senin şarkılarını çalan en yakın mekanları GPS haritasında bul.',
    ctaText: 'Mekanları Gör',
    actionType: 'map' as const,
    icon: Compass,
    badge: 'Mekan Rehberi',
  },
  {
    title: 'Müziğin Ritmini Kafeye Taşı',
    sponsor: 'Muzikors Sound',
    description: 'En sevdiğin parçaları sıraya ekle, arkadaşlarınla birlikte oy vererek liste başına taşı!',
    ctaText: 'Şarkı Ara & İste',
    actionType: 'search' as const,
    icon: Music2,
    badge: 'Sponsorlu',
  },
  {
    title: 'Kristal Netliğinde Müzik Yayını',
    sponsor: 'Spotify & Muzikors SoundLab',
    description: 'En son çıkan hit parçalar ve stüdyo kalitesinde mekan ses akışı ile ambiyansın tadını çıkar.',
    ctaText: 'Hemen İncele',
    actionType: 'howitworks' as const,
    icon: Volume2,
    badge: 'Sponsorlu',
  },
];

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ variantIndex = 0 }) => {
  const { openModal } = useApp();
  const creative = BACKUP_CREATIVES[variantIndex % BACKUP_CREATIVES.length];
  const IconComponent = creative.icon;

  const handleAction = () => {
    if (creative.actionType === 'premium') {
      openModal('premium');
    } else if (creative.actionType === 'map') {
      openModal('map');
    } else if (creative.actionType === 'search') {
      openModal('search');
    } else {
      openModal('howitworks');
    }
  };

  return (
    <div className="bg-[#1C130D]/80 border border-[#D4AF37]/25 p-3.5 mb-4 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.3)] relative overflow-hidden group hover:border-[#D4AF37]/45 transition-all">
      {/* Subtle Glow Background */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header with Sponsor badge */}
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-transparent border border-[#D4AF37]/35 flex items-center justify-center text-[#D4AF37] shadow-inner shrink-0">
            <IconComponent className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white">{creative.sponsor}</span>
            </div>
            <span className="text-[10px] font-medium text-amber-200/50">Yerel Tanıtım & Fırsat</span>
          </div>
        </div>

        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
          {creative.badge}
        </span>
      </div>

      {/* Body Content */}
      <div className="mb-3 relative z-10">
        <h4 className="text-sm font-black text-white group-hover:text-amber-200 transition-colors">
          {creative.title}
        </h4>
        <p className="text-xs text-amber-200/70 mt-1 leading-relaxed font-medium">
          {creative.description}
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between relative z-10">
        <span className="text-[10px] font-bold text-amber-200/40 uppercase tracking-wider">
          AdMob • AdSense
        </span>
        <button
          onClick={handleAction}
          className="px-3.5 py-1.5 rounded-xl gold-gradient-bg text-stone-950 text-xs font-black flex items-center gap-1.5 shadow-[0_3px_12px_rgba(212,175,55,0.25)] active:scale-95 transition-all cursor-pointer"
        >
          <span>{creative.ctaText}</span>
          <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
