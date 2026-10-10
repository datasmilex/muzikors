import { clearLivePalette } from './albumColor';

export type ThemeType = 'live' | 'monochrome' | 'crema' | 'ruby' | 'sapphire';

export const DEFAULT_THEME: ThemeType = 'live';

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
    // Çalan şarkının kapak rengine göre boyanır; şarkı yokken klasik altın tonları görünür.
    id: 'live',
    name: 'Canlı Renk',
    subtitle: 'Çalan şarkının kapağına göre',
    previewColor: 'conic-gradient(#D4AF37, #E11D48, #0EA5E9, #10B981, #D4AF37)',
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
];

export const THEME_STORAGE_KEY = 'muzikors_theme';
// Eski varsayılan (monochrome) ile kalmış kullanıcıları bir kereliğine Canlı Renk'e taşır.
const THEME_MIGRATION_KEY = 'muzikors_theme_v2';

export function getStoredTheme(): ThemeType {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (!localStorage.getItem(THEME_MIGRATION_KEY)) {
      localStorage.setItem(THEME_MIGRATION_KEY, '1');
      if (!saved || saved === 'monochrome' || saved === 'velvet') return DEFAULT_THEME;
    }
    if (saved === 'velvet') return 'monochrome';
    // Kaldırılan temalar (Obsidian Gold, Emerald Jazz) Canlı Renk'e döner.
    if (saved === 'obsidian' || saved === 'emerald') return DEFAULT_THEME;
    if (saved && THEMES.some((t) => t.id === saved)) {
      return saved as ThemeType;
    }
  } catch (e) {
    console.error('Failed to get theme from localStorage', e);
  }
  return DEFAULT_THEME;
}

export function applyTheme(theme: ThemeType) {
  if (typeof document === 'undefined') return;
  const config = THEMES.find((t) => t.id === theme) || THEMES[0];

  // Renkler globals.css'teki [data-theme] bloklarından gelir; Canlı Renk'in
  // önceki şarkıdan kalan satır içi değişkenleri temizlenir.
  document.documentElement.dataset.theme = theme;
  clearLivePalette();
  if (document.body) {
    document.body.style.backgroundColor = 'var(--theme-bg)';
  }

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    window.dispatchEvent(new CustomEvent('muzikors:theme-changed', { detail: { theme, config } }));
  } catch (e) {
    console.error('Failed to save theme to localStorage', e);
  }
}
