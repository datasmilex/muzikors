// ─── Achievements System ───────────────────────────────────────────────────
// Her başarımın emoji simgesi, başlık, açıklaması, hedef değeri ve ödülü var.
// category: 'songs' = total_songs_requested bazlı
//           'spend'  = total_credits_spent bazlı
// tier: görsel kalite seviyesi ('bronze' | 'silver' | 'gold' | 'diamond')

export type AchievementCategory = 'songs' | 'spend' | 'special';
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Achievement {
  id: string;
  emoji: string;             // büyük emoji icon olarak render edilecek
  title: string;             // başarım adı
  description: string;       // kısa açıklama (progress metni dahil)
  tier: AchievementTier;
  category: AchievementCategory;
  target: number;            // hedef değer (şarkı sayısı veya harcanan kredi)
  reward: number;            // kazanılacak promo_credits miktarı
}

// ─── Şarkı İsteme Başarımları ─────────────────────────────────────────────
// "Müzik Zevki → Mekanın Sesi → Altın Kulak → Efsane DJ"
// hedefler: 5 → 20 → 75 → 250

const songAchievements: Achievement[] = [
  {
    id: 'songs_5',
    emoji: '🎵',
    title: 'Müzik Zevki',
    description: 'İlk {target} şarkını çaldırdın.',
    tier: 'bronze',
    category: 'songs',
    target: 5,
    reward: 10,
  },
  {
    id: 'songs_20',
    emoji: '🎤',
    title: 'Mekanın Sesi',
    description: '{target} şarkı isteği — ortamı sen yaratıyorsun.',
    tier: 'silver',
    category: 'songs',
    target: 20,
    reward: 30,
  },
  {
    id: 'songs_75',
    emoji: '🎸',
    title: 'Altın Kulak',
    description: '{target} şarkı ile müzik hafızan dolu.',
    tier: 'gold',
    category: 'songs',
    target: 75,
    reward: 100,
  },
  {
    id: 'songs_250',
    emoji: '👑',
    title: 'Efsane DJ',
    description: '{target} şarkı isteğiyle sen artık bir efsanesin.',
    tier: 'diamond',
    category: 'songs',
    target: 250,
    reward: 350,
  },
];

// ─── Kredi Harcama Başarımları ────────────────────────────────────────────
// "Atmosfer Yaratıcısı → Bonkör → Mekanın Sahibi → Altın Kalp"
// hedefler: 100 → 500 → 2000 → 7500

const spendAchievements: Achievement[] = [
  {
    id: 'spend_100',
    emoji: '⚡',
    title: 'Atmosfer Yaratıcısı',
    description: '{target} kredi harcayarak mekanı hareketlendirdin.',
    tier: 'bronze',
    category: 'spend',
    target: 100,
    reward: 15,
  },
  {
    id: 'spend_500',
    emoji: '💎',
    title: 'Bonkör',
    description: '{target} kredi ile mekanın en cömert dinleyicisisin.',
    tier: 'silver',
    category: 'spend',
    target: 500,
    reward: 60,
  },
  {
    id: 'spend_2000',
    emoji: '🏆',
    title: 'Mekanın Sahibi',
    description: '{target} kredi — bu mekana ruhunu kattın.',
    tier: 'gold',
    category: 'spend',
    target: 2000,
    reward: 250,
  },
  {
    id: 'spend_7500',
    emoji: '🌟',
    title: 'Altın Kalp',
    description: '{target} kredi ile sen artık Muzikors\'un efsanesisin.',
    tier: 'diamond',
    category: 'spend',
    target: 7500,
    reward: 1000,
  },
];

// ─── Özel Başarımlar (Special) ──────────────────────────────────────────────
const specialAchievements: Achievement[] = [
  {
    id: 'beta_tester',
    emoji: '🧪',
    title: 'Beta Tester',
    description: 'Muzikors\'un erken aşama test sürecine katkıda bulundun.',
    tier: 'diamond',
    category: 'special',
    target: 1, // Kilitli olup olmadığını özel mantıkla çözeceğiz
    reward: 300,
  },
];

export const ACHIEVEMENTS: Achievement[] = [...songAchievements, ...spendAchievements, ...specialAchievements];

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────
export function getAchievementProgress(
  achievement: Achievement,
  totalSongs: number,
  totalSpent: number,
  isBetaTester: boolean = false
): number {
  if (achievement.id === 'beta_tester') return isBetaTester ? 1 : 0;
  const current = achievement.category === 'songs' ? totalSongs : totalSpent;
  return Math.min(current, achievement.target);
}

export function isAchievementUnlocked(
  achievement: Achievement,
  totalSongs: number,
  totalSpent: number,
  isBetaTester: boolean = false
): boolean {
  if (achievement.id === 'beta_tester') return isBetaTester;
  return getAchievementProgress(achievement, totalSongs, totalSpent, isBetaTester) >= achievement.target;
}

export function isAchievementClaimed(
  achievement: Achievement, 
  claimedList: string[],
  isBetaTesterRewardClaimed: boolean = false
): boolean {
  if (achievement.id === 'beta_tester') return isBetaTesterRewardClaimed;
  return claimedList.includes(achievement.id);
}

// Tier renk sistemi
export const TIER_STYLES: Record<AchievementTier, {
  border: string;
  bg: string;
  glow: string;
  badge: string;
  text: string;
  progressFill: string;
}> = {
  bronze: {
    border: 'border-amber-700/50',
    bg: 'bg-amber-950/30',
    glow: 'shadow-[0_0_15px_rgba(180,100,30,0.2)]',
    badge: 'bg-amber-700/30 text-amber-500 border-amber-700/40',
    text: 'text-amber-500',
    progressFill: 'bg-amber-700',
  },
  silver: {
    border: 'border-slate-400/50',
    bg: 'bg-slate-900/40',
    glow: 'shadow-[0_0_15px_rgba(150,160,180,0.15)]',
    badge: 'bg-slate-700/30 text-slate-300 border-slate-600/40',
    text: 'text-slate-300',
    progressFill: 'bg-slate-400',
  },
  gold: {
    border: 'border-[#D4AF37]/60',
    bg: 'bg-[#241911]/60',
    glow: 'shadow-[0_0_20px_rgba(212,175,55,0.2)]',
    badge: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40',
    text: 'text-[#D4AF37]',
    progressFill: 'bg-gradient-to-r from-[#D4AF37] to-[#E5A93B]',
  },
  diamond: {
    border: 'border-purple-400/50',
    bg: 'bg-purple-950/30',
    glow: 'shadow-[0_0_20px_rgba(167,139,250,0.2)]',
    badge: 'bg-purple-900/30 text-purple-300 border-purple-700/40',
    text: 'text-purple-300',
    progressFill: 'bg-gradient-to-r from-purple-500 to-pink-500',
  },
};
