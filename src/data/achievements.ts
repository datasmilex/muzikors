// ─── Achievements System ───────────────────────────────────────────────────
// Her başarımın emoji simgesi, başlık, açıklaması, hedef değeri ve ödülü var.
// category: 'songs' = total_songs_requested bazlı
//           'spend'  = total_credits_spent bazlı
// tier: görsel kalite seviyesi ('bronze' | 'silver' | 'gold' | 'diamond')

export type AchievementCategory = 'songs' | 'special';
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

const specialAchievements: Achievement[] = [
  {
    id: 'beta_tester',
    emoji: '🧪',
    title: 'Beta Tester',
    description: 'Muzikors\'un erken aşama test sürecine katkıda bulundun.',
    tier: 'diamond',
    category: 'special',
    target: 1,
    reward: 0,
  },
];

export const ACHIEVEMENTS: Achievement[] = [...songAchievements, ...specialAchievements];

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────────────
export function getAchievementProgress(
  achievement: Achievement,
  totalSongs: number,
  isBetaTester: boolean = false
): number {
  if (achievement.id === 'beta_tester') return isBetaTester ? 1 : 0;
  const current = totalSongs;
  return Math.min(current, achievement.target);
}

export function isAchievementUnlocked(
  achievement: Achievement,
  totalSongs: number,
  isBetaTester: boolean = false
): boolean {
  if (achievement.id === 'beta_tester') return isBetaTester;
  return getAchievementProgress(achievement, totalSongs, isBetaTester) >= achievement.target;
}

export function isAchievementClaimed(
  achievementOrId: Achievement | string,
  claimedList: string[] = [],
  isBetaTesterRewardClaimed: boolean = false
): boolean {
  const id = typeof achievementOrId === 'string' ? achievementOrId : achievementOrId.id;
  if (id === 'beta_tester') return isBetaTesterRewardClaimed;
  return claimedList.includes(id);
}

// ─── Profil Çerçeveleri (Avatar Frames) ──────────────────────────────────────
export interface AvatarFrameConfig {
  id: string;
  name: string;
  requiredAchievementId: string | null;
  glowClass: string;
  borderClass: string;
  ornamentEmoji?: string;
  previewGradient: string;
  description: string;
}

export const AVATAR_FRAMES: AvatarFrameConfig[] = [
  {
    id: 'none',
    name: 'Sade / Klasik',
    requiredAchievementId: null,
    glowClass: '',
    borderClass: 'border-2 border-white/10',
    previewGradient: 'from-zinc-800 to-zinc-900',
    description: 'Standart çerçevesiz görünüm.',
  },
  {
    id: 'songs_5',
    name: 'Bronz Melodi',
    requiredAchievementId: 'songs_5',
    glowClass: 'shadow-[0_0_12px_rgba(217,119,6,0.6)] ring-2 ring-amber-600/80',
    borderClass: 'border-2 border-amber-500',
    ornamentEmoji: '🎵',
    previewGradient: 'from-amber-700 via-amber-600 to-yellow-700',
    description: '"Müzik Zevki" başarımını kazananlara özel bronz çerçeve.',
  },
  {
    id: 'songs_20',
    name: 'Gümüş Akustik',
    requiredAchievementId: 'songs_20',
    glowClass: 'shadow-[0_0_14px_rgba(226,232,240,0.7)] ring-2 ring-slate-300',
    borderClass: 'border-2 border-slate-200',
    ornamentEmoji: '🎤',
    previewGradient: 'from-slate-400 via-slate-200 to-slate-400',
    description: '"Mekanın Sesi" başarımını kazananlara özel parlak gümüş çerçeve.',
  },
  {
    id: 'songs_75',
    name: 'Altın Plak',
    requiredAchievementId: 'songs_75',
    glowClass: 'shadow-[0_0_18px_rgba(212,175,55,0.9)] ring-2 ring-[#D4AF37]',
    borderClass: 'border-2 border-[#D4AF37]',
    ornamentEmoji: '🎸',
    previewGradient: 'from-yellow-600 via-[#D4AF37] to-amber-300',
    description: '"Altın Kulak" başarımını kazananlara özel 24K saf altın ışıltılı çerçeve.',
  },
  {
    id: 'songs_250',
    name: 'Efsane DJ',
    requiredAchievementId: 'songs_250',
    glowClass: 'shadow-[0_0_22px_rgba(34,211,238,0.9)] ring-2 ring-cyan-400',
    borderClass: 'border-2 border-cyan-300',
    ornamentEmoji: '👑',
    previewGradient: 'from-cyan-400 via-fuchsia-500 to-indigo-600',
    description: '"Efsane DJ" başarımını kazananlara özel kozmik elmas taçlı çerçeve.',
  },
  {
    id: 'beta_tester',
    name: 'Kuantum Siber Altın',
    requiredAchievementId: 'beta_tester',
    glowClass: 'shadow-[0_0_20px_rgba(245,158,11,0.8)] ring-2 ring-amber-500',
    borderClass: 'border-2 border-amber-400',
    ornamentEmoji: '🧪',
    previewGradient: 'from-amber-500 via-yellow-400 to-amber-600',
    description: 'Muzikors Beta Tester takımına özel kuantum siber altın çerçeve.',
  },
];

export function isFrameUnlocked(
  frameId: string,
  totalSongs: number,
  isBetaTester: boolean = false
): boolean {
  if (!frameId || frameId === 'none') return true;
  const frame = AVATAR_FRAMES.find(f => f.id === frameId);
  if (!frame || !frame.requiredAchievementId) return true;
  
  if (frame.requiredAchievementId === 'beta_tester') return isBetaTester;
  if (frame.requiredAchievementId === 'songs_5') return totalSongs >= 5;
  if (frame.requiredAchievementId === 'songs_20') return totalSongs >= 20;
  if (frame.requiredAchievementId === 'songs_75') return totalSongs >= 75;
  if (frame.requiredAchievementId === 'songs_250') return totalSongs >= 250;
  return false;
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
    border: 'border-cyan-400/50',
    bg: 'bg-cyan-950/30',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.2)]',
    badge: 'bg-cyan-900/30 text-cyan-300 border-cyan-700/40',
    text: 'text-cyan-300',
    progressFill: 'bg-gradient-to-r from-cyan-500 to-emerald-500',
  },
};
