'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { AqiCategory } from '@/lib/api';
import { ALL_15_POLLUTANTS } from '@/lib/mock-data';

export default function AnalyticsPage() {
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedPollutant, setSelectedPollutant] = useState<string>('PM2.5');
  const [selectedSeason, setSelectedSeason] = useState<string>('All Seasons');
  const [selectedYearRange, setSelectedYearRange] = useState<string>('2015-2026');

  const cities = ['All Cities', 'Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Hyderabad', 'Kolkata', 'Chennai', 'Lucknow', 'Patna'];
  const seasons = ['All Seasons', 'Winter (Nov-Feb)', 'Summer (Mar-Jun)', 'Monsoon (Jul-Sep)', 'Post-Monsoon (Oct)'];

  const yearlyTrends = [
    { year: '2009', avg: 104.2, min: 38.0, max: 284.1 },
    { year: '2011', avg: 108.5, min: 41.2, max: 312.4 },
    { year: '2013', avg: 112.1, min: 44.5, max: 340.6 },
    { year: '2015', avg: 116.8, min: 46.2, max: 388.0 },
    { year: '2017', avg: 110.4, min: 42.1, max: 375.2 },
    { year: '2019', avg: 105.1, min: 39.8, max: 352.0 },
    { year: '2020', avg: 82.4, min: 28.5, max: 274.5 },
    { year: '2021', avg: 94.6, min: 34.2, max: 310.8 },
    { year: '2022', avg: 91.2, min: 32.0, max: 298.4 },
    { year: '2023', avg: 88.5, min: 31.4, max: 286.2 },
    { year: '2024', avg: 86.1, min: 29.8, max: 278.0 },
    { year: '2025', avg: 84.7, min: 28.9, max: 271.4 },
    { year: '2026', avg: 83.2, min: 27.5, max: 265.0 },
  ];

  const cityComparisonData = [
    { city: 'Delhi', avg_pm25: 148.6, avg_pm10: 236.4, avg_no2: 68.2, aqi_median: 285, status: 'Poor' },
    { city: 'Patna', avg_pm25: 136.2, avg_pm10: 218.0, avg_no2: 52.4, aqi_median: 264, status: 'Poor' },
    { city: 'Lucknow', avg_pm25: 126.8, avg_pm10: 198.5, avg_no2: 54.1, aqi_median: 242, status: 'Poor' },
    { city: 'Kolkata', avg_pm25: 88.2, avg_pm10: 142.1, avg_no2: 44.8, aqi_median: 168, status: 'Moderate' },
    { city: 'Mumbai', avg_pm25: 78.4, avg_pm10: 122.6, avg_no2: 42.5, aqi_median: 148, status: 'Moderate' },
    { city: 'Pune', avg_pm25: 64.9, avg_pm10: 104.2, avg_no2: 38.1, aqi_median: 128, status: 'Moderate' },
    { city: 'Hyderabad', avg_pm25: 56.4, avg_pm10: 92.8, avg_no2: 34.0, aqi_median: 112, status: 'Moderate' },
    { city: 'Bengaluru', avg_pm25: 46.5, avg_pm10: 78.2, avg_no2: 28.4, aqi_median: 92, status: 'Satisfactory' },
    { city: 'Chennai', avg_pm25: 44.8, avg_pm10: 74.5, avg_no2: 24.2, aqi_median: 88, status: 'Satisfactory' },
  ];

  const diurnalHours = [
    { hour: '00:00', val: 112, desc: 'Boundary layer collapse / Inversion' },
    { hour: '02:00', val: 124, desc: 'Nighttime thermal trapping' },
    { hour: '04:00', val: 132, desc: 'Peak early morning stagnation' },
    { hour: '06:00', val: 128, desc: 'Dawn transition' },
    { hour: '08:00', val: 148, desc: 'Morning traffic rush-hour emission' },
    { hour: '10:00', val: 122, desc: 'Solar heating begins convection' },
    { hour: '12:00', val: 86, desc: 'Boundary layer expansion / Dispersion' },
    { hour: '14:00', val: 68, desc: 'Diurnal minimum concentration' },
    { hour: '16:00', val: 74, desc: 'Afternoon vertical mixing' },
    { hour: '18:00', val: 105, desc: 'Evening rush hour traffic begins' },
    { hour: '20:00', val: 138, desc: 'Fleet movement + Surface cooling' },
    { hour: '22:00', val: 126, desc: 'Commercial heavy transport window' },
  ];

  const seasonalMetrics = [
    { season: 'Winter (Nov-Feb)', avg_aqi: 278, pm25: 164.2, char: 'Severe thermal inversion, biomass burning, and low surface wind speeds.' },
    { season: 'Summer (Mar-Jun)', avg_aqi: 142, pm25: 72.8, char: 'Strong thermal convection, high dispersion, elevated coarse dust PM10.' },
    { season: 'Monsoon (Jul-Sep)', avg_aqi: 68, pm25: 34.5, char: 'Precipitation scavenging and wet deposition cleans ambient air column.' },
    { season: 'Post-Monsoon (Oct)', avg_aqi: 198, pm25: 118.0, char: 'Wind stagnation, agricultural residue clearing, and falling nocturnal temperatures.' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Spatiotemporal Analytics
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Historical Air Analytics (2009–2026)
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="HISTORICAL WAREHOUSE DATA" />
          <Link
            href="/olap"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            OLAP Explorer →
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card-data-dashboard p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">City Scope</label>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
            style={{ borderRadius: '0px' }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">Target Pollutant</label>
          <select
            value={selectedPollutant}
            onChange={(e) => setSelectedPollutant(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
            style={{ borderRadius: '0px' }}
          >
            {ALL_15_POLLUTANTS.slice(0, 8).map((p) => (
              <option key={p.id} value={p.symbol}>{p.symbol} ({p.name})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">Seasonal Window</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
            style={{ borderRadius: '0px' }}
          >
            {seasons.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">Temporal Epoch</label>
          <select
            value={selectedYearRange}
            onChange={(e) => setSelectedYearRange(e.target.value)}
            className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
            style={{ borderRadius: '0px' }}
          >
            <option value="2015-2026">2015–2026 (Recent 11 Years)</option>
            <option value="2009-2026">2009–2026 (Full 17-Year Archive)</option>
            <option value="2020-2026">2020–2026 (Post-Lockdown Baseline)</option>
          </select>
        </div>
      </div>

      {/* MULTI-YEAR TREND */}
      <div className="card-data-dashboard p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#816729]">Longitudinal Observation</span>
            <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
              National {selectedPollutant} Multi-Year Trajectory (2009–2026)
            </h2>
          </div>
          <span className="font-mono text-xs text-[#828282]">
            Annual Station-Weighted Means
          </span>
        </div>

        {/* Minimal Editorial Column Chart */}
        <div className="h-64 w-full bg-[#f5f5f5] rounded-xl p-4 flex flex-col justify-between border border-[#e8e8e8]">
          <div className="flex justify-between text-[11px] font-mono text-[#828282] border-b border-[#e8e8e8] pb-1">
            <span>Peak Winter Envelope (Max: 388 µg/m³)</span>
            <span>Annual National Station Average</span>
            <span>Summer/Monsoon Baseline (Min: 27.5 µg/m³)</span>
          </div>

          <div className="grid grid-cols-13 gap-2 h-44 items-end pt-4">
            {yearlyTrends.map((yt) => {
              const heightPct = Math.round((yt.avg / 150) * 100);
              return (
                <div key={yt.year} className="flex flex-col items-center gap-1 group relative h-full justify-end">
                  <div className="w-full bg-[#e8e8e8] rounded-t h-full flex flex-col justify-end">
                    <div
                      className="w-full bg-[#202020] hover:bg-[#ff682c] rounded-t transition-colors"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-[#828282] group-hover:text-[#202020]">
                    &apos;{yt.year.slice(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-[#4d4d4d] flex flex-col sm:flex-row justify-between gap-2 pt-2 border-t border-[#efefef]">
          <span>
            Drop observed during 2020 industrial restrictions (82.4 µg/m³), with gradual stabilization post-2022.
          </span>
          <span className="font-mono text-[#828282] text-[11px]">
            196.5M Total Historical Observations
          </span>
        </div>
      </div>

      {/* CITY COMPARISON & SEASONAL DYNAMICS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* City Comparison Table */}
        <div className="lg:col-span-7 card-data-dashboard p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Spatial Contrast</span>
              <h2 className="text-lg text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                Metropolitan Air Quality Distribution
              </h2>
            </div>
            <span className="font-mono text-xs text-[#828282]">2009–2026 Aggregates</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table">
              <thead>
                <tr>
                  <th>City</th>
                  <th>PM2.5 (µg/m³)</th>
                  <th>PM10 (µg/m³)</th>
                  <th>NO2 (µg/m³)</th>
                  <th>Median AQI</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cityComparisonData.map((row) => (
                  <tr key={row.city}>
                    <td className="font-mono font-semibold text-[#202020]">{row.city}</td>
                    <td className="font-mono text-[#202020]">{row.avg_pm25}</td>
                    <td className="font-mono text-[#4d4d4d]">{row.avg_pm10}</td>
                    <td className="font-mono text-[#4d4d4d]">{row.avg_no2}</td>
                    <td className="font-mono text-[#202020] font-semibold">{row.aqi_median}</td>
                    <td>
                      <AqiBadge category={row.status as AqiCategory} showNumber={false} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Seasonal & Diurnal Analysis */}
        <div className="lg:col-span-5 space-y-6">
          <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-3">
            <span className="text-[11px] font-mono uppercase text-[#816729]">Climatic Dynamics</span>
            <h3 className="text-base text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
              Seasonal Air Quality Variation
            </h3>

            <div className="space-y-2.5 font-mono text-xs">
              {seasonalMetrics.map((sm) => (
                <div key={sm.season} className="p-3 bg-[#ffffff] border border-[#e8e8e8] rounded space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[#202020] font-semibold">{sm.season}</span>
                    <span className="text-[#202020]">AQI ~{sm.avg_aqi}</span>
                  </div>
                  <div className="text-[11px] text-[#816729]">Avg PM2.5: {sm.pm25} µg/m³</div>
                  <p className="font-sans text-[11px] text-[#4d4d4d] leading-normal pt-1">
                    {sm.char}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* 24-HOUR POLLUTION CLOCK */}
      <div className="card-data-dashboard p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#816729]">Boundary Layer Dynamics</span>
            <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
              24-Hour Diurnal Pollution Clock
            </h2>
          </div>
          <span className="font-mono text-xs text-[#828282]">
            Hour 00 to 23 IST
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 font-mono text-xs">
          {diurnalHours.map((dh) => {
            const isHigh = dh.val > 110;
            return (
              <div
                key={dh.hour}
                className="p-3 rounded border border-[#e8e8e8] bg-[#f5f5f5] flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center text-[#828282] text-[11px]">
                    <span className="text-[#202020] font-semibold">{dh.hour}</span>
                    <span className={isHigh ? 'text-[#ff682c] font-semibold' : 'text-[#816729]'}>
                      {dh.val} µg/m³
                    </span>
                  </div>
                  <div className="w-full bg-[#e8e8e8] h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full ${isHigh ? 'bg-[#ff682c]' : 'bg-[#202020]'}`}
                      style={{ width: `${(dh.val / 160) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-[#4d4d4d] font-sans mt-3 leading-tight">
                  {dh.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
