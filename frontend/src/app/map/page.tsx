'use client';

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Search } from 'lucide-react';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { CPCB_AQI_CATEGORIES, getAqiCategory, getApiBaseUrl } from '@/lib/api';
import type { MapStation } from '@/lib/map-data';

const API_BASE = getApiBaseUrl();

const MAJOR_CITIES = new Set([
  'Ahmedabad',
  'Bengaluru',
  'Bhopal',
  'Chandigarh',
  'Chennai',
  'Delhi',
  'Faridabad',
  'Ghaziabad',
  'Gurugram',
  'Hyderabad',
  'Jaipur',
  'Kanpur',
  'Kolkata',
  'Lucknow',
  'Mumbai',
  'Nagpur',
  'Patna',
  'Pune',
  'Surat',
  'Visakhapatnam',
]);

const AirSenseMap = dynamic(
  () => import('@/components/map/AirSenseMap').then((mod) => mod.AirSenseMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-[#f5f5f5] flex items-center justify-center font-mono text-xs text-[#828282] border border-[#e8e8e8]">
        Loading station map...
      </div>
    ),
  }
);

type MapFilter = 'all' | 'major' | `city:${string}`;

async function requestStations(signal: AbortSignal): Promise<MapStation[]> {
  const response = await fetch(`${API_BASE}/api/air/map?limit=1000`, {
    cache: 'no-store',
    signal,
  });
  if (!response.ok) {
    throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
  }

  const result: { data?: MapStation[] } = await response.json();
  return Array.isArray(result.data)
    ? result.data.filter((station) =>
        station.station_id &&
        station.station_name &&
        station.city_name &&
        station.state_name &&
        Number.isFinite(station.latitude) &&
        Number.isFinite(station.longitude)
      )
    : [];
}

export default function MapPage() {
  const [stations, setStations] = useState<MapStation[]>([]);
  const [selectedStationId, setSelectedStationId] = useState('');
  const [activeLayer, setActiveLayer] = useState<'AQI' | 'Clusters'>('AQI');
  const [surfaceMode, setSurfaceMode] = useState<'markers' | 'density'>('markers');
  const [cityFilter, setCityFilter] = useState<MapFilter>('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    requestStations(controller.signal)
      .then((rows) => {
        if (controller.signal.aborted) return;
        setStations(rows);
        setSelectedStationId((current) => {
          if (rows.some((station) => station.station_id === current)) return current;
          return rows.find((station) => station.city_name.toLowerCase() === 'mumbai')?.station_id
            || rows[0]?.station_id
            || '';
        });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : `Unable to reach the AirSense API at ${API_BASE}.`
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reloadToken]);

  const cities = useMemo(
    () => [...new Set(stations.map((station) => station.city_name))].sort((a, b) => a.localeCompare(b)),
    [stations]
  );
  const states = useMemo(
    () => [...new Set(stations.map((station) => station.state_name))].sort((a, b) => a.localeCompare(b)),
    [stations]
  );
  const filteredStations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return stations.filter((station) => {
      const matchesCity = cityFilter === 'all'
        || (cityFilter === 'major' && MAJOR_CITIES.has(station.city_name))
        || (cityFilter.startsWith('city:') && station.city_name === cityFilter.slice(5));
      const matchesState = stateFilter === 'all' || station.state_name === stateFilter;
      const matchesQuery = !query
        || station.city_name.toLocaleLowerCase().includes(query)
        || station.station_name.toLocaleLowerCase().includes(query)
        || station.station_id.toLocaleLowerCase().includes(query);
      return matchesCity && matchesState && matchesQuery;
    });
  }, [cityFilter, search, stateFilter, stations]);

  const effectiveSelectedStationId = filteredStations.some(
    (station) => station.station_id === selectedStationId
  )
    ? selectedStationId
    : filteredStations[0]?.station_id || '';
  const selectedStation = filteredStations.find(
    (station) => station.station_id === effectiveSelectedStationId
  ) || null;
  const aqi = selectedStation?.aqi_estimate ?? null;
  const category = aqi === null
    ? null
    : getAqiCategory(aqi);

  const resetFilters = () => {
    setCityFilter('all');
    setStateFilter('all');
    setSearch('');
  };

  const selectCityFilter = (value: string) => {
    setCityFilter(value as MapFilter);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#ffffff]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Geospatial Intelligence
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1">
            National Monitoring Station Map
          </h1>
          <p className="text-xs text-[#828282] mt-2">
            {loading ? 'Loading monitored stations...' : `${filteredStations.length} of ${stations.length} stations shown`}
          </p>
        </div>
        <Link href="/dashboard" className="btn-ghost-sharp text-xs py-1.5 px-3">
          Citizen Dashboard →
        </Link>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs flex items-start justify-between gap-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(null);
              setReloadToken((current) => current + 1);
            }}
            className="underline whitespace-nowrap"
          >
            Retry
          </button>
        </div>
      )}

      <section className="card-data-dashboard p-4 sm:p-5 space-y-4" aria-label="Station filters">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          <label className="text-[11px] font-mono text-[#828282] uppercase">
            City group
            <select
              value={cityFilter}
              onChange={(event) => selectCityFilter(event.target.value)}
              className="mt-1 block w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-xs text-[#202020] normal-case"
            >
              <option value="all">All cities</option>
              <option value="major">Major cities</option>
              {cities.map((city) => (
                <option key={city} value={`city:${city}`}>{city}</option>
              ))}
            </select>
          </label>

          <label className="text-[11px] font-mono text-[#828282] uppercase">
            State or union territory
            <select
              value={stateFilter}
              onChange={(event) => setStateFilter(event.target.value)}
              className="mt-1 block w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-xs text-[#202020] normal-case"
            >
              <option value="all">All states</option>
              {states.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
          </label>

          <label className="text-[11px] font-mono text-[#828282] uppercase">
            Search city, station, or ID
            <span className="mt-1 flex items-center gap-2 bg-[#f5f5f5] border border-[#e8e8e8] px-2">
              <Search className="w-3.5 h-3.5" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. Delhi or Anand Vihar"
                className="min-w-0 w-full py-2 bg-transparent text-xs text-[#202020] normal-case outline-none"
              />
            </span>
          </label>

          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full sm:w-auto btn-ghost-sharp px-3 py-2 text-xs flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Everything
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#efefef] pt-3">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#828282] uppercase">Layer:</span>
            {(['AQI', 'Clusters'] as const).map((layer) => (
              <button
                key={layer}
                type="button"
                onClick={() => setActiveLayer(layer)}
                className={`px-3 py-1.5 ${activeLayer === layer ? 'bg-[#202020] text-white' : 'bg-[#f5f5f5] text-[#4d4d4d]'}`}
              >
                {layer === 'AQI' ? 'Air quality index' : 'K-means clusters'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#828282] uppercase">View:</span>
            {(['markers', 'density'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSurfaceMode(mode)}
                className={`px-3 py-1.5 capitalize ${surfaceMode === mode ? 'bg-[#202020] text-white' : 'bg-[#f5f5f5] text-[#4d4d4d]'}`}
              >
                {mode === 'markers' ? 'Stations' : 'Station footprints'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-3">
          <div className="relative isolate z-0 border border-[#e8e8e8] rounded-2xl overflow-hidden h-[560px] bg-[#f5f5f5]">
            {!loading && filteredStations.length > 0 && (
              <AirSenseMap
                activeLayer={activeLayer}
                selectedStationId={effectiveSelectedStationId}
                stations={filteredStations}
                onSelectStation={setSelectedStationId}
                surfaceMode={surfaceMode}
              />
            )}
            {!loading && filteredStations.length === 0 && !error && (
              <div className="h-full flex items-center justify-center text-sm text-[#828282]">
                No stations match these filters.
              </div>
            )}
            {loading && (
              <div className="h-full flex items-center justify-center font-mono text-xs text-[#828282]">
                Loading station records...
              </div>
            )}
            <div className="absolute bottom-3 left-3 z-[400] bg-white/95 px-3 py-1.5 rounded border border-[#e8e8e8] text-[11px] font-mono text-[#4d4d4d] pointer-events-none">
              {activeLayer === 'AQI'
                ? 'Station AQI snapshot · CPCB category colors'
                : 'K-means cluster assignment from station analytics'}
            </div>
          </div>
          {surfaceMode === 'density' && (
            <p className="text-[11px] text-[#828282]">
              Footprints show a 45 km radius around each station; they are not an interpolated pollution surface.
            </p>
          )}
        </div>

        <aside className="lg:col-span-4 card-data-dashboard p-6 space-y-5" aria-live="polite">
          <div className="border-b border-[#efefef] pb-3">
            <div className="text-[10px] font-mono uppercase text-[#816729]">Selected station</div>
            <h2 className="text-lg text-[#202020] mt-1">
              {selectedStation?.station_name || 'No station selected'}
            </h2>
            {selectedStation && (
              <div className="text-xs font-mono text-[#828282] mt-1">
                {selectedStation.city_name}, {selectedStation.state_name}
              </div>
            )}
          </div>

          {selectedStation && (
            <>
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-mono uppercase text-[#828282]">AQI estimate</span>
                {category && <AqiBadge category={category} aqi={aqi ?? undefined} size="sm" />}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#828282] uppercase">Station ID</div>
                  <div className="text-[#202020] font-semibold mt-1 break-all">{selectedStation.station_id}</div>
                </div>
                <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#828282] uppercase">Dominant pollutant</div>
                  <div className="text-[#202020] font-semibold mt-1">{selectedStation.dominant_pollutant || 'Unavailable'}</div>
                </div>
                <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#828282] uppercase">Latitude</div>
                  <div className="text-[#202020] mt-1">{selectedStation.latitude.toFixed(5)}°</div>
                </div>
                <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8]">
                  <div className="text-[10px] text-[#828282] uppercase">Longitude</div>
                  <div className="text-[#202020] mt-1">{selectedStation.longitude.toFixed(5)}°</div>
                </div>
              </div>

              <div className="p-4 border border-[#efefef] text-xs text-[#4d4d4d]">
                <div className="text-[10px] font-mono uppercase text-[#816729] mb-2">Station clusters</div>
                <div>K-means: {selectedStation.kmeans_cluster ?? 'Unavailable'}</div>
                <div>Hierarchical: {selectedStation.hierarchical_cluster ?? 'Unavailable'}</div>
                <div>DBSCAN: {selectedStation.dbscan_cluster ?? 'Unavailable'}</div>
              </div>
            </>
          )}

          {category && (
            <div className="p-3 bg-[#f5f5f5] border border-[#efefef] text-xs text-[#4d4d4d]">
              {CPCB_AQI_CATEGORIES[category as keyof typeof CPCB_AQI_CATEGORIES]?.healthStatement}
            </div>
          )}
          <p className="text-[10px] text-[#828282] font-mono">
            Station coordinates and AQI estimates are loaded from the AirSense station map API.
          </p>
        </aside>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
