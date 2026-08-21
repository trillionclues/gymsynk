'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { TodayCheckInResponse } from '@/services/dashboard-service';
import { Panel } from './dashboard-ui';

function buildHourlyBuckets(checkIns: TodayCheckInResponse[]) {
  const buckets: Record<number, number> = {};
  for (let h = 6; h <= 22; h++) buckets[h] = 0;

  for (const ci of checkIns) {
    const h = new Date(ci.checkInTime).getHours();
    if (h >= 6 && h <= 22) buckets[h] = (buckets[h] ?? 0) + 1;
  }

  return Object.entries(buckets).map(([hour, count]) => ({
    hour: `${hour}:00`,
    count,
  }));
}

interface CheckInChartProps {
  checkIns: TodayCheckInResponse[];
  loading: boolean;
}

export function CheckInChart({ checkIns, loading }: CheckInChartProps) {
  const data = useMemo(() => buildHourlyBuckets(checkIns), [checkIns]);

  return (
    <Panel title="Check-in activity" subtitle="Hourly distribution — today">
      {loading && !checkIns.length ? (
        <div className="h-[180px] animate-pulse rounded-xl bg-[color:var(--color-surface-2)]" />
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
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
              dataKey="hour"
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
              axisLine={false}
              tickLine={false}
              interval={2}
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
