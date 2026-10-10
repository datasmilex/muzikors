// Albüm kapağından baskın rengi çıkarıp "Canlı Renk" teması için bir palet üretir.
// Spotify kapak görselleri CORS'a izin verdiği (Access-Control-Allow-Origin: *)
// için canvas üzerinden okunabilir; okunamayan görsellerde null döner.

export interface Rgb { r: number; g: number; b: number }

export interface LivePalette {
  bg: Rgb;
  card: Rgb;
  cardAlt: Rgb;
  primary: Rgb;
  primaryLight: Rgb;
  primaryDark: Rgb;
  text: Rgb;
}

const cache = new Map<string, Rgb | null>();

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

function rgbToHsl({ r, g, b }: Rgb): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

function hslToRgb(h: number, s: number, l: number): Rgb {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return { r: Math.round(f(0) * 255), g: Math.round(f(8) * 255), b: Math.round(f(4) * 255) };
}

/** Kapaktaki en baskın "canlı" rengi bulur (gri/siyah/beyaz pikseller ağırlıksızdır). */
export function extractDominantColor(src: string): Promise<Rgb | null> {
  if (!src || typeof window === 'undefined') return Promise.resolve(null);
  if (cache.has(src)) return Promise.resolve(cache.get(src) ?? null);

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('canvas yok');
        ctx.drawImage(img, 0, 0, size, size);
        const { data } = ctx.getImageData(0, 0, size, size);

        // 12 renk tonu kovası; her piksel doygunluk × parlaklık ile ağırlıklandırılır
        const buckets = Array.from({ length: 12 }, () => ({ w: 0, r: 0, g: 0, b: 0 }));
        let vividWeight = 0;
        for (let i = 0; i < data.length; i += 4) {
          const px = { r: data[i], g: data[i + 1], b: data[i + 2] };
          const [h, s, l] = rgbToHsl(px);
          if (s < 0.2 || l < 0.12 || l > 0.9) continue;
          const w = s * (1 - Math.abs(l - 0.5) * 1.4);
          const bucket = buckets[Math.floor(h / 30) % 12];
          bucket.w += w;
          bucket.r += px.r * w;
          bucket.g += px.g * w;
          bucket.b += px.b * w;
          vividWeight += w;
        }

        const best = buckets.reduce((a, b) => (b.w > a.w ? b : a));
        // Kapak neredeyse renksizse (siyah-beyaz kapaklar) marka rengine düşülür
        const result = vividWeight < 20 || best.w === 0
          ? null
          : { r: Math.round(best.r / best.w), g: Math.round(best.g / best.w), b: Math.round(best.b / best.w) };
        cache.set(src, result);
        resolve(result);
      } catch {
        cache.set(src, null);
        resolve(null);
      }
    };
    img.onerror = () => {
      cache.set(src, null);
      resolve(null);
    };
    img.src = src;
  });
}

/** Koyu zemin üzerinde okunabilir kalacak şekilde, tek renkten tüm tema paletini üretir. */
export function paletteFromColor(color: Rgb): LivePalette {
  const [h, s] = rgbToHsl(color);
  const vivid = clamp(s, 0.55, 0.9);
  return {
    bg: hslToRgb(h, clamp(s, 0.25, 0.5), 0.055),
    card: hslToRgb(h, clamp(s, 0.2, 0.4), 0.1),
    cardAlt: hslToRgb(h, clamp(s, 0.18, 0.35), 0.145),
    primary: hslToRgb(h, vivid, 0.62),
    primaryLight: hslToRgb(h, clamp(s, 0.45, 0.8), 0.8),
    primaryDark: hslToRgb(h, vivid, 0.45),
    text: hslToRgb(h, 0.35, 0.97),
  };
}

const LIVE_VARS = [
  '--theme-bg', '--theme-bg-rgb', '--theme-card', '--theme-card-rgb', '--theme-card-alt', '--theme-card-alt-rgb',
  '--theme-primary', '--theme-primary-rgb', '--theme-primary-light', '--theme-primary-dark',
  '--theme-glow', '--theme-text', '--theme-text-muted',
];

const hex = ({ r, g, b }: Rgb) => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const triplet = ({ r, g, b }: Rgb) => `${r}, ${g}, ${b}`;

/** Paleti kök elemana CSS değişkeni olarak yazar; null verilirse temanın kendi renklerine döner. */
export function applyLivePalette(palette: LivePalette | null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  if (!palette) {
    LIVE_VARS.forEach((v) => root.removeProperty(v));
    return;
  }
  root.setProperty('--theme-bg', hex(palette.bg));
  root.setProperty('--theme-bg-rgb', triplet(palette.bg));
  root.setProperty('--theme-card', hex(palette.card));
  root.setProperty('--theme-card-rgb', triplet(palette.card));
  root.setProperty('--theme-card-alt', hex(palette.cardAlt));
  root.setProperty('--theme-card-alt-rgb', triplet(palette.cardAlt));
  root.setProperty('--theme-primary', hex(palette.primary));
  root.setProperty('--theme-primary-rgb', triplet(palette.primary));
  root.setProperty('--theme-primary-light', hex(palette.primaryLight));
  root.setProperty('--theme-primary-dark', hex(palette.primaryDark));
  root.setProperty('--theme-glow', `rgba(${triplet(palette.primary)}, 0.22)`);
  root.setProperty('--theme-text', hex(palette.text));
  root.setProperty('--theme-text-muted', `rgba(${triplet(palette.text)}, 0.7)`);
}

export const clearLivePalette = () => applyLivePalette(null);
