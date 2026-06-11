**GymSynk**

_Open-Source Gym Management Platform_

Licensed under AGPL-3.0

**Design System**

Visual Language, Color Tokens, and Theming Reference

Version 1.0.0

---

# 1. Design Philosophy

GymSynk's UI has two surfaces — the staff portal (cashier/admin dashboard) and the member PWA — but they share one design language. Both are installed as PWAs. Both run on the same token system. There is no "consumer product vs. ops tool" split in the visual identity.

**Principles:**
- **Minimal, not sterile.** Warm neutral base (not pure cool gray) — same character as Mockline.
- **Purposeful color.** The warm gold accent is reserved for primary actions and brand. Status colors (green, red, amber) communicate check-in state and are not decorative.
- **Fast legibility.** Cashiers read the live feed in motion, on tablets, in mixed gym lighting. Status badges must be immediately scannable.
- **Dark mode from day 1.** Not an afterthought — same token system, inverted.

---

# 2. Color Tokens

Implemented as CSS custom properties on `:root.light` and `:root.dark`. Applied via Tailwind CSS config (`tailwind.config.ts`).

## 2.1 Light Mode

```css
:root.light {
  /* ── Surfaces ─────────────────────────────────────────── */
  --color-bg:               #fafafa;       /* Page background */
  --color-surface:          #ffffff;       /* Cards, panels, modals */
  --color-surface-2:        #f5f5f5;       /* Sidebar, secondary panels */
  --color-surface-3:        #efefef;       /* Hover states on surface-2 */

  /* ── Borders ──────────────────────────────────────────── */
  --color-border:           #ededf3;       /* Default borders, dividers */
  --color-border-strong:    #d4d4d8;       /* Input borders, table lines */
  --color-border-highlight: rgba(201, 162, 39, 0.20); /* Accent-tinted border */

  /* ── Primary (Warm Gold) ──────────────────────────────── */
  --color-primary:          #C9A227;       /* Buttons, links, focus rings */
  --color-primary-hover:    #B08D1F;       /* Darken 10% for hover */
  --color-primary-muted:    rgba(201, 162, 39, 0.10); /* Ghost backgrounds */
  --color-primary-muted-hover: rgba(201, 162, 39, 0.18);

  /* ── Text ─────────────────────────────────────────────── */
  --color-text:             #1a1a2e;       /* Body copy */
  --color-text-strong:      #09090b;       /* Headings, labels */
  --color-text-muted:       #52525b;       /* Secondary text, descriptions */
  --color-text-subtle:      #a1a1aa;       /* Placeholders, timestamps */
  --color-text-on-primary:  #0a0a0b;       /* Text on gold button backgrounds */

  /* ── Navigation ───────────────────────────────────────── */
  --color-nav-text:         #71717a;       /* Inactive nav items */
  --color-nav-text-active:  #09090b;       /* Active nav item */
  --color-nav-bg-scrolled:  rgba(255, 255, 255, 0.85); /* Sticky nav blur bg */

  /* ── Status — Check-in States ─────────────────────────── */
  --color-status-valid:         #059669;   /* VALID check-in (emerald) */
  --color-status-valid-bg:      rgba(5, 150, 105, 0.08);
  --color-status-expired:       #DC2626;   /* EXPIRED_PLAN (red) */
  --color-status-expired-bg:    rgba(220, 38, 38, 0.08);
  --color-status-override:      #D97706;   /* OVERRIDE / manual (amber) */
  --color-status-override-bg:   rgba(217, 119, 6, 0.08);
  --color-status-wrong:         #71717a;   /* WRONG_SESSION / WRONG_DAY (neutral) */
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.08);
  --color-status-duplicate:     #7C3AED;   /* ALREADY_CHECKED_IN (violet) */
  --color-status-duplicate-bg:  rgba(124, 58, 237, 0.08);

  /* ── Plan Badges ──────────────────────────────────────── */
  --color-plan-daily:       #D97706;       /* Amber — short-term */
  --color-plan-daily-bg:    rgba(217, 119, 6, 0.10);
  --color-plan-weekly:      #2563EB;       /* Blue — mid-term */
  --color-plan-weekly-bg:   rgba(37, 99, 235, 0.10);
  --color-plan-monthly:     #059669;       /* Emerald — committed */
  --color-plan-monthly-bg:  rgba(5, 150, 105, 0.10);
  --color-plan-custom:      #7C3AED;       /* Violet — custom/special */
  --color-plan-custom-bg:   rgba(124, 58, 237, 0.10);

  /* ── Session Badges ───────────────────────────────────── */
  --color-session-morning:  #C9A227;       /* AM — warm gold */
  --color-session-morning-bg: rgba(201, 162, 39, 0.10);
  --color-session-evening:  #52525b;       /* PM — neutral dark */
  --color-session-evening-bg: rgba(82, 82, 91, 0.10);

  /* ── Utility ──────────────────────────────────────────── */
  --color-shadow:           rgba(0, 0, 0, 0.08);
  --color-shadow-md:        rgba(0, 0, 0, 0.12);
  --color-grid-line:        rgba(0, 0, 0, 0.04);   /* Background grid pattern */
  --color-logo-line:        #0a0a0b;
  --color-overlay:          rgba(0, 0, 0, 0.40);   /* Modal backdrops */
}
```

## 2.2 Dark Mode

```css
:root.dark {
  /* ── Surfaces ─────────────────────────────────────────── */
  --color-bg:               #0a0a0b;       /* Page background */
  --color-surface:          #18181b;       /* Cards, panels, modals */
  --color-surface-2:        #1c1c1f;       /* Sidebar, secondary panels */
  --color-surface-3:        #222226;       /* Hover states on surface-2 */

  /* ── Borders ──────────────────────────────────────────── */
  --color-border:           #27272a;       /* Default borders, dividers */
  --color-border-strong:    #3f3f46;       /* Input borders, table lines */
  --color-border-highlight: rgba(242, 201, 76, 0.15);

  /* ── Primary (Warm Gold — lightened for dark bg) ─────── */
  --color-primary:          #F2C94C;       /* Buttons, links, focus rings */
  --color-primary-hover:    #E6BC38;       /* Darken slightly for hover */
  --color-primary-muted:    rgba(242, 201, 76, 0.12);
  --color-primary-muted-hover: rgba(242, 201, 76, 0.20);

  /* ── Text ─────────────────────────────────────────────── */
  --color-text:             #e4e4e7;       /* Body copy */
  --color-text-strong:      #fafafa;       /* Headings, labels */
  --color-text-muted:       #a1a1aa;       /* Secondary text */
  --color-text-subtle:      #52525b;       /* Placeholders, timestamps */
  --color-text-on-primary:  #0a0a0b;       /* Text on gold button backgrounds */

  /* ── Navigation ───────────────────────────────────────── */
  --color-nav-text:         #71717a;
  --color-nav-text-active:  #fafafa;
  --color-nav-bg-scrolled:  rgba(10, 10, 11, 0.85);

  /* ── Status — Check-in States ─────────────────────────── */
  --color-status-valid:         #34D399;   /* Lighter emerald for dark bg */
  --color-status-valid-bg:      rgba(52, 211, 153, 0.10);
  --color-status-expired:       #F87171;   /* Lighter red */
  --color-status-expired-bg:    rgba(248, 113, 113, 0.10);
  --color-status-override:      #FCD34D;   /* Lighter amber */
  --color-status-override-bg:   rgba(252, 211, 77, 0.10);
  --color-status-wrong:         #71717a;
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.10);
  --color-status-duplicate:     #A78BFA;   /* Lighter violet */
  --color-status-duplicate-bg:  rgba(167, 139, 250, 0.10);

  /* ── Plan Badges ──────────────────────────────────────── */
  --color-plan-daily:       #FCD34D;
  --color-plan-daily-bg:    rgba(252, 211, 77, 0.10);
  --color-plan-weekly:      #60A5FA;
  --color-plan-weekly-bg:   rgba(96, 165, 250, 0.10);
  --color-plan-monthly:     #34D399;
  --color-plan-monthly-bg:  rgba(52, 211, 153, 0.10);
  --color-plan-custom:      #A78BFA;
  --color-plan-custom-bg:   rgba(167, 139, 250, 0.10);

  /* ── Session Badges ───────────────────────────────────── */
  --color-session-morning:  #F2C94C;
  --color-session-morning-bg: rgba(242, 201, 76, 0.12);
  --color-session-evening:  #a1a1aa;
  --color-session-evening-bg: rgba(161, 161, 170, 0.10);

  /* ── Utility ──────────────────────────────────────────── */
  --color-shadow:           rgba(0, 0, 0, 0.40);
  --color-shadow-md:        rgba(0, 0, 0, 0.60);
  --color-grid-line:        rgba(255, 255, 255, 0.03);
  --color-logo-line:        #fafafa;
  --color-overlay:          rgba(0, 0, 0, 0.60);
}
```

---

# 3. Background Grid Pattern

Same subtle grid as Mockline — applied to `body::before` so it sits behind all content without affecting layout.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}
```

All page content must be `position: relative; z-index: 1` or higher to render above the grid.

---

# 4. Tailwind Integration

Map all tokens into `tailwind.config.ts` so they're usable as utility classes. This way components use `bg-surface`, `text-muted`, `border-border` etc. and inherit theme mode automatically.

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:              'var(--color-bg)',
        surface:         'var(--color-surface)',
        'surface-2':     'var(--color-surface-2)',
        'surface-3':     'var(--color-surface-3)',
        border:          'var(--color-border)',
        'border-strong': 'var(--color-border-strong)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover:   'var(--color-primary-hover)',
          muted:   'var(--color-primary-muted)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          strong:  'var(--color-text-strong)',
          muted:   'var(--color-text-muted)',
          subtle:  'var(--color-text-subtle)',
          'on-primary': 'var(--color-text-on-primary)',
        },
        status: {
          valid:          'var(--color-status-valid)',
          'valid-bg':     'var(--color-status-valid-bg)',
          expired:        'var(--color-status-expired)',
          'expired-bg':   'var(--color-status-expired-bg)',
          override:       'var(--color-status-override)',
          'override-bg':  'var(--color-status-override-bg)',
          wrong:          'var(--color-status-wrong)',
          'wrong-bg':     'var(--color-status-wrong-bg)',
          duplicate:      'var(--color-status-duplicate)',
          'duplicate-bg': 'var(--color-status-duplicate-bg)',
        },
        plan: {
          daily:       'var(--color-plan-daily)',
          'daily-bg':  'var(--color-plan-daily-bg)',
          weekly:      'var(--color-plan-weekly)',
          'weekly-bg': 'var(--color-plan-weekly-bg)',
          monthly:     'var(--color-plan-monthly)',
          'monthly-bg':'var(--color-plan-monthly-bg)',
          custom:      'var(--color-plan-custom)',
          'custom-bg': 'var(--color-plan-custom-bg)',
        },
        session: {
          morning:       'var(--color-session-morning)',
          'morning-bg':  'var(--color-session-morning-bg)',
          evening:       'var(--color-session-evening)',
          'evening-bg':  'var(--color-session-evening-bg)',
        },
      },
      boxShadow: {
        sm: '0 1px 2px var(--color-shadow)',
        md: '0 4px 12px var(--color-shadow-md)',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

# 5. Theme Switching

Theme is stored in `localStorage` and applied as a class on `<html>`. Use a `ThemeProvider` that reads the stored preference on mount and applies it before first paint to avoid flash.

```tsx
// src/components/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = (localStorage.getItem('gymsynk-theme') as Theme) || 'system';
    setThemeState(stored);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

    root.classList.remove('light', 'dark');
    root.classList.add(resolved);
    setResolvedTheme(resolved);
    localStorage.setItem('gymsynk-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
```

**Inline script to prevent FOUC** (place in `<head>` before any CSS):

```html
<script>
  (function() {
    var stored = localStorage.getItem('gymsynk-theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = stored === 'dark' || ((!stored || stored === 'system') && prefersDark)
      ? 'dark' : 'light';
    document.documentElement.classList.add(resolved);
  })();
</script>
```

---

# 6. Typography

No custom font in v1 — system font stack for performance and fast first paint on slow connections. This is a functional tool, not a marketing page.

```css
/* globals.css */
:root {
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  --font-mono: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo,
    Consolas, 'DejaVu Sans Mono', monospace;
}

body {
  font-family: var(--font-sans);
  background-color: var(--color-bg);
  color: var(--color-text);
}
```

Monospace is used for member numbers (`GS-XXXXX`), receipt numbers, and token displays.

If a brand font is added in v1.5, Inter is the natural fit — already used by shadcn/ui's default config and has full variable weight support.

---

# 7. Component Patterns

## Status Badge

Used in check-in feed cards, member profile drawers, and check-in history.

```tsx
// src/components/ui/StatusBadge.tsx
type CheckInStatus =
  | 'VALID'
  | 'EXPIRED_PLAN'
  | 'OVERRIDE'
  | 'WRONG_SESSION'
  | 'WRONG_DAY'
  | 'ALREADY_CHECKED_IN';

const statusConfig: Record<CheckInStatus, { label: string; className: string }> = {
  VALID:              { label: 'Valid',           className: 'bg-status-valid-bg text-status-valid' },
  EXPIRED_PLAN:       { label: 'Expired',         className: 'bg-status-expired-bg text-status-expired' },
  OVERRIDE:           { label: 'Override',        className: 'bg-status-override-bg text-status-override' },
  WRONG_SESSION:      { label: 'Wrong Session',   className: 'bg-status-wrong-bg text-status-wrong' },
  WRONG_DAY:          { label: 'Wrong Day',       className: 'bg-status-wrong-bg text-status-wrong' },
  ALREADY_CHECKED_IN: { label: 'Already In',      className: 'bg-status-duplicate-bg text-status-duplicate' },
};

export function StatusBadge({ status }: { status: CheckInStatus }) {
  const { label, className } = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
```

## Plan Badge

```tsx
type PlanType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';

const planConfig: Record<PlanType, { className: string }> = {
  DAILY:   { className: 'bg-plan-daily-bg text-plan-daily' },
  WEEKLY:  { className: 'bg-plan-weekly-bg text-plan-weekly' },
  MONTHLY: { className: 'bg-plan-monthly-bg text-plan-monthly' },
  CUSTOM:  { className: 'bg-plan-custom-bg text-plan-custom' },
};

export function PlanBadge({ type, name }: { type: PlanType; name: string }) {
  const { className } = planConfig[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${className}`}>
      {name}
    </span>
  );
}
```

## Session Badge

```tsx
type Session = 'MORNING' | 'EVENING';

export function SessionBadge({ session }: { session: Session }) {
  const isAM = session === 'MORNING';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
      isAM
        ? 'bg-session-morning-bg text-session-morning'
        : 'bg-session-evening-bg text-session-evening'
    }`}>
      {isAM ? '☀ AM' : '🌙 PM'}
    </span>
  );
}
```

---

# 8. PWA Manifest Colors

Both the cashier/admin portal and member PWA use the same manifest theme.

```json
{
  "name": "GymSynk",
  "short_name": "GymSynk",
  "theme_color": "#C9A227",
  "background_color": "#fafafa",
  "display": "standalone",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

For dark-mode-aware manifest support (Chrome 93+), the `manifest.ts` in Next.js can return different `theme_color` based on `prefers-color-scheme`. For v1, `#C9A227` works acceptably in both modes as the browser chrome accent.

---

# 9. QR Scanner Screen

The QR scanner station (`/dashboard/check-in/scanner`) and the QR display on the member PWA have specific visual requirements:

- **Scanner station** (cashier tablet, mounted at entrance): full-screen camera view, dark overlay frame, result overlay for 3 seconds:
  - VALID → full-screen green overlay with member name, `bg-status-valid` tinted, white text
  - EXPIRED_PLAN → `bg-status-expired` tinted overlay
  - WRONG_SESSION / WRONG_DAY → `bg-status-wrong` tinted overlay

- **Member QR display**: large QR at 280×280px centered on screen, countdown pill (`120s` → ticking down in `text-text-muted`), plan badge below, member number in monospace. Dark background variant: `bg-surface` card on `bg-bg` — QR is always black on white regardless of theme (ZXing outputs a PNG, render it on a white background even in dark mode so it scans cleanly).

---

# 10. globals.css — Complete Starting Point

```css
/* src/styles/globals.css */

@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* ── Light mode tokens ──────────────────────────────────── */
:root.light {
  --color-bg:               #fafafa;
  --color-surface:          #ffffff;
  --color-surface-2:        #f5f5f5;
  --color-surface-3:        #efefef;
  --color-border:           #ededf3;
  --color-border-strong:    #d4d4d8;
  --color-border-highlight: rgba(201, 162, 39, 0.20);
  --color-primary:          #C9A227;
  --color-primary-hover:    #B08D1F;
  --color-primary-muted:    rgba(201, 162, 39, 0.10);
  --color-primary-muted-hover: rgba(201, 162, 39, 0.18);
  --color-text:             #1a1a2e;
  --color-text-strong:      #09090b;
  --color-text-muted:       #52525b;
  --color-text-subtle:      #a1a1aa;
  --color-text-on-primary:  #0a0a0b;
  --color-nav-text:         #71717a;
  --color-nav-text-active:  #09090b;
  --color-nav-bg-scrolled:  rgba(255, 255, 255, 0.85);
  --color-status-valid:         #059669;
  --color-status-valid-bg:      rgba(5, 150, 105, 0.08);
  --color-status-expired:       #DC2626;
  --color-status-expired-bg:    rgba(220, 38, 38, 0.08);
  --color-status-override:      #D97706;
  --color-status-override-bg:   rgba(217, 119, 6, 0.08);
  --color-status-wrong:         #71717a;
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.08);
  --color-status-duplicate:     #7C3AED;
  --color-status-duplicate-bg:  rgba(124, 58, 237, 0.08);
  --color-plan-daily:       #D97706;
  --color-plan-daily-bg:    rgba(217, 119, 6, 0.10);
  --color-plan-weekly:      #2563EB;
  --color-plan-weekly-bg:   rgba(37, 99, 235, 0.10);
  --color-plan-monthly:     #059669;
  --color-plan-monthly-bg:  rgba(5, 150, 105, 0.10);
  --color-plan-custom:      #7C3AED;
  --color-plan-custom-bg:   rgba(124, 58, 237, 0.10);
  --color-session-morning:  #C9A227;
  --color-session-morning-bg: rgba(201, 162, 39, 0.10);
  --color-session-evening:  #52525b;
  --color-session-evening-bg: rgba(82, 82, 91, 0.10);
  --color-shadow:           rgba(0, 0, 0, 0.08);
  --color-shadow-md:        rgba(0, 0, 0, 0.12);
  --color-grid-line:        rgba(0, 0, 0, 0.04);
  --color-logo-line:        #0a0a0b;
  --color-overlay:          rgba(0, 0, 0, 0.40);
}

/* ── Dark mode tokens ───────────────────────────────────── */
:root.dark {
  --color-bg:               #0a0a0b;
  --color-surface:          #18181b;
  --color-surface-2:        #1c1c1f;
  --color-surface-3:        #222226;
  --color-border:           #27272a;
  --color-border-strong:    #3f3f46;
  --color-border-highlight: rgba(242, 201, 76, 0.15);
  --color-primary:          #F2C94C;
  --color-primary-hover:    #E6BC38;
  --color-primary-muted:    rgba(242, 201, 76, 0.12);
  --color-primary-muted-hover: rgba(242, 201, 76, 0.20);
  --color-text:             #e4e4e7;
  --color-text-strong:      #fafafa;
  --color-text-muted:       #a1a1aa;
  --color-text-subtle:      #52525b;
  --color-text-on-primary:  #0a0a0b;
  --color-nav-text:         #71717a;
  --color-nav-text-active:  #fafafa;
  --color-nav-bg-scrolled:  rgba(10, 10, 11, 0.85);
  --color-status-valid:         #34D399;
  --color-status-valid-bg:      rgba(52, 211, 153, 0.10);
  --color-status-expired:       #F87171;
  --color-status-expired-bg:    rgba(248, 113, 113, 0.10);
  --color-status-override:      #FCD34D;
  --color-status-override-bg:   rgba(252, 211, 77, 0.10);
  --color-status-wrong:         #71717a;
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.10);
  --color-status-duplicate:     #A78BFA;
  --color-status-duplicate-bg:  rgba(167, 139, 250, 0.10);
  --color-plan-daily:       #FCD34D;
  --color-plan-daily-bg:    rgba(252, 211, 77, 0.10);
  --color-plan-weekly:      #60A5FA;
  --color-plan-weekly-bg:   rgba(96, 165, 250, 0.10);
  --color-plan-monthly:     #34D399;
  --color-plan-monthly-bg:  rgba(52, 211, 153, 0.10);
  --color-plan-custom:      #A78BFA;
  --color-plan-custom-bg:   rgba(167, 139, 250, 0.10);
  --color-session-morning:  #F2C94C;
  --color-session-morning-bg: rgba(242, 201, 76, 0.12);
  --color-session-evening:  #a1a1aa;
  --color-session-evening-bg: rgba(161, 161, 170, 0.10);
  --color-shadow:           rgba(0, 0, 0, 0.40);
  --color-shadow-md:        rgba(0, 0, 0, 0.60);
  --color-grid-line:        rgba(255, 255, 255, 0.03);
  --color-logo-line:        #fafafa;
  --color-overlay:          rgba(0, 0, 0, 0.60);
}

/* ── Base styles ────────────────────────────────────────── */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
  text-size-adjust: 100%;
}

body {
  font-family: var(--font-sans, ui-sans-serif, system-ui, -apple-system, sans-serif);
  background-color: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── Background grid ────────────────────────────────────── */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 60px 60px;
  pointer-events: none;
  z-index: 0;
}

/* All page content renders above the grid */
#__next,
main,
.layout-root {
  position: relative;
  z-index: 1;
}

/* ── Focus styles ───────────────────────────────────────── */
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 2px;
}

/* ── Scrollbar ──────────────────────────────────────────── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-border-strong);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-subtle);
}
```
