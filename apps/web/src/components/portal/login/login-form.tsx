'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle } from 'lucide-react';
import { loginStaff } from '@/services/auth-service';
import { decodeSessionUser } from '@/lib/jwt';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { DISPLAY, MONO } from '@/lib/constants';

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
    <div className="space-y-1.5">
      <label
        className="block text-[10px] uppercase tracking-[0.12em]"
        style={{ ...MONO, color: 'var(--color-text-subtle)' }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[11px]" style={{ ...MONO, color: 'var(--color-status-expired)' }}>
          {error}
        </p>
      )}
    </div>
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

  const emailErr    = touched.email    ? validateEmail(email)    : null;
  const passwordErr = touched.password ? validatePassword(password) : null;
  const formValid   = !validateEmail(email) && !validatePassword(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
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

  const inputCls = (hasErr: boolean) => cn(
    'w-full border px-[14px] py-[11px] text-[13px] outline-none transition',
    'bg-[color:var(--color-surface-2)] placeholder:text-[color:var(--color-text-subtle)]',
    hasErr
      ? 'border-[color:var(--color-status-expired)]'
      : 'border-[color:var(--color-border)] focus:border-[color:var(--color-border-strong)]',
  );

  return (
    <section className="flex flex-col justify-center px-8 py-14 sm:px-12">
      <div
        className="mb-8 border-b pb-8"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="eyebrow mb-2">Staff login</p>
        <h2
          className="text-[32px] font-extrabold leading-none"
          style={{ ...DISPLAY, color: 'var(--color-text-strong)' }}
        >
          Cashier/Admin Workspace
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
            className={inputCls(Boolean(emailErr))}
            style={{ ...MONO, color: 'var(--color-text-strong)' }}
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
            className={inputCls(Boolean(passwordErr))}
            style={{ ...MONO, color: 'var(--color-text-strong)' }}
          />
        </Field>

        {error && (
          <div
            className="flex items-center gap-2 border px-[14px] py-[10px] text-[12px]"
            style={{
              ...MONO,
              color:       'var(--color-status-expired)',
              borderColor: 'var(--color-plate-rust-border)',
              background:  'var(--color-status-expired-bg)',
            }}
          >
            <span className="h-[6px] w-[6px] shrink-0" style={{ background: 'var(--color-status-expired)' }} />
            {error}
          </div>
        )}

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
        className="mt-8 border-t pt-6"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p
          className="mb-3 text-[10px] uppercase tracking-[0.12em]"
          style={{ ...MONO, color: 'var(--color-text-subtle)' }}
        >
          Demo credentials
        </p>
        <div className="space-y-2">
          {[
            { role: 'Admin',   cred: 'admin@gymsynk.com',   suffix: 'password' },
            { role: 'Cashier', cred: 'cashier@gymsynk.com', suffix: 'password' },
            { role: 'Member',  cred: 'member@gymsynk.com',  suffix: 'OTP login' },
          ].map(({ role, cred, suffix }) => (
            <div key={role} className="flex items-center gap-0">
              <span
                className="w-[60px] shrink-0 text-[10px] uppercase tracking-wider"
                style={{ ...MONO, color: 'var(--color-text-subtle)' }}
              >
                {role}
              </span>
              <span className="text-[12px]" style={{ ...MONO, color: 'var(--color-text-muted)' }}>
                {cred}
              </span>
              <span
                className="ml-2 text-[11px]"
                style={{ ...MONO, color: 'var(--color-text-subtle)' }}
              >
                / {suffix}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px]" style={{ ...MONO, color: 'var(--color-text-subtle)' }}>
          Member?{' '}
          <a href="/member/login" className="underline hover:opacity-80">
            Use the member login →
          </a>
        </p>
      </div>
    </section>
  );
}
