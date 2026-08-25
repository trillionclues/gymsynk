'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from './theme-toggle';
import { logoutStaff } from '@/services/auth-service';
import { useAuthStore } from '@/stores/authStore';


function IconBrand() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]">
      <rect x="2"  y="9" width="3" height="6" />
      <rect x="19" y="9" width="3" height="6" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <rect x="7"  y="7" width="2" height="10" />
      <rect x="15" y="7" width="2" height="10" />
    </svg>
  );
}

function IconDashboard() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <rect x="3"  y="3"  width="8" height="8" />
      <rect x="13" y="3"  width="8" height="8" />
      <rect x="3"  y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}

function IconScanner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M20 8V5a1 1 0 0 0-1-1h-3" />
      <path d="M4 16v3a1 1 0 0 0 1 1h3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <line x1="6" y1="12" x2="18" y2="12" />
    </svg>
  );
}

function IconMembers() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <circle cx="9"  cy="8"   r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="18" cy="9"   r="2.4" />
      <path d="M15.5 14a5 5 0 0 1 5 5" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[11px] w-[11px]">
      <line x1="4"  y1="4"  x2="20" y2="20" />
      <line x1="20" y1="4"  x2="4"  y2="20" />
    </svg>
  );
}

function IconMenu() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <line x1="3" y1="6"  x2="21" y2="6"  />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IconPlans() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconStaff() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function IconPayments() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6"  y1="20" x2="6"  y2="14" />
    </svg>
  );
}

function IconAudit() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

const primaryNav = [
  { href: '/dashboard',           label: 'Dashboard', Icon: IconDashboard },
  { href: '/dashboard/scanner',   label: 'Scanner',   Icon: IconScanner   },
  { href: '/dashboard/members',   label: 'Members',   Icon: IconMembers,   roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/plans',     label: 'Plans',     Icon: IconPlans,     roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/staff',     label: 'Staff',     Icon: IconStaff,     roles: ['ADMIN'] },
  { href: '/dashboard/payments',  label: 'Payments',  Icon: IconPayments,  roles: ['ADMIN', 'CASHIER'] },
  { href: '/dashboard/analytics', label: 'Analytics', Icon: IconAnalytics, roles: ['ADMIN'] },
  { href: '/dashboard/audit',     label: 'Audit',     Icon: IconAudit,     roles: ['ADMIN'] },
];

function RailBtn({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center transition-colors',
        // Left-border active indicator (rust, 2px, flush to sidebar left edge)
        active
          ? 'border-l-2 border-l-[color:var(--color-accent)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-strong)]'
          : 'border-l-2 border-l-transparent text-[color:var(--color-ash-dim,var(--color-text-subtle))] hover:text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)]',
      )}
    >
      {children}
    </button>
  );
}

function ExpandedLink({
  href,
  label,
  active,
  Icon,
  onClick,
}: {
  href: string;
  label: string;
  active: boolean;
  Icon: () => any;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'group relative flex h-10 items-center gap-3 pl-4 pr-3 text-sm transition-colors',
        active
          ? 'border-l-2 border-l-[color:var(--color-accent)] bg-[color:var(--color-surface-2)] text-[color:var(--color-text-strong)] font-semibold'
          : 'border-l-2 border-l-transparent text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text-strong)]',
      )}
    >
      <span className={cn('shrink-0', active ? 'text-[color:var(--color-accent)]' : '')}>
        <Icon />
      </span>
      <span style={{ fontFamily: 'var(--font-body)' }}>{label}</span>
    </Link>
  );
}

export function SidebarNav({
  collapsed,
  onToggleCollapse,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname  = usePathname();
  const user      = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = async () => {
    try { await logoutStaff(); } catch { /* ignore */ }
    clearSession();
    window.location.href = '/login';
  };

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : 'GS';

  return (
    <>
      <div
        className="sticky top-0 z-30 flex h-14 items-center justify-between border-b px-4 md:hidden"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-strong)' }}
        >
          <IconBrand />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center border"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <IconClose /> : <IconMenu />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed bottom-0 top-0 z-50 flex flex-col border-r transition-all duration-300 ease-in-out',
          // Desktop width
          collapsed ? 'md:w-16' : 'md:w-56',
          // Mobile positioning
          mobileOpen ? 'left-0 w-56' : '-left-full md:left-0',
        )}
        style={{
          borderColor: 'var(--color-border)',
          background:  'var(--color-surface)',
          color:       'var(--color-text)',
        }}
      >
        <div
          className="flex h-14 shrink-0 items-center justify-center border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {collapsed && !mobileOpen ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="flex h-[34px] w-[34px] items-center justify-center border transition hover:opacity-80"
              style={{
                borderColor: 'var(--color-border)',
                color:       'var(--color-text-strong)',
              }}
            >
              <IconBrand />
            </button>
          ) : (
            <div className="flex w-full items-center justify-between px-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-[34px] w-[34px] shrink-0 items-center justify-center border"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-strong)' }}
                >
                  <IconBrand />
                </div>
                <span
                  className="text-sm font-semibold tracking-tight"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-strong)', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                >
                  GymSynk
                </span>
              </div>
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Collapse sidebar"
                className="hidden md:flex h-6 w-6 items-center justify-center opacity-40 hover:opacity-100 transition"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          {primaryNav
            .filter((item) => !item.roles || (user?.role && item.roles.includes(user.role as any)))
            .map(({ href, label, Icon }) => {
            const active =
              pathname === href ||
              (href !== '/dashboard' && pathname.startsWith(href));

            return collapsed && !mobileOpen ? (
              /* Rail mode — icon only */
              <Link
                key={href}
                href={href}
                title={label}
                aria-label={label}
                className={cn(
                  'relative flex h-10 w-full items-center justify-center transition-colors',
                  active
                    ? 'border-l-2 border-l-[color:var(--color-accent)] text-[color:var(--color-text-strong)]'
                    : 'border-l-2 border-l-transparent text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-surface-2)]',
                )}
                style={active ? { background: 'var(--color-surface-2)' } : undefined}
              >
                <span style={active ? { color: 'var(--color-accent)' } : undefined}>
                  <Icon />
                </span>
              </Link>
            ) : (
              /* Expanded mode — icon + label */
              <ExpandedLink
                key={href}
                href={href}
                label={label}
                active={active}
                Icon={Icon}
                onClick={() => setMobileOpen(false)}
              />
            );
          })}
        </nav>

        <div
          className="shrink-0 border-t py-2"
          style={{ borderColor: 'var(--color-border)' }}
        >
           {collapsed && !mobileOpen ? (
            <RailBtn label="Settings">
              <IconSettings />
            </RailBtn>
          ) : (
            <button
              type="button"
              disabled
              className="flex h-10 w-full items-center gap-3 border-l-2 border-l-transparent pl-4 pr-3 text-sm opacity-40"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)' }}
            >
              <IconSettings />
              <span>Settings</span>
            </button>
          )}

          <div className={cn('flex items-center px-3 py-2', collapsed && !mobileOpen && 'justify-center px-0')}>
            <ThemeToggle showLabel={!collapsed || mobileOpen} />
          </div>

          <div
            className={cn(
              'mx-3 mb-2 flex items-center border',
              collapsed && !mobileOpen ? 'mx-auto h-[30px] w-[30px] justify-center' : 'gap-2.5 px-2 py-1.5',
            )}
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="flex h-[30px] w-[30px] shrink-0 items-center justify-center text-[11px]"
              style={{
                fontFamily:  'var(--font-mono)',
                color:       'var(--color-ash, var(--color-text-muted))',
                border:      '1px solid var(--color-border)',
                background:  'var(--color-surface-2)',
                flexShrink:  0,
              }}
            >
              {initials}
            </div>

            {(!collapsed || mobileOpen) && (
              <>
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-xs font-semibold leading-none"
                    style={{ color: 'var(--color-text-strong)' }}
                  >
                    {user?.email ?? 'Staff'}
                  </p>
                  <p
                    className="mt-0.5 truncate text-[10px] uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
                  >
                    {user?.role ?? 'CASHIER'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  className="flex h-7 w-7 shrink-0 items-center justify-center border transition hover:opacity-80"
                  style={{
                    borderColor: 'var(--color-border)',
                    color:       'var(--color-text-muted)',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
