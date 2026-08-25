'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, LoaderCircle, UserRoundPlus, X } from 'lucide-react';

import { registerMember } from '@/services/member-service';
import { useMemberRegistrationOptions } from '@/hooks/use-member-registration-options';
import { cn } from '@/lib/utils';

type Step = 1 | 2 | 3;

export function MemberRegistrationWizard({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}) {
  const { plans, locations, loading, error } = useMemberRegistrationOptions();
  const [step, setStep] = useState<Step>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planId, setPlanId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!planId && plans.length) {
      setPlanId(plans[0].id);
      setPaymentAmount(String(plans[0].price));
    }
    if (!locationId && locations.length) {
      setLocationId(locations[0].id);
    }
  }, [plans, locations, planId, locationId]);

  const selectedPlan = plans.find((plan) => plan.id === planId);
  const selectedLocation = locations.find((loc) => loc.id === locationId);

  const canContinueStep1 = firstName.trim().length > 0 && lastName.trim().length > 0;
  const canContinueStep2 = Boolean(planId && locationId);

  const submit = async () => {
    setSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result = await registerMember({
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        planId,
        locationId,
        paymentAmount: paymentAmount ? Number(paymentAmount) : undefined,
      });
      setSuccessMessage(`Registered ${result.member.member.firstName} ${result.member.member.lastName} successfully.`);
      onSuccess?.();

      setTimeout(() => {
        setStep(1);
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        if (plans[0]) {
          setPlanId(plans[0].id);
          setPaymentAmount(String(plans[0].price));
        }
        if (locations[0]) {
          setLocationId(locations[0].id);
        }
        setSuccessMessage(null);
        onClose?.();
      }, 1200);
    } catch {
      setErrorMessage('Registration failed. Check the input values and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isOpen === false) return null;

  const content = (
    <div className="space-y-5">
      {loading ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">Loading plans and locations…</p>
      ) : null}
      {error ? <p className="mb-4 text-sm text-[color:var(--color-status-expired)]">{error}</p> : null}
      {successMessage ? (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[color:var(--color-status-valid-bg)] bg-[color:var(--color-status-valid-bg)] px-4 py-3 text-sm text-[color:var(--color-status-valid)]">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      ) : null}
      {errorMessage ? (
        <div className="mb-4 rounded-xl border border-[color:var(--color-status-expired-bg)] bg-[color:var(--color-status-expired-bg)] px-4 py-3 text-sm text-[color:var(--color-status-expired)]">
          {errorMessage}
        </div>
      ) : null}

      <Stepper step={step} />

      {step === 1 ? (
        <StepOne
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          setFirstName={setFirstName}
          setLastName={setLastName}
          setEmail={setEmail}
          setPhone={setPhone}
          onNext={() => setStep(2)}
          canContinue={canContinueStep1}
        />
      ) : null}
      {step === 2 ? (
        <StepTwo
          plans={plans}
          locations={locations}
          planId={planId}
          locationId={locationId}
          paymentAmount={paymentAmount}
          setPlanId={(id) => {
            setPlanId(id);
            const found = plans.find((p) => p.id === id);
            if (found) setPaymentAmount(String(found.price));
          }}
          setLocationId={setLocationId}
          setPaymentAmount={setPaymentAmount}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
          canContinue={canContinueStep2}
        />
      ) : null}
      {step === 3 ? (
        <StepThree
          firstName={firstName}
          lastName={lastName}
          email={email}
          phone={phone}
          selectedPlanName={selectedPlan?.name ?? 'Plan'}
          locationName={selectedLocation?.name ?? 'Branch'}
          paymentAmount={paymentAmount ? `$${paymentAmount}` : 'None'}
          onBack={() => setStep(2)}
          onSubmit={() => void submit()}
          submitting={submitting}
        />
      ) : null}
    </div>
  );

  // Render inside Progressive Modal Dialog if isOpen is provided
  if (isOpen !== undefined) {
    if (!isOpen || !mounted) return null;

    return createPortal(
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-up"
          onClick={onClose}
        />
        <div className="relative my-auto w-full max-w-lg rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl animate-scale-in z-10 text-[color:var(--color-text)]">
          <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-[color:var(--color-text-strong)]">Register Member</h3>
              <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">Step-by-step registration wizard</p>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-1.5 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-strong)] transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {content}
        </div>
      </div>,
      document.body,
    );
  }

  // Standalone card mode (fallback)

  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] shadow-xs">
      <div className="flex items-start justify-between gap-4 border-b border-[color:var(--color-border)] px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-[color:var(--color-text-strong)]">Register member</h3>
          <p className="mt-0.5 text-xs text-[color:var(--color-text-muted)]">Cash-only transaction flow.</p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--color-accent-muted)] text-[color:var(--color-accent)]">
          <UserRoundPlus className="h-4 w-4" />
        </div>
      </div>
      <div className="p-5">{content}</div>
    </section>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = [
    { num: 1, label: 'Personal' },
    { num: 2, label: 'Plan & Location' },
    { num: 3, label: 'Review' },
  ];

  return (
    <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-4 mb-4">
      {steps.map((s, idx) => (
        <div key={s.num} className="flex items-center gap-2">
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
              step >= s.num
                ? 'bg-[color:var(--color-primary)] text-[color:var(--color-text-on-primary)]'
                : 'bg-[color:var(--color-surface-2)] text-[color:var(--color-text-muted)]'
            }`}
          >
            {s.num}
          </div>
          <span
            className={`text-xs font-medium ${
              step === s.num
                ? 'text-[color:var(--color-text-strong)]'
                : 'text-[color:var(--color-text-muted)]'
            }`}
          >
            {s.label}
          </span>
          {idx < steps.length - 1 ? (
            <span className="h-px w-6 bg-[color:var(--color-border)] hidden sm:block" />
          ) : null}
        </div>
      ))}
    </div>
  );
}

function StepOne({
  firstName,
  lastName,
  email,
  phone,
  setFirstName,
  setLastName,
  setEmail,
  setPhone,
  onNext,
  canContinue,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  setFirstName: (val: string) => void;
  setLastName: (val: string) => void;
  setEmail: (val: string) => void;
  setPhone: (val: string) => void;
  onNext: () => void;
  canContinue: boolean;
}) {
  const [touched, setTouched] = useState({ email: false, phone: false });

  const emailInvalid = email.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const emailErr = touched.email && emailInvalid ? 'Enter a valid email address' : null;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First name *">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="John"
            className={inputClass}
          />
        </Field>
        <Field label="Last name *">
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Doe"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Email address" error={emailErr}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          placeholder="john@example.com"
          className={cn(inputClass, emailErr && 'border-[color:var(--color-status-expired)]')}
        />
      </Field>
      <Field label="Phone number">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
          placeholder="+234 800 000 0000"
          className={inputClass}
        />
      </Field>
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={!canContinue || Boolean(emailInvalid)}
          onClick={onNext}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text-on-primary)] transition-all duration-150 active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next: Plan & Location →
        </button>
      </div>
    </div>
  );
}

function StepTwo({
  plans,
  locations,
  planId,
  locationId,
  paymentAmount,
  setPlanId,
  setLocationId,
  setPaymentAmount,
  onBack,
  onNext,
  canContinue,
}: {
  plans: Array<{ id: string; name: string; price: number | string; durationType: string }>;
  locations: Array<{ id: string; name: string }>;
  planId: string;
  locationId: string;
  paymentAmount: string;
  setPlanId: (val: string) => void;
  setLocationId: (val: string) => void;
  setPaymentAmount: (val: string) => void;
  onBack: () => void;
  onNext: () => void;
  canContinue: boolean;
}) {

  return (
    <div className="space-y-4">
      <Field label="Select Plan">
        <select
          value={planId}
          onChange={(e) => setPlanId(e.target.value)}
          className={selectClass}
        >
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — ${p.price} ({p.durationType})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Assigned Location">
        <select
          value={locationId}
          onChange={(e) => setLocationId(e.target.value)}
          className={selectClass}
        >
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Payment Amount ($)">
        <input
          type="number"
          value={paymentAmount}
          onChange={(e) => setPaymentAmount(e.target.value)}
          placeholder="0.00"
          className={inputClass}
        />
      </Field>
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          Back
        </button>
        <button
          type="button"
          disabled={!canContinue}
          onClick={onNext}
          className="rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text-on-primary)] transition-all duration-150 active:scale-[0.98] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next: Review →
        </button>
      </div>
    </div>
  );
}

function StepThree({
  firstName,
  lastName,
  email,
  phone,
  selectedPlanName,
  locationName,
  paymentAmount,
  onBack,
  onSubmit,
  submitting,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  selectedPlanName: string;
  locationName: string;
  paymentAmount: string;
  onBack: () => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-4">
      <SummaryRow label="Name" value={`${firstName} ${lastName}`} />
      <SummaryRow label="Email" value={email || 'None'} />
      <SummaryRow label="Phone" value={phone || 'None'} />
      <SummaryRow label="Plan" value={selectedPlanName} />
      <SummaryRow label="Location" value={locationName} />
      <SummaryRow label="Payment" value={paymentAmount} />
      <div className="flex items-center justify-between pt-2">
        <button type="button" onClick={onBack} className={secondaryButtonClass}>
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-primary)] px-4 py-2.5 text-xs font-semibold text-[color:var(--color-text-on-primary)] transition-all duration-150 active:scale-[0.98] hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Register Member
        </button>
      </div>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string | null; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-[color:var(--color-text-strong)]">{label}</span>
      {children}
      {error && <p className="text-[11px] text-[color:var(--color-status-expired)] mt-1">{error}</p>}
    </label>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-2.5">
      <span className="text-xs text-[color:var(--color-text-muted)]">{label}</span>
      <span className="text-xs font-semibold text-[color:var(--color-text-strong)]">{value}</span>
    </div>
  );
}

const inputClass =
  'w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3.5 py-2.5 text-xs text-[color:var(--color-text-strong)] outline-none transition placeholder:text-[color:var(--color-text-subtle)] focus:border-[color:var(--color-border-strong)] focus:ring-2 focus:ring-[color:var(--color-accent-muted)]';

const selectClass = inputClass;
const secondaryButtonClass =
  'rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3.5 py-2.5 text-xs font-medium text-[color:var(--color-text-strong)] transition-all duration-150 active:scale-[0.98] hover:border-[color:var(--color-border-strong)] cursor-pointer';
