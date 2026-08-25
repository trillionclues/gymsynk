'use client';

import { MONO } from '@/lib/constants';
import { KeyRound } from 'lucide-react';

export function StepPaymentMode({
  paymentMode,
  setPaymentMode,
  gwProvider,
  setGwProvider,
  gwPublicKey,
  setGwPublicKey,
  gwSecretKey,
  setGwSecretKey,
  gwWebhookSecret,
  setGwWebhookSecret,
}: {
  paymentMode: 'CASH_ONLY' | 'TRACK_AND_RECEIPT' | 'FULL_PROCESSING';
  setPaymentMode: (mode: 'CASH_ONLY' | 'TRACK_AND_RECEIPT' | 'FULL_PROCESSING') => void;
  gwProvider: 'PAYSTACK' | 'LEMONSQUEEZY' | 'FLUTTERWAVE';
  setGwProvider: (val: 'PAYSTACK' | 'LEMONSQUEEZY' | 'FLUTTERWAVE') => void;
  gwPublicKey: string;
  setGwPublicKey: (val: string) => void;
  gwSecretKey: string;
  setGwSecretKey: (val: string) => void;
  gwWebhookSecret: string;
  setGwWebhookSecret: (val: string) => void;
}) {
  const modes = [
    {
      id: 'CASH_ONLY',
      title: 'Cash & Manual Payments Only',
      desc: 'Cashiers record cash, POS, or direct bank transfer payments manually in the cashier desk.',
      tag: 'Simple & Instant',
    },
    {
      id: 'TRACK_AND_RECEIPT',
      title: 'Track & Digital Receipts',
      desc: 'Record payments manually and automatically generate & email PDF receipts to members upon payment.',
      tag: 'Recommended',
    },
    {
      id: 'FULL_PROCESSING',
      title: 'Full Online Payment Processing',
      desc: 'Enable self-serve member renewals and online card payments via Paystack / LemonSqueezy API gateways.',
      tag: 'Automated Gateway',
    },
  ] as const;

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <p className="text-xs text-[color:var(--color-text-subtle)] mb-4" style={MONO}>
        Select how your gym handles payments:
      </p>
      {modes.map((mode) => (
        <div
          key={mode.id}
          onClick={() => setPaymentMode(mode.id)}
          className={`flex items-start gap-4 rounded-xl border p-4 cursor-pointer transition-all ${
            paymentMode === mode.id
              ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] shadow-md'
              : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-2)]'
          }`}
        >
          <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            paymentMode === mode.id ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-neutral-500'
          }`}>
            {paymentMode === mode.id && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-[color:var(--color-text-strong)]">{mode.title}</h4>
              <span className="rounded-full bg-[color:var(--color-surface)] border border-[color:var(--color-border)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--color-text-subtle)]" style={MONO}>
                {mode.tag}
              </span>
            </div>
            <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]">{mode.desc}</p>
          </div>
        </div>
      ))}

      {/* Gateway Credential Input Form when FULL_PROCESSING selected */}
      {paymentMode === 'FULL_PROCESSING' && (
        <div className="mt-4 rounded-xl border border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-2 border-b border-[color:var(--color-border)] pb-3">
            <KeyRound className="h-4 w-4 text-emerald-500" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[color:var(--color-text-strong)]" style={MONO}>
              Online Gateway Credentials
            </h4>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
              Gateway Provider *
            </label>
            <select
              value={gwProvider}
              onChange={(e) => setGwProvider(e.target.value as any)}
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs font-bold outline-none"
            >
              <option value="PAYSTACK">Paystack (Nigeria / W. Africa)</option>
              <option value="LEMONSQUEEZY">LemonSqueezy (Global Merchant of Record)</option>
              <option value="FLUTTERWAVE">Flutterwave (Pan-Africa)</option>
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Public Key *
              </label>
              <input
                type="text"
                value={gwPublicKey}
                onChange={(e) => setGwPublicKey(e.target.value)}
                placeholder="pk_test_..."
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Secret / API Key *
              </label>
              <input
                type="password"
                value={gwSecretKey}
                onChange={(e) => setGwSecretKey(e.target.value)}
                placeholder="sk_test_..."
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
              Webhook Secret (Optional)
            </label>
            <input
              type="text"
              value={gwWebhookSecret}
              onChange={(e) => setGwWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2 text-xs outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
