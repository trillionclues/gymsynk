import { ShieldCheck, Sparkles, Users, Waves } from 'lucide-react';
import { LoginFeatureCard } from './login-feature-card';

export function LoginHero() {
  return (
    <section className="flex flex-col justify-between rounded-[36px] border border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface),var(--color-surface-2))] p-8 shadow-[0_28px_90px_var(--color-shadow)]">
      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-[color:var(--color-text-subtle)]">
              GymSynk
            </p>
            <p className="text-sm text-[color:var(--color-text-muted)]">Cashier Portal</p>
          </div>
        </div>

        <h1 className="mt-8 max-w-xl text-4xl font-semibold tracking-tight text-[color:var(--color-text-strong)] sm:text-6xl">
          A faster front desk for members, scans, and registrations.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-[color:var(--color-text-muted)] sm:text-lg">
          Sign in to handle QR scans, manual overrides, new memberships, and the live check-in feed from a single tablet-ready workspace.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <LoginFeatureCard
          icon={ShieldCheck}
          title="Secure access"
          body="JWT access tokens with refresh-cookie session recovery."
        />
        <LoginFeatureCard
          icon={Users}
          title="Member flow"
          body="Search, register, and review active memberships without leaving the desk."
        />
        <LoginFeatureCard
          icon={Waves}
          title="Live activity"
          body="Dashboard stats and live check-in updates in one view."
        />
      </div>
    </section>
  );
}
