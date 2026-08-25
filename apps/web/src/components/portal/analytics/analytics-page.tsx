'use client';

import { useEffect, useState } from 'react';
import {
  loadAttendanceSeries,
  loadRevenueSeries,
  loadHeatmap,
  type DailyPoint,
  type RevenuePoint,
  type HeatmapCell,
} from '@/services/analytics-service';
import { MONO } from '@/lib/constants';
import { TrendingUp, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DateRangeSheetModal } from '@/components/ui/date-range-sheet-modal';

export function AnalyticsPage() {
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(thirtyDaysAgoStr);
  const [toDate, setToDate] = useState(todayStr);

  const [attendance, setAttendance] = useState<DailyPoint[]>([]);
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapCell[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [attData, revData, hmData] = await Promise.all([
        loadAttendanceSeries(fromDate, toDate),
        loadRevenueSeries(fromDate, toDate),
        loadHeatmap(),
      ]);
      setAttendance(attData);
      setRevenue(revData);
      setHeatmap(hmData);
    } catch {
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchAnalytics();
  }, [fromDate, toDate]);

  // Heatmap helper matrix (7 days x 24 hours)
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const getCellCount = (dayIdx: number, hour: number) => {
    const cell = heatmap.find((c) => c.day === dayIdx + 1 && c.hour === hour);
    return cell ? cell.count : 0;
  };
  const maxCount = Math.max(...heatmap.map((h) => h.count), 1);

  const [dateModalOpen, setDateModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[color:var(--color-border)] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h1 className="text-2xl font-extrabold tracking-tight text-[color:var(--color-text-strong)]">
              Analytics & Insights
            </h1>
          </div>
          <p className="mt-1 text-xs text-[color:var(--color-text-subtle)]" style={MONO}>
            Monitor member check-in trends, revenue flow, and peak hourly attendance density.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setDateModalOpen(true)}
          className="inline-flex items-center gap-2.5 rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-2.5 text-xs font-bold text-[color:var(--color-text-strong)] hover:border-[color:var(--color-border-strong)] transition-all shadow-sm"
          style={MONO}
        >
          <Calendar className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            {fromDate} &nbsp;→&nbsp; {toDate}
          </span>
        </button>
      </div>

      <DateRangeSheetModal
        open={dateModalOpen}
        onClose={() => setDateModalOpen(false)}
        fromDate={fromDate}
        toDate={toDate}
        onApply={(f, t) => {
          setFromDate(f);
          setToDate(t);
        }}
      />

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-500">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[color:var(--color-text-strong)] uppercase tracking-wider" style={MONO}>
              Attendance Trend
            </h3>
            <span className="text-xs text-[color:var(--color-text-subtle)] font-semibold" style={MONO}>
              Total Scans
            </span>
          </div>

          <div className="h-[260px] w-full">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={attendance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="var(--color-text-subtle)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-text-subtle)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#attGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-[color:var(--color-text-strong)] uppercase tracking-wider" style={MONO}>
              Revenue Trend
            </h3>
            <span className="text-xs text-[color:var(--color-text-subtle)] font-semibold" style={MONO}>
              Amount Collected
            </span>
          </div>

          <div className="h-[260px] w-full">
            {loading ? (
              <div className="h-full w-full animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="date" stroke="var(--color-text-subtle)" fontSize={10} tickLine={false} />
                  <YAxis stroke="var(--color-text-subtle)" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-[color:var(--color-text-strong)] uppercase tracking-wider" style={MONO}>
              7×24 Peak Density Heatmap
            </h3>
            <p className="text-xs text-[color:var(--color-text-subtle)] mt-0.5">
              Check-in concentration by day of week and hour of day (last 90 days).
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[color:var(--color-text-subtle)]" style={MONO}>
            <span>Low</span>
            <div className="flex h-3 w-16 rounded overflow-hidden">
              <div className="flex-1 bg-emerald-500/10" />
              <div className="flex-1 bg-emerald-500/30" />
              <div className="flex-1 bg-emerald-500/60" />
              <div className="flex-1 bg-emerald-500" />
            </div>
            <span>Peak</span>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <div className="min-w-[680px] space-y-1.5">
            <div className="flex items-center text-[10px] font-bold text-[color:var(--color-text-subtle)]" style={MONO}>
              <div className="w-12 shrink-0" />
              {Array.from({ length: 24 }).map((_, h) => (
                <div key={h} className="flex-1 text-center">
                  {h % 3 === 0 ? `${h}h` : ''}
                </div>
              ))}
            </div>

            {daysOfWeek.map((dayName, dayIdx) => (
              <div key={dayName} className="flex items-center gap-1">
                <div className="w-12 shrink-0 text-xs font-bold text-[color:var(--color-text-subtle)]" style={MONO}>
                  {dayName}
                </div>
                {Array.from({ length: 24 }).map((_, hour) => {
                  const cnt = getCellCount(dayIdx, hour);
                  const opacity = cnt > 0 ? Math.max(0.15, cnt / maxCount) : 0.05;
                  return (
                    <div
                      key={hour}
                      title={`${dayName} ${hour}:00 — ${cnt} check-ins`}
                      className="flex-1 h-7 rounded-md transition-all hover:scale-110 cursor-pointer flex items-center justify-center text-[9px] font-bold"
                      style={{
                        backgroundColor: cnt > 0 ? `rgba(16, 185, 129, ${opacity})` : 'var(--color-surface-2)',
                        color: opacity > 0.5 ? '#fff' : 'var(--color-text-subtle)',
                      }}
                    >
                      {cnt > 0 ? cnt : ''}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
