import { Track, Venue, CreditPackage } from '../types';

// Clean slate: no demo venues registered by default
export const MOCK_VENUES: Record<string, Venue> = {};

// Clean slate: no now playing track initially
export const CURRENTLY_PLAYING: Track | null = null;

// Clean slate: empty upcoming queue
export const UP_NEXT_QUEUE: Track[] = [];

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'pack-50',
    credits: 50,
    bonusCredits: 0,
    priceTL: 50,
    oldPriceTL: 75,
    description: 'Başlangıç Paketi',
  },
  {
    id: 'pack-120',
    credits: 100,
    bonusCredits: 20,
    priceTL: 100,
    oldPriceTL: 150,
    isPopular: true,
    badge: 'ÇOK SATAN',
    description: 'Popüler Tercih',
  },
  {
    id: 'pack-250',
    credits: 200,
    bonusCredits: 50,
    priceTL: 200,
    oldPriceTL: 300,
    badge: 'EN AVANTAJLI VIP',
    description: 'VIP Gece Paketi',
  },
];
