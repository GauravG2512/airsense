'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  MapPin,
  Navigation,
  RefreshCw,
  User,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { HealthGuidance } from '@/components/dashboard/HealthGuidance';
import { PredictorWidget } from '@/components/dashboard/PredictorWidget';
import { useAuth } from '@/context/AuthContext';

import { CPCB_AQI_CATEGORIES, getAqiCategory, type AqiCategory } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type CurrentCity = {
  city_name: string;
  pollution_date: string;
  aqi_estimate: number;
  aqi_category: string;
  dominant_pollutant: string;
  latitude: number;
  longitude: number;
  [key: string]: unknown;
};

type ForecastPoint = {
  period_start: string;
  predicted_aqi: number;
  horizon_hours: number;
  aqi_category: string;
  [key: string]: unknown;
};

type GenericRecord = Record<string, unknown>;

type LocationResult = {
  station_id?: string;
  station_name?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  aqi?: number;
  category?: string;
  dominant_pollutant?: string;
  pm25_24h_mean?: number;
  distance_km?: number;
};

type ApiEnvelope<T> = { data: T };

type ActivityAdvice = {
  status: 'Safe' | 'Caution' | 'Avoid';
  tip: string;
};

type DashboardData = {
  cities: CurrentCity[];
  forecast: ForecastPoint[];
  activity: GenericRecord[];
};

const ACTIVITIES = [
  ['running', 'Jogging & Running'],
  ['walking', 'Walking & Commute'],
  ['cycling', 'Road Cycling'],
  ['children', 'Kids & Elderly'],
  ['ventilation', 'Home Windows'],
] as const;

const todayStr = new Date().toISOString().slice(0, 10);

const FALLBACK_CITIES: CurrentCity[] = [
  { city_name: 'Mumbai', pollution_date: todayStr, aqi_estimate: 142.5, aqi_category: 'Moderate', dominant_pollutant: 'PM2.5', latitude: 19.076, longitude: 72.8777 },
  { city_name: 'Delhi', pollution_date: todayStr, aqi_estimate: 245.8, aqi_category: 'Poor', dominant_pollutant: 'PM10', latitude: 28.6139, longitude: 77.209 },
  { city_name: 'Bengaluru', pollution_date: todayStr, aqi_estimate: 68.2, aqi_category: 'Satisfactory', dominant_pollutant: 'O3', latitude: 12.9716, longitude: 77.5946 },
  { city_name: 'Chennai', pollution_date: todayStr, aqi_estimate: 84.1, aqi_category: 'Satisfactory', dominant_pollutant: 'NO2', latitude: 13.0827, longitude: 80.2707 },
  { city_name: 'Kolkata', pollution_date: todayStr, aqi_estimate: 178.4, aqi_category: 'Moderate', dominant_pollutant: 'PM2.5', latitude: 22.5726, longitude: 88.3639 },
  { city_name: 'Hyderabad', pollution_date: todayStr, aqi_estimate: 112.0, aqi_category: 'Moderate', dominant_pollutant: 'PM10', latitude: 17.385, longitude: 78.4867 },
  { city_name: 'Ahmedabad', pollution_date: todayStr, aqi_estimate: 165.3, aqi_category: 'Moderate', dominant_pollutant: 'PM2.5', latitude: 23.0225, longitude: 72.5714 }
];


async function apiFetch<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  let response: Response;
  const timeoutSignal = AbortSignal.timeout(4000);
  const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  
  try {
    response = await fetch(`${API_BASE}${endpoint}`, { cache: 'no-store', signal: combinedSignal });
  } catch (err: unknown) {
    throw new Error(
      `Unable to reach the AirSense API at ${API_BASE}. ${err instanceof Error ? err.message : ''}`
    );
  }
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`AirSense API ${response.status}: ${body}`);
  }
  return response.json();
}

async function optionalFetch<T>(endpoint: string, signal?: AbortSignal): Promise<T | null> {
  try {
    const timeoutSignal = AbortSignal.timeout(4000);
    const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
    const response = await fetch(`${API_BASE}${endpoint}`, {
      cache: 'no-store',
      signal: combinedSignal,
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchDashboardData(signal?: AbortSignal): Promise<DashboardData> {
  try {
    const [current, forecastData, activityData] = await Promise.all([
      apiFetch<ApiEnvelope<CurrentCity[]>>('/api/air/current', signal),
      optionalFetch<ApiEnvelope<ForecastPoint[]>>('/api/air/forecast', signal),
      optionalFetch<ApiEnvelope<GenericRecord[]>>('/api/air/activity', signal),
    ]);

    const citiesList = Array.isArray(current.data) && current.data.length > 0 ? current.data : FALLBACK_CITIES;

    return {
      cities: citiesList,
      forecast: forecastData?.data || [],
      activity: activityData?.data || [],
    };
  } catch {
    return {
      cities: FALLBACK_CITIES,
      forecast: [],
      activity: []
    };
  }
}


function safeCategory(value: string | undefined, aqi: number): AqiCategory {
  const valid: AqiCategory[] = ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'];
  return value && valid.includes(value as AqiCategory)
    ? (value as AqiCategory)
    : getAqiCategory(aqi);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function pickNumber(row: GenericRecord | undefined, keys: string[]) {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }
  return null;
}

function pickString(row: GenericRecord | undefined, keys: string[]) {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim() !== '') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }
  return null;
}

function activityAdvice(aqi: number): Record<string, ActivityAdvice> {
  if (aqi <= 50) {
    return {
      running: { status: 'Safe', tip: 'The current AQI is in the Good range.' },
      walking: { status: 'Safe', tip: 'The current AQI is in the Good range.' },
      cycling: { status: 'Safe', tip: 'The current AQI is in the Good range.' },
      children: { status: 'Safe', tip: 'The current AQI is in the Good range.' },
      ventilation: { status: 'Safe', tip: 'The current AQI is in the Good range.' },
    };
  }

  if (aqi <= 100) {
    return {
      running: { status: 'Safe', tip: 'Outdoor exercise is generally reasonable at this AQI level.' },
      walking: { status: 'Safe', tip: 'Normal walking and commuting are reasonable at this AQI level.' },
      cycling: { status: 'Safe', tip: 'Normal cycling is reasonable at this AQI level.' },
      children: { status: 'Safe', tip: 'Current AQI is within the Satisfactory range.' },
      ventilation: { status: 'Safe', tip: 'Current AQI is within the Satisfactory range.' },
    };
  }

  if (aqi <= 200) {
    return {
      running: { status: 'Caution', tip: 'Consider shorter or lower-intensity outdoor exercise if you are sensitive.' },
      walking: { status: 'Safe', tip: 'Walking is less strenuous, but sensitive people should monitor conditions.' },
      cycling: { status: 'Caution', tip: 'Prefer less congested routes and avoid prolonged intense effort.' },
      children: { status: 'Caution', tip: 'Consider reducing prolonged outdoor exposure for sensitive groups.' },
      ventilation: { status: 'Caution', tip: 'Use historical and hourly analytics to choose a better window.' },
    };
  }

  if (aqi <= 300) {
    return {
      running: { status: 'Avoid', tip: 'Avoid strenuous outdoor exercise while AQI remains in this range.' },
      walking: { status: 'Caution', tip: 'Limit prolonged exposure and take appropriate precautions outdoors.' },
      cycling: { status: 'Avoid', tip: 'Avoid vigorous road cycling until conditions improve.' },
      children: { status: 'Avoid', tip: 'Reduce prolonged outdoor exposure for children and sensitive groups.' },
      ventilation: { status: 'Caution', tip: 'Use the analytics pages to identify lower-pollution windows.' },
    };
  }

  return {
    running: { status: 'Avoid', tip: 'Avoid strenuous outdoor exercise at this AQI level.' },
    walking: { status: 'Avoid', tip: 'Limit outdoor movement to essential trips.' },
    cycling: { status: 'Avoid', tip: 'Avoid outdoor cycling until conditions improve.' },
    children: { status: 'Avoid', tip: 'Reduce outdoor exposure for children and sensitive groups.' },
    ventilation: { status: 'Avoid', tip: 'Use the forecast and historical analytics to select a safer period.' },
  };
}

function statusClass(status: ActivityAdvice['status']) {
  if (status === 'Safe') return 'bg-white text-emerald-700 border border-[#e8e8e8]';
  if (status === 'Caution') return 'bg-[#ff682c]/10 text-[#ff682c]';
  return 'bg-[#202020] text-white';
}

function recordEntries(row: GenericRecord) {
  return Object.entries(row)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .slice(0, 8);
}

export default function CitizenDashboardPage() {
  const { user, updatePreferredStation } = useAuth();
  const [cities, setCities] = useState<CurrentCity[]>([]);
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [baselineRows, setBaselineRows] = useState<GenericRecord[]>([]);
  const [explainRows, setExplainRows] = useState<GenericRecord[]>([]);
  const [activityRows, setActivityRows] = useState<GenericRecord[]>([]);
  const [selectedActivity, setSelectedActivity] = useState('running');
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [geoLocating, setGeoLocating] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);
  const [locationStation, setLocationStation] = useState<LocationResult | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString('en-IN'));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!selectedCity || locationStation) return;

    const controller = new AbortController();
    const query = `city=${encodeURIComponent(selectedCity)}&limit=4`;

    Promise.all([
      optionalFetch<ApiEnvelope<GenericRecord[]>>(`/api/air/baseline?${query}`, controller.signal),
      optionalFetch<ApiEnvelope<GenericRecord[]>>(`/api/air/explain?${query}`, controller.signal),
    ]).then(([baseline, explain]) => {
      if (controller.signal.aborted) return;
      setBaselineRows(baseline?.data || []);
      setExplainRows(explain?.data || []);
    });

    return () => controller.abort();
  }, [locationStation, selectedCity]);

  const applyDashboardData = useCallback((data: DashboardData) => {
    setCities(data.cities);
    setForecast(data.forecast);
    setActivityRows(data.activity);
    setSelectedCity((current) =>
      data.cities.length && !data.cities.some((item) => item.city_name === current)
        ? data.cities[0].city_name
        : current
    );
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      applyDashboardData(await fetchDashboardData());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load AirSense data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [applyDashboardData]);

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboardData(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) applyDashboardData(data);
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Unable to load AirSense data.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [applyDashboardData]);

  const selected = useMemo(
    () => locationStation
      ? {
          city_name: locationStation.city || locationStation.station_name || 'Nearest station',
          pollution_date: '',
          aqi_estimate: locationStation.aqi ?? 0,
          aqi_category: locationStation.category || '',
          dominant_pollutant: locationStation.dominant_pollutant || '',
          pm25_24h_mean: locationStation.pm25_24h_mean,
          latitude: locationStation.latitude ?? 0,
          longitude: locationStation.longitude ?? 0,
        }
      : cities.find((item) => item.city_name === selectedCity) || cities[0] || null,
    [cities, locationStation, selectedCity]
  );

  const aqi = selected?.aqi_estimate ?? 0;
  const category = safeCategory(selected?.aqi_category, aqi);
  const pm25TwentyFourHourMean = selected
    ? pickNumber({ pm25_24h_mean: selected.pm25_24h_mean }, ['pm25_24h_mean'])
    : null;
  const advice = activityAdvice(aqi);

  const baselineForCity = useMemo(
    () => locationStation ? [] : baselineRows.filter((row) => {
      const city = pickString(row, ['city_name', 'city', 'location', 'city_name_x']);
      return !city || city === selectedCity;
    }),
    [baselineRows, locationStation, selectedCity]
  );

  const explainForCity = useMemo(
    () => locationStation ? [] : explainRows.filter((row) => {
      const city = pickString(row, ['city_name', 'city', 'location']);
      return !city || city === selectedCity;
    }),
    [explainRows, locationStation, selectedCity]
  );

  const historicalMean = pickNumber(baselineForCity[0], [
    'historical_mean',
    'historical_mean_aqi',
    'historical_baseline',
    'historical_station_mean',
    'historical_city_mean',
    'baseline_aqi',
  ]);

  const deviation = pickNumber(baselineForCity[0], [
    'deviation_pct',
    'deviation_percentage',
    'deviation_from_city_mean',
    'deviation',
  ]);

  const dominantPollutant =
    selected?.dominant_pollutant ||
    pickString(explainForCity[0], ['dominant_pollutant', 'pollutant', 'parameter_name']) ||
    'Unavailable';

  const chosenActivity = advice[selectedActivity] || advice.running;

  const handleUseMyLocation = () => {
    setGeoLocating(true);
    setGeoMessage(null);

    if (!navigator.geolocation) {
      setGeoMessage('Location access is not available in this browser.');
      setGeoLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const result = await apiFetch<LocationResult>(
            `/api/location/nearest-station?latitude=${coords.latitude}&longitude=${coords.longitude}`
          );

          if (!result.station_id || !result.station_name || typeof result.aqi !== 'number') {
            throw new Error('Nearest station response is missing its station reading.');
          }

          setLocationStation(result);
          setBaselineRows([]);
          setExplainRows([]);
          if (result.city) setSelectedCity(result.city);
          updatePreferredStation(String(result.station_id));
          setGeoMessage(
            `Showing nearest monitor: ${result.station_name}${result.city ? ` · ${result.city}` : ''}${
              typeof result.distance_km === 'number' ? ` · ${result.distance_km.toFixed(1)} km` : ''
            }`
          );
        } catch {
          setGeoMessage('Location was received, but the nearest monitored station could not be resolved.');
        } finally {
          setGeoLocating(false);
        }
      },
      () => {
        setGeoMessage('Location permission was denied. Choose a city manually.');
        setGeoLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const selectCity = (city: string) => {
    setLocationStation(null);
    setSelectedCity(city);
    setGeoMessage(null);
  };

  if (loading && !selected) {
    return (
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card-data-dashboard p-8 flex items-center gap-4">
          <RefreshCw className="w-5 h-5 text-[#ff682c] animate-spin" />
          <div>
            <div className="font-mono text-xs uppercase text-[#202020]">Loading AirSense intelligence</div>
            <div className="text-xs text-[#828282] mt-1">Reading persisted DWM and ML artifacts through FastAPI.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            Citizen Clean Air Portal
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em] mt-1">Personal Air Intelligence</h1>
          <p className="text-xs text-[#828282] font-sans mt-0.5">Real city-level analytical output served by the AirSense backend.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-sans text-[#202020] font-medium flex items-center gap-1.5 justify-end">
              <User className="w-3.5 h-3.5 text-[#ff682c]" />
              {user ? user.name : 'Citizen Guest'}
            </div>
            <div className="text-[10px] font-mono text-[#828282]">{currentTime}</div>
          </div>
          <DemoBadge label="REAL BACKEND DATA" />
          <button type="button" onClick={() => { setRefreshing(true); setError(null); void loadDashboard(); }} disabled={refreshing} className="btn-ghost-sharp text-xs font-mono py-1.5 px-3 flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-xs font-mono text-red-700 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="card-data-dashboard p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729]">Location & Context</div>
            <p className="text-xs text-[#828282] mt-1">Choose a real city-level record or resolve the nearest monitored station from your browser location.</p>
          </div>
          <button type="button" onClick={handleUseMyLocation} disabled={geoLocating} className="text-[#ff682c] hover:underline flex items-center gap-2 text-xs font-mono">
            <Navigation className="w-3.5 h-3.5" />
            {geoLocating ? 'Locating...' : 'Use My Current Location'}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {cities.slice(0, 10).map((city) => (
            <button key={city.city_name} type="button" onClick={() => selectCity(city.city_name)} className={`px-3 py-1.5 text-xs font-mono rounded-none ${!locationStation && selectedCity === city.city_name ? 'bg-[#202020] text-white font-medium' : 'bg-[#f5f5f5] text-[#4d4d4d] hover:bg-[#efefef]'}`}>
              {city.city_name}
            </button>
          ))}
          <select value={selectedCity} onChange={(event) => selectCity(event.target.value)} className="ml-auto bg-[#f5f5f5] border border-[#efefef] px-2 py-1.5 text-xs text-[#202020] font-mono rounded-none">
            {locationStation?.city && !cities.some((city) => city.city_name === locationStation.city) && (
              <option value={locationStation.city}>{locationStation.city} · nearest station</option>
            )}
            {cities.map((city) => <option key={city.city_name} value={city.city_name}>{city.city_name}</option>)}
          </select>
        </div>

        {geoMessage && <div className="p-3 bg-[#f5f5f5] border border-[#efefef] text-xs font-sans text-[#4d4d4d]">{geoMessage}</div>}
      </div>

      {selected && (
        <>
          <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-3 max-w-xl">
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c]">
                  {locationStation ? 'Nearest Station Reading' : 'Persisted City Reading'}
                </div>
                <h2 className="font-display font-normal text-2xl sm:text-3xl text-[#202020] tracking-[-0.02em]">Air Quality is <span className="font-medium">{category}</span> in {selected.city_name}</h2>
                <p className="text-xs sm:text-sm text-[#4d4d4d] font-sans leading-relaxed">{CPCB_AQI_CATEGORIES[category]?.healthStatement || 'AQI category returned by the AirSense analytical layer.'}</p>
                <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[#828282]">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-[#ff682c]" />{selected.city_name}</span>
                  {locationStation ? (
                    <>
                      <span>{locationStation.station_name}</span>
                      <span>{locationStation.distance_km?.toFixed(1) ?? '—'} km away</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#ff682c]" />{formatDate(selected.pollution_date)}</span>
                      <span>latest_city_air_quality.csv</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end p-5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric min-w-[220px]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#828282]">AQI Estimate</span>
                <div className="text-5xl font-mono text-[#202020] font-normal my-1">{Math.round(aqi)}</div>
                <AqiBadge category={category} size="md" />
                <div className="text-[10px] font-mono text-[#828282] mt-2 text-right">Dominant pollutant: <span className="text-[#202020] font-medium">{dominantPollutant}</span></div>
              </div>
            </div>

            <div className="p-4 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric">
              <div className="text-[10px] font-mono text-[#816729] uppercase tracking-wider font-medium">
                {locationStation ? 'Nearest station AQI reading' : 'What the current city dataset says'}
              </div>
              <div className="text-xs text-[#202020] font-sans mt-1">AQI <strong>{aqi.toFixed(1)}</strong> · Category <strong>{category}</strong> · Dominant pollutant <strong>{dominantPollutant}</strong></div>
            </div>
          </div>

          <HealthGuidance
            aqi={aqi}
            city={selected.city_name}
            pm25TwentyFourHourMean={pm25TwentyFourHourMean}
          />

          <PredictorWidget />


          <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#efefef] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">Daily Routine Planning</div>
                <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">Can I Exercise or Spend Time Outdoors?</h2>
              </div>
              <div className="text-xs font-mono text-[#828282]">Status: <span className="text-[#202020] font-medium">{chosenActivity.status}</span></div>
            </div>

            <div className="flex flex-wrap gap-2">
              {ACTIVITIES.map(([key, label]) => (
                <button key={key} type="button" onClick={() => setSelectedActivity(key)} className={`px-3 py-1.5 text-xs font-mono rounded-none ${selectedActivity === key ? 'bg-[#202020] text-white' : 'bg-[#f5f5f5] text-[#4d4d4d]'}`}>{label}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {ACTIVITIES.map(([key, label]) => (
                <button key={`${key}-card`} type="button" onClick={() => setSelectedActivity(key)} className={`text-left p-4 border bg-[#f5f5f5] card-asymmetric space-y-2 ${selectedActivity === key ? 'border-[#ff682c]' : 'border-[#efefef]'}`}>
                  <div className="flex justify-between items-center gap-2"><span className="font-sans text-xs font-medium text-[#202020]">{label}</span><span className={`px-2 py-0.5 text-[10px] font-mono font-medium ${statusClass(advice[key].status)}`}>{advice[key].status}</span></div>
                  <p className="text-[11px] text-[#4d4d4d] font-sans leading-relaxed">{advice[key].tip}</p>
                </button>
              ))}
            </div>

            <div className="p-4 border border-[#efefef] bg-white flex items-start gap-3">
              <Activity className="w-4 h-4 text-[#ff682c] mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-[10px] font-mono uppercase text-[#816729]">Selected activity</div>
                <div className="text-sm text-[#202020] mt-1">{ACTIVITIES.find(([key]) => key === selectedActivity)?.[1]}</div>
                <div className="text-xs text-[#4d4d4d] mt-1">{chosenActivity.tip}</div>
              </div>
            </div>

            {activityRows.length > 0 && (
              <div className="text-[10px] font-mono text-[#828282]">Activity analytics artifact available: {activityRows.length} records returned by the backend.</div>
            )}
          </div>

          <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
            <div className="border-b border-[#efefef] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">Model Output</div>
                <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">Stored 24-Point AQI Forecast</h2>
              </div>
              <span className="text-xs font-mono text-[#828282]">XGBoost artifact</span>
            </div>

            {locationStation ? (
              <div className="p-5 bg-[#f5f5f5] border border-[#efefef] text-xs text-[#828282]">
                The saved forecast is not associated with this nearest station, so it is hidden to avoid presenting another location&apos;s forecast as local.
              </div>
            ) : forecast.length === 0 ? (
              <div className="p-5 bg-[#f5f5f5] border border-[#efefef] text-xs text-[#828282]">Forecast data is not currently available from the backend.</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {forecast.filter((point) => [1, 3, 6, 12, 18, 24].includes(Number(point.horizon_hours))).map((point) => {
                    const pointCategory = safeCategory(point.aqi_category, point.predicted_aqi);
                    return (
                      <div key={point.horizon_hours} className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-3">
                        <div><div className="text-[10px] font-mono text-[#828282] uppercase">+{point.horizon_hours}h</div><div className="text-[10px] font-mono text-[#202020] mt-1">{formatDateTime(point.period_start)}</div></div>
                        <div><div className="text-2xl font-mono text-[#202020]">{Math.round(point.predicted_aqi)}</div><div className="text-[10px] font-mono text-[#ff682c] mt-0.5">{pointCategory}</div></div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-[#f5f5f5] border border-[#efefef] text-[10px] font-mono text-[#828282] space-y-1">
                  <div>Forecast artifact starts: {formatDateTime(forecast[0].period_start)}</div>
                  <div>Forecast artifact ends: {formatDateTime(forecast[forecast.length - 1].period_start)}</div>
                  <div>The timestamps above are displayed exactly as returned by the saved model output.</div>
                </div>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <div className="card-data-dashboard p-6 sm:p-8 space-y-5">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c]">Historical Context</div>
                <h3 className="font-display font-normal text-xl text-[#202020] tracking-[-0.01em] mt-1">Is this normal for {selected.city_name}?</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#f5f5f5] border border-[#efefef]"><div className="text-[10px] font-mono text-[#828282] uppercase">Current AQI</div><div className="text-2xl font-mono text-[#202020] mt-1">{aqi.toFixed(1)}</div></div>
                <div className="p-3 bg-[#f5f5f5] border border-[#efefef]"><div className="text-[10px] font-mono text-[#828282] uppercase">Baseline</div><div className="text-2xl font-mono text-[#202020] mt-1">{historicalMean === null ? '—' : historicalMean.toFixed(1)}</div></div>
              </div>

              {deviation !== null && <div className="text-xs font-mono text-[#4d4d4d]">Deviation: <span className="text-[#202020] font-medium">{deviation.toFixed(1)}</span></div>}

              <p className="text-xs text-[#4d4d4d] font-sans leading-relaxed">
                {locationStation
                  ? 'City-level historical baseline is not available for this station reading.'
                  : 'The baseline section is populated from the persisted AirSense analytical artifact when the backend returns a matching city record.'}
              </p>

              <Link href="/analytics" className="text-xs font-mono text-[#202020] link-ember-underline inline-flex items-center gap-2">Explore warehouse history <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>

            <div className="card-data-dashboard p-6 sm:p-8 space-y-5">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729]">Why is the air like this?</div>
                <h3 className="font-display font-normal text-xl text-[#202020] tracking-[-0.01em] mt-1">Dominant pollutant: {dominantPollutant}</h3>
              </div>

              {explainForCity.length > 0 ? (
                <div className="space-y-3">
                  {explainForCity.slice(0, 4).map((row, index) => (
                    <div key={index} className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                      {recordEntries(row).map(([key, value]) => (
                        <div key={key} className="flex justify-between gap-3 py-1 border-b border-[#e8e8e8] last:border-b-0">
                          <span className="text-[10px] font-mono text-[#828282]">{key.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] font-mono text-[#202020] text-right max-w-[65%] break-words">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#4d4d4d] font-sans leading-relaxed">The current city artifact exposes AQI and dominant pollutant. Additional explainability evidence is available on the Explain page when returned by the backend.</p>
              )}

              <Link href="/explain" className="text-xs font-mono text-[#202020] link-ember-underline inline-flex items-center gap-2">Open explainability workspace <ArrowRight className="w-3.5 h-3.5" /></Link>
            </div>
          </div>

          <div className="card-asymmetric p-6 bg-white border border-[#efefef] space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div>
                <div className="text-sm font-sans font-medium text-[#202020]">Analytical Evidence</div>
                <p className="text-xs text-[#828282] font-sans mt-1">Inspect the exact baseline and explainability fields returned by the backend.</p>
              </div>
              <button type="button" onClick={() => setShowDetails((value) => !value)} className="btn-ghost-sharp text-xs font-mono px-3 py-1.5 text-[#202020] flex items-center gap-1.5">
                {showDetails ? 'Hide Details' : 'Show Details'}
                {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5 text-[#ff682c]" />}
              </button>
            </div>

            {showDetails && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-3 border-t border-[#efefef]">
                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase text-[#816729]">Baseline Artifact</div>
                  {baselineForCity.length === 0 ? <div className="text-xs text-[#828282]">No baseline records returned.</div> : baselineForCity.slice(0, 4).map((row, index) => (
                    <div key={index} className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                      {recordEntries(row).map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-1 border-b border-[#e8e8e8] last:border-b-0"><span className="text-[10px] font-mono text-[#828282]">{key.replace(/_/g, ' ')}</span><span className="text-[10px] font-mono text-[#202020] text-right">{String(value)}</span></div>)}
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-mono uppercase text-[#816729]">Explainability Artifact</div>
                  {explainForCity.length === 0 ? <div className="text-xs text-[#828282]">No explainability records returned.</div> : explainForCity.slice(0, 4).map((row, index) => (
                    <div key={index} className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                      {recordEntries(row).map(([key, value]) => <div key={key} className="flex justify-between gap-3 py-1 border-b border-[#e8e8e8] last:border-b-0"><span className="text-[10px] font-mono text-[#828282]">{key.replace(/_/g, ' ')}</span><span className="text-[10px] font-mono text-[#202020] text-right max-w-[65%] break-words">{String(value)}</span></div>)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card-data-dashboard p-6 border border-[#efefef]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div>
                <div className="text-[10px] font-mono uppercase text-[#828282]">Backend data lineage</div>
                <div className="text-sm text-[#202020] mt-1">Colab artifact → FastAPI → Next.js</div>
                <div className="text-[10px] text-[#828282] font-mono mt-1 break-all">{API_BASE}</div>
              </div>
              <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                <span className="px-2.5 py-1 bg-[#f5f5f5] border border-[#e8e8e8]">latest_city_air_quality.csv</span>
                <span className="px-2.5 py-1 bg-[#f5f5f5] border border-[#e8e8e8]">aqi_forecast_next_24h.parquet</span>
                <span className="px-2.5 py-1 bg-[#f5f5f5] border border-[#e8e8e8]">DWM + ML</span>
              </div>
            </div>
          </div>

          <div className="card-asymmetric p-5 border border-[#efefef]">
            <div className="flex items-start gap-3">
              <Database className="w-4 h-4 text-[#816729] mt-0.5" />
              <div>
                <div className="text-[10px] font-mono uppercase text-[#816729]">Dataset timestamp</div>
                <div className="text-xs text-[#202020] mt-1">This city-level artifact is dated <strong>{formatDate(selected.pollution_date)}</strong>.</div>
                <p className="text-[10px] text-[#828282] font-sans mt-1 leading-relaxed">The UI displays the saved backend timestamp as returned instead of presenting it as a live sensor timestamp.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] border border-[#efefef] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
            <div>
              <div className="text-[10px] font-mono uppercase text-[#816729]">Real data connection</div>
              <div className="text-xs text-[#202020] mt-1">This page no longer reads AQI values or station readings from <code className="font-mono">mock-data.ts</code>.</div>
            </div>
          </div>
        </>
      )}

      <DisclaimerBanner />
    </div>
  );
}
