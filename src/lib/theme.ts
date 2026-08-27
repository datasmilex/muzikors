export type ThemeType = 'velvet' | 'crema' | 'emerald' | 'ruby' | 'sapphire';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  subtitle: string;
  accentColor: string;
  bgColor: string;
  gradient: string;
  badgeBg: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'velvet',
    name: 'Velvet Gold',
    subtitle: 'Espresso & Sıcak Altın',
    accentColor: '#D4AF37',
    bgColor: '#120C08',
    gradient: 'from-[#E5A93B] to-[#D4AF37]',
    badgeBg: 'bg-[#D4AF37]',
  },
  {
    id: 'crema',
    name: 'Crema Gold',
    subtitle: 'Yumuşak Krema & Şampanya',
    accentColor: '#E5B869',
    bgColor: '#1E1712',
    gradient: 'from-[#F5D8A4] to-[#E5B869]',
    badgeBg: 'bg-[#E5B869]',
  },
  {
    id: 'emerald',
    name: 'Emerald Caz',
    subtitle: 'Derin Zümrüt & Pirinç',
    accentColor: '#10B981',
    bgColor: '#04140D',
    gradient: 'from-[#34D399] to-[#10B981]',
    badgeBg: 'bg-[#10B981]',
  },
  {
    id: 'ruby',
    name: 'Ruby Noir',
    subtitle: 'Mürdüm & Bordo Yakut',
    accentColor: '#F43F5E',
    bgColor: '#140508',
    gradient: 'from-[#FB7185] to-[#F43F5E]',
    badgeBg: 'bg-[#F43F5E]',
  },
  {
    id: 'sapphire',
    name: 'Sapphire Night',
    subtitle: 'Okyanus & Safir Mavisi',
    accentColor: '#38BDF8',
    bgColor: '#060B14',
    gradient: 'from-[#60A5FA] to-[#38BDF8]',
    badgeBg: 'bg-[#38BDF8]',
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
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
}
