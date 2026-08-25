'use client';

import { useEffect, useState } from 'react';
import { loadDashboardSnapshot, type DashboardSnapshot } from '@/services/dashboard-service';

export function useDashboardSnapshot(range: 'today' | '7d' | '30d' = 'today') {
  const [snapshot, setSnapshot] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      setSnapshot(await loadDashboardSnapshot(range));
    } catch {
      setError('Unable to load dashboard data. Check the API connection and sign in again if needed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => {
      void refresh(true);
    }, 30000);

    return () => window.clearInterval(interval);
  }, [range]);

  return { snapshot, loading, refreshing, error, refresh };
}
