import { RotateCcw } from "lucide-react";
import { ErrorBanner } from "../ErrorBanner";
import { OtpInput } from "../OtpInput";
import { PrimaryBtn } from "../PrimaryBtn";
import { FormEvent } from "react";

export function VerifyStage({
  email, otp, setOtp, otpError, loading, error,
  cooldown, onSubmit, onBack, onResend,
}: {
  email: string;
  otp: string;
  setOtp: (v: string) => void;
  otpError: string | null;
  loading: boolean;
  error: string | null;
  cooldown: number;
  onSubmit: (e: FormEvent) => Promise<void>;
  onBack: () => void;
  onResend: () => Promise<void>;
}) {
  return (
    <form className="flex flex-1 flex-col" onSubmit={onSubmit} noValidate>
      <div className="mb-8">
        <p className="eyebrow mb-3">Check your inbox</p>
        <h1
          className="text-[44px] font-extrabold leading-none"
          style={{ fontFamily: 'var(--font-display)', textTransform: 'uppercase', color: 'var(--color-text-strong)' }}
        >
          Enter code
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          Sent to{' '}
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-strong)' }}>
            {email}
          </span>
          . Code expires in 5 minutes.
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div className="space-y-3">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            hasError={Boolean(otpError)}
          />
          {otpError && (
            <p className="text-[11px]" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-status-expired)' }}>
              {otpError}
            </p>
          )}
          {error && <ErrorBanner message={error} />}
        </div>

        <div className="mt-8 space-y-3">
          <PrimaryBtn
            loading={loading}
            disabled={otp.length < 6}
            loadingLabel="Verifying…"
            label="Verify code"
          />

          <div
            className="flex items-center justify-between border-t pt-4"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <button
              type="button"
              onClick={onBack}
              className="text-[11px] transition hover:opacity-80"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-subtle)' }}
            >
              ← Change email
            </button>
            <button
              type="button"
              onClick={onResend}
              disabled={cooldown > 0 || loading}
              className="inline-flex items-center gap-1.5 text-[11px] transition disabled:opacity-40"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}
            >
              <RotateCcw className="h-3 w-3" />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}