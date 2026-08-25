import type { ComponentType, ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { DISPLAY, MONO } from '@/lib/constants';

const PANEL =
  'border border-[color:var(--color-border)] bg-[color:var(--color-surface)]';

const PANEL_HEAD =
  'flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] px-[22px] py-[18px]';

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
      className="inline-flex items-center gap-2 border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-[18px] py-[11px] text-[11px] transition hover:border-[color:var(--color-border-strong)]"
      style={MONO}
    >
      <Icon className="h-[13px] w-[13px]" />
      {label}
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
    <section className={cn(PANEL, className)}>
      <div className={PANEL_HEAD}>
        <div>
          <h3 className="text-[19px] font-bold" style={DISPLAY}>{title}</h3>
          {subtitle ? (
            <p className="mt-[2px] text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action}
      </div>
      <div className="px-[22px] py-[22px]">{children}</div>
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
  trend?: string;
}) {
  const badgeStyles: Record<string, { bg: string; border: string; text: string }> = {
    valid: {
      bg: 'var(--color-surface-2)',
      border: 'var(--color-plate-moss-border)',
      text: 'var(--color-status-valid)',
    },
    monthly: {
      bg: 'var(--color-surface-2)',
      border: 'var(--color-plate-moss-border)',
      text: 'var(--color-status-valid)',
    },
    weekly: {
      bg: 'var(--color-surface-2)',
      border: 'var(--color-plate-gold-border)',
      text: 'var(--color-status-override)',
    },
    override: {
      bg: 'var(--color-surface-2)',
      border: 'var(--color-plate-rust-border)',
      text: 'var(--color-status-expired)',
    },
  };

  const style = badgeStyles[accent] ?? badgeStyles.valid;

  return (
    <div
      className="flex items-center justify-between gap-4 border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 py-5 shadow-xs transition hover:border-[color:var(--color-border-strong)]"
    >
      <div className="min-w-0 space-y-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-[0.12em] truncate"
          style={{ ...MONO, color: 'var(--color-text-subtle)' }}
        >
          {label}
        </p>
        <p
          className="text-2xl font-extrabold tracking-tight whitespace-nowrap overflow-hidden text-ellipsis"
          style={{ ...DISPLAY, color: 'var(--color-text-strong)' }}
          title={value}
        >
          {value}
        </p>
        {trend ? (
          <p
            className="flex items-center gap-1.5 text-[11px]"
            style={{ ...MONO, color: 'var(--color-text-muted)' }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: style.text }}
            />
            {trend}
          </p>
        ) : null}
      </div>

      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center border transition"
        style={{
          background: style.bg,
          borderColor: style.border,
          color: style.text,
        }}
      >
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}

export function EmptyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div
      className="border border-dashed border-[color:var(--color-border)] px-5 py-[30px] text-center"
    >
      <p className="text-[18px] font-bold" style={{ ...DISPLAY, color: 'var(--color-text-strong)' }}>
        {title}
      </p>
      <p className="mt-[6px] text-[13px]" style={{ color: 'var(--color-text-subtle)' }}>
        {body}
      </p>
    </div>
  );
}

export function FeedSkeleton({ compact }: { compact?: boolean } = {}) {
  return (
    <div className="space-y-px">
      {Array.from({ length: compact ? 3 : 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse flex items-center gap-[14px] border-b border-[color:var(--color-border)] px-[22px] py-[14px]"
        >
          {/* Tag square */}
          <div className="h-[38px] w-[38px] shrink-0 bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 bg-[color:var(--color-border)]" />
            <div className="h-2.5 w-44 bg-[color:var(--color-border)]" />
          </div>
          <div className="h-[22px] w-14 bg-[color:var(--color-border)]" />
        </div>
      ))}
    </div>
  );
}

export function Chit({ value }: { value: string }) {
  type ChitTone = { color: string; borderColor: string; dotBg: string };

  const tones: Record<string, ChitTone> = {
    VALID: {
      color:       'var(--color-status-valid)',
      borderColor: 'var(--color-plate-moss-border)',
      dotBg:       'var(--color-status-valid)',
    },
    EXPIRED_PLAN: {
      color:       'var(--color-status-expired)',
      borderColor: 'var(--color-plate-rust-border)',
      dotBg:       'var(--color-status-expired)',
    },
    OVERRIDE: {
      color:       'var(--color-status-override)',
      borderColor: 'var(--color-plate-gold-border)',
      dotBg:       'var(--color-status-override)',
    },
    WRONG_SESSION: {
      color:       'var(--color-text-subtle)',
      borderColor: 'var(--color-border)',
      dotBg:       'var(--color-text-subtle)',
    },
    WRONG_DAY: {
      color:       'var(--color-text-subtle)',
      borderColor: 'var(--color-border)',
      dotBg:       'var(--color-text-subtle)',
    },
    ALREADY_CHECKED_IN: {
      color:       'var(--color-status-duplicate)',
      borderColor: 'var(--color-status-duplicate-bg)',
      dotBg:       'var(--color-status-duplicate)',
    },
  };

  const labels: Record<string, string> = {
    VALID:              'Valid',
    EXPIRED_PLAN:       'Expired',
    OVERRIDE:           'Override',
    WRONG_SESSION:      'Wrong session',
    WRONG_DAY:          'Wrong day',
    ALREADY_CHECKED_IN: 'Duplicate',
  };

  const tone = tones[value] ?? tones.WRONG_SESSION;
  const label = labels[value] ?? value;

  return (
    <span
      className="inline-flex items-center gap-[6px] border px-[8px] py-[4px] text-[10px] uppercase tracking-[0.08em]"
      style={{ ...MONO, color: tone.color, borderColor: tone.borderColor }}
    >
      <span
        className="h-[6px] w-[6px] shrink-0"
        style={{ background: tone.dotBg }}
      />
      {label}
    </span>
  );
}
export const StatusPill = Chit;

export function Tag({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const dim = size === 'sm' ? 'h-[34px] w-[34px] text-[11px]'
            : size === 'lg' ? 'h-[52px] w-[52px] text-[16px]'
            : 'h-[38px] w-[38px] text-[12px]';

  return (
    <div
      className={cn('relative flex shrink-0 items-center justify-center border border-[color:var(--color-border)]', dim)}
      style={{ ...MONO, color: 'var(--color-text-muted)', background: 'var(--color-surface-2)', flexShrink: 0 }}
    >
      {initials}
      {/* Dot accent */}
      <span
        className="absolute right-[3px] top-[3px] h-[3px] w-[3px] border border-[color:var(--color-border)]"
        style={{ borderRadius: '50%' }}
      />
    </div>
  );
}

export function MemberAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' }) {
  return <Tag name={name} size={size} />;
}

export function Btn({
  children,
  primary,
  onClick,
  type = 'button',
  disabled,
  className,
}: {
  children: ReactNode;
  primary?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 border px-[18px] py-[11px] text-[11px] uppercase tracking-[0.09em] transition disabled:cursor-not-allowed disabled:opacity-40',
        primary
          ? 'border-[color:var(--color-primary)] bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)] hover:opacity-90'
          : 'border-[color:var(--color-border)] bg-transparent text-[color:var(--color-text)] hover:border-[color:var(--color-border-strong)]',
        className,
      )}
      style={MONO}
    >
      {children}
    </button>
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
