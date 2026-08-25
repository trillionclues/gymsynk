'use client';

import { useEffect, useState } from 'react';
import { loadAuditLog, type AuditLogItem, type AuditPage as AuditPageType } from '@/services/audit-service';
import { MONO } from '@/lib/constants';
import { ShieldCheck, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { SheetSelect } from '@/components/ui/sheet-select';

export function AuditPage() {
  const [data, setData] = useState<AuditPageType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAudit = async (p = 0, act = actionFilter) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loadAuditLog(p, 30, act);
      setData(res);
    } catch {
      setError('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAudit(page, actionFilter);
  }, [page, actionFilter]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--color-text-strong)]">
              Audit Trail
            </h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            Immutable security log recording administrative actions, staff overrides, and system changes.
          </p>
        </div>

        <div className="w-full sm:w-56">
          <SheetSelect
            value={actionFilter}
            onChange={(v) => { setActionFilter(v); setPage(0); }}
            sheetTitle="Filter by Action Type"
            options={[
              { value: 'ALL', label: 'All Actions', icon: '⚡' },
              { value: 'STAFF_CREATED', label: 'Staff Created', icon: '👤' },
              { value: 'STAFF_TOGGLED', label: 'Staff Status Change', icon: '🔒' },
              { value: 'PLAN_CREATED', label: 'Plan Created', icon: '📋' },
              { value: 'PLAN_UPDATED', label: 'Plan Updated', icon: '✏️' },
              { value: 'CHECK_IN_OVERRIDE', label: 'Check-In Override', icon: '⚠️' },
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
            <ShieldCheck className="mx-auto h-10 w-10 text-[color:var(--color-text-muted)]" />
            <h3 className="mt-3 text-sm font-bold text-[color:var(--color-text-strong)]">No audit log records</h3>
            <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]">Administrative activities will appear here as staff perform system actions.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] font-semibold text-[color:var(--color-text-subtle)] uppercase tracking-wider" style={MONO}>
                <tr>
                  <th className="w-8 px-4 py-3.5" />
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Entity Type</th>
                  <th className="px-4 py-3.5">Actor ID</th>
                  <th className="px-4 py-3.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[color:var(--color-border)]">
                {data.content.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const badgeClass = log.action.includes('CREATED')
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                    : log.action.includes('OVERRIDE')
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    : 'bg-blue-500/10 text-blue-500 border border-blue-500/30';
                  return (
                    <tr key={log.id} className="group">
                      <td colSpan={5} className="p-0">
                        <div
                          onClick={() => toggleExpand(log.id)}
                          className="flex items-center justify-between px-4 py-3.5 hover:bg-[color:var(--color-surface-2)] cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-[color:var(--color-text-subtle)] shrink-0">
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                              style={MONO}
                            >
                              {log.action}
                            </span>
                            <span className="font-bold text-[color:var(--color-text-strong)] text-xs truncate" style={MONO}>
                              {log.entityType}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs shrink-0">
                            <span className="text-[11px] text-[color:var(--color-text-subtle)] font-mono">
                              {log.actorId || 'SYSTEM'}
                            </span>
                            <span className="text-[11px] text-[color:var(--color-text-subtle)]" style={MONO}>
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="bg-[color:var(--color-surface-2)] p-4 border-t border-[color:var(--color-border)]">
                            <div className="space-y-2 text-xs">
                              <div className="font-bold text-[color:var(--color-text-strong)] uppercase tracking-wider text-[10px]" style={MONO}>
                                JSON Payload Diff
                              </div>
                              <pre className="p-3 rounded-xl bg-black/80 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-emerald-500/20">
                                {JSON.stringify(
                                  {
                                    entityId: log.entityId,
                                    oldValue: log.oldValue ? JSON.parse(log.oldValue) : null,
                                    newValue: log.newValue ? JSON.parse(log.newValue) : null,
                                  },
                                  null,
                                  2
                                )}
                              </pre>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-[color:var(--color-border)] px-6 py-3.5 bg-[color:var(--color-surface-2)] text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            <span>
              Page {data.page + 1} of {data.totalPages} ({data.totalElements} logs)
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
