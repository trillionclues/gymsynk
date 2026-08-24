'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { theme, setTheme } = useTheme();
  // Defer rendering until after hydration — theme is read from localStorage
  // on the client, but the server always renders 'dark'. Showing a neutral
  // placeholder until mounted prevents the server/client HTML mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const isDark = theme === 'dark';

  // Render a same-sized placeholder during SSR / before hydration.
  // It has no interactive content so no mismatch occurs.
  if (!mounted) {
    return (
      <div
        className={cn(
          'border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]',
          showLabel ? 'px-2.5 py-1.5 w-full h-8' : 'h-8 w-8',
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        'flex items-center gap-2 border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]',
        showLabel ? 'px-2.5 py-1.5 w-full justify-between text-xs font-medium' : 'h-8 w-8 justify-center p-0',
      )}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="flex items-center gap-2">
        {isDark
          ? <Sun  className="h-3.5 w-3.5 shrink-0" />
          : <Moon className="h-3.5 w-3.5 shrink-0" />}
        {showLabel && (
          <span className="text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
            {isDark ? 'Light mode' : 'Dark mode'}
          </span>
        )}
      </div>
      {showLabel && (
        <span
          className="text-[10px] uppercase tracking-wider"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
        >
          {theme}
        </span>
      )}
    </button>
  );
}
