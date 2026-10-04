'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  Table,
  FileCode,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { executeOLAPQuery } from '@/lib/mock-data';

export default function OlapPage() {
  const [measure, setMeasure] = useState<string>('avg_pm25');
  const [dimension, setDimension] = useState<string>('Time');
  const [hierarchy, setHierarchy] = useState<string>('Month');
  const [operation, setOperation] = useState<string>('Roll-up');
  const [filterCity, setFilterCity] = useState<string>('All Cities');

  const result = executeOLAPQuery(measure, dimension, hierarchy, operation, filterCity);

  const pivotCities = ['Delhi', 'Mumbai', 'Bengaluru', 'Pune', 'Kolkata'];
  const pivotMonths = ['Jan', 'Apr', 'Jul', 'Oct'];
  const pivotMatrix: Record<string, Record<string, number>> = {
    Delhi: { Jan: 184.2, Apr: 88.5, Jul: 42.1, Oct: 148.6 },
    Mumbai: { Jan: 92.4, Apr: 64.1, Jul: 28.5, Oct: 84.2 },
    Bengaluru: { Jan: 52.8, Apr: 44.2, Jul: 22.4, Oct: 48.0 },
    Pune: { Jan: 76.2, Apr: 58.0, Jul: 26.8, Oct: 68.4 },
    Kolkata: { Jan: 112.5, Apr: 72.8, Jul: 34.0, Oct: 96.2 },
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Multidimensional Cube Workspace
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            OLAP Explorer
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="SIMULATION // WAREHOUSE SQL PREVIEW" />
          <Link
            href="/warehouse"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Inspect Schemas →
          </Link>
        </div>
      </div>

      {/* Cube Concept Banner */}
      <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-2">
        <div className="font-mono text-[#816729] text-[11px] uppercase font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#202020]" />
          3D Multidimensional Cube Architecture: Time × Location × Pollutant
        </div>
        <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
          This explorer models the primary warehouse cube aggregated from 196.5M hourly readings. 
          Use the operational controls below to execute <strong>Roll-up</strong>, <strong>Drill-down</strong>, 
          <strong>Slice</strong>, <strong>Dice</strong>, and <strong>Pivot</strong> queries across dimensional hierarchies.
        </p>
      </div>

      {/* OLAP Operational Controls */}
      <div className="card-data-dashboard p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          
          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">1. Target Measure</label>
            <select
              value={measure}
              onChange={(e) => setMeasure(e.target.value)}
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{ borderRadius: '0px' }}
            >
              <option value="avg_pm25">Average PM2.5 (µg/m³)</option>
              <option value="max_pm25">Maximum PM2.5 (µg/m³)</option>
              <option value="avg_pm10">Average PM10 (µg/m³)</option>
              <option value="avg_no2">Average NO2 (µg/m³)</option>
              <option value="avg_so2">Average SO2 (µg/m³)</option>
              <option value="avg_co">Average CO (mg/m³)</option>
              <option value="aqi">CPCB AQI Index</option>
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">2. Dimension Axis</label>
            <select
              value={dimension}
              onChange={(e) => {
                const newDim = e.target.value;
                setDimension(newDim);
                if (newDim === 'Time') setHierarchy('Month');
                else if (newDim === 'Location') setHierarchy('City');
                else setHierarchy('Specific Pollutant');
              }}
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{ borderRadius: '0px' }}
            >
              <option value="Time">Dim_Time</option>
              <option value="Location">Dim_Location / Station</option>
              <option value="Pollutant">Dim_Pollutant</option>
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">3. Hierarchy Granularity</label>
            <select
              value={hierarchy}
              onChange={(e) => setHierarchy(e.target.value)}
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{ borderRadius: '0px' }}
            >
              {dimension === 'Time' ? (
                <>
                  <option value="Year">Year (Highest Roll-up)</option>
                  <option value="Month">Month (Seasonal)</option>
                  <option value="Hour">Hour (Diurnal Drill-down)</option>
                </>
              ) : dimension === 'Location' ? (
                <>
                  <option value="State">State Level (Roll-up)</option>
                  <option value="City">City Level (Standard)</option>
                  <option value="Station">Station Site (Drill-down)</option>
                </>
              ) : (
                <>
                  <option value="Group">Pollutant Group</option>
                  <option value="Specific Pollutant">Specific Parameter</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">4. OLAP Operation</label>
            <select
              value={operation}
              onChange={(e) => {
                const op = e.target.value;
                setOperation(op);
                if (op === 'Roll-up') {
                  setDimension('Time');
                  setHierarchy('Year');
                } else if (op === 'Drill-down') {
                  setDimension('Time');
                  setHierarchy('Hour');
                } else if (op === 'Slice') {
                  setDimension('Pollutant');
                  setHierarchy('Specific Pollutant');
                } else if (op === 'Dice') {
                  setDimension('Location');
                  setHierarchy('City');
                }
              }}
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] font-semibold focus:outline-none"
              style={{ borderRadius: '0px' }}
            >
              <option value="Roll-up">Roll-up (Climb Hierarchy)</option>
              <option value="Drill-down">Drill-down (Expand Grain)</option>
              <option value="Slice">Slice (Fixed Value)</option>
              <option value="Dice">Dice (Subcube Selection)</option>
              <option value="Pivot">Pivot (Matrix Rotation)</option>
            </select>
          </div>

        </div>

        <div className="flex items-center justify-between text-xs font-mono bg-[#f5f5f5] p-3 rounded border border-[#e8e8e8]">
          <div>
            <span className="text-[#828282] uppercase">Operation Context:</span>{' '}
            <strong className="text-[#202020]">
              {operation === 'Roll-up' && 'Roll-up: Station → City → State | Day → Month → Year'}
              {operation === 'Drill-down' && 'Drill-down: Year → Month → Day → Hour (Fine Hourly Grain)'}
              {operation === 'Slice' && 'Slice: Fixing Pollutant = PM2.5 across all dimensions'}
              {operation === 'Dice' && 'Dice: Subcube [Mumbai + Pune] × [2024-2026] × [PM2.5 + PM10]'}
              {operation === 'Pivot' && 'Pivot: Rotating Dimension Axes (Cities × Calendar Quarters Matrix)'}
            </strong>
          </div>
          <span className="text-[11px] text-[#816729]">PostgreSQL Fact Constellation</span>
        </div>
      </div>

      {/* Results and Generated SQL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: OLAP Result Grid */}
        <div className="lg:col-span-7 card-data-dashboard p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Result Set</span>
              <h2 className="text-lg text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                {operation === 'Pivot' ? 'Cross-Tabulation Matrix (Cities × Quarters)' : `Aggregated Dimensions (${dimension} : ${hierarchy})`}
              </h2>
            </div>
            <span className="font-mono text-xs text-[#828282]">
              {operation === 'Pivot' ? '5 Cities × 4 Seasons' : `${result.records.length} Summary Records`}
            </span>
          </div>

          {operation === 'Pivot' ? (
            <div className="overflow-x-auto">
              <table className="w-full editorial-table">
                <thead>
                  <tr>
                    <th>City / Metric ({measure})</th>
                    {pivotMonths.map((m) => (
                      <th key={m}>{m} Quarter</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pivotCities.map((city) => (
                    <tr key={city}>
                      <td className="font-mono font-semibold text-[#202020]">{city}</td>
                      {pivotMonths.map((m) => {
                        const val = pivotMatrix[city][m];
                        return (
                          <td key={m} className="font-mono text-[#202020]">
                            {val} µg/m³
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full editorial-table">
                <thead>
                  <tr>
                    {result.dimensions.map((dim) => (
                      <th key={dim}>{dim}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.records.map((row, idx) => (
                    <tr key={idx}>
                      {result.dimensions.map((dim) => (
                        <td key={dim} className="font-mono text-xs">
                          {row[dim]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="text-[11px] font-mono text-[#828282] pt-2 flex justify-between">
            <span>Source: {result.execution_source}</span>
            <span>Latency SLA: &lt;3.0 seconds</span>
          </div>
        </div>

        {/* Right Side: Generated SQL */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-[#202020] text-white rounded-xl space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center border-b border-[#333333] pb-2 text-[10px] text-[#828282] uppercase">
              <span className="flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-[#ff682c]" />
                Generated Warehouse SQL Query
              </span>
              <span className="text-[#ff682c]">GROUP BY ROLLUP</span>
            </div>

            <pre className="text-[11px] text-[#ebe6dd] whitespace-pre-wrap overflow-x-auto leading-relaxed p-3 bg-[#111111] rounded border border-[#333333]">
              {operation === 'Pivot'
                ? `SELECT * FROM CROSSTAB(
  'SELECT ds.city, dt.quarter, AVG(f.avg_pm25)
   FROM fact_air_daily f
   JOIN dim_station ds ON f.station_id = ds.station_id
   JOIN dim_time dt ON f.time_id = dt.time_id
   GROUP BY ds.city, dt.quarter
   ORDER BY 1, 2'
) AS ct(city text, Q1 numeric, Q2 numeric, Q3 numeric, Q4 numeric);`
                : result.generated_sql}
            </pre>

            <div className="text-[10px] text-[#828282] pt-1 font-sans">
              Queries use PostgreSQL materialized views to avoid full scans over 196.5M measurements.
            </div>
          </div>

          <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-2 text-xs">
            <div className="font-mono text-[#816729] uppercase font-semibold">
              Cube Operation Rules
            </div>
            <ul className="space-y-1 text-[#4d4d4d] font-sans">
              <li>• <strong>Roll-up:</strong> Moves up hierarchy (Hour → Day → Month → Year).</li>
              <li>• <strong>Drill-down:</strong> Navigates from summary to atomic granularities.</li>
              <li>• <strong>Slice:</strong> Selects a 2D sub-plane by fixing one dimension.</li>
              <li>• <strong>Dice:</strong> Selects a subcube by filtering two or more dimensions.</li>
              <li>• <strong>Pivot:</strong> Rotates axes for cross-tabulation.</li>
            </ul>
          </div>
        </div>

      </div>

      <DisclaimerBanner />
    </div>
  );
}
