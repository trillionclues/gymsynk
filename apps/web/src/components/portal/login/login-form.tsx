'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { loginStaff } from '@/services/auth-service';
import { decodeSessionUser } from '@/lib/jwt';
import { useAuthStore } from '@/stores/authStore';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-[color:var(--color-text-strong)]">{label}</span>
      {children}
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [email, setEmail] = useState('cashier@gymsynk.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken } = await loginStaff(email, password);
      const sessionUser = decodeSessionUser(accessToken, email);
      setSession(accessToken, sessionUser);
      router.push(sessionUser.role === 'MEMBER' ? '/member' : '/dashboard');
    } catch {
      setError('Login failed. Check the email and password, then try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex items-center">
      <div className="w-full rounded-[36px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-[0_28px_90px_var(--color-shadow)] sm:p-8">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-[color:var(--color-text-subtle)]">
            Staff login
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[color:var(--color-text-strong)]">
            Continue to the cashier workspace
          </h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Field label="Email">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] outline-none transition placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-border-strong)]"
              placeholder="cashier@gymsynk.com"
            />
          </Field>

          <Field label="Password">
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="w-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] outline-none transition placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-border-strong)]"
              placeholder="••••••••"
            />
          </Field>

          {error ? (
            <p className="rounded-2xl border border-[color:var(--color-status-expired-bg)] bg-[color:var(--color-status-expired-bg)] px-4 py-3 text-sm text-[color:var(--color-status-expired)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[color:var(--color-primary)] px-4 py-3 text-sm font-medium text-[color:var(--color-text-on-primary)] transition hover:bg-[color:var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {loading ? 'Signing in' : 'Sign in'}
            {!loading ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        </form>

        <div className="mt-8 rounded-3xl border border-[color:var(--color-border)] bg-[linear-gradient(180deg,var(--color-surface-2),var(--color-surface))] p-5">
          <p className="text-sm font-medium text-[color:var(--color-text-strong)]">
            Demo credentials
          </p>
          <div className="mt-3 space-y-2 text-sm text-[color:var(--color-text-muted)]">
            <p>Admin: admin@gymsynk.com / password</p>
            <p>Cashier: cashier@gymsynk.com / password</p>
            <p>Member OTP login: member@gymsynk.com</p>
          </div>
        </div>
      </div>
    </section>
  );
}
