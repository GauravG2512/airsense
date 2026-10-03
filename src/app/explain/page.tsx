'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, HelpCircle, Activity, Sparkles } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { MONITORED_STATIONS, getStationAirReading } from '@/lib/mock-data';

export default function ExplainPage() {
  const [selectedStationId, setSelectedStationId] = useState<string>('MH_001'); // BKC Mumbai
  const reading = getStationAirReading(selectedStationId);

  // SHAP waterfall contributions for the selected station
  const shapBaseValue = 82.4; // Base model expectation (E[f(x)])
  const shapContributions = [
    { feature: 'PM25_rolling_6h', value: '72 µg/m³', shap: +28.4, dir: 'Increases AQI', desc: 'Sustained elevated particulate concentration over preceding 6 hours.' },
    { feature: 'zscore_vs_station_history', value: '+1.42σ', shap: +16.2, dir: 'Increases AQI', desc: 'Current reading is 1.42 standard deviations higher than normal seasonal mean.' },
    { feature: 'hour_of_day (19:00)', value: '19 (Peak)', shap: +14.5, dir: 'Increases AQI', desc: 'Evening rush-hour transition and falling boundary layer height.' },
    { feature: 'wind_speed_kmh', value: '9.8 km/h', shap: -6.2, dir: 'Decreases AQI', desc: 'Moderate coastal breeze provides partial convective ventilation.' },
    { feature: 'PM25_PM10_ratio', value: '0.65', shap: +7.7, dir: 'Increases AQI', desc: 'Predominance of fine combustion smoke over coarse road dust.' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            TreeSHAP Additive Interpretability
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
            Explain My AQI &amp; Forecast
          </h1>
          <p className="text-sm font-sans text-[#828282] mt-1 max-w-2xl">
            Deconstructing model predictions into game-theoretic Shapley feature contributions and plain-language environmental causes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge label="SHAPLEY VALUES" />
          <Link
            href="/dashboard"
            className="btn-ghost-sharp text-xs font-mono text-[#202020] flex items-center gap-1.5"
          >
            Citizen Dashboard <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
          </Link>
        </div>
      </div>

      {/* Target Monitor Selector Bar */}
      <div className="card-asymmetric p-5 bg-white border border-[#efefef] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs font-mono">
          <label htmlFor="explain-station-select" className="text-[#828282] uppercase tracking-wider text-[11px]">
            Target Monitor:
          </label>
          <select
            id="explain-station-select"
            value={selectedStationId}
            onChange={(e) => setSelectedStationId(e.target.value)}
            className="bg-[#f5f5f5] border border-[#efefef] rounded-none px-3 py-1.5 text-[#202020] font-mono text-xs focus:outline-none focus:border-[#202020]"
          >
            {MONITORED_STATIONS.map((s) => (
              <option key={s.station_id} value={s.station_id}>
                {s.station_name} ({s.city})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-[#828282]">Current Index:</span>
          <AqiBadge category={reading.aqi_category} aqi={reading.aqi} size="sm" />
        </div>
      </div>

      {/* Citizen Plain-Language Section */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4 flex justify-between items-start">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
              Plain-Language Diagnostic
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Why Is the Current Air Quality Forecast Elevated?
            </h2>
            <p className="text-xs text-[#828282] font-sans mt-1">
              AirSense translates machine learning feature weights into verified atmospheric and anthropogenic causes.
            </p>
          </div>
          <div className="hidden sm:block text-right font-mono text-xs text-[#828282]">
            Target Station: <span className="text-[#202020] font-medium">{reading.station_name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Plain Language Drivers List */}
          <div className="space-y-3 font-mono text-xs">
            <div className="card-asymmetric p-4 bg-[#f5f5f5] border border-[#efefef] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#202020]">1. PM2.5 Recent Trailing Trend</span>
                <span className="text-[#ff682c] font-mono font-medium">+28.4% Impact</span>
              </div>
              <p className="text-[#4d4d4d] font-sans text-xs leading-relaxed">
                Particulate levels have been consistently rising over the last 6 hours due to traffic congestion and background industrial emissions.
              </p>
            </div>

            <div className="card-asymmetric p-4 bg-[#f5f5f5] border border-[#efefef] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#202020]">2. Evening Inversion &amp; Rush Hour</span>
                <span className="text-[#ff682c] font-mono font-medium">+14.5% Impact</span>
              </div>
              <p className="text-[#4d4d4d] font-sans text-xs leading-relaxed">
                As the sun sets, surface temperatures cool and trap vehicle exhaust close to the ground, preventing upward atmospheric dispersion.
              </p>
            </div>

            <div className="card-asymmetric p-4 bg-[#f5f5f5] border border-[#efefef] space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#202020]">3. Historical Station Deviation</span>
                <span className="text-[#ff682c] font-mono font-medium">+16.2% Impact</span>
              </div>
              <p className="text-[#4d4d4d] font-sans text-xs leading-relaxed">
                Current concentration is 32% above the normal baseline recorded for this station during the same month over the past 17 years.
              </p>
            </div>
          </div>

          {/* Citizen Advisory Box on Warm Ivory */}
          <div className="card-asymmetric p-6 bg-[#ebe6dd] border border-[#e0dacd] space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff682c]" />
              <h3 className="font-display font-normal text-lg text-[#202020] tracking-[-0.01em]">
                Citizen Health Summary
              </h3>
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
              The primary health stressor is fine particulate matter (PM2.5). 
              Sensitive groups and individuals with respiratory conditions are advised to reduce intense outdoor cardio activities until 
              boundary layer dispersion recovers after 07:00 tomorrow morning.
            </p>
            <div className="pt-3 border-t border-[#d8d1c1] text-[11px] font-mono text-[#816729] flex justify-between items-center">
              <span>Forecast Trend: Moderating by Morning</span>
              <Link href="/dashboard" className="text-[#ff682c] link-ember-underline">
                View Forecast Timeline
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Analyst SHAP Waterfall Section */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
              Analyst Diagnostic View
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              SHAP Waterfall &amp; Additive Feature Contributions
            </h2>
          </div>
          <div className="font-mono text-xs text-[#828282]">
            E[f(x)] Baseline: <span className="text-[#202020] font-medium">{shapBaseValue} AQI</span> → Output: <span className="text-[#ff682c] font-medium">{reading.aqi} AQI</span>
          </div>
        </div>

        <p className="text-xs text-[#4d4d4d] max-w-3xl leading-relaxed font-sans">
          TreeSHAP computes exact game-theoretic Shapley values for the production XGBoost model. 
          Each feature nudges the base expectation (82.4 AQI) up or down to arrive at the current prediction.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full editorial-table text-xs">
            <thead>
              <tr>
                <th className="text-left">Feature Name</th>
                <th className="text-left">Observed Value</th>
                <th className="text-left">Direction</th>
                <th className="text-right">SHAP Impact</th>
                <th className="text-left">Analytical Rationale</th>
              </tr>
            </thead>
            <tbody>
              {shapContributions.map((s) => (
                <tr key={s.feature}>
                  <td className="font-mono text-[#202020] font-medium">{s.feature}</td>
                  <td className="font-mono text-[#4d4d4d]">{s.value}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded-none ${
                      s.shap > 0 ? 'bg-[#ff682c]/10 text-[#ff682c]' : 'bg-[#efefef] text-[#4d4d4d]'
                    }`}>
                      {s.dir}
                    </span>
                  </td>
                  <td className={`font-mono font-medium text-right ${s.shap > 0 ? 'text-[#ff682c]' : 'text-[#4d4d4d]'}`}>
                    {s.shap > 0 ? `+${s.shap}` : s.shap} AQI
                  </td>
                  <td className="text-xs text-[#828282] font-sans">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
