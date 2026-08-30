# Muzikors Design System (DESIGN.md)

## 1. Visual World & Direction
- **Identity:** High-end venue jukebox & nightlife social experience.
- **Surface Mode:** **Operate & Experience**
- **Tone:** Sleek, confident, high contrast, tactile, responsive.

## 2. Color Tokens & Theme Architecture
Muzikors uses a dynamic multi-theme system rooted in CSS variables (`--theme-bg`, `--theme-text`, `--theme-accent`, `--theme-card`):
- **Base Background:** Deep Obsidian `#070604` / `#0a0a0c`
- **Surface / Cards:** Subtly elevated `#141318` / `rgba(255, 255, 255, 0.04)` with refined 1px border `rgba(255, 255, 255, 0.08)`
- **Accent Primary:** Warm Gold `#f59e0b` / Amber `#d97706` / Crema Gold `#e6c88b`
- **Accent Secondary:** Emerald Green `#10b981` (active playing state, live indicators)
- **Status / Danger:** Ruby Red `#ef4444` (veto, cancel, error)
- **Text:**
  - High Emphasis: `#ffffff` / `text-white`
  - Medium Emphasis: `#a1a1aa` / `text-neutral-400`
  - Subtle / Metadata: `#71717a` / `text-neutral-500`

## 3. Typography & Hierarchy
- **Font Families:** Clean modern sans-serif (Inter / System UI font stack).
- **Hierarchy:**
  - Screen Titles: `text-xl font-bold tracking-tight text-white`
  - Card Headings / Song Titles: `text-sm sm:text-base font-semibold text-white truncate`
  - Artist / Subtitles: `text-xs text-neutral-400 truncate`
  - Badges / Micro Labels: `text-[10px] sm:text-xs font-medium uppercase tracking-wider`
- **Rules:**
  - Do NOT apply decorative `bg-clip-text text-transparent bg-gradient-to-r` on standard headers. Use crisp solid colors.
  - No italic serifs or low-contrast muted text on dark surfaces.

## 4. Components & Spatial Grid
- **Border Radius:**
  - Cards / Modals: `rounded-2xl` (16px) or `rounded-xl` (12px). Avoid excessive pill-rounding (`rounded-3xl` / `rounded-full`) on standard cards.
  - Buttons / Controls: `rounded-xl` or `rounded-full` (for circular icon buttons).
- **Card Nesting Rule:** NEVER nest cards within cards with redundant borders and backgrounds. Use spacing (`space-y-3`, `gap-3`), dividers, or subtle opacity variations.
- **Touch Ergonomics:**
  - All interactive buttons: Minimum `44px x 44px` hit target.
  - Active tactile feedback: `active:scale-95 transition-transform duration-150`.

## 5. Anti-Slop Check (The 0-Slop Standard)
1. 🚫 **No AI Purple Gradients:** Do not use `from-purple-600 to-indigo-600` for generic cards or buttons. Use the established Gold/Amber/Crema/Emerald palette.
2. 🚫 **No Nested Cards:** Strip redundant wrapper boxes.
3. 🚫 **No Jittery Bounces:** Replace `animate-bounce` with smooth ease-out transitions or subtle scale pulses.
4. 🚫 **No Asymmetric Side Tabs:** Remove thick colored left/right borders on rounded cards (`border-l-4 border-amber-500`). Use cohesive outlines or subtle background tinting.
5. 🚫 **No Generic Copy:** Write direct, punchy copy (e.g. "Şarkı İste", "Sıraya Ekle", "Oy Ver").
