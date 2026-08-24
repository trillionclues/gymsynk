'use client';

import Link from 'next/link';
import { UserPlus, ScanQrCode } from 'lucide-react';
import { Btn } from '../dashboard/dashboard-ui';

export function MemberPageHero({ onOpenRegister }: { onOpenRegister?: () => void }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-[color:var(--color-border)]">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-[color:var(--color-text-strong)] sm:text-2xl">
          Members Directory
        </h1>
        <p className="text-xs text-[color:var(--color-text-muted)] mt-0.5">
          Full member directory list, profile history, and registration
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Btn>

        <Link
          href="/dashboard/scanner"
          className="inline-flex items-center gap-2 "
        >
          <ScanQrCode className="h-3.5 w-3.5 text-[color:var(--color-text-muted)]" />
          Scanner Station
        </Link>
                </Btn>
        {onOpenRegister && (
          <Btn
            type="button"
            onClick={onOpenRegister}
            // className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Register Member
          </Btn>
        )}
      </div>
    </div>
  );
}
