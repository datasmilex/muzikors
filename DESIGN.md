# Muzikors Design System (DESIGN.md)

## 1. Visual World & Direction
- **Identity:** Venue jukebox for cafes and bars, used one-handed in dim rooms.
- **Surface Mode:** **Operate & Experience**
- **Tone:** Calm, confident, readable. Color is used to point at things, not to fill screens.

## 2. Color
Themes are CSS variables on `<html data-theme>` (`src/app/globals.css`): `--theme-bg`, `--theme-card`, `--theme-card-alt`, `--theme-primary`, `--theme-primary-light`, `--theme-text` (+ `-rgb` triplets for alpha).

- **Surfaces stay near-neutral.** Backgrounds and cards carry only a faint tint of the theme. Inside cards use white overlays: `bg-white/[0.04]` rows, `bg-white/[0.06–0.07]` controls, `border-white/[0.06–0.08]` hairlines.
- **The accent (`--theme-primary`) is for one thing per screen:** the primary action (e.g. "Şarkı iste", "Sıraya ekle"), the progress bar, small live indicators and selected states. Never tint whole cards, chips or borders with it.
- **Text:** white for titles, `text-white/50–65` for secondary, `text-white/35–45` for meta. Minimum body size 13px; avoid 9–10px uppercase micro-labels.
- **Status colors** only as small dots or short text: emerald = live/success, red = destructive.
- **No glows, no gradient buttons, no confetti.** Shadows are soft and dark (`rgba(0,0,0,0.4–0.6)`), never colored.

### Canlı Renk (default theme: `live`)
- Tints the app with the dominant color of the playing album cover (`src/lib/albumColor.ts`, applied from `AppContext`). No track or a colorless cover falls back to the classic gold.
- `paletteFromColor` keeps backgrounds almost neutral (saturation ≤ 0.2, lightness ~5–14%) and puts the cover color into the accent (saturation 0.45–0.72, lightness 64%).
- Theme colors are registered with `@property`, so a track change cross-fades over ~0.9s.

## 3. Motion
Shared tokens live in `src/lib/motion.ts`; use them instead of ad-hoc timings.
- `SPRING_SHEET` – sheets sliding up; `SPRING_SNAPPY` – tab indicators, switches, nav highlight; `SPRING_SOFT` – list reordering; `EASE_OUT` for fades.
- Animate only `transform` / `opacity` (smooth on low-end Android WebViews). Keyframes in `globals.css`: `eq-bar`, `cover-breathe`, `spin-slow`, `ring-out`, `vote-pop`.
- Queue rows use framer-motion `layout`, so vote changes reorder smoothly.
- Always respect `useReducedMotion()` / `prefers-reduced-motion`.
- Celebrations (e.g. "Şarkın çalıyor") use the cover color wave + haptic — never stars, sparkles or confetti.

## 4. Sheets (all pop-ups)
Every pop-up uses `src/components/ui/Sheet.tsx`:
- Portrait: slides up from the bottom, drag the handle/header down to dismiss. Landscape/desktop: centered dialog.
- Props: `title`, `subtitle`, `onBack` (step back arrow), `toolbar` (non-scrolling search/tabs), `footer` (sticky primary action), `height="tall"` for lists, `dismissible={false}` for announcements that must be acknowledged.
- Escape closes the top-most sheet; body scroll is locked while any sheet is open.
- Shared controls in `src/components/ui/controls.tsx`: `btn.primary / secondary / quiet / danger`, `groupCard` + `groupRow` (list groups separated by hairlines, no cards inside cards), `Segmented`, `Switch`, `SkeletonRows`, `EmptyState`.
- Toasts appear at the top so they never cover a sheet's primary button.

## 5. Layout
- **Header:** venue identity on the left (tap → venue info), QR scan and profile on the right.
- **Bottom nav (portrait):** Mekân · Sıralama · **Şarkı iste** (center, accent) · Keşfet · Menü. Landscape uses the same items as a right rail.
- **Main screen:** now playing card, then the queue with vote buttons inline (first 5; "Tümü" opens the full list).
- **Legal pages** (`/legal/*`, `/privacy`, `/delete-account`) use `src/components/legal/LegalLayout.tsx`: plain document typography, no cards or gradients.

## 6. Typography & Spacing
- System UI font stack. Screen/sheet titles 17–22px bold, list titles 14–15px semibold, meta 12–13px.
- Cards and sheets: `rounded-2xl` rows, `rounded-[24–28px]` panels. Avoid nested cards — use spacing and hairlines.
- Touch targets ≥ 44×44px; tactile feedback with `active:scale-[0.97]` (buttons) or `active:scale-90` (icon buttons).

## 7. Anti-Slop Check
1. 🚫 No purple/indigo gradients, no gradient text, no colored glows.
2. 🚫 No nested cards; no thick colored side borders.
3. 🚫 No `animate-bounce`; use springs and ease-out fades.
4. 🚫 No `Sparkles`/`Star` icons or star emojis anywhere.
5. 🚫 No generic copy — short Turkish verbs: "Şarkı iste", "Sıraya ekle", "Oy ver".
