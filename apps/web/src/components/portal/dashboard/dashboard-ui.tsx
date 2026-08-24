import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 py-2.5 text-sm font-medium text-[color:var(--color-text-strong)] shadow-sm transition hover:border-[color:var(--color-border-strong)] hover:shadow-md"
    >
      <Icon className="h-4 w-4" />
      {label}
      <ArrowRight className="h-3.5 w-3.5 text-[color:var(--color-text-muted)]" />
    </Link>
  );
}

export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-[0_1px_4px_var(--color-shadow)]', className)}>
      <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-text-strong)]">{title}</h3>
          {subtitle ? <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  trend,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  accent: 'valid' | 'monthly' | 'weekly' | 'override';
  trend?: string; // e.g. "+12% today"
}) {
  const iconTone = {
    valid:    'bg-[color:var(--color-status-valid-bg)]   text-[color:var(--color-status-valid)]',
    monthly:  'bg-[color:var(--color-plan-monthly-bg)]   text-[color:var(--color-plan-monthly)]',
    weekly:   'bg-[color:var(--color-plan-weekly-bg)]    text-[color:var(--color-plan-weekly)]',
    override: 'bg-[color:var(--color-status-override-bg)] text-[color:var(--color-status-override)]',
  }[accent];

  return (
    <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5 shadow-[0_1px_4px_var(--color-shadow)] transition hover:shadow-[0_4px_12px_var(--color-shadow-md)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[color:var(--color-text-muted)] uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[color:var(--color-text-strong)]">{value}</p>
          {trend ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[color:var(--color-status-valid)]">
              <TrendingUp className="h-3 w-3" />
              {trend}
            </p>
          ) : null}
        </div>
        <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', iconTone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[color:var(--color-border)] px-5 py-10 text-center">
      <p className="text-sm font-medium text-[color:var(--color-text-strong)]">{title}</p>
      <p className="mt-1.5 text-xs leading-5 text-[color:var(--color-text-muted)]">{body}</p>
    </div>
  );
}

export function FeedSkeleton({ compact }: { compact?: boolean } = {}) {
  return (
    <div className={cn('space-y-2', compact && 'space-y-1.5')}>
      {Array.from({ length: compact ? 3 : 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center gap-3 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3.5"
        >
          <div className="h-8 w-8 rounded-full bg-[color:var(--color-border)]" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 rounded-full bg-[color:var(--color-border)]" />
            <div className="h-2.5 w-44 rounded-full bg-[color:var(--color-border)]" />
          </div>
          <div className="h-3 w-12 rounded-full bg-[color:var(--color-border)]" />
        </div>
      ))}
    </div>
  );
}

export function StatusPill({ value }: { value: string }) {
  const tone =
    {
      VALID:              'bg-[color:var(--color-status-valid-bg)]     text-[color:var(--color-status-valid)]',
      EXPIRED_PLAN:       'bg-[color:var(--color-status-expired-bg)]   text-[color:var(--color-status-expired)]',
      OVERRIDE:           'bg-[color:var(--color-status-override-bg)]  text-[color:var(--color-status-override)]',
      WRONG_SESSION:      'bg-[color:var(--color-status-wrong-bg)]     text-[color:var(--color-status-wrong)]',
      WRONG_DAY:          'bg-[color:var(--color-status-wrong-bg)]     text-[color:var(--color-status-wrong)]',
      ALREADY_CHECKED_IN: 'bg-[color:var(--color-status-duplicate-bg)] text-[color:var(--color-status-duplicate)]',
    }[value] ?? 'bg-[color:var(--color-status-wrong-bg)] text-[color:var(--color-status-wrong)]';

  const label =
    {
      VALID: 'Valid',
      EXPIRED_PLAN: 'Expired',
      OVERRIDE: 'Override',
      WRONG_SESSION: 'Wrong session',
      WRONG_DAY: 'Wrong day',
      ALREADY_CHECKED_IN: 'Duplicate',
    }[value] ?? value;

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none', tone)}>
      {label}
    </span>
  );
}

export function MemberAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-[color:var(--color-primary-muted)] text-[color:var(--color-text-strong)] font-semibold',
        size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs',
      )}
    >
      {initials}
    </div>
  );
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
