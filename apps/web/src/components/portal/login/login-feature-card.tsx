import type { ComponentType } from 'react';

export function LoginFeatureCard({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-3xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/80 p-4 shadow-sm backdrop-blur">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--color-accent-muted)] text-[color:var(--color-accent)]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-[color:var(--color-text-strong)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--color-text-muted)]">{body}</p>
    </div>
  );
}
