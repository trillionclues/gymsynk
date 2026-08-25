'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TodayCheckInResponse } from '@/services/dashboard-service';
import { Panel } from './dashboard-ui';

function getISODateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildChartData(checkIns: TodayCheckInResponse[], timeRange: 'today' | '7d' | '30d') {
  if (timeRange === 'today') {
    const buckets: Record<number, number> = {};
    for (let h = 6; h <= 22; h++) buckets[h] = 0;

    for (const ci of checkIns) {
      if (!ci.checkInTime) continue;
      const h = new Date(ci.checkInTime).getHours();
      if (h >= 6 && h <= 22) buckets[h] = (buckets[h] ?? 0) + 1;
    }

    return Object.entries(buckets).map(([hour, count]) => ({
      label: `${hour}:00`,
      count,
    }));
  }

  const daysCount = timeRange === '7d' ? 7 : 30;
  const dateMap = new Map<string, { label: string; count: number }>();

  const today = new Date();
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = getISODateKey(d);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    dateMap.set(key, { label, count: 0 });
  }

  for (const ci of checkIns) {
    if (!ci.checkInTime) continue;
    const d = new Date(ci.checkInTime);
    const key = getISODateKey(d);
    const item = dateMap.get(key);
    if (item) {
      item.count += 1;
    }
  }

  return Array.from(dateMap.values());
}

interface CheckInChartProps {
  checkIns: TodayCheckInResponse[];
  loading: boolean;
  timeRange?: 'today' | '7d' | '30d';
}

export function CheckInChart({ checkIns, loading, timeRange = 'today' }: CheckInChartProps) {
  const data = useMemo(() => buildChartData(checkIns, timeRange), [checkIns, timeRange]);

  const subtitle =
    timeRange === '7d'
      ? 'Daily check-in distribution — last 7 days'
      : timeRange === '30d'
      ? 'Daily check-in distribution — last 30 days'
      : 'Hourly distribution — today';

  const xInterval = timeRange === '30d' ? 4 : timeRange === '7d' ? 0 : 2;

  return (
    <Panel title="Check-in activity" subtitle={subtitle}>
      {loading && !checkIns.length ? (
        <div className="h-[180px] animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 16, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="gs-chart-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="var(--color-chart-primary)" stopOpacity={0.18} />
                <stop offset="95%" stopColor="var(--color-chart-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={xInterval}
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '12px',
                color: 'var(--color-text-strong)',
                boxShadow: '0 4px 12px var(--color-shadow-md)',
              }}
              labelStyle={{ fontWeight: 600 }}
              cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="var(--color-chart-primary)"
              strokeWidth={2}
              fill="url(#gs-chart-grad)"
              dot={false}
              activeDot={{ r: 4, fill: 'var(--color-chart-primary)', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
}
