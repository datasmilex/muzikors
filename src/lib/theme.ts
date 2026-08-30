export type ThemeType = 'velvet' | 'crema' | 'emerald' | 'ruby' | 'sapphire';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  cardColor: string;
  gradient: string;
  badgeBg: string;
  textAccent: string;
  glowColor: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'velvet',
    name: 'Velvet Gold',
    subtitle: 'Espresso & Sıcak Altın',
    accentColor: '#F59E0B',
    bgColor: '#070604',
    cardColor: '#141318',
    gradient: 'from-amber-400 to-yellow-500',
    badgeBg: 'bg-amber-400 text-black',
    textAccent: 'text-amber-400',
    glowColor: 'rgba(245, 158, 11, 0.4)',
  },
  {
    id: 'crema',
    name: 'Crema Gold',
    subtitle: 'Yumuşak Krema & Şampanya',
    accentColor: '#F3D573',
    bgColor: '#0A0806',
    cardColor: '#191510',
    gradient: 'from-[#F5D8A4] to-[#E5B869]',
    badgeBg: 'bg-[#F3D573] text-black',
    textAccent: 'text-[#F3D573]',
    glowColor: 'rgba(243, 213, 115, 0.4)',
  },
  {
    id: 'emerald',
    name: 'Emerald Caz',
    subtitle: 'Derin Zümrüt & Neon',
    accentColor: '#10B981',
    bgColor: '#020C07',
    cardColor: '#071A11',
    gradient: 'from-emerald-400 to-teal-500',
    badgeBg: 'bg-emerald-400 text-black',
    textAccent: 'text-emerald-400',
    glowColor: 'rgba(16, 185, 129, 0.4)',
  },
  {
    id: 'ruby',
    name: 'Ruby Noir',
    subtitle: 'Mürdüm & Yakut Kırmızısı',
    accentColor: '#F43F5E',
    bgColor: '#0C0205',
    cardColor: '#1A070C',
    gradient: 'from-rose-400 to-red-500',
    badgeBg: 'bg-rose-500 text-white',
    textAccent: 'text-rose-400',
    glowColor: 'rgba(244, 63, 94, 0.4)',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Night',
    subtitle: 'Okyanus & Safir Mavisi',
    accentColor: '#38BDF8',
    bgColor: '#030810',
    cardColor: '#091321',
    gradient: 'from-sky-400 to-blue-500',
    badgeBg: 'bg-sky-400 text-black',
    textAccent: 'text-sky-400',
    glowColor: 'rgba(56, 189, 248, 0.4)',
  },
];

export const THEME_STORAGE_KEY = 'muzikors_theme';

export function getStoredTheme(): ThemeType {
  if (typeof window === 'undefined') return 'velvet';
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeType;
    }
  } catch (e) {
    console.error('Failed to get theme from localStorage', e);
  }
  return 'velvet';
}

export function applyTheme(theme: ThemeType) {
  if (typeof document === 'undefined') return;
  const config = THEMES.find((t) => t.id === theme) || THEMES[0];
  
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.setProperty('--theme-bg', config.bgColor);
  document.documentElement.style.setProperty('--theme-card', config.cardColor);
  document.documentElement.style.setProperty('--theme-primary', config.accentColor);
  document.documentElement.style.setProperty('--theme-glow', config.glowColor);

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('muzikors:theme-changed', { detail: { theme, config } }));
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
}
