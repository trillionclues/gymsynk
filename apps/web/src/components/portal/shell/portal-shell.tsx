'use client';

import { ReactNode, useState, useEffect } from 'react';
import { SidebarNav } from './sidebar-nav';
import { cn } from '@/lib/utils';

const SIDEBAR_COLLAPSE_KEY = 'gymsynk-sidebar-collapsed';

export function PortalShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
    if (stored !== null) {
      setCollapsed(stored === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[color:var(--color-bg)] text-[color:var(--color-text)]">
      <SidebarNav collapsed={collapsed} onToggleCollapse={toggleCollapse} />

      <main
        className={cn(
          'min-w-0 flex-1 transition-all duration-300 ease-in-out px-4 py-6 sm:px-6 lg:px-8',
          collapsed ? 'md:ml-16' : 'md:ml-60',
        )}
      >
        <div className="mx-auto max-w-[1500px] w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
