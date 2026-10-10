/**
 * Muzikors Gamification & Level System Engine
 * Dynamic XP calculation, titles, progression curve, and level-based avatar frames.
 */

export interface LevelTier {
  minLevel: number;
  maxLevel: number;
  title: string;
  icon: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const LEVEL_TIERS: LevelTier[] = [
  {
    minLevel: 1,
    maxLevel: 5,
    title: 'Dinleyici',
    icon: '🎧',
    badgeBg: 'bg-neutral-800/80',
    badgeText: 'text-neutral-300',
    badgeBorder: 'border-neutral-700'
  },
  {
    minLevel: 6,
    maxLevel: 15,
    title: 'Stajyer DJ',
    icon: '📻',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30'
  },
  {
    minLevel: 16,
    maxLevel: 30,
    title: 'Part time DJ',
    icon: '🎶',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-400',
    badgeBorder: 'border-sky-500/30'
  },
  {
    minLevel: 31,
    maxLevel: 50,
    title: 'Full time DJ',
    icon: '🎷',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-400',
    badgeBorder: 'border-amber-500/30'
  },
  {
    minLevel: 51,
    maxLevel: 75,
    title: 'Rezident DJ',
    icon: '🎛️',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-400',
    badgeBorder: 'border-emerald-500/30'
  },
  {
    minLevel: 76,
    maxLevel: 100,
    title: 'Efsanevi Maestro',
    icon: '👑',
    badgeBg: 'bg-[var(--theme-primary)]/20',
    badgeText: 'text-[var(--theme-primary-light)]',
    badgeBorder: 'border-[var(--theme-primary)]/40'
  }
];

export const XP_REWARDS = {
  REQUEST_SONG: 15,
  RECEIVE_LIKE: 5,
  GIVE_LIKE: 2,
  BOOST_SONG: 25,
  MAX_DAILY_RECEIVED_LIKE_XP: 100
} as const;

/**
 * Returns the XP needed to progress from level L to level L+1.
 * Formula: 100 + (L - 1) * 5
 * e.g. Lvl 1 -> 100 XP, Lvl 2 -> 105 XP, Lvl 3 -> 110 XP
 */
export function getXpRequiredForLevel(level: number): number {
  if (level < 1) return 100;
  return 100 + (level - 1) * 5;
}

/**
 * Returns total cumulative XP required to reach the start of level L.
 */
export function getTotalXpForLevel(level: number): number {
  if (level <= 1) return 0;
  const n = level - 1;
  return 100 * n + (5 * n * (n - 1)) / 2;
}

export interface LevelDetails {
  level: number;
  totalXp: number;
  currentLevelXp: number;     // XP earned in current level
  xpForNextLevel: number;     // Total XP needed to finish current level
  remainingXpForNext: number; // XP left to level up
  progressPercentage: number; // 0 - 100
  title: string;              // e.g. 'Stajyer DJ'
  fullTitle: string;          // e.g. '📻 Stajyer DJ'
  icon: string;               // e.g. '📻'
  tier: LevelTier;
}

/**
 * Computes full level progress and metadata from total accumulated XP
 */
export function getLevelDetails(totalXp: number = 0): LevelDetails {
  const safeXp = Math.max(0, Math.floor(totalXp || 0));
  
  let currentLevel = 1;
  while (currentLevel < 100) {
    const xpThresholdForNext = getTotalXpForLevel(currentLevel + 1);
    if (safeXp < xpThresholdForNext) {
      break;
    }
    currentLevel++;
  }

  const levelBaseXp = getTotalXpForLevel(currentLevel);
  const xpForNextLevel = getXpRequiredForLevel(currentLevel);
  const currentLevelXp = safeXp - levelBaseXp;
  const remainingXpForNext = Math.max(0, xpForNextLevel - currentLevelXp);
  const progressPercentage = Math.min(100, Math.max(0, Math.round((currentLevelXp / xpForNextLevel) * 100)));

  const tier = LEVEL_TIERS.find(t => currentLevel >= t.minLevel && currentLevel <= t.maxLevel) || LEVEL_TIERS[0];

  return {
    level: currentLevel,
    totalXp: safeXp,
    currentLevelXp,
    xpForNextLevel,
    remainingXpForNext,
    progressPercentage,
    title: tier.title,
    fullTitle: `${tier.icon} ${tier.title}`,
    icon: tier.icon,
    tier
  };
}

/**
 * Returns tier metadata for a given level
 */
export function getTierForLevel(level: number): LevelTier {
  const safeLevel = Math.max(1, Math.min(100, Math.floor(level || 1)));
  return LEVEL_TIERS.find(t => safeLevel >= t.minLevel && safeLevel <= t.maxLevel) || LEVEL_TIERS[0];
}

// ─── Avatar Frames (Level & Beta Unlocked) ──────────────────────────────────
export interface AvatarFrameConfig {
  id: string;
  name: string;
  minLevel?: number;
  isBetaOnly?: boolean;
  glowClass: string;
  borderClass: string;
  ornamentEmoji?: string;
  previewGradient: string;
  description: string;
}

export const AVATAR_FRAMES: AvatarFrameConfig[] = [
  {
    id: 'none',
    name: 'Çerçevesiz',
    glowClass: '',
    borderClass: '',
    previewGradient: 'from-neutral-800 to-neutral-900',
    description: 'Klasik sade profil görünümü.',
  },
  {
    id: 'frame_lvl6',
    name: 'Stajyer DJ Çerçevesi',
    minLevel: 6,
    glowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.3)] ring-2 ring-emerald-500/50',
    borderClass: 'border-2 border-emerald-400',
    ornamentEmoji: '📻',
    previewGradient: 'from-emerald-700 via-emerald-500 to-teal-600',
    description: 'Seviye 6 (Stajyer DJ) ve üzeri kullanıcılara özel zümrüt ışıltılı çerçeve.',
  },
  {
    id: 'frame_lvl16',
    name: 'Part Time DJ Çerçevesi',
    minLevel: 16,
    glowClass: 'shadow-[0_0_8px_rgba(56,189,248,0.3)] ring-2 ring-sky-400',
    borderClass: 'border-2 border-sky-300',
    ornamentEmoji: '🎶',
    previewGradient: 'from-sky-600 via-sky-400 to-blue-500',
    description: 'Seviye 16 (Part time DJ) ve üzeri kullanıcılara özel neon gökyüzü çerçevesi.',
  },
  {
    id: 'frame_lvl31',
    name: 'Full Time Altın Plak',
    minLevel: 31,
    glowClass: 'shadow-[0_0_10px_rgba(245,158,11,0.35)] ring-2 ring-amber-400',
    borderClass: 'border-2 border-amber-300',
    ornamentEmoji: '🎷',
    previewGradient: 'from-amber-600 via-amber-400 to-yellow-300',
    description: 'Seviye 31 (Full time DJ) ve üzeri kullanıcılara özel saf altın ışıltılı çerçeve.',
  },
  {
    id: 'frame_lvl51',
    name: 'Rezident DJ Aurası',
    minLevel: 51,
    glowClass: 'shadow-[0_0_10px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400',
    borderClass: 'border-2 border-emerald-300',
    ornamentEmoji: '🎛️',
    previewGradient: 'from-emerald-600 via-teal-400 to-emerald-300',
    description: 'Seviye 51 (Rezident DJ) ve üzeri kullanıcılara özel stüdyo mikseri zümrüt aurası.',
  },
  {
    id: 'frame_lvl76',
    name: 'Efsanevi Maestro Tacı',
    minLevel: 76,
    glowClass: 'shadow-[0_0_12px_rgba(212,175,55,0.45)] ring-2 ring-[var(--theme-primary)]',
    borderClass: 'border-2 border-[var(--theme-primary-light)]',
    ornamentEmoji: '👑',
    previewGradient: 'from-amber-500 via-[var(--theme-primary)] to-yellow-200',
    description: 'Seviye 76 (Efsanevi Maestro) kullanıcılarına özel altın taçlı zirve çerçevesi.',
  },
  {
    id: 'beta_tester',
    name: 'Beta Tester Siber Neon',
    isBetaOnly: true,
    glowClass: 'shadow-[0_0_20px_var(--theme-glow)] ring-2 ring-[var(--theme-primary)]',
    borderClass: 'border-2 border-[var(--theme-primary-light)]',
    ornamentEmoji: '🧪',
    previewGradient: 'from-[var(--theme-primary-dark)] via-[var(--theme-primary)] to-[var(--theme-primary-light)]',
    description: 'Muzikors Beta Tester takımına özel kuantum çerçeve.',
  },
];

export function isFrameUnlocked(
  frameId: string,
  userLevel: number = 1,
  isBetaTester: boolean = false
): boolean {
  if (!frameId || frameId === 'none') return true;
  const frame = AVATAR_FRAMES.find(f => f.id === frameId);
  if (!frame) return true;
  
  if (frame.isBetaOnly) return isBetaTester;
  if (frame.minLevel) return userLevel >= frame.minLevel;
  return true;
}
