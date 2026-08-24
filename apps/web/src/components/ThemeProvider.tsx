'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useLayoutEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Read the stored theme synchronously.
 * Called inside useState initialiser so the value is correct on first render —
 * no second effect needed to "correct" the initial state.
 * Returns 'dark' during SSR (no window) which matches the FOUC script fallback.
 */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = localStorage.getItem('gymsynk-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  // First visit — resolve from system and persist immediately so next refresh is stable
  const resolved: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  localStorage.setItem('gymsynk-theme', resolved);
  return resolved;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Initialiser runs once on mount — reads localStorage synchronously.
  // This means theme is already the correct value on the first render,
  // so the effect below never "corrects" from a wrong initial state.
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // useLayoutEffect fires synchronously before paint — prevents any flash
  // even if the FOUC script missed (e.g. cached page, browser extension).
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('gymsynk-theme', theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
};
