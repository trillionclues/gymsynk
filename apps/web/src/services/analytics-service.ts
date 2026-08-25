import { api } from '@/lib/api';


export interface DailyPoint { date: string; count: number }
export interface RevenuePoint { date: string; amount: number }
export interface HeatmapCell { day: number; hour: number; count: number }

export async function loadAttendanceSeries(from: string, to: string): Promise<DailyPoint[]> {
  const res = await api.get<{ series: DailyPoint[] }>('/analytics/attendance', {
    params: { from, to },
  });
  return res.data.series;
}

export async function loadRevenueSeries(from: string, to: string): Promise<RevenuePoint[]> {
  const res = await api.get<{ series: RevenuePoint[] }>('/analytics/revenue', {
    params: { from, to },
  });
  return res.data.series;
}

export async function loadHeatmap(): Promise<HeatmapCell[]> {
  const res = await api.get<{ cells: HeatmapCell[] }>('/analytics/heatmap');
  return res.data.cells;
}
