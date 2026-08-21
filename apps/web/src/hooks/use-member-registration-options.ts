'use client';

import { useEffect, useState } from 'react';
import { listLocations, type LocationResponse } from '@/services/location-service';
import { listPlans, type PlanResponse } from '@/services/member-service';

export function useMemberRegistrationOptions() {
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [locations, setLocations] = useState<LocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [planData, locationData] = await Promise.all([listPlans(), listLocations()]);
        if (!active) return;
        setPlans(planData);
        setLocations(locationData.filter((location) => location.isActive));
      } catch {
        if (!active) return;
        setError('Unable to load plans or locations.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return { plans, locations, loading, error };
}
