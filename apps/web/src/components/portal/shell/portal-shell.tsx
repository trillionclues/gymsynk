'use client';

import { type ReactNode, useState, useLayoutEffect } from 'react';
import { SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/utils';

const SIDEBAR_KEY = 'gymsynk-sidebar-collapsed';

export function PortalShell({ children }: { children: ReactNode }) {
  // Always start false — matches server HTML exactly, no hydration mismatch.
  const [collapsed, setCollapsed] = useState(false);
  // Whether we've read localStorage and applied the stored value.
  // Until ready, transitions are suppressed so there's no animated jump.
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    // Runs synchronously after the first paint — correct the collapsed state
    // from localStorage before the user sees anything.
    const stored = localStorage.getItem(SIDEBAR_KEY);
    if (stored === 'true') setCollapsed(true);
    setReady(true);
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_KEY, String(next));
      return next;
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <SidebarNav collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <main
        className={cn(
          'min-w-0',
          // Transition only active after hydration — prevents the animated
          // jump from expanded → collapsed on page refresh.
          ready && 'transition-all duration-300 ease-in-out',
          collapsed ? 'md:ml-16' : 'md:ml-56',
        )}
      >
        <div className="mx-auto max-w-[1500px] px-8 py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
