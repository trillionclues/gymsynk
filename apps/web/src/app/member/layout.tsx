import type { ReactNode } from 'react';

/**
 * Member PWA layout — deliberately minimal.
 * No portal shell, no sidebar. Max width 420px centred, full-height,
 * dark background regardless of system theme so it looks right when
 * installed as a PWA on a phone.
 */
export default function MemberLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-h-screen flex-col"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <div className="mx-auto flex w-full max-w-[420px] flex-1 flex-col">
        {children}
      </div>
    </div>
  );
}
