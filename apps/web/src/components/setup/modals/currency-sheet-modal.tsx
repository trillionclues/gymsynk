'use client';

import { useState, useMemo } from 'react';
import type { CurrencyItem } from '@/services/setup-service';
import { MONO } from '@/lib/constants';
import { Globe, Search, X, CheckCircle2 } from 'lucide-react';

export function CurrencySheetModal({
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: {
  currencies: CurrencyItem[];
  selectedCode: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return currencies;
    const q = search.toLowerCase();
    return currencies.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [currencies, search]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-t-2xl sm:rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-extrabold text-[color:var(--color-text-strong)]">
              Select Currency
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[color:var(--color-text-subtle)] hover:bg-[color:var(--color-surface-2)] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-[color:var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search currency code or country..."
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pl-9 pr-4 py-2.5 text-xs outline-none"
            autoFocus
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
          {filtered.map((c) => {
            const isSelected = c.code === selectedCode;
            return (
              <div
                key={c.code}
                onClick={() => onSelect(c.code)}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-all ${
                  isSelected
                    ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)] font-bold'
                    : 'border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:bg-[color:var(--color-surface-2)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.flag || '🌐'}</span>
                  <div>
                    <div className="text-xs font-bold text-[color:var(--color-text-strong)]" style={MONO}>
                      {c.code} ({c.symbol})
                    </div>
                    <div className="text-[11px] text-[color:var(--color-text-subtle)]">{c.name}</div>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
