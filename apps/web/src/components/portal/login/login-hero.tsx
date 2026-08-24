import { DISPLAY, MONO } from '@/lib/constants';
import { ShieldCheck, Users, Activity } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure access',
    body: 'JWT access tokens with refresh-cookie session recovery.',
  },
  {
    icon: Users,
    title: 'Member flow',
    body: 'Search, register, and review active memberships without leaving the desk.',
  },
  {
    icon: Activity,
    title: 'Live activity',
    body: 'Dashboard stats and live check-in updates in one view.',
  },
];

export function LoginHero() {
  return (
    <section
      className="hidden flex-col justify-between border-r px-12 py-14 lg:flex"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center border"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-strong)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <rect x="2"  y="9" width="3" height="6" />
            <rect x="19" y="9" width="3" height="6" />
            <line x1="5" y1="12" x2="19" y2="12" />
            <rect x="7"  y="7" width="2" height="10" />
            <rect x="15" y="7" width="2" height="10" />
          </svg>
        </div>
        <div>
          <p
            className="text-[14px] font-extrabold leading-none"
            style={{ ...DISPLAY, color: 'var(--color-text-strong)' }}
          >
            GymSynk
          </p>
          <p className="mt-0.5 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
            Cashier/Admin Portal
          </p>
        </div>
      </div>

      <div>
        <h1
          className="text-[52px] font-extrabold leading-[1.0] tracking-tight"
          style={{ ...DISPLAY, color: 'var(--color-text-strong)', maxWidth: 420 }}
        >
          A faster{'\u00A0'}
          <br />front desk for{'\u00A0'}
          <br />every check&#8209;in.
        </h1>
        <p
          className="mt-5 max-w-sm text-[14px] leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Sign in to handle QR scans, manual overrides, new memberships, and the live check-in feed from a single tablet-ready workspace.
        </p>
      </div>

      <div
        className="space-y-0 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {features.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="flex items-start gap-4 border-b py-5"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <div
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border"
              style={{
                borderColor: 'var(--color-border)',
                color:       'var(--color-text-muted)',
              }}
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.6} />
            </div>
            <div>
              <p
                className="text-[12px] font-semibold"
                style={{ color: 'var(--color-text-strong)' }}
              >
                {title}
              </p>
              <p className="mt-0.5 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
                {body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
