'use client';

import { useEffect, useState } from 'react';
import { loadDashboardSnapshot, type DashboardSnapshot } from '@/services/dashboard-service';

export function useDashboardSnapshot() {
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
      setSnapshot(await loadDashboardSnapshot());
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
  }, []);

  return { snapshot, loading, refreshing, error, refresh };
}
