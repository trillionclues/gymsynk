'use client';

import { useState, useEffect } from 'react';
import { searchOpenStreetMapAddresses, type NominatimLocationResult } from '@/services/setup-service';
import { MONO } from '@/lib/constants';
import { MapPin, Globe, CheckCircle2, Navigation, Loader2 } from 'lucide-react';

export function StepLocation({
  locationName,
  setLocationName,
  address,
  setAddress,
  phone,
  setPhone,
  latitude,
  setLatitude,
  longitude,
  setLongitude,
  city,
  setCity,
  country,
  setCountry,
  placeId,
  setPlaceId,
  geofenceRadiusMeters,
  setGeofenceRadiusMeters,
}: {
  locationName: string;
  setLocationName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  latitude?: number;
  setLatitude: (val: number | undefined) => void;
  longitude?: number;
  setLongitude: (val: number | undefined) => void;
  city?: string;
  setCity: (val: string | undefined) => void;
  country?: string;
  setCountry: (val: string | undefined) => void;
  placeId?: string;
  setPlaceId: (val: string | undefined) => void;
  geofenceRadiusMeters: number;
  setGeofenceRadiusMeters: (val: number) => void;
}) {
  const [query, setQuery] = useState(address);
  const [results, setResults] = useState<NominatimLocationResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Debounced OpenStreetMap address lookup
  useEffect(() => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      const data = await searchOpenStreetMapAddresses(query);
      setResults(data);
      setSearching(false);
      setShowDropdown(data.length > 0);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectLocation = (loc: NominatimLocationResult) => {
    setAddress(loc.display_name);
    setQuery(loc.display_name);
    setLatitude(Number(loc.lat));
    setLongitude(Number(loc.lon));
    setPlaceId(String(loc.place_id));

    const cityName = loc.address?.city || loc.address?.town || loc.address?.suburb || loc.address?.state || '';
    const countryName = loc.address?.country || '';
    setCity(cityName);
    setCountry(countryName);

    setShowDropdown(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Branch / Location Name *
        </label>
        <input
          type="text"
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Main Branch / Lekki Phase 1"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          autoFocus
        />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)]" style={MONO}>
            OpenStreetMap Verified Address
          </label>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500" style={MONO}>
            <Globe className="h-3 w-3" /> Live Geocoding
          </span>
        </div>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setAddress(e.target.value);
            }}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            placeholder="Type address or search on OpenStreetMap..."
            className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] pl-10 pr-10 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
          />
          <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-[color:var(--color-text-muted)]" />
          {searching && (
            <Loader2 className="absolute right-3 top-3.5 h-4 w-4 text-emerald-500 animate-spin" />
          )}
        </div>

        {/* Nominatim Suggestions Dropdown */}
        {showDropdown && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-1.5 shadow-2xl space-y-1">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectLocation(r)}
                className="w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left text-xs hover:bg-[color:var(--color-surface-2)] transition"
              >
                <Navigation className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-[color:var(--color-text-strong)] truncate">
                    {r.display_name}
                  </div>
                  <div className="text-[10px] text-[color:var(--color-text-subtle)]" style={MONO}>
                    Lat: {Number(r.lat).toFixed(4)}°, Lon: {Number(r.lon).toFixed(4)}°
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Verified Map Precision Badge */}
      {latitude !== undefined && longitude !== undefined && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-500" style={MONO}>
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>OpenStreetMap Coordinates Verified</span>
            </div>
            <div className="text-[11px] text-[color:var(--color-text-strong)] font-semibold" style={MONO}>
              📍 GPS: {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
              {city && ` · ${city}`}
              {country && `, ${country}`}
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 shrink-0 bg-emerald-500/20 px-2 py-0.5 rounded-md" style={MONO}>
            Sub-meter Precision
          </span>
        </div>
      )}

      {/* Geofence Radius Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Geofence Radius (Check-in Boundary)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {[50, 100, 250, 500].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setGeofenceRadiusMeters(r)}
              className={`py-2 rounded-xl border text-xs font-bold transition ${
                geofenceRadiusMeters === r
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                  : 'border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] hover:border-[color:var(--color-border-strong)]'
              }`}
              style={MONO}
            >
              {r}m {r === 100 ? '★' : ''}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-[11px] text-[color:var(--color-text-subtle)]" style={MONO}>
          Members can check in when physically within {geofenceRadiusMeters} meters of this facility.
        </p>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[color:var(--color-text-subtle)] mb-2" style={MONO}>
          Phone Number (Optional)
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="e.g. +234 801 234 5678"
          className="w-full rounded-xl border border-[color:var(--color-border)] bg-[color:var(--color-surface-2)] px-4 py-3 text-sm text-[color:var(--color-text-strong)] placeholder-[color:var(--color-text-muted)] outline-none focus:border-[color:var(--color-border-strong)] transition"
        />
      </div>
    </div>
  );
}

