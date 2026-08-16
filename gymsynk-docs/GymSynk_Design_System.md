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
- **Minimal and functional.** Near-neutral palette — no heavy accent colors, no decorative chrome. The interface should recede so the data is what the cashier reads.
- **Color as signal, not style.** Status colors (valid, expired, override) are deliberately muted — low-chroma, readable but not alarming. The only vivid color in the system is the VALID check-in state, because that's what matters most at the entrance.
- **Fast legibility.** Cashiers read the live feed in motion, on tablets, in mixed gym lighting. Status badges must be immediately scannable without needing to read the label.
- **Dark mode from day 1.** Not an afterthought — same token system, inverted. Dark is the expected mode for a tablet mounted at a gym entrance.

---

# 2. Color Tokens

Implemented as CSS custom properties on `:root.light` and `:root.dark`. Applied via Tailwind CSS config (`tailwind.config.ts`).

## 2.1 Light Mode

```css
:root.light {
  /* ── Surfaces ─────────────────────────────────────────── */
  --color-bg:               #f9f9f9;       /* Page background — off-white, not pure white */
  --color-surface:          #ffffff;       /* Cards, panels, modals */
  --color-surface-2:        #f4f4f5;       /* Sidebar, secondary panels */
  --color-surface-3:        #eeeeef;       /* Hover states on surface-2 */

  /* ── Borders ──────────────────────────────────────────── */
  --color-border:           #e4e4e7;       /* Default borders, dividers */
  --color-border-strong:    #d1d1d6;       /* Input borders, table lines */
  --color-border-highlight: rgba(113, 113, 122, 0.20); /* Neutral-tinted border — no color leak */

  /* ── Primary (Near-black — clean, minimal) ────────────── */
  --color-primary:          #18181b;       /* Buttons, active states */
  --color-primary-hover:    #09090b;       /* Deepen on hover */
  --color-primary-muted:    rgba(24, 24, 27, 0.06);  /* Ghost backgrounds */
  --color-primary-muted-hover: rgba(24, 24, 27, 0.10);

  /* ── Accent (Warm tone — used sparingly: focus rings, highlights) */
  --color-accent:           #a16207;       /* Muted amber/gold — desaturated */
  --color-accent-hover:     #854d0e;
  --color-accent-muted:     rgba(161, 98, 7, 0.08);
  --color-accent-muted-hover: rgba(161, 98, 7, 0.14);

  /* ── Text ─────────────────────────────────────────────── */
  --color-text:             #18181b;       /* Body copy */
  --color-text-strong:      #09090b;       /* Headings, labels */
  --color-text-muted:       #52525b;       /* Secondary text, descriptions */
  --color-text-subtle:      #a1a1aa;       /* Placeholders, timestamps */
  --color-text-on-primary:  #ffffff;       /* Text on primary (near-black) buttons */
  --color-text-on-accent:   #ffffff;       /* Text on accent backgrounds */

  /* ── Navigation ───────────────────────────────────────── */
  --color-nav-text:         #71717a;       /* Inactive nav items */
  --color-nav-text-active:  #09090b;       /* Active nav item */
  --color-nav-bg-scrolled:  rgba(249, 249, 249, 0.90); /* Sticky nav blur bg */

  /* ── Status — Check-in States (muted, readable, not alarming) */
  --color-status-valid:         #16a34a;   /* Valid check-in — green, present but not vivid */
  --color-status-valid-bg:      rgba(22, 163, 74, 0.07);
  --color-status-expired:       #b91c1c;   /* Expired — muted red */
  --color-status-expired-bg:    rgba(185, 28, 28, 0.07);
  --color-status-override:      #b45309;   /* Override / manual — muted amber */
  --color-status-override-bg:   rgba(180, 83, 9, 0.07);
  --color-status-wrong:         #71717a;   /* Wrong session / day — neutral gray */
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.07);
  --color-status-duplicate:     #6d28d9;   /* Already checked in — muted violet */
  --color-status-duplicate-bg:  rgba(109, 40, 217, 0.07);

  /* ── Plan Badges (all muted — no vivid color) ─────────── */
  --color-plan-daily:       #92400e;       /* Muted amber-brown */
  --color-plan-daily-bg:    rgba(146, 64, 14, 0.07);
  --color-plan-weekly:      #1d4ed8;       /* Muted blue */
  --color-plan-weekly-bg:   rgba(29, 78, 216, 0.07);
  --color-plan-monthly:     #166534;       /* Muted green */
  --color-plan-monthly-bg:  rgba(22, 101, 52, 0.07);
  --color-plan-custom:      #5b21b6;       /* Muted violet */
  --color-plan-custom-bg:   rgba(91, 33, 182, 0.07);

  /* ── Session Badges ───────────────────────────────────── */
  --color-session-morning:  #a16207;       /* Muted amber — morning warmth */
  --color-session-morning-bg: rgba(161, 98, 7, 0.07);
  --color-session-evening:  #3f3f46;       /* Dark neutral — evening */
  --color-session-evening-bg: rgba(63, 63, 70, 0.07);

  /* ── Utility ──────────────────────────────────────────── */
  --color-shadow:           rgba(0, 0, 0, 0.06);
  --color-shadow-md:        rgba(0, 0, 0, 0.10);
  --color-grid-line:        rgba(0, 0, 0, 0.035);  /* Very subtle background grid */
  --color-logo-line:        #09090b;
  --color-overlay:          rgba(0, 0, 0, 0.35);   /* Modal backdrops */
}
```

## 2.2 Dark Mode

```css
:root.dark {
  /* ── Surfaces ─────────────────────────────────────────── */
  --color-bg:               #0a0a0b;       /* Page background — near-black */
  --color-surface:          #111113;       /* Cards, panels, modals */
  --color-surface-2:        #18181b;       /* Sidebar, secondary panels */
  --color-surface-3:        #1e1e21;       /* Hover states on surface-2 */

  /* ── Borders ──────────────────────────────────────────── */
  --color-border:           #27272a;       /* Default borders, dividers */
  --color-border-strong:    #3f3f46;       /* Input borders, table lines */
  --color-border-highlight: rgba(161, 161, 170, 0.15); /* Neutral-tinted border */

  /* ── Primary (Off-white — clean inversion of light mode) ─ */
  --color-primary:          #fafafa;       /* Buttons, active states */
  --color-primary-hover:    #e4e4e7;       /* Slightly dimmed on hover */
  --color-primary-muted:    rgba(250, 250, 250, 0.07);
  --color-primary-muted-hover: rgba(250, 250, 250, 0.12);

  /* ── Accent (Muted warm tone — focus rings, highlights) ── */
  --color-accent:           #ca8a04;       /* Muted amber-gold — readable on dark */
  --color-accent-hover:     #a16207;
  --color-accent-muted:     rgba(202, 138, 4, 0.10);
  --color-accent-muted-hover: rgba(202, 138, 4, 0.18);

  /* ── Text ─────────────────────────────────────────────── */
  --color-text:             #d4d4d8;       /* Body copy — not pure white */
  --color-text-strong:      #fafafa;       /* Headings, labels */
  --color-text-muted:       #71717a;       /* Secondary text */
  --color-text-subtle:      #52525b;       /* Placeholders, timestamps */
  --color-text-on-primary:  #09090b;       /* Text on off-white buttons */
  --color-text-on-accent:   #09090b;       /* Text on accent backgrounds */

  /* ── Navigation ───────────────────────────────────────── */
  --color-nav-text:         #52525b;
  --color-nav-text-active:  #fafafa;
  --color-nav-bg-scrolled:  rgba(10, 10, 11, 0.90);

  /* ── Status — Check-in States (muted, readable on dark bg) */
  --color-status-valid:         #4ade80;   /* Muted green — readable, not vivid */
  --color-status-valid-bg:      rgba(74, 222, 128, 0.08);
  --color-status-expired:       #f87171;   /* Muted red */
  --color-status-expired-bg:    rgba(248, 113, 113, 0.08);
  --color-status-override:      #fbbf24;   /* Muted amber */
  --color-status-override-bg:   rgba(251, 191, 36, 0.08);
  --color-status-wrong:         #52525b;   /* Neutral gray */
  --color-status-wrong-bg:      rgba(82, 82, 91, 0.08);
  --color-status-duplicate:     #a78bfa;   /* Muted violet */
  --color-status-duplicate-bg:  rgba(167, 139, 250, 0.08);

  /* ── Plan Badges ──────────────────────────────────────── */
  --color-plan-daily:       #fbbf24;       /* Muted amber */
  --color-plan-daily-bg:    rgba(251, 191, 36, 0.08);
  --color-plan-weekly:      #60a5fa;       /* Muted blue */
  --color-plan-weekly-bg:   rgba(96, 165, 250, 0.08);
  --color-plan-monthly:     #4ade80;       /* Muted green */
  --color-plan-monthly-bg:  rgba(74, 222, 128, 0.08);
  --color-plan-custom:      #a78bfa;       /* Muted violet */
  --color-plan-custom-bg:   rgba(167, 139, 250, 0.08);

  /* ── Session Badges ───────────────────────────────────── */
  --color-session-morning:  #ca8a04;       /* Muted amber-gold */
  --color-session-morning-bg: rgba(202, 138, 4, 0.10);
  --color-session-evening:  #71717a;       /* Mid gray */
  --color-session-evening-bg: rgba(113, 113, 122, 0.10);

  /* ── Utility ──────────────────────────────────────────── */
  --color-shadow:           rgba(0, 0, 0, 0.50);
  --color-shadow-md:        rgba(0, 0, 0, 0.70);
  --color-grid-line:        rgba(255, 255, 255, 0.025);
  --color-logo-line:        #fafafa;
  --color-overlay:          rgba(0, 0, 0, 0.65);
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
        // Primary: near-black in light, off-white in dark
        primary: {
          DEFAULT:      'var(--color-primary)',
          hover:        'var(--color-primary-hover)',
          muted:        'var(--color-primary-muted)',
          'muted-hover':'var(--color-primary-muted-hover)',
        },
        // Accent: muted warm tone — focus rings, highlights only
        accent: {
          DEFAULT:      'var(--color-accent)',
          hover:        'var(--color-accent-hover)',
          muted:        'var(--color-accent-muted)',
          'muted-hover':'var(--color-accent-muted-hover)',
        },
        text: {
          DEFAULT:      'var(--color-text)',
          strong:       'var(--color-text-strong)',
          muted:        'var(--color-text-muted)',
          subtle:       'var(--color-text-subtle)',
          'on-primary': 'var(--color-text-on-primary)',
          'on-accent':  'var(--color-text-on-accent)',
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
          daily:        'var(--color-plan-daily)',
          'daily-bg':   'var(--color-plan-daily-bg)',
          weekly:       'var(--color-plan-weekly)',
          'weekly-bg':  'var(--color-plan-weekly-bg)',
          monthly:      'var(--color-plan-monthly)',
          'monthly-bg': 'var(--color-plan-monthly-bg)',
          custom:       'var(--color-plan-custom)',
          'custom-bg':  'var(--color-plan-custom-bg)',
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
  "theme_color": "#18181b",
  "background_color": "#f9f9f9",
  "display": "standalone",
  "orientation": "any",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}
```

For dark-mode-aware manifest support (Chrome 93+), `manifest.ts` can return `theme_color: "#0a0a0b"` when `prefers-color-scheme: dark`. For v1, `#18181b` works in both modes as a clean, neutral browser chrome accent — no color bleed from a gold or colored value.

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
  --color-bg:               #f9f9f9;
  --color-surface:          #ffffff;
  --color-surface-2:        #f4f4f5;
  --color-surface-3:        #eeeeef;
  --color-border:           #e4e4e7;
  --color-border-strong:    #d1d1d6;
  --color-border-highlight: rgba(113, 113, 122, 0.20);
  --color-primary:          #18181b;
  --color-primary-hover:    #09090b;
  --color-primary-muted:    rgba(24, 24, 27, 0.06);
  --color-primary-muted-hover: rgba(24, 24, 27, 0.10);
  --color-accent:           #a16207;
  --color-accent-hover:     #854d0e;
  --color-accent-muted:     rgba(161, 98, 7, 0.08);
  --color-accent-muted-hover: rgba(161, 98, 7, 0.14);
  --color-text:             #18181b;
  --color-text-strong:      #09090b;
  --color-text-muted:       #52525b;
  --color-text-subtle:      #a1a1aa;
  --color-text-on-primary:  #ffffff;
  --color-text-on-accent:   #ffffff;
  --color-nav-text:         #71717a;
  --color-nav-text-active:  #09090b;
  --color-nav-bg-scrolled:  rgba(249, 249, 249, 0.90);
  --color-status-valid:         #16a34a;
  --color-status-valid-bg:      rgba(22, 163, 74, 0.07);
  --color-status-expired:       #b91c1c;
  --color-status-expired-bg:    rgba(185, 28, 28, 0.07);
  --color-status-override:      #b45309;
  --color-status-override-bg:   rgba(180, 83, 9, 0.07);
  --color-status-wrong:         #71717a;
  --color-status-wrong-bg:      rgba(113, 113, 122, 0.07);
  --color-status-duplicate:     #6d28d9;
  --color-status-duplicate-bg:  rgba(109, 40, 217, 0.07);
  --color-plan-daily:       #92400e;
  --color-plan-daily-bg:    rgba(146, 64, 14, 0.07);
  --color-plan-weekly:      #1d4ed8;
  --color-plan-weekly-bg:   rgba(29, 78, 216, 0.07);
  --color-plan-monthly:     #166534;
  --color-plan-monthly-bg:  rgba(22, 101, 52, 0.07);
  --color-plan-custom:      #5b21b6;
  --color-plan-custom-bg:   rgba(91, 33, 182, 0.07);
  --color-session-morning:  #a16207;
  --color-session-morning-bg: rgba(161, 98, 7, 0.07);
  --color-session-evening:  #3f3f46;
  --color-session-evening-bg: rgba(63, 63, 70, 0.07);
  --color-shadow:           rgba(0, 0, 0, 0.06);
  --color-shadow-md:        rgba(0, 0, 0, 0.10);
  --color-grid-line:        rgba(0, 0, 0, 0.035);
  --color-logo-line:        #09090b;
  --color-overlay:          rgba(0, 0, 0, 0.35);
}

/* ── Dark mode tokens ───────────────────────────────────── */
:root.dark {
  --color-bg:               #0a0a0b;
  --color-surface:          #111113;
  --color-surface-2:        #18181b;
  --color-surface-3:        #1e1e21;
  --color-border:           #27272a;
  --color-border-strong:    #3f3f46;
  --color-border-highlight: rgba(161, 161, 170, 0.15);
  --color-primary:          #fafafa;
  --color-primary-hover:    #e4e4e7;
  --color-primary-muted:    rgba(250, 250, 250, 0.07);
  --color-primary-muted-hover: rgba(250, 250, 250, 0.12);
  --color-accent:           #ca8a04;
  --color-accent-hover:     #a16207;
  --color-accent-muted:     rgba(202, 138, 4, 0.10);
  --color-accent-muted-hover: rgba(202, 138, 4, 0.18);
  --color-text:             #d4d4d8;
  --color-text-strong:      #fafafa;
  --color-text-muted:       #71717a;
  --color-text-subtle:      #52525b;
  --color-text-on-primary:  #09090b;
  --color-text-on-accent:   #09090b;
  --color-nav-text:         #52525b;
  --color-nav-text-active:  #fafafa;
  --color-nav-bg-scrolled:  rgba(10, 10, 11, 0.90);
  --color-status-valid:         #4ade80;
  --color-status-valid-bg:      rgba(74, 222, 128, 0.08);
  --color-status-expired:       #f87171;
  --color-status-expired-bg:    rgba(248, 113, 113, 0.08);
  --color-status-override:      #fbbf24;
  --color-status-override-bg:   rgba(251, 191, 36, 0.08);
  --color-status-wrong:         #52525b;
  --color-status-wrong-bg:      rgba(82, 82, 91, 0.08);
  --color-status-duplicate:     #a78bfa;
  --color-status-duplicate-bg:  rgba(167, 139, 250, 0.08);
  --color-plan-daily:       #fbbf24;
  --color-plan-daily-bg:    rgba(251, 191, 36, 0.08);
  --color-plan-weekly:      #60a5fa;
  --color-plan-weekly-bg:   rgba(96, 165, 250, 0.08);
  --color-plan-monthly:     #4ade80;
  --color-plan-monthly-bg:  rgba(74, 222, 128, 0.08);
  --color-plan-custom:      #a78bfa;
  --color-plan-custom-bg:   rgba(167, 139, 250, 0.08);
  --color-session-morning:  #ca8a04;
  --color-session-morning-bg: rgba(202, 138, 4, 0.10);
  --color-session-evening:  #71717a;
  --color-session-evening-bg: rgba(113, 113, 122, 0.10);
  --color-shadow:           rgba(0, 0, 0, 0.50);
  --color-shadow-md:        rgba(0, 0, 0, 0.70);
  --color-grid-line:        rgba(255, 255, 255, 0.025);
  --color-logo-line:        #fafafa;
  --color-overlay:          rgba(0, 0, 0, 0.65);
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

/* ── Focus styles (accent ring — not primary, keeps buttons clean) */
:focus-visible {
  outline: 2px solid var(--color-accent);
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
