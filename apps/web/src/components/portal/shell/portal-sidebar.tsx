'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, Bell, ChevronRight, LogOut, ScanQrCode, Sparkles, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutStaff } from '@/services/auth-service';
import { useAuthStore } from '@/stores/authStore';

const navigation = [
  { href: '/dashboard', label: 'Dashboard', icon: Activity },
  { href: '/dashboard/scanner', label: 'Scanner', icon: ScanQrCode },
  { href: '/dashboard/members', label: 'Members', icon: UserRound },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = async () => {
    try {
      await logoutStaff();
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    window.location.href = '/login';
  };

  return (
    <aside className="hidden w-[290px] shrink-0 flex-col rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[0_24px_80px_var(--color-shadow)] backdrop-blur xl:flex">
      <div className="flex items-center gap-3 border-b border-[color:var(--color-border)] pb-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] shadow-lg">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.28em] text-[color:var(--color-text-subtle)]">
            GymSynk
          </p>
          <p className="text-sm text-[color:var(--color-text-muted)]">Cashier Portal</p>
        </div>
      </div>

      <nav className="mt-6 space-y-2">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center justify-between rounded-2xl border px-4 py-3 transition-all duration-200',
                active
                  ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-strong)] shadow-sm'
                  : 'border-transparent text-[color:var(--color-nav-text)] hover:border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)]',
              )}
            >
              <span className="flex items-center gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                    active
                      ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface)]'
                      : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)]/70 group-hover:border-[color:var(--color-border-strong)]',
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              <ChevronRight
                className={cn(
                  'h-4 w-4 transition-transform',
                  active ? 'translate-x-0 opacity-100' : '-translate-x-1 opacity-30 group-hover:translate-x-0 group-hover:opacity-100',
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-3xl border border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface-2),var(--color-surface))] p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color:var(--color-accent-muted)] text-[color:var(--color-accent)]">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium text-[color:var(--color-text-strong)]">Phase 2 live</p>
              <p className="text-xs text-[color:var(--color-text-muted)]">Dashboard, scanner, and member search.</p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-strong)] transition hover:border-[color:var(--color-border-strong)] hover:bg-[color:var(--color-surface-3)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
