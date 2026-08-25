'use client';

import { useEffect, useState } from 'react';
import { loadAllPlans, createPlan, updatePlan, togglePlanActive, type PlanItem, type CreatePlanPayload } from '@/services/plan-service';
import { MONO } from '@/lib/constants';
import { Layers, Plus, Check, X, LoaderCircle, Edit3, Power, AlertCircle } from 'lucide-react';

export function PlansPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
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
      const data = await loadAllPlans();
      setPlans(data);
    } catch {
      setError('Failed to load membership plans. Make sure you are signed in as an Admin.');
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

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
          style={MONO}
        >
          <Plus className="h-4 w-4" />
          <span>Create New Plan</span>
        </button>
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
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[color:var(--color-border)] pb-3">
              <h3 className="text-base font-extrabold text-[color:var(--color-text-strong)]">
                {editingPlan ? 'Edit Membership Plan' : 'Create New Plan'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-2)]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {modalError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
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
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs text-[color:var(--color-text-strong)] outline-none"
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
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs font-bold text-[color:var(--color-text-strong)] outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs outline-none"
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="GHS">GHS (GH₵)</option>
                    <option value="KES">KES (KSh)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                    Duration Type
                  </label>
                  <select
                    value={durationType}
                    onChange={(e) => setDurationType(e.target.value as any)}
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs outline-none"
                  >
                    <option value="DAILY">Daily</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="CUSTOM">Custom Days</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                    Duration Value
                  </label>
                  <input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value))}
                    className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1" style={MONO}>
                  Allowed Sessions
                </label>
                <select
                  value={allowedSessions}
                  onChange={(e) => setAllowedSessions(e.target.value)}
                  className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-3 py-2 text-xs outline-none"
                >
                  <option value="MORNING,EVENING">Both (Morning & Evening)</option>
                  <option value="MORNING">Morning Session Only</option>
                  <option value="EVENING">Evening Session Only</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[color:var(--color-border)]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-[color:var(--color-border)] px-4 py-2 text-xs font-semibold"
                  style={MONO}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-[color:var(--color-text-strong)] text-[color:var(--color-surface)] px-5 py-2 text-xs font-extrabold uppercase tracking-wider"
                  style={MONO}
                >
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
