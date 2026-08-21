'use client';

import Link from 'next/link';
import { ScanQrCode, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

export function DashboardHero({ onOpenRegister }: { onOpenRegister?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-[color:var(--color-border)]">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
          {greeting}{user?.email ? `, ${user.email.split('@')[0]}` : ''} — Overview & Live Front Desk Activity
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        {onOpenRegister ? (
          <button
            type="button"
            onClick={onOpenRegister}
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-xs font-medium text-[color:var(--color-text)] shadow-xs transition hover:bg-[color:var(--color-surface-2)] cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5 text-[color:var(--color-text-muted)]" />
            Add Member
          </button>
        ) : (
          <Link
            href="/dashboard/members"
            className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3.5 py-2 text-xs font-medium text-[color:var(--color-text)] shadow-xs transition hover:bg-[color:var(--color-surface-2)]"
          >
            <UserPlus className="h-3.5 w-3.5 text-[color:var(--color-text-muted)]" />
            Add Member
          </Link>
        )}
        <Link
          href="/dashboard/scanner"
          className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          <ScanQrCode className="h-3.5 w-3.5" />
          Scanner Station
        </Link>
      </div>
    </div>
  );
}
