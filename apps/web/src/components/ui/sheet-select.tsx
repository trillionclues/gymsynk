'use client';

import { useState, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { MONO } from '@/lib/constants';
import { BottomSheet } from './bottom-sheet';
import { cn } from '@/lib/utils';

export interface SheetOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  icon?: string;
}

interface SheetSelectProps {
  label?: string;
  value: string;
  options: SheetOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  sheetTitle?: string;
  disabled?: boolean;
  className?: string;
}

export function SheetSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  searchable = false,
  sheetTitle,
  disabled = false,
  className,
}: SheetSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.description ?? '').toLowerCase().includes(q)
    );
  }, [options, search]);

  const handleSelect = (v: string) => {
    onChange(v);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          className="block text-[11px] font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-1"
          style={MONO}
        >
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setOpen(true)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2',
          'rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)]',
          'px-3 py-2.5 text-xs text-left transition-all',
          'hover:border-[color:var(--color-border-strong)] focus:outline-none',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'font-semibold truncate',
            selected
              ? 'text-[color:var(--color-text-strong)]'
              : 'text-[color:var(--color-text-subtle)]',
          )}
          style={MONO}
        >
          {selected ? (selected.icon ? `${selected.icon} ${selected.label}` : selected.label) : placeholder}
        </span>
        <ChevronDown className="h-3.5 w-3.5 text-[color:var(--color-text-subtle)] shrink-0" />
      </button>

      <BottomSheet
        open={open}
        onClose={() => { setOpen(false); setSearch(''); }}
        title={sheetTitle ?? label ?? 'Select'}
        maxWidth="md"
      >
        <div className="space-y-3">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[color:var(--color-text-muted)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pl-9 pr-4 py-2.5 text-xs outline-none"
                autoFocus
              />
            </div>
          )}

          <div className="space-y-1.5">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
                No options found
              </p>
            ) : (
              filtered.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      'w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all',
                      isSelected
                        ? 'border-[color:var(--color-border-strong)] bg-[color:var(--color-surface-2)]'
                        : 'border-[color:var(--color-border)] hover:bg-[color:var(--color-surface-2)]',
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {opt.icon && <span className="text-base shrink-0">{opt.icon}</span>}
                      <div className="min-w-0">
                        <div
                          className={cn(
                            'text-xs font-bold truncate',
                            isSelected
                              ? 'text-[color:var(--color-text-strong)]'
                              : 'text-[color:var(--color-text-strong)]',
                          )}
                          style={MONO}
                        >
                          {opt.label}
                        </div>
                        {opt.description && (
                          <div className="text-[11px] text-[color:var(--color-text-subtle)] truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span
                          className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] text-[color:var(--color-text-subtle)]"
                          style={MONO}
                        >
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && <Check className="h-4 w-4 text-emerald-500" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
