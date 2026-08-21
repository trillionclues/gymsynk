'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ScanQrCode,
  Users,
  Settings,
  BookOpen,
  PanelLeftClose,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { logoutStaff } from '@/services/auth-service';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/dashboard/scanner', label: 'Scanner', icon: ScanQrCode },
  { href: '/dashboard/members', label: 'Members', icon: Users },
];

const secondaryNav = [
  { href: '#', label: 'Settings', icon: Settings, placeholder: true },
  { href: '#', label: 'Documentation', icon: BookOpen, placeholder: true },
];

export function SidebarNav({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch {
      /* ignore */
    }
    clearSession();
    window.location.href = '/login';
  };

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : 'GS';

  return (
    <>
      {/* Mobile top bar with hamburger */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-[color:var(--color-text-strong)]">
            GymSynk
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text)]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop Fixed + Mobile Overlay) */}
      <aside
        className={cn(
          'fixed bottom-0 top-0 z-50 flex flex-col border-r border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text)] transition-all duration-300 ease-in-out shadow-xs',
          // Desktop sizing
          collapsed ? 'md:w-16' : 'md:w-60',
          // Mobile positioning
          mobileOpen ? 'left-0 w-64' : '-left-full md:left-0',
        )}
      >
        {/* Top Header: Brand + Collapse Toggle */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-[color:var(--color-border)]">
          {collapsed && !mobileOpen ? (
            /* Collapsed state: Logo icon is used to expand, collapse icon is HIDDEN */
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] shadow-sm transition hover:scale-105 mx-auto cursor-pointer"
              title="Click logo to expand sidebar"
            >
              <Sparkles className="h-4 w-4" />
            </button>
          ) : (
            /* Expanded state: Show logo + brand title + collapse icon button */
            <>
              <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] shadow-sm font-bold">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold tracking-tight text-[color:var(--color-text-strong)] truncate leading-none">
                    GymSynk
                  </span>
                  <span className="text-[10px] text-[color:var(--color-text-muted)] tracking-wider truncate mt-0.5 uppercase font-medium">
                    Enterprise
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)] transition"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-6">
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-[color:var(--color-primary-muted)] text-[color:var(--color-text-strong)] font-semibold'
                      : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)]',
                    collapsed && 'md:justify-center md:px-0',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      active
                        ? 'text-[color:var(--color-accent)]'
                        : 'text-[color:var(--color-text-muted)] group-hover:text-[color:var(--color-text-strong)]',
                    )}
                  />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                  {active && (!collapsed || mobileOpen) && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Secondary Navigation (Settings, Docs) */}
          <div className="border-t border-[color:var(--color-border)] pt-4 space-y-1">
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className={cn(
                    'group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)] transition-colors',
                    collapsed && 'md:justify-center md:px-0',
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-4 w-4 shrink-0 text-[color:var(--color-text-subtle)] group-hover:text-[color:var(--color-text-muted)]" />
                  {(!collapsed || mobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Theme Toggle & User Profile */}
        <div className="border-t border-[color:var(--color-border)] p-3 space-y-3 bg-[color:var(--color-surface-2)]">
          <div className={cn('flex items-center justify-center', (!collapsed || mobileOpen) && 'w-full')}>
            <ThemeToggle showLabel={!collapsed || mobileOpen} />
          </div>

          <div
            className={cn(
              'flex items-center gap-2.5 rounded-xl p-1.5 bg-[color:var(--color-surface)] border border-[color:var(--color-border)] shadow-2xs',
              collapsed && 'md:justify-center md:p-1 md:bg-transparent md:border-0',
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[color:var(--color-accent)] text-xs font-bold text-white shadow-xs">
              {initials}
            </div>

            {(!collapsed || mobileOpen) && (
              <div className="flex flex-1 flex-col min-w-0">
                <span className="text-xs font-semibold text-[color:var(--color-text-strong)] truncate leading-tight">
                  {user?.email ?? 'Staff User'}
                </span>
                <span className="text-[10px] text-[color:var(--color-text-muted)] truncate uppercase tracking-wider font-medium">
                  {user?.role ?? 'CASHIER'}
                </span>
              </div>
            )}

            {(!collapsed || mobileOpen) && (
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-status-expired-bg)] hover:text-[color:var(--color-status-expired)] transition"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
