'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { PredictorWidget } from '@/components/dashboard/PredictorWidget';
import { CPCB_AQI_CATEGORIES, getAqiCategory } from '@/lib/api';


const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

type CitySnapshot = {
  city_name: string;
  pollution_date: string;
  aqi_estimate: number;
  aqi_category: string;
  dominant_pollutant: string;
};

type OlapResult = {
  source_file: string;
  columns: string[];
  data: Array<Record<string, string | number | null>>;
};

type OlapState = {
  operation: 'Roll-up' | 'Drill-down' | 'Slice' | 'Dice' | 'Pivot';
  result?: OlapResult;
  error?: string;
};

export default function HomePage() {
  const [citySnapshots, setCitySnapshots] = useState<CitySnapshot[]>([]);
  const [selectedHeroCity, setSelectedHeroCity] = useState('Mumbai');
  const [snapshotError, setSnapshotError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/air/current?limit=1000`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
        }
        return response.json() as Promise<{ data?: CitySnapshot[] }>;
      })
      .then((result) => {
        if (controller.signal.aborted) return;
        const rows = Array.isArray(result.data) ? result.data : [];
        setCitySnapshots(rows);
        if (rows.length) {
          setSelectedHeroCity((current) =>
            rows.some((row) => row.city_name === current) ? current : rows[0].city_name
          );
        }
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setSnapshotError(
            requestError instanceof Error
              ? requestError.message
              : `Unable to reach the AirSense API at ${API_BASE}.`
          );
        }
      });
    return () => controller.abort();
  }, []);

  const currentReading = citySnapshots.find((row) => row.city_name === selectedHeroCity);
  const currentAqi = currentReading ? Number(currentReading.aqi_estimate) : null;
  const currentCategory = currentAqi === null ? null : getAqiCategory(currentAqi);

  // OLAP preview controls
  const [olapOp, setOlapOp] = useState<'Roll-up' | 'Drill-down' | 'Slice' | 'Dice' | 'Pivot'>('Roll-up');
  const [olapState, setOlapState] = useState<OlapState | null>(null);
  const olapLoading = !olapState || olapState.operation !== olapOp;
  const olapResult = olapState?.operation === olapOp ? olapState.result || null : null;
  const olapError = olapState?.operation === olapOp ? olapState.error || null : null;

  useEffect(() => {
    const controller = new AbortController();
    const operation = olapOp.toLowerCase().replace('-', '');
    fetch(`${API_BASE}/api/olap?operation=${operation}&limit=20`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
        }
        return response.json() as Promise<OlapResult>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setOlapState({ operation: olapOp, result });
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setOlapState({
            operation: olapOp,
            error: requestError instanceof Error
              ? requestError.message
              : `Unable to reach the AirSense API at ${API_BASE}.`,
          });
        }
      });
    return () => controller.abort();
  }, [olapOp]);

  return (
    <div className="space-y-20 pb-24 bg-[#ffffff]">
      
      {/* ========================================================================= */}
      {/* HERO SECTION: Editorial 2-Column Split on White Canvas */}
      {/* ========================================================================= */}
      <section className="pt-12 sm:pt-16 pb-12 max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: 66px Whisper-weight Display Headline & Dual Sharp Buttons */}
          <div className="lg:col-span-6 space-y-6">
            <div className="editorial-tag bg-[#efefef] text-[#202020] border border-[#e8e8e8]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
              <span>CITIZEN OBSERVATORY</span>
            </div>

            <div className="space-y-4">
              <h1
                className="text-4xl sm:text-5xl lg:text-[62px] text-[#202020] leading-[0.93] tracking-[-1.32px] font-normal"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Air quality intelligence on paper.
              </h1>
              <p className="text-[17px] sm:text-[18px] text-[#4d4d4d] leading-[1.3] font-normal max-w-xl">
                AirSense transforms 196.5 million historical hourly observations into clear environmental intelligence. 
                Coupling big-data DuckDB preprocessing, a PostgreSQL Fact Constellation, multidimensional OLAP cubes, 
                and XGBoost predictive modeling.
              </p>
            </div>

            {/* Architectural Workflow Note */}
            <div className="card-asymmetric p-5 border border-[#e8e8e8] font-mono text-xs space-y-1.5 text-[#4d4d4d]">
              <div className="text-[10px] uppercase text-[#816729] font-sans font-medium tracking-wider">
                Engineering Ingestion Pipeline
              </div>
              <div className="text-[#202020] font-sans text-xs">
                196.5M Historical Observations → Air Quality Analysis → Forecasts → Citizen Action
              </div>
            </div>

            {/* Dual CTA Button Stack: Sharp 0px Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/dashboard" className="btn-primary-sharp">
                Citizen Dashboard
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link href="/warehouse" className="btn-ghost-sharp">
                Inspect Data Warehouse
              </Link>
              <Link href="/map" className="btn-ghost-sharp">
                National Map
              </Link>
            </div>

            {/* Micro Statistics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#efefef] text-xs font-mono">
              <div>
                <div className="text-[10px] uppercase text-[#828282]">Total Grain</div>
                <div className="text-[#202020] text-sm mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  196.5M Readings
                </div>
                <div className="text-[#828282] text-[10px]">XKDR India Repo</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#828282]">Stations</div>
                <div className="text-[#202020] text-sm mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  558 Monitors
                </div>
                <div className="text-[#828282] text-[10px]">CPCB + US Embassy</div>
              </div>
              <div>
                <div className="text-[10px] uppercase text-[#828282]">Span</div>
                <div className="text-[#202020] text-sm mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                  2009–2026
                </div>
                <div className="text-[#828282] text-[10px]">17-Year Archive</div>
              </div>
            </div>
          </div>

          {/* Right Column: Floating Data Dashboard Card (20px radius, white surface) */}
          <div className="lg:col-span-6 card-data-dashboard p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#ff682c]" />
                <span
                  className="text-sm text-[#202020] font-normal"
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  Observatory Live Snapshot
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase text-[#828282]">Persisted City Reading</span>
            </div>

            {/* City snapshot selector */}
            <div className="flex items-center justify-between text-xs font-mono">
              <label htmlFor="hero-select" className="text-[#828282] text-[11px]">
                City:
              </label>
              <select
                id="hero-select"
                value={selectedHeroCity}
                onChange={(e) => setSelectedHeroCity(e.target.value)}
                className="bg-[#f5f5f5] border border-[#e8e8e8] text-[#202020] px-2.5 py-1 text-xs focus:outline-none"
                style={{ borderRadius: '0px' }}
                disabled={!citySnapshots.length}
              >
                {citySnapshots.map((snapshot) => (
                  <option key={snapshot.city_name} value={snapshot.city_name}>
                    {snapshot.city_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Large Number AQI Box */}
            <div className="p-6 bg-[#f5f5f5] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {currentReading ? (
                <>
                  <div>
                    <div className="text-[11px] font-mono text-[#828282] uppercase tracking-wider">
                      Persisted AQI snapshot · {currentReading.city_name}
                    </div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span
                        className="text-5xl font-normal text-[#202020] tracking-tight"
                        style={{ fontFamily: 'var(--font-heading)' }}
                      >
                        {Math.round(currentReading.aqi_estimate)}
                      </span>
                      {currentCategory && <AqiBadge category={currentCategory} showNumber={false} size="md" />}
                    </div>
                    <div className="text-xs text-[#4d4d4d] mt-1 font-sans">
                      Dominant pollutant: <strong className="text-[#202020]">{currentReading.dominant_pollutant}</strong>
                    </div>
                  </div>
                  <div className="sm:border-l sm:border-[#e8e8e8] sm:pl-5 text-right font-mono text-xs space-y-1">
                    <div className="text-[10px] text-[#828282] uppercase">Saved reading date</div>
                    <div className="text-[#202020] font-medium font-sans">{currentReading.pollution_date}</div>
                    <div className="text-[10px] text-[#828282] uppercase pt-1">AQI estimate</div>
                    <div className="text-[#4d4d4d] text-[11px]">{currentReading.aqi_estimate.toFixed(1)}</div>
                  </div>
                </>
              ) : (
                <div className="text-xs text-[#828282]">
                  {snapshotError || 'Loading persisted city readings...'}
                </div>
              )}
            </div>

            <div className="p-4 bg-[#f5f5f5] rounded-xl text-xs text-[#4d4d4d] font-sans">
              This view uses the backend&apos;s saved city-level air quality records. Open the station map for station-level readings and coordinates.
            </div>

            <div className="text-[11px] text-[#828282] flex justify-between items-center pt-1 font-mono">
              <span>Source: persisted AirSense city dataset</span>
              <Link href="/dashboard" className="link-ember-underline text-[#202020]">
                Full Citizen View →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* REPOSITORY ATTRIBUTION STRIP (White canvas with Brass caption) */}
      {/* ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 border-y border-[#efefef] py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs text-[#828282]">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#816729] font-sans font-medium uppercase tracking-wider">
              PRIMARY DATA REPOSITORY
            </span>
            <span className="text-[#202020] font-sans font-medium">XKDR India Air Quality Database (2026)</span>
          </div>
          <div className="flex items-center gap-6">
            <span>CPCB CAAQM Network</span>
            <span>•</span>
            <span>US Dept of State via AirNow</span>
            <span>•</span>
            <span className="text-[#ff682c]">CC BY 4.0 License</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* AI AQI PREDICTION SECTION */}
      {/* ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <PredictorWidget />
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: 6-STAGE PIPELINE (Ash Surface Band) */}
      {/* ========================================================================= */}
      <section className="bg-[#efefef] py-20">

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#e8e8e8] pb-4">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#816729] tracking-wider font-medium">
                System Workflow
              </div>
              <h2
                className="text-3xl text-[#202020] mt-1 font-normal tracking-[-0.02em]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                196.5M observations to citizen intelligence.
              </h2>
            </div>
            <span className="font-mono text-xs text-[#828282]">
              DuckDB → PostgreSQL → FastAPI → Next.js
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                num: '01',
                title: 'Data Ingestion',
                sub: 'Raw Parquet Lake',
                desc: '196.5M hourly readings from 558 stations. DuckDB predicate pushdown and temporal cleaning.',
                href: '/pipeline',
              },
              {
                num: '02',
                title: 'Data Warehouse',
                sub: 'Fact Constellation',
                desc: 'PostgreSQL atomic measurements & daily aggregates. Dim_Time, Station, Location, Pollutant, Source.',
                href: '/warehouse',
              },
              {
                num: '03',
                title: 'OLAP Engine',
                sub: 'Multidimensional Cubes',
                desc: 'Roll-up, Drill-down, Slice, Dice, and Pivot across temporal and geographical hierarchies.',
                href: '/olap',
              },
              {
                num: '04',
                title: 'Data Mining',
                sub: 'Patterns & Outliers',
                desc: 'Station clustering (K-Means/DBSCAN), Anomaly detection (IQR/Z-score/Isolation Forest), and PCA.',
                href: '/datamining',
              },
              {
                num: '05',
                title: 'Machine Learning',
                sub: 'Forecasting & Class.',
                desc: 'XGBoost regressor for +1h to +24h forecasting, 6-class CPCB categorization, and SHAP explainability.',
                href: '/models',
              },
              {
                num: '06',
                title: 'Citizen Intel',
                sub: 'Decision Support',
                desc: 'Plain-language diagnostics: Why is my air bad? Is this normal? Activity planning and station routing.',
                href: '/dashboard',
              },
            ].map((step) => (
              <Link
                key={step.num}
                href={step.href}
                className="card-asymmetric p-6 bg-[#ffffff] border border-[#e8e8e8] flex flex-col justify-between hover:border-[#202020] transition-colors"
              >
                <div>
                  <div className="font-mono text-xs text-[#816729] font-medium flex justify-between items-center">
                    <span>STAGE {step.num}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
                  </div>
                  <h3
                    className="text-xl text-[#202020] mt-3 font-normal"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    {step.title}
                  </h3>
                  <div className="text-xs font-mono text-[#828282] mt-1">{step.sub}</div>
                  <p className="text-xs text-[#4d4d4d] leading-relaxed mt-3 font-sans">
                    {step.desc}
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#efefef] text-[11px] font-mono text-[#202020] flex items-center gap-1">
                  Inspect Stage →
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: THE WAREHOUSE & OLAP CUBES (White Canvas) */}
      {/* ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 border-b border-[#efefef] pb-4">
          <div>
            <div className="text-[11px] font-mono uppercase text-[#816729] tracking-wider font-medium">
              Data Architecture
            </div>
            <h2
              className="text-3xl text-[#202020] mt-1 font-normal tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              PostgreSQL Fact Constellation &amp; OLAP Cubes
            </h2>
          </div>
          <Link href="/warehouse" className="link-ember-underline font-mono text-xs text-[#202020]">
            Full Schema Specifications →
          </Link>
        </div>

        {/* Fact Constellation Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-mono text-xs">
          <div className="card-asymmetric p-6 border border-[#e8e8e8] bg-[#efefef] space-y-3">
            <div className="flex justify-between items-center border-b border-[#e8e8e8] pb-2">
              <span className="font-sans font-semibold text-[#202020]">FACT 1: Fact_Air_Measurement</span>
              <span className="text-[10px] text-[#828282]">Hourly Atomic Grain</span>
            </div>
            <div className="text-[#4d4d4d] text-[11px]">
              Grain: 1 pollutant measurement / station / timestamp.
            </div>
            <div className="p-4 bg-[#ffffff] rounded border border-[#e8e8e8] space-y-1 text-[11px]">
              <div><span className="text-[#828282]">PK:</span> measurement_id (BIGINT)</div>
              <div><span className="text-[#828282]">FKs:</span> time_id, station_id, location_id, pollutant_id, source_id</div>
              <div><span className="text-[#202020] font-semibold">Measure:</span> measurement_value (NUMERIC)</div>
            </div>
            <p className="text-xs text-[#4d4d4d] font-sans leading-normal">
              Maintains atomic observational integrity for feature engineering and raw outlier validation.
            </p>
          </div>

          <div className="card-asymmetric p-6 border border-[#e8e8e8] bg-[#efefef] space-y-3">
            <div className="flex justify-between items-center border-b border-[#e8e8e8] pb-2">
              <span className="font-sans font-semibold text-[#202020]">FACT 2: Fact_Air_Daily</span>
              <span className="text-[10px] text-[#828282]">Daily Summary Grain</span>
            </div>
            <div className="text-[#4d4d4d] text-[11px]">
              Grain: 1 station × 1 calendar day.
            </div>
            <div className="p-4 bg-[#ffffff] rounded border border-[#e8e8e8] space-y-1 text-[11px]">
              <div><span className="text-[#828282]">PK:</span> daily_fact_id (BIGINT)</div>
              <div><span className="text-[#828282]">FKs:</span> time_id, station_id, location_id (Conformed)</div>
              <div><span className="text-[#202020] font-semibold">Measures:</span> avg_pm25, max_pm25, avg_pm10, avg_no2, aqi</div>
            </div>
            <p className="text-xs text-[#4d4d4d] font-sans leading-normal">
              Pre-computed daily summary serving sub-second dashboard queries and multi-year OLAP roll-ups.
            </p>
          </div>
        </div>

        {/* Quick Interactive OLAP Preview */}
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-3">
            <div>
              <div className="text-[11px] font-mono uppercase text-[#816729]">Multidimensional Workspace</div>
              <h3 className="text-lg text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                OLAP Cube Analysis: {olapOp}
              </h3>
            </div>
            <div className="flex gap-1.5 font-mono text-xs">
              {(['Roll-up', 'Drill-down', 'Slice', 'Dice', 'Pivot'] as const).map((op) => (
                <button
                  key={op}
                  onClick={() => setOlapOp(op)}
                  className={`px-3 py-1 text-xs transition-colors rounded ${
                    olapOp === op
                      ? 'bg-[#202020] text-white'
                      : 'bg-[#efefef] text-[#4d4d4d] hover:bg-[#e8e8e8]'
                  }`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {olapError && <div className="border border-red-200 bg-red-50 p-3 text-red-700">{olapError}</div>}
            {olapLoading && <div className="text-[#828282]">Loading persisted OLAP results...</div>}
            {olapResult && !olapLoading && (
              <>
                <div className="text-[10px] uppercase text-[#828282]">
                  Persisted result · {olapResult.source_file} · showing {olapResult.data.length} rows
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full editorial-table">
                    <thead>
                      <tr>
                        {olapResult.columns.map((column) => <th key={column}>{column}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {olapResult.data.map((row, index) => (
                        <tr key={index}>
                          {olapResult.columns.map((column) => (
                            <td key={column}>{row[column] ?? '—'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: CITIZEN INTELLIGENCE PRIMER (Warm Ivory Accent Wash) */}
      {/* ========================================================================= */}
      <section className="bg-[#ebe6dd] py-20 border-y border-[#e8e8e8]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="border-b border-[#d8d0c2] pb-4">
            <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
              Citizen Decision Support
            </div>
            <h2
              className="text-3xl text-[#202020] mt-1 font-normal tracking-[-0.02em]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Plain-language air quality answers.
            </h2>
            <p className="text-xs text-[#4d4d4d] mt-1 font-sans">
              AirSense translates complex sensor readings into answers for daily living.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-asymmetric p-6 bg-[#ffffff] border border-[#d8d0c2] space-y-2">
              <h3 className="text-base text-[#202020] font-normal" style={{ fontFamily: 'var(--font-heading)' }}>
                &quot;Why is my air poor?&quot;
              </h3>
              <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
                Surfaces the dominant contributing pollutant relative to normal levels, rather than displaying an abstract number alone.
              </p>
            </div>

            <div className="card-asymmetric p-6 bg-[#ffffff] border border-[#d8d0c2] space-y-2">
              <h3 className="text-base text-[#202020] font-normal" style={{ fontFamily: 'var(--font-heading)' }}>
                &quot;Is this normal?&quot;
              </h3>
              <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
                Queries the historical Data Warehouse to compare today against the same station, month, and hour across 17 years.
              </p>
            </div>

            <div className="card-asymmetric p-6 bg-[#ffffff] border border-[#d8d0c2] space-y-2">
              <h3 className="text-base text-[#202020] font-normal" style={{ fontFamily: 'var(--font-heading)' }}>
                &quot;When will it improve?&quot;
              </h3>
              <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
                Chronological forecast timeline to schedule running, cycling, or outdoor commutes during lower-particulate windows.
              </p>
            </div>
          </div>

          {/* Educational Definitions */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4 border-t border-[#d8d0c2] text-xs">
            <div className="p-4 bg-[#ffffff] rounded border border-[#d8d0c2]">
              <span className="font-semibold text-[#202020]">PM2.5</span>
              <p className="text-[#4d4d4d] mt-1 font-sans">
                Tiny airborne particles under 2.5 micrometres. Can penetrate deep into the lungs.
              </p>
            </div>
            <div className="p-4 bg-[#ffffff] rounded border border-[#d8d0c2]">
              <span className="font-semibold text-[#202020]">PM10</span>
              <p className="text-[#4d4d4d] mt-1 font-sans">
                Inhalable particles under 10 micrometres, such as road dust and pulverized pollen.
              </p>
            </div>
            <div className="p-4 bg-[#ffffff] rounded border border-[#d8d0c2]">
              <span className="font-semibold text-[#202020]">NO₂</span>
              <p className="text-[#4d4d4d] mt-1 font-sans">
                Gaseous pollutant originating primarily from motor vehicle fuel combustion.
              </p>
            </div>
            <div className="p-4 bg-[#ffffff] rounded border border-[#d8d0c2]">
              <span className="font-semibold text-[#202020]">µg/m³</span>
              <p className="text-[#4d4d4d] mt-1 font-sans">
                Micrograms of particles per cubic metre of air measuring mass concentration.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: OFFICIAL CPCB SCALE & DISCLAIMER (White Canvas) */}
      {/* ========================================================================= */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-[#efefef] pb-3">
          <h3
            className="text-lg text-[#202020] font-normal"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            National Air Quality Index (CPCB Standard Scales)
          </h3>
          <p className="text-xs text-[#828282] mt-0.5 font-mono">
            6 regulatory categories defined by the Central Pollution Control Board
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 font-mono text-xs">
          {(Object.keys(CPCB_AQI_CATEGORIES) as Array<keyof typeof CPCB_AQI_CATEGORIES>).map((k) => {
            const cat = CPCB_AQI_CATEGORIES[k];
            return (
              <div key={cat.category} className="p-3 bg-[#f5f5f5] rounded border border-[#e8e8e8] space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="font-semibold text-[#202020] text-xs">{cat.category}</span>
                </div>
                <div className="text-[11px] text-[#4d4d4d]">{cat.min}–{cat.max}</div>
                <div className="text-[10px] text-[#828282] font-sans leading-tight pt-1">
                  {cat.description}
                </div>
              </div>
            );
          })}
        </div>

        <DisclaimerBanner />
      </section>

    </div>
  );
}
