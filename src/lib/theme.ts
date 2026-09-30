export type ThemeType = 'monochrome' | 'crema' | 'emerald' | 'ruby' | 'sapphire' | 'obsidian';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  subtitle: string;
  previewColor?: string;
  accentColor: string;
  accentLight: string;
  accentDark: string;
  bgColor: string;
  cardColor: string;
  gradient: string;
  badgeBg: string;
  textAccent: string;
  glowColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'monochrome',
    name: 'Monochrome',
    subtitle: 'Saf Siyah-Beyaz & Minimal',
    previewColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    accentLight: '#F4F4F5',
    accentDark: '#E4E4E7',
    bgColor: '#000000',
    cardColor: '#0D0D0D',
    gradient: 'from-white via-zinc-200 to-zinc-400',
    badgeBg: 'bg-white text-black',
    textAccent: 'text-white',
    glowColor: 'rgba(255, 255, 255, 0.15)',
  },
  {
    id: 'crema',
    name: 'Crema Gold',
    subtitle: 'Krema & Şampanya',
    accentColor: '#F3D573',
    accentLight: '#F8E7A8',
    accentDark: '#D4AF37',
    bgColor: '#0A0806',
    cardColor: '#191510',
    gradient: 'from-[#F8E7A8] to-[#D4AF37]',
    badgeBg: 'bg-[#F3D573] text-black',
    textAccent: 'text-[#F3D573]',
    glowColor: 'rgba(243, 213, 115, 0.18)',
  },
  {
    id: 'emerald',
    name: 'Emerald Jazz',
    subtitle: 'Zümrüt Yeşili',
    accentColor: '#10B981',
    accentLight: '#34D399',
    accentDark: '#059669',
    bgColor: '#020C07',
    cardColor: '#071A11',
    gradient: 'from-emerald-400 to-teal-500',
    badgeBg: 'bg-emerald-400 text-black',
    textAccent: 'text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.18)',
  },
  {
    id: 'ruby',
    name: 'Ruby Rosé',
    subtitle: 'Krem Beyazı & Yakut',
    accentColor: '#FB7185',
    accentLight: '#FFF0F3',
    accentDark: '#E11D48',
    bgColor: '#130C10',
    cardColor: '#20141B',
    gradient: 'from-[#FFF0F3] via-[#FB7185] to-[#E11D48]',
    badgeBg: 'bg-[#FFF0F3] text-rose-950',
    textAccent: 'text-[#FB7185]',
    glowColor: 'rgba(251, 113, 133, 0.18)',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Night',
    subtitle: 'Safir & Gece Mavisi',
    accentColor: '#38BDF8',
    accentLight: '#7DD3FC',
    accentDark: '#0284C7',
    bgColor: '#030810',
    cardColor: '#091321',
    gradient: 'from-sky-400 to-blue-500',
    badgeBg: 'bg-sky-400 text-black',
    textAccent: 'text-sky-400',
    glowColor: 'rgba(56, 189, 248, 0.18)',
  },
  {
    id: 'obsidian',
    name: 'Obsidian Gold',
    subtitle: 'Muzikors Klasik',
    accentColor: '#D4AF37',
    accentLight: '#F3D573',
    accentDark: '#B49326',
    bgColor: '#070604',
    cardColor: '#110F0A',
    gradient: 'from-[#F3D573] to-[#D4AF37]',
    badgeBg: 'bg-[#D4AF37] text-black',
    textAccent: 'text-[#D4AF37]',
    glowColor: 'rgba(212, 175, 55, 0.18)',
  },
];

export const THEME_STORAGE_KEY = 'muzikors_theme';

export function getStoredTheme(): ThemeType {
  if (typeof window === 'undefined') return 'monochrome';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'velvet') return 'monochrome';
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeType;
    }
  } catch (e) {
    console.error('Failed to get theme from localStorage', e);
  }
  return 'monochrome';
}

export function applyTheme(theme: ThemeType) {
  if (typeof document === 'undefined') return;
  const config = THEMES.find((t) => t.id === theme) || THEMES[0];
  
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty('--theme-bg', config.bgColor);
  document.documentElement.style.setProperty('--theme-card', config.cardColor);
  document.documentElement.style.setProperty('--theme-primary', config.accentColor);
  document.documentElement.style.setProperty('--theme-primary-light', config.accentLight);
  document.documentElement.style.setProperty('--theme-primary-dark', config.accentDark);
  document.documentElement.style.setProperty('--theme-glow', config.glowColor);
  if (document.body) {
    document.body.style.backgroundColor = config.bgColor;
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('muzikors:theme-changed', { detail: { theme, config } }));
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
}
