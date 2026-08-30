<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design System & Anti-Slop Guidelines (Impeccable)
Always adhere to `PRODUCT.md` and `DESIGN.md` when creating or modifying frontend UI:
- **No AI Slop:** Never use generic purple gradients, nested cards soup, unnecessary text gradient clips, or jerky bounce animations.
- **Brand Palette:** Always utilize Muzikors's theme variables and established palette (Obsidian, Gold/Amber, Crema Gold, Emerald).
- **Mobile Ergonomics:** Ensure touch targets are min 44x44px and have tactile feedback (`active:scale-95`).

# Android Version Updates
Whenever delivering a new update or making a release for Android, ALWAYS increment `versionCode` and update `versionName` in `android/app/build.gradle` automatically without asking.
