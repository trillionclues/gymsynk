import { FormEvent } from "react";
import { ErrorBanner } from "../ErrorBanner";
import { PrimaryBtn } from "../PrimaryBtn";
import { cn } from "@/lib/utils";

export function RequestStage({
  email, setEmail, touched, setTouched,
  emailError, loading, error, onSubmit,
}: {
  email: string;
  setEmail: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  emailError: string | null;
  loading: boolean;
  error: string | null;
  onSubmit: (e: FormEvent) => Promise<void>;
}) {
  return (
    <form className="flex flex-1 flex-col" onSubmit={onSubmit} noValidate>
      <div className="mb-8">
        <p className="eyebrow mb-3">Member access</p>
        <h1
          className="text-[44px] font-extrabold leading-none"
          style={{ ...{ fontFamily: 'var(--font-display)', textTransform: 'uppercase' }, color: 'var(--color-text-strong)' }}
        >
          Sign in
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Enter your email address and we'll send you a 6-digit code. No password needed.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label
              className="block text-[10px] uppercase tracking-[0.12em]"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
            >
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              disabled={loading}
              placeholder="you@example.com"
              autoComplete="email"
              autoFocus
              className={cn(
                'w-full border px-4 py-4 text-[15px] outline-none transition',
                'bg-[color:var(--color-surface-2)] placeholder:text-[color:var(--color-text-subtle)]',
                emailError
                  ? 'border-[color:var(--color-status-expired)]'
                  : 'border-[color:var(--color-border)] focus:border-[color:var(--color-border-strong)]',
              )}
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-strong)' }}
            />
            {emailError && (
              <p className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-status-expired)' }}>
                {emailError}
              </p>
            )}
          </div>
          {error && <ErrorBanner message={error} />}
        </div>

        <div className="mt-8">
          <PrimaryBtn
            loading={loading}
            loadingLabel="Sending code…"
            label="Send login code"
          />
        </div>
      </div>
    </form>
  );
}
