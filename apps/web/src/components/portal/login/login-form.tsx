'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { loginStaff } from '@/services/auth-service';
import { decodeSessionUser } from '@/lib/jwt';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const MONO: React.CSSProperties = { fontFamily: 'var(--font-mono)' };

function validateEmail(v: string) {
  if (!v.trim()) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address';
  return null;
}

function validatePassword(v: string) {
  if (!v) return 'Password is required';
  if (v.length < 6) return 'Password must be at least 6 characters';
  return null;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span
        className="text-[11px] uppercase tracking-[0.10em]"
        style={{ ...MONO, color: 'var(--color-text-muted)' }}
      >
        {label}
      </span>
      {children}
      {error ? (
        <p className="text-[11px]" style={{ ...MONO, color: 'var(--color-status-expired)' }}>
          {error}
        </p>
      ) : null}
    </label>
  );
}

export function LoginForm() {
  const router     = useRouter();
  const setSession = useAuthStore((s) => s.setSession);

  const [email,    setEmail]    = useState('cashier@gymsynk.com');
  const [password, setPassword] = useState('password');
  const [touched,  setTouched]  = useState({ email: false, password: false });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const emailErr    = touched.email    ? validateEmail(email)       : null;
  const passwordErr = touched.password ? validatePassword(password) : null;
  const formValid   = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Mark all fields touched so errors show
    setTouched({ email: true, password: true });
    if (!formValid) return;

    setLoading(true);
    setError(null);

    try {
      const { accessToken } = await loginStaff(email, password);
      const sessionUser = decodeSessionUser(accessToken, email);
      setSession(accessToken, sessionUser);
      router.push(sessionUser.role === 'MEMBER' ? '/member' : '/dashboard');
    } catch {
      setError('Invalid email or password. Check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full border px-[14px] py-[11px] text-[13px] outline-none transition',
      'bg-[color:var(--color-surface-2)] placeholder:text-[color:var(--color-text-subtle)]',
      hasError
        ? 'border-[color:var(--color-status-expired)]'
        : 'border-[color:var(--color-border)] focus:border-[color:var(--color-border-strong)]',
    );

  return (
    <section className="flex items-center">
      <div
        className="w-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-8"
      >
        <div className="mb-8">
          <p className="eyebrow">Staff login</p>
          <h2
            className="mt-3 text-[32px] font-extrabold leading-none"
            style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-text-strong)' }}
          >
            Cashier workspace
          </h2>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
            Sign in to access the front desk dashboard.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <Field label="Email address" error={emailErr}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              type="email"
              autoComplete="email"
              disabled={loading}
              placeholder="cashier@gymsynk.com"
              className={inputClass(Boolean(emailErr))}
              style={{ color: 'var(--color-text-strong)' }}
            />
          </Field>

          <Field label="Password" error={passwordErr}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              type="password"
              autoComplete="current-password"
              disabled={loading}
              placeholder="••••••••"
              className={inputClass(Boolean(passwordErr))}
              style={{ color: 'var(--color-text-strong)' }}
            />
          </Field>

          {error ? (
            <div
              className="flex items-center gap-2 border px-[14px] py-[11px] text-[12px]"
              style={{
                ...MONO,
                color:       'var(--color-status-expired)',
                borderColor: 'var(--color-plate-rust-border)',
                background:  'var(--color-status-expired-bg)',
              }}
            >
              <span
                className="h-[6px] w-[6px] shrink-0"
                style={{ background: 'var(--color-status-expired)' }}
              />
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 border px-[18px] py-[13px] text-[11px] uppercase tracking-[0.09em] transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              ...MONO,
              background:  'var(--color-primary)',
              borderColor: 'var(--color-primary)',
              color:       'var(--color-text-on-primary)',
            }}
          >
            {loading
              ? <><LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Signing in…</>
              : <><ArrowRight className="h-3.5 w-3.5" /> Sign in</>}
          </button>
        </form>

        <div
          className="mt-8 border border-[color:var(--color-border)] p-5"
        >
          <p
            className="text-[10px] uppercase tracking-[0.12em]"
            style={{ ...MONO, color: 'var(--color-text-subtle)' }}
          >
            Demo credentials
          </p>
          <div className="mt-3 space-y-1.5">
            {[
              { role: 'ADMIN',   cred: 'admin@gymsynk.com / password' },
              { role: 'CASHIER', cred: 'cashier@gymsynk.com / password' },
              { role: 'MEMBER',  cred: 'member@gymsynk.com — OTP login' },
            ].map(({ role, cred }) => (
              <div key={role} className="flex items-center gap-3">
                <span
                  className="text-[9px] uppercase tracking-wider"
                  style={{ ...MONO, color: 'var(--color-text-subtle)', minWidth: 52 }}
                >
                  {role}
                </span>
                <span className="text-[12px]" style={{ ...MONO, color: 'var(--color-text-muted)' }}>
                  {cred}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
