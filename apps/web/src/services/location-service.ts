import { api } from '@/lib/api';

export type LocationResponse = {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
};

export async function listLocations() {
  const { data } = await api.get<LocationResponse[]>('/locations');
  return data;
}
