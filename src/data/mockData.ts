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
    description: 'Başlangıç Paketi (5 Şarkı İstek)',
  },
  {
    id: 'pack-100',
    credits: 100,
    bonusCredits: 15,
    priceTL: 90,
    isPopular: true,
    badge: 'ÇOK SATAN',
    description: '100 Kredi + 15 Hediye Kredi!',
  },
  {
    id: 'pack-200',
    credits: 200,
    bonusCredits: 40,
    priceTL: 160,
    badge: 'EN AVANTAJLI VIP',
    description: '200 Kredi + 40 Hediye Kredi!',
  },
];
