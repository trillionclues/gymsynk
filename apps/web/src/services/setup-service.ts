import { api } from '@/lib/api';

export type SetupStatusResponse = {
  setupComplete: boolean;
};

export type OperatingHourPayload = {
  dayOfWeek: number;
  sessionType: 'MORNING' | 'EVENING';
  openTime: string;
  closeTime: string;
  isActive: boolean;
};

export type MembershipPlanPayload = {
  name: string;
  price: number;
  currency: string;
  durationType: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  durationValue: number;
  allowedSessions: string;
  allowedDays: string;
  maxCheckinsPerDay: number;
};

export type PaymentGatewayConfig = {
  provider: 'PAYSTACK' | 'LEMONSQUEEZY' | 'FLUTTERWAVE';
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
};

export type NominatimLocationResult = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
};

export type SetupPayload = {
  orgName: string;
  currency: string;
  timezone: string;
  paymentMode: 'CASH_ONLY' | 'TRACK_AND_RECEIPT' | 'FULL_PROCESSING';
  gatewayConfig?: PaymentGatewayConfig;
  locationName: string;
  address?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  placeId?: string;
  geofenceRadiusMeters?: number;
  operatingHours: OperatingHourPayload[];
  plans: MembershipPlanPayload[];
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
};

export type CurrencyItem = {
  code: string;
  symbol: string;
  name: string;
  flag?: string;
};

export const FALLBACK_CURRENCIES: CurrencyItem[] = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound', flag: '🇪🇬' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: '🇧🇷' },
];

export async function checkSetupStatus() {
  const res = await api.get<SetupStatusResponse>('/setup/status');
  return res.data;
}

export async function executeFirstRunSetup(payload: SetupPayload) {
  const res = await api.post<{ accessToken: string }>('/setup', payload);
  return res.data;
}

export async function fetchWorldCurrencies(): Promise<CurrencyItem[]> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { cache: 'force-cache' });
    if (!res.ok) return FALLBACK_CURRENCIES;
    const data = await res.json();
    if (!data?.rates) return FALLBACK_CURRENCIES;

    const fetchedCodes = Object.keys(data.rates);
    // Combine fetched rate codes with our catalog names/symbols
    const map = new Map<string, CurrencyItem>();
    FALLBACK_CURRENCIES.forEach((c) => map.set(c.code, c));

    fetchedCodes.forEach((code) => {
      if (!map.has(code)) {
        map.set(code, { code, symbol: code, name: code });
      }
    });

    return Array.from(map.values());
  } catch {
    return FALLBACK_CURRENCIES;
  }
}

export async function searchOpenStreetMapAddresses(query: string): Promise<NominatimLocationResult[]> {
  if (!query || query.trim().length < 3) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}
