'use client';

import type { MembershipPlanPayload, CurrencyItem } from '@/services/setup-service';
import { MONO } from '@/lib/constants';
import { Plus, Trash2 } from 'lucide-react';

export function StepPlans({
  plans,
  setPlans,
  selectedCurrencyObj,
  currency,
}: {
  plans: MembershipPlanPayload[];
  setPlans: React.Dispatch<React.SetStateAction<MembershipPlanPayload[]>>;
  selectedCurrencyObj: CurrencyItem;
  currency: string;
}) {
  const updatePlan = (index: number, field: keyof MembershipPlanPayload, val: any) => {
    setPlans((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const addPlan = () => {
    setPlans((prev) => [
      ...prev,
      {
        name: 'Custom Pass',
        price: 15000,
        currency,
        durationType: 'MONTHLY',
        durationValue: 1,
        allowedSessions: 'MORNING,EVENING',
        allowedDays: '0,1,2,3,4,5,6',
        maxCheckinsPerDay: 1,
      },
    ]);
  };

  const removePlan = (index: number) => {
    setPlans((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
          Setup initial membership plans for members to purchase:
        </p>
        <button
          type="button"
          onClick={addPlan}
          className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--color-text-strong)] hover:opacity-80 transition"
          style={MONO}
        >
          <Plus className="h-3.5 w-3.5" /> Add Plan
        </button>
      </div>

      <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
        {plans.map((p, idx) => (
          <div key={idx} className="rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={p.name}
                onChange={(e) => updatePlan(idx, 'name', e.target.value)}
                className="rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-bold text-[color:var(--color-text-strong)] outline-none"
                placeholder="Plan Name"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={MONO}>{selectedCurrencyObj.symbol}</span>
                <input
                  type="number"
                  value={p.price}
                  onChange={(e) => updatePlan(idx, 'price', Number(e.target.value))}
                  className="w-28 rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 text-xs font-bold outline-none"
                />
                {plans.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePlan(idx)}
                    className="p-1 text-red-400 hover:text-red-600 transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[10px] text-[color:var(--color-text-subtle)] mb-1" style={MONO}>Duration Type</label>
                <select
                  value={p.durationType}
                  onChange={(e) => updatePlan(idx, 'durationType', e.target.value as any)}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-1.5 text-xs"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="CUSTOM">Custom Days</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-[color:var(--color-text-subtle)] mb-1" style={MONO}>Duration Value</label>
                <input
                  type="number"
                  value={p.durationValue}
                  onChange={(e) => updatePlan(idx, 'durationValue', Number(e.target.value))}
                  className="w-full rounded-lg border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-2 py-1.5 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
