'use client';

import { useTheme } from '@/components/ThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const toggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-xs font-medium text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]',
        showLabel ? 'px-2.5 py-1.5 w-full justify-between' : 'h-8 w-8 justify-center p-0',
      )}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="h-4 w-4 text-amber-400 shrink-0" />
        ) : (
          <Moon className="h-4 w-4 text-indigo-500 shrink-0" />
        )}
        {showLabel && (
          <span className="text-xs text-[color:var(--color-text)]">
            {isDark ? 'Light mode' : 'Dark mode'}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="text-[10px] uppercase font-semibold text-[color:var(--color-text-subtle)] tracking-wider">
          {resolvedTheme}
        </span>
      )}
    </button>
  );
}
