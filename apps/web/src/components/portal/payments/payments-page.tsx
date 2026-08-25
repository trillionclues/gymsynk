'use client';

import { useEffect, useState } from 'react';
import { loadPayments, type PaymentItem, type PaymentPage as PaymentPageType } from '@/services/payment-service';
import { MONO } from '@/lib/constants';
import { CreditCard, AlertCircle, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { SheetSelect } from '@/components/ui/sheet-select';

export function PaymentsPage() {
  const [data, setData] = useState<PaymentPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const fetchPayments = async (p = 0, st = statusFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loadPayments(p, 20, st);
      setData(res);
    } catch {
      setError('Failed to load payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchPayments(page, statusFilter);
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--color-text-strong)]">
              Payments Log
            </h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            Track transaction history, revenue collections, and payment verification statuses.
          </p>
        </div>

        <div className="w-full sm:w-48">
          <SheetSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(0); }}
            sheetTitle="Filter by Payment Status"
            options={[
              { value: 'ALL', label: 'All Statuses', icon: '⚡' },
              { value: 'COMPLETED', label: 'Completed', icon: '✅', badge: 'Paid' },
              { value: 'PENDING', label: 'Pending', icon: '⏳', badge: 'Processing' },
              { value: 'FAILED', label: 'Failed', icon: '❌', badge: 'Declined' },
              { value: 'REFUNDED', label: 'Refunded', icon: '↩️', badge: 'Returned' },
            ]}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
            ))}
          </div>
        ) : !data || data.content.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="mx-auto h-10 w-10 text-[color:var(--color-text-muted)]" />
            <h3 className="mt-3 text-sm font-bold text-[color:var(--color-text-strong)]">No payment logs found</h3>
            <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]">No payments match the selected status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] font-semibold text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
                <tr>
                  <th className="px-6 py-3.5">Member Name</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Reference</th>
                  <th className="px-6 py-3.5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {data.content.map((p) => (
                  <tr key={p.id} className="hover:bg-[color:var(--color-surface-2)] transition-colors">
                    <td className="px-6 py-4 font-bold text-[color:var(--color-text-strong)] text-sm">
                      {p.memberName}
                    </td>
                    <td className="px-6 py-4 font-black text-[color:var(--color-text-strong)] text-sm" style={MONO}>
                      {p.currency === 'NGN' ? '₦' : p.currency} {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[color:var(--color-surface-2)] border border-[color:var(--color-border)] text-[color:var(--color-text-strong)]" style={MONO}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          p.paymentStatus === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                            : p.paymentStatus === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                            : 'bg-red-500/10 text-red-500 border border-red-500/30'
                        }`}
                        style={MONO}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-[color:var(--color-text-subtle)] truncate max-w-[140px]" style={MONO}>
                      {p.externalRef || '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-[11px] text-[color:var(--color-text-subtle)]" style={MONO}>
                      {new Date(p.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[color:var(--color-border)] px-6 py-3.5 bg-[color:var(--color-surface-2)] text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            <span>
              Page {data.page + 1} of {data.totalPages} ({data.totalElements} records)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 font-bold hover:bg-[color:var(--color-surface-2)] disabled:opacity-40 transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(data.totalPages - 1, prev + 1))}
                disabled={page >= data.totalPages - 1}
                className="inline-flex items-center gap-1 rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-1.5 font-bold hover:bg-[color:var(--color-surface-2)] disabled:opacity-40 transition"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
