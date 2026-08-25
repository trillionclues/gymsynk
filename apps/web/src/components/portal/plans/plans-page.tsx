'use client';

import { useEffect, useState } from 'react';
import { loadAllPlans, createPlan, updatePlan, togglePlanActive, type PlanItem, type CreatePlanPayload } from '@/services/plan-service';
import { fetchWorldCurrencies, type CurrencyItem } from '@/services/setup-service';
import { useAuthStore } from '@/stores/authStore';
import { MONO } from '@/lib/constants';
import { Layers, Plus, Edit3, Power, AlertCircle, Globe } from 'lucide-react';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SheetSelect } from '@/components/ui/sheet-select';
import { CurrencySheetModal } from '@/components/setup/modals/currency-sheet-modal';

export function PlansPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanItem | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [durationType, setDurationType] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM'>('MONTHLY');
  const [durationValue, setDurationValue] = useState(1);
  const [price, setPrice] = useState(15000);
  const [currency, setCurrency] = useState('NGN');
  const [allowedSessions, setAllowedSessions] = useState('MORNING,EVENING');

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, currList] = await Promise.all([
        loadAllPlans(),
        fetchWorldCurrencies(),
      ]);
      setPlans(data);
      setCurrencies(currList);
    } catch {
      setError('Failed to load membership plans.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPlans();
  }, []);

  const openCreateModal = () => {
    setEditingPlan(null);
    setName('');
    setDurationType('MONTHLY');
    setDurationValue(1);
    setPrice(20000);
    setCurrency('NGN');
    setAllowedSessions('MORNING,EVENING');
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PlanItem) => {
    setEditingPlan(p);
    setName(p.name);
    setDurationType(p.durationType);
    setDurationValue(p.durationValue);
    setPrice(p.price);
    setCurrency(p.currency);
    setAllowedSessions(p.allowedSessions.join(','));
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setModalError('Please enter a plan name.');
      return;
    }

    setSubmitting(true);
    setModalError(null);

    const payload: CreatePlanPayload = {
      name: name.trim(),
      durationType,
      durationValue: Number(durationValue),
      price: Number(price),
      currency,
      allowedSessions,
      allowedDays: '0,1,2,3,4,5,6',
      maxCheckinsPerDay: 1,
    };

    try {
      if (editingPlan) {
        await updatePlan(editingPlan.id, payload);
      } else {
        await createPlan(payload);
      }
      setIsModalOpen(false);
      void fetchPlans();
    } catch (err: any) {
      setModalError(err?.response?.data?.message || 'Failed to save membership plan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await togglePlanActive(id);
      void fetchPlans();
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--color-text-strong)]">
              Membership Plans
            </h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            Configure membership duration tiers, pricing, and allowed session check-in rules.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
            style={MONO}
          >
            <Plus className="h-4 w-4" />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[180px] animate-pulse rounded-2xl bg-[color:var(--color-surface-2)]" />
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-12 text-center">
          <Layers className="mx-auto h-10 w-10 text-[color:var(--color-text-muted)]" />
          <h3 className="mt-3 text-sm font-bold text-[color:var(--color-text-strong)]">No membership plans created yet</h3>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]">Click 'Create New Plan' to add your gym's first membership tier.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={`flex flex-col justify-between rounded-2xl border p-5 transition-all ${
                p.isActive
                  ? 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:border-[color:var(--color-border-strong)]'
                  : 'border-neutral-500/20 bg-[color:var(--color-surface-2)] opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="text-base font-extrabold text-[color:var(--color-text-strong)]">{p.name}</h3>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      p.isActive
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/30'
                    }`}
                    style={MONO}
                  >
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-baseline gap-1 text-2xl font-black text-[color:var(--color-text-strong)] mb-4">
                  <span className="text-sm font-bold text-[color:var(--color-text-subtle)]" style={MONO}>
                    {p.currency === 'NGN' ? '₦' : p.currency}
                  </span>
                  <span>{p.price.toLocaleString()}</span>
                  <span className="text-xs font-semibold text-[color:var(--color-text-subtle)]" style={MONO}>
                    / {p.durationValue} {p.durationType.toLowerCase()}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
                  <div className="flex items-center justify-between">
                    <span>Sessions:</span>
                    <span className="font-semibold text-[color:var(--color-text-strong)]">{p.allowedSessions.join(', ')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Daily Scans:</span>
                    <span className="font-semibold text-[color:var(--color-text-strong)]">{p.maxCheckInsPerDay} / day</span>
                  </div>
                </div>
              </div>

              {isAdmin ? (
                <div className="mt-6 flex items-center justify-between border-t border-[color:var(--color-border)] pt-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(p)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[color:var(--color-text-subtle)] hover:text-[color:var(--color-text-strong)] transition"
                    style={MONO}
                  >
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(p.id)}
                    className={`inline-flex items-center gap-1 text-xs font-semibold transition ${
                      p.isActive ? 'text-red-400 hover:text-red-600' : 'text-emerald-500 hover:text-emerald-600'
                    }`}
                    style={MONO}
                  >
                    <Power className="h-3.5 w-3.5" /> {p.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              ) : (
                <div className="mt-6 border-t border-[color:var(--color-border)] pt-3 text-right">
                  <span className="text-[10px] font-bold text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
                    Read Only
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <BottomSheet
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
        titleIcon={<Layers className="h-5 w-5 text-emerald-500" />}
        maxWidth="md"
      >
        {modalError && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
            {modalError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
              Plan Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Student Monthly Pass"
              className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs text-[color:var(--color-text-strong)] outline-none focus:border-[color:var(--color-border-strong)] transition"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Price *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs font-bold text-[color:var(--color-text-strong)] outline-none focus:border-[color:var(--color-border-strong)] transition"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Currency
              </label>
              <button
                type="button"
                onClick={() => setCurrencyModalOpen(true)}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs font-bold text-[color:var(--color-text-strong)] hover:border-[color:var(--color-border-strong)] transition-all"
                style={MONO}
              >
                <div className="flex items-center gap-2 truncate">
                  <span>{currencies.find((c) => c.code === currency)?.flag || '🌐'}</span>
                  <span>{currency}</span>
                </div>
                <Globe className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <SheetSelect
              label="Duration Type"
              value={durationType}
              onChange={(v) => setDurationType(v as typeof durationType)}
              options={[
                { value: 'DAILY',   label: 'Daily',       description: 'Per calendar day',   icon: '📅' },
                { value: 'WEEKLY',  label: 'Weekly',      description: '7-day rolling period', icon: '📆' },
                { value: 'MONTHLY', label: 'Monthly',     description: '30-day rolling period', icon: '🗓️' },
                { value: 'CUSTOM',  label: 'Custom Days', description: 'Specify exact days',  icon: '⚙️' },
              ]}
            />
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                Duration Value
              </label>
              <input
                type="number"
                value={durationValue}
                onChange={(e) => setDurationValue(Number(e.target.value))}
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2.5 text-xs outline-none focus:border-[color:var(--color-border-strong)] transition"
                required
              />
            </div>
          </div>

          <SheetSelect
            label="Allowed Sessions"
            value={allowedSessions}
            onChange={setAllowedSessions}
            options={[
              { value: 'MORNING,EVENING', label: 'Both Sessions',       description: 'Morning & Evening access',   icon: '🌅' },
              { value: 'MORNING',         label: 'Morning Only',         description: 'Morning session access only', icon: '☀️' },
              { value: 'EVENING',         label: 'Evening Only',         description: 'Evening session access only', icon: '🌙' },
            ]}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[color:var(--color-border)]">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-[color:var(--color-border)] px-4 py-2.5 text-xs font-semibold hover:bg-[color:var(--color-surface-2)] transition"
              style={MONO}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
              style={MONO}
            >
              {submitting ? 'Saving…' : editingPlan ? 'Update Plan' : 'Create Plan'}
            </button>
          </div>
        </form>
      </BottomSheet>

      {currencyModalOpen && (
        <CurrencySheetModal
          currencies={currencies}
          selectedCode={currency}
          onSelect={(c) => {
            setCurrency(c);
            setCurrencyModalOpen(false);
          }}
          onClose={() => setCurrencyModalOpen(false)}
        />
      )}
    </div>
  );
}
