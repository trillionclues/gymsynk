'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  executeFirstRunSetup,
  fetchWorldCurrencies,
  FALLBACK_CURRENCIES,
  type SetupPayload,
  type OperatingHourPayload,
  type MembershipPlanPayload,
  type CurrencyItem,
} from '@/services/setup-service';
import { MONO } from '@/lib/constants';
import {
  Building2,
  MapPin,
  Clock,
  CreditCard,
  Layers,
  UserCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  LoaderCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

import { CurrencySheetModal } from './modals/currency-sheet-modal';
import { TimePickerSheetModal } from './modals/time-picker-sheet-modal';
import { StepGymDetails } from './steps/step-gym-details';
import { StepLocation } from './steps/step-location';
import { StepOperatingHours } from './steps/step-operating-hours';
import { StepPaymentMode } from './steps/step-payment-mode';
import { StepPlans } from './steps/step-plans';
import { StepAdminAccount } from './steps/step-admin-account';

const DAYS_OF_WEEK = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' },
];

const DEFAULT_HOURS: OperatingHourPayload[] = [
  ...DAYS_OF_WEEK.flatMap(({ day }) => [
    { dayOfWeek: day, sessionType: 'MORNING' as const, openTime: '06:00', closeTime: '12:00', isActive: true },
    { dayOfWeek: day, sessionType: 'EVENING' as const, openTime: '16:00', closeTime: '21:00', isActive: true },
  ]),
];

const DEFAULT_PLANS: MembershipPlanPayload[] = [
  {
    name: 'Day Pass',
    price: 3000,
    currency: 'NGN',
    durationType: 'DAILY',
    durationValue: 1,
    allowedSessions: 'MORNING,EVENING',
    allowedDays: '0,1,2,3,4,5,6',
    maxCheckinsPerDay: 1,
  },
  {
    name: 'Weekly Access',
    price: 12000,
    currency: 'NGN',
    durationType: 'WEEKLY',
    durationValue: 1,
    allowedSessions: 'MORNING,EVENING',
    allowedDays: '0,1,2,3,4,5,6',
    maxCheckinsPerDay: 1,
  },
  {
    name: 'Monthly Standard',
    price: 35000,
    currency: 'NGN',
    durationType: 'MONTHLY',
    durationValue: 1,
    allowedSessions: 'MORNING,EVENING',
    allowedDays: '0,1,2,3,4,5,6',
    maxCheckinsPerDay: 1,
  },
];

export function SetupWizard() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setAccessToken);

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const [currencyList, setCurrencyList] = useState<CurrencyItem[]>(FALLBACK_CURRENCIES);
  const [isCurrencySheetOpen, setIsCurrencySheetOpen] = useState(false);

  const [activeTimePicker, setActiveTimePicker] = useState<{ day: number; session: 'MORNING' | 'EVENING'; field: 'openTime' | 'closeTime'; currentTime: string } | null>(null);

  const [orgName, setOrgName] = useState('');
  const [timezone, setTimezone] = useState('Africa/Lagos');
  const [currency, setCurrency] = useState('NGN');
  const [locationName, setLocationName] = useState('Main Branch');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [city, setCity] = useState<string | undefined>(undefined);
  const [country, setCountry] = useState<string | undefined>(undefined);
  const [placeId, setPlaceId] = useState<string | undefined>(undefined);
  const [geofenceRadiusMeters, setGeofenceRadiusMeters] = useState<number>(100);

  const [paymentMode, setPaymentMode] = useState<'CASH_ONLY' | 'TRACK_AND_RECEIPT' | 'FULL_PROCESSING'>('CASH_ONLY');

  const [gwProvider, setGwProvider] = useState<'PAYSTACK' | 'LEMONSQUEEZY' | 'FLUTTERWAVE'>('PAYSTACK');
  const [gwPublicKey, setGwPublicKey] = useState('');
  const [gwSecretKey, setGwSecretKey] = useState('');
  const [gwWebhookSecret, setGwWebhookSecret] = useState('');

  const [operatingHours, setOperatingHours] = useState<OperatingHourPayload[]>(DEFAULT_HOURS);
  const [plans, setPlans] = useState<MembershipPlanPayload[]>(DEFAULT_PLANS);
  
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  useEffect(() => {
    async function loadCurrencies() {
      const list = await fetchWorldCurrencies();
      if (list && list.length > 0) setCurrencyList(list);
    }
    void loadCurrencies();
  }, []);

  const selectedCurrencyObj = useMemo(() => {
    return currencyList.find((c) => c.code === currency) || FALLBACK_CURRENCIES[0];
  }, [currency, currencyList]);

  const stepsList = [
    { num: 1, label: 'Gym Details', icon: Building2 },
    { num: 2, label: 'Location', icon: MapPin },
    { num: 3, label: 'Operating Hours', icon: Clock },
    { num: 4, label: 'Payment Mode', icon: CreditCard },
    { num: 5, label: 'Plans', icon: Layers },
    { num: 6, label: 'Admin Account', icon: UserCheck },
  ];

  const handleNext = () => {
    setError(null);
    if (step === 1 && !orgName.trim()) {
      setError('Please enter your gym name.');
      return;
    }
    if (step === 2 && !locationName.trim()) {
      setError('Please enter a branch location name.');
      return;
    }
    if (step === 4 && paymentMode === 'FULL_PROCESSING' && (!gwPublicKey.trim() || !gwSecretKey.trim())) {
      setError('Please provide your gateway public and secret keys for Full Online Payment Processing.');
      return;
    }
    if (step === 5 && plans.length === 0) {
      setError('Please add at least one membership plan.');
      return;
    }
    if (step === 6) {
      submitSetupForm();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const submitSetupForm = async () => {
    if (!adminFirstName.trim() || !adminLastName.trim() || !adminEmail.trim() || !adminPassword) {
      setError('Please complete all admin account fields.');
      return;
    }
    if (adminPassword !== adminPasswordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload: SetupPayload = {
      orgName: orgName.trim(),
      currency,
      timezone,
      paymentMode,
      gatewayConfig:
        paymentMode === 'FULL_PROCESSING'
          ? {
              provider: gwProvider,
              publicKey: gwPublicKey.trim(),
              secretKey: gwSecretKey.trim(),
              webhookSecret: gwWebhookSecret.trim() || undefined,
            }
          : undefined,
      locationName: locationName.trim(),
      address: address.trim() || undefined,
      phone: phone.trim() || undefined,
      latitude,
      longitude,
      city,
      country,
      placeId,
      geofenceRadiusMeters,
      operatingHours,
      plans: plans.map((p) => ({ ...p, currency })),
      adminFirstName: adminFirstName.trim(),
      adminLastName: adminLastName.trim(),
      adminEmail: adminEmail.trim().toLowerCase(),
      adminPassword,
    };

    try {
      const res = await executeFirstRunSetup(payload);
      setToken(res.accessToken);
      setCompleted(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to complete setup. Please check details and retry.');
    } finally {
      setSubmitting(false);
    }
  };

  if (completed) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[color:var(--color-surface-2)] border border-[color:var(--color-border-strong)] text-[color:var(--color-chart-primary)]">
          <CheckCircle2 className="h-10 w-10 animate-bounce" />
        </div>
        <h2 className="text-3xl font-extrabold text-[color:var(--color-text-strong)]">Setup Completed!</h2>
        <p className="mt-2 text-sm text-[color:var(--color-text-subtle)]" style={MONO}>
          Welcome to {orgName}. Launching your cashier dashboard...
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-[color:var(--color-text-muted)]">
          <LoaderCircle className="h-4 w-4 animate-spin text-[color:var(--color-text-strong)]" />
          <span>Redirecting to portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 sm:p-10 shadow-2xl transition-all">
      <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]" style={MONO}>
              <Sparkles className="h-3 w-3 text-amber-500" />
              First-Run Wizard
            </span>
            <span className="text-xs font-semibold text-[color:var(--color-text-muted)]" style={MONO}>
              Step {step} of 6
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[color:var(--color-text-strong)] tracking-tight">
            {stepsList[step - 1].label}
          </h1>
        </div>
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-xl bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] text-[color:var(--color-text-strong)]">
          {(() => {
            const Icon = stepsList[step - 1].icon;
            return <Icon className="h-6 w-6" />;
          })()}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-1 mb-2">
          {stepsList.map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < step && setStep(s.num)}
              className={`flex-1 text-center cursor-pointer transition-all ${
                s.num === step
                  ? 'text-[color:var(--color-text-strong)] font-bold'
                  : s.num < step
                  ? 'text-[color:var(--color-text-subtle)] font-medium hover:text-[color:var(--color-text-strong)]'
                  : 'text-[color:var(--color-text-muted)] opacity-50'
              }`}
            >
              <span className="text-[11px] block truncate" style={MONO}>
                {s.num}. {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-1.5 w-full rounded-full bg-[color:var(--color-surface-2)] overflow-hidden">
          <div
            className="h-full bg-[color:var(--color-chart-primary)] transition-all duration-300"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500 animate-in fade-in">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="min-h-[300px]">
        {step === 1 && (
          <StepGymDetails
            orgName={orgName}
            setOrgName={setOrgName}
            timezone={timezone}
            setTimezone={setTimezone}
            selectedCurrencyObj={selectedCurrencyObj}
            onOpenCurrencySheet={() => setIsCurrencySheetOpen(true)}
          />
        )}
        {step === 2 && (
          <StepLocation
            locationName={locationName}
            setLocationName={setLocationName}
            address={address}
            setAddress={setAddress}
            phone={phone}
            setPhone={setPhone}
            latitude={latitude}
            setLatitude={setLatitude}
            longitude={longitude}
            setLongitude={setLongitude}
            city={city}
            setCity={setCity}
            country={country}
            setCountry={setCountry}
            placeId={placeId}
            setPlaceId={setPlaceId}
            geofenceRadiusMeters={geofenceRadiusMeters}
            setGeofenceRadiusMeters={setGeofenceRadiusMeters}
          />
        )}
        {step === 3 && (
          <StepOperatingHours
            operatingHours={operatingHours}
            onOpenTimePicker={setActiveTimePicker}
          />
        )}
        {step === 4 && (
          <StepPaymentMode
            paymentMode={paymentMode}
            setPaymentMode={setPaymentMode}
            gwProvider={gwProvider}
            setGwProvider={setGwProvider}
            gwPublicKey={gwPublicKey}
            setGwPublicKey={setGwPublicKey}
            gwSecretKey={gwSecretKey}
            setGwSecretKey={setGwSecretKey}
            gwWebhookSecret={gwWebhookSecret}
            setGwWebhookSecret={setGwWebhookSecret}
          />
        )}
        {step === 5 && (
          <StepPlans
            plans={plans}
            setPlans={setPlans}
            selectedCurrencyObj={selectedCurrencyObj}
            currency={currency}
          />
        )}
        {step === 6 && (
          <StepAdminAccount
            adminFirstName={adminFirstName}
            setAdminFirstName={setAdminFirstName}
            adminLastName={adminLastName}
            setAdminLastName={setAdminLastName}
            adminEmail={adminEmail}
            setAdminEmail={setAdminEmail}
            adminPassword={adminPassword}
            setAdminPassword={setAdminPassword}
            adminPasswordConfirm={adminPasswordConfirm}
            setAdminPasswordConfirm={setAdminPasswordConfirm}
          />
        )}
      </div>

      <div className="flex items-center justify-between border-t border-[color:var(--color-border)] pt-6 mt-8">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || submitting}
          className={`inline-flex items-center gap-1.5 rounded-xl border border-[color:var(--color-border)] px-5 py-2.5 text-xs font-semibold transition ${
            step === 1 || submitting
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-[color:var(--color-surface-2)] text-[color:var(--color-text-strong)]'
          }`}
          style={MONO}
        >
          <ChevronLeft className="h-4 w-4" /> Back
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-6 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          style={MONO}
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Completing Setup...</span>
            </>
          ) : step === 6 ? (
            <>
              <span>Complete & Launch</span>
              <CheckCircle2 className="h-4 w-4" />
            </>
          ) : (
            <>
              <span>Continue</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

      {isCurrencySheetOpen && (
        <CurrencySheetModal
          currencies={currencyList}
          selectedCode={currency}
          onSelect={(code) => {
            setCurrency(code);
            setIsCurrencySheetOpen(false);
          }}
          onClose={() => setIsCurrencySheetOpen(false)}
        />
      )}

      {activeTimePicker && (
        <TimePickerSheetModal
          target={activeTimePicker}
          onSelectTime={(timeStr) => {
            const { day, session, field } = activeTimePicker;
            setOperatingHours((prev) =>
              prev.map((h) => (h.dayOfWeek === day && h.sessionType === session ? { ...h, [field]: timeStr } : h))
            );
            setActiveTimePicker(null);
          }}
          onClose={() => setActiveTimePicker(null)}
        />
      )}
    </div>
  );
}
