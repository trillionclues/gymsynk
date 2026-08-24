'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, ScanQrCode, UserRound, Sparkles, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { logoutStaff } from '@/services/auth-service';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/dashboard/scanner', label: 'Scanner', icon: ScanQrCode },
  { href: '/dashboard/members', label: 'Members', icon: UserRound },
];

function UserAvatar({ email, role }: { email: string | null; role: string }) {
  const initials = email ? email.slice(0, 2).toUpperCase() : 'GS';
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--color-primary)] text-xs font-semibold text-[color:var(--color-text-on-primary)] shadow-sm">
        {initials}
      </div>
      <div className="hidden xl:block">
        <p className="text-xs font-medium text-[color:var(--color-text-strong)] leading-none">{email ?? 'Staff'}</p>
        <p className="mt-0.5 text-[10px] text-[color:var(--color-text-muted)] uppercase tracking-wider">{role}</p>
      </div>
    </div>
  );
}

export function PortalTopNav() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try { await logoutStaff(); } catch { /* ignore */ }
    clearSession();
    window.location.href = '/login';
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-[color:var(--color-border)] bg-[color:var(--color-nav-bg-scrolled)] backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">

          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight text-[color:var(--color-text-strong)] hidden sm:block">
              GymSynk
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {navigation.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-[color:var(--color-primary-muted)] text-[color:var(--color-text-strong)]'
                      : 'text-[color:var(--color-nav-text)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)]',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[color:var(--color-accent)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="hidden sm:block">
              <UserAvatar email={user?.email ?? null} role={user?.role ?? 'CASHIER'} />
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs font-medium text-[color:var(--color-text-muted)] transition hover:border-[color:var(--color-border-strong)] hover:text-[color:var(--color-text-strong)]"
            >
              Sign out
            </button>
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="flex md:hidden items-center justify-center rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-2"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 pb-4 pt-3 animate-fade-up">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                      active
                        ? 'bg-[color:var(--color-primary-muted)] text-[color:var(--color-text-strong)]'
                        : 'text-[color:var(--color-nav-text)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)]',
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[color:var(--color-accent)]" />}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-4 border-t border-[color:var(--color-border)] pt-4 flex items-center justify-between">
              <UserAvatar email={user?.email ?? null} role={user?.role ?? 'CASHIER'} />
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-status-expired)]"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
