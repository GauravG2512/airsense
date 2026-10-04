'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Layers,
  Play,
  Pause,
  RotateCcw,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import {
  MONITORED_STATIONS,
  getStationAirReading,
  getStationForecast,
  ANOMALIES_SAMPLE,
} from '@/lib/mock-data';
import { CPCB_AQI_CATEGORIES } from '@/lib/api';

const AirSenseMap = dynamic(
  () => import('@/components/map/AirSenseMap').then((mod) => mod.AirSenseMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[550px] bg-[#f5f5f5] flex items-center justify-center font-mono text-xs text-[#828282] border border-[#e8e8e8]">
        Loading Cartographic Surface...
      </div>
    ),
  }
);

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState<
    'AQI' | 'PM2.5' | 'PM10' | 'NO2' | 'SO2' | 'O3' | 'Clusters' | 'Anomalies'
  >('AQI');
  const [selectedStationId, setSelectedStationId] = useState<string>('MH_001'); // BKC Mumbai
  const [surfaceMode, setSurfaceMode] = useState<'markers' | 'density'>('markers');

  // Pollution Replay state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [replayHour, setReplayHour] = useState<number>(19);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying) {
      timer = setInterval(() => {
        setReplayHour((prev) => (prev >= 23 ? 0 : prev + 1));
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const station =
    MONITORED_STATIONS.find((s) => s.station_id === selectedStationId) ||
    MONITORED_STATIONS[4];
  const reading = getStationAirReading(selectedStationId);
  const forecast = getStationForecast(selectedStationId);
  const anomaly = ANOMALIES_SAMPLE.find((a) => a.station_id === selectedStationId);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Geospatial Intelligence
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            National Monitoring Station Map
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="SIMULATION // STATION GEO-COORDINATES" />
          <Link
            href="/dashboard"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Citizen Dashboard →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Map Display and Controls (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Layer and Mode Toolbar */}
          <div className="card-data-dashboard p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[#828282] uppercase text-[10px] mr-1">Layer:</span>
              {(['AQI', 'PM2.5', 'PM10', 'NO2', 'SO2', 'O3', 'Clusters', 'Anomalies'] as const).map(
                (layer) => (
                  <button
                    key={layer}
                    onClick={() => setActiveLayer(layer)}
                    className={`px-3 py-1 rounded transition-colors ${
                      activeLayer === layer
                        ? 'bg-[#202020] text-white'
                        : 'bg-[#efefef] text-[#4d4d4d] hover:bg-[#e8e8e8]'
                    }`}
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {layer}
                  </button>
                )
              )}
            </div>

            <div className="flex items-center gap-1.5 border-l border-[#e8e8e8] pl-3">
              <span className="text-[#828282] uppercase text-[10px] mr-1">View:</span>
              <button
                onClick={() => setSurfaceMode('markers')}
                className={`px-3 py-1 rounded transition-colors ${
                  surfaceMode === 'markers'
                    ? 'bg-[#202020] text-white'
                    : 'bg-[#efefef] text-[#4d4d4d] hover:bg-[#e8e8e8]'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Stations
              </button>
              <button
                onClick={() => setSurfaceMode('density')}
                className={`px-3 py-1 rounded transition-colors ${
                  surfaceMode === 'density'
                    ? 'bg-[#202020] text-white'
                    : 'bg-[#efefef] text-[#4d4d4d] hover:bg-[#e8e8e8]'
                }`}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Footprint
              </button>
            </div>
          </div>

          {/* Map Surface */}
          <div className="relative border border-[#e8e8e8] rounded-2xl overflow-hidden h-[560px] bg-[#f5f5f5]">
            <AirSenseMap
              activeLayer={activeLayer}
              selectedStationId={selectedStationId}
              onSelectStation={(id) => setSelectedStationId(id)}
              replayHour={replayHour}
              surfaceMode={surfaceMode}
            />

            <div className="absolute bottom-3 left-3 z-[400] bg-[#ffffff]/95 px-3 py-1.5 rounded border border-[#e8e8e8] text-[11px] font-mono text-[#4d4d4d] pointer-events-none">
              {surfaceMode === 'density'
                ? 'Station-based footprint visualization (not continuous measured surface)'
                : 'Observed CAAQM Network Coordinates (XKDR Database)'}
            </div>
          </div>

          {/* POLLUTION REPLAY CONTROLLER */}
          <div className="card-data-dashboard p-6 space-y-4 font-mono text-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#ff682c]" />
                <span className="text-sm text-[#202020] font-normal" style={{ fontFamily: 'var(--font-heading)' }}>
                  Pollution Replay Scrubber (Diurnal Simulation)
                </span>
              </div>
              <span className="text-[11px] text-[#828282]">
                Hourly Temporal Dimension: {replayHour.toString().padStart(2, '0')}:00 IST
              </span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="btn-primary-sharp text-xs py-1.5 px-4"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-3.5 h-3.5 text-[#ff682c]" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-[#ff682c]" />
                    Play Replay
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setReplayHour(19);
                }}
                className="btn-ghost-sharp text-xs py-1.5 px-3"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset
              </button>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-[10px] text-[#828282]">00:00</span>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={replayHour}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setReplayHour(parseInt(e.target.value, 10));
                  }}
                  className="w-full accent-[#ff682c] cursor-pointer"
                />
                <span className="text-[10px] text-[#828282]">23:00</span>
              </div>
            </div>

            <p className="text-xs text-[#4d4d4d] font-sans leading-relaxed">
              Watch boundary layer dynamics cycle across India&apos;s monitoring network. 
              Mornings (08:00) and evenings (20:00) reflect rush-hour emissions and thermal inversion trapping.
            </p>
          </div>

          {/* CPCB Color Scale Legend */}
          <div className="card-asymmetric p-5 border border-[#e8e8e8] font-mono text-xs space-y-2">
            <div className="text-[10px] text-[#816729] uppercase font-sans font-medium">
              National CPCB Color Scale
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-[11px]">
              {(Object.keys(CPCB_AQI_CATEGORIES) as Array<keyof typeof CPCB_AQI_CATEGORIES>).map(
                (k) => {
                  const cat = CPCB_AQI_CATEGORIES[k];
                  return (
                    <div key={cat.category} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-[#4d4d4d] truncate">
                        {cat.category} ({cat.min}–{cat.max})
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>

        {/* Right Station Details Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card-data-dashboard p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#816729]">
                  Station Inspector
                </span>
                <h3 className="text-base text-[#202020] mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  {station.station_name}
                </h3>
                <div className="text-xs font-mono text-[#828282]">
                  {station.city}, {station.state}
                </div>
              </div>
              <AqiBadge category={reading.aqi_category} aqi={reading.aqi} size="sm" />
            </div>

            {/* Quick Metadata */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#f5f5f5] p-3 rounded-lg border border-[#e8e8e8]">
              <div>
                <span className="text-[10px] text-[#828282] uppercase">Station ID</span>
                <div className="text-[#202020] font-semibold">{station.station_id}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#828282] uppercase">Network</span>
                <div className="text-[#202020] font-semibold">{station.source}</div>
              </div>
              <div>
                <span className="text-[10px] text-[#828282] uppercase">Coordinates</span>
                <div className="text-[#4d4d4d]">{station.latitude}°, {station.longitude}°</div>
              </div>
              <div>
                <span className="text-[10px] text-[#828282] uppercase">Installed</span>
                <div className="text-[#4d4d4d]">{station.installation_year}</div>
              </div>
            </div>

            {/* Pollutants concentration list */}
            <div className="space-y-2">
              <div className="text-xs font-mono text-[#202020] uppercase font-semibold">
                Active Sensor Readings
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {reading.pollutants.map((p) => (
                  <div
                    key={p.pollutant_id}
                    className="p-2 border border-[#e8e8e8] rounded flex justify-between items-center bg-[#ffffff]"
                  >
                    <div>
                      <span className="font-semibold text-[#202020]">{p.symbol}</span>
                      <span className="text-[#828282] text-[10px] ml-1.5">Lim: {p.standard_cpcb_24h}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#202020] font-semibold">
                        {p.value} {p.unit}
                      </span>
                      <span className="text-[10px] text-[#828282] block">
                        Sub-idx: {p.sub_index}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Anomaly Check */}
            {anomaly ? (
              <div className="p-4 rounded border border-[#e8e8e8] bg-[#f5f5f5] text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 text-[#ff682c] font-semibold uppercase">
                  <AlertCircle className="w-4 h-4 text-[#ff682c]" />
                  Statistical Anomaly Flagged
                </div>
                <p className="text-[#4d4d4d] text-[11px] font-sans leading-normal">
                  {anomaly.evidence_summary}
                </p>
                <div className="text-[10px] text-[#816729] pt-1">
                  Method: {anomaly.detection_method} | Z-Score: {anomaly.z_score}σ
                </div>
              </div>
            ) : (
              <div className="p-3 rounded border border-[#e8e8e8] bg-[#f5f5f5] text-xs font-mono text-[#4d4d4d] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#816729]" />
                No statistical anomaly active for this station.
              </div>
            )}

            {/* 24h Forecast Preview */}
            <div className="space-y-2 pt-2 border-t border-[#efefef]">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#202020] font-semibold">24h Forecast Horizon</span>
                <span className="text-[#ff682c] text-[10px]">XGBoost</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 text-center font-mono text-xs">
                {forecast.slice(0, 4).map((fc) => (
                  <div key={fc.forecast_hour} className="p-1.5 border border-[#e8e8e8] rounded bg-[#f5f5f5]">
                    <div className="text-[10px] text-[#828282]">+{fc.forecast_hour}h</div>
                    <div className="text-[#202020] font-semibold">{fc.predicted_aqi}</div>
                    <div className="text-[9px] text-[#4d4d4d]">{fc.predicted_category}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/dashboard"
                className="btn-primary-sharp w-full text-xs py-2 text-center"
              >
                Open Full Station Dashboard →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
