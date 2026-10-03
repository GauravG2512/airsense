'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { FEATURE_IMPORTANCE_LIST } from '@/lib/mock-data';

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState<'engineered' | 'selection'>('engineered');

  const engineeredGroups = [
    {
      group: 'Temporal & Cyclical Features (8)',
      description: 'Encodes planetary boundary layer cycles, diurnal transport rhythms, and seasonal patterns.',
      items: [
        { name: 'hour_of_day', type: 'Cyclical / Continuous', desc: 'Hour 0–23 transformed via sin/cos cyclical encoding.' },
        { name: 'day_of_week', type: 'Categorical / Integer', desc: 'Day 0–6 capturing weekday transport differentials.' },
        { name: 'month', type: 'Integer (1–12)', desc: 'Macro seasonal indicator capturing winter vs summer radiation.' },
        { name: 'quarter', type: 'Integer (1–4)', desc: 'Quarterly financial and climatic grouping.' },
        { name: 'season_winter_flag', type: 'Binary Flag (0/1)', desc: 'High inversion flag for November through February.' },
        { name: 'is_weekend', type: 'Binary Flag (0/1)', desc: 'Reduced commercial freight transport activity indicator.' },
        { name: 'rush_hour_flag', type: 'Binary Flag (0/1)', desc: 'Peak commute intervals (08:00–10:00 & 18:00–21:00).' },
        { name: 'time_of_day_phase', type: 'One-Hot (4 categories)', desc: 'Morning Peak, Afternoon Convection, Evening, Night.' },
      ],
    },
    {
      group: 'Autoregressive Lag Features (5)',
      description: 'Historical observations of particulate concentration capturing short-term atmospheric momentum.',
      items: [
        { name: 'PM25_lag_1', type: 'Continuous (µg/m³)', desc: 'Previous hour measured PM2.5 observation.' },
        { name: 'PM25_lag_3', type: 'Continuous (µg/m³)', desc: '3-hour prior PM2.5 measurement.' },
        { name: 'PM25_lag_6', type: 'Continuous (µg/m³)', desc: '6-hour prior PM2.5 measurement.' },
        { name: 'PM25_lag_12', type: 'Continuous (µg/m³)', desc: '12-hour prior PM2.5 measurement.' },
        { name: 'PM25_lag_24', type: 'Continuous (µg/m³)', desc: '24-hour diurnal lag observation.' },
      ],
    },
    {
      group: 'Rolling Statistical Windows (5)',
      description: 'Trailing window statistics smoothing sensor noise and identifying dispersion volatility.',
      items: [
        { name: 'PM25_rolling_3h_mean', type: 'Continuous (µg/m³)', desc: '3-hour short-term trailing rolling mean.' },
        { name: 'PM25_rolling_6h_mean', type: 'Continuous (µg/m³)', desc: '6-hour medium-term trailing rolling mean.' },
        { name: 'PM25_rolling_12h_mean', type: 'Continuous (µg/m³)', desc: '12-hour prolonged exposure rolling mean.' },
        { name: 'PM25_rolling_24h_mean', type: 'Continuous (µg/m³)', desc: '24-hour CPCB regulatory window rolling mean.' },
        { name: 'rolling_std_6h', type: 'Continuous (Volatility)', desc: '6-hour trailing standard deviation.' },
      ],
    },
    {
      group: 'Cross-Pollutant Interaction Ratios (4)',
      description: 'Chemical stoichiometry and combustion source diagnostics.',
      items: [
        { name: 'PM25_PM10_ratio', type: 'Dimensionless Ratio', desc: 'Distinguishes fine combustion smoke from mechanical road dust.' },
        { name: 'NO2_CO_ratio', type: 'Dimensionless Ratio', desc: 'Indicates vehicular catalytic efficiency and fuel combustion type.' },
        { name: 'particulate_index', type: 'Compound Metric', desc: 'Combined weighted aerosol loading index.' },
        { name: 'pollutant_count_above_threshold', type: 'Integer (0–7)', desc: 'Number of CPCB pollutants simultaneously exceeding limits.' },
      ],
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Feature Store &amp; Engineering Pipeline
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Feature Engineering &amp; Selection Lab
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="FEATURE STORE SPECIFICATION" />
          <Link
            href="/models"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Model Lab →
          </Link>
        </div>
      </div>

      {/* Feature Reduction Funnel Banner */}
      <div className="card-data-dashboard p-6 space-y-4 font-mono text-xs">
        <div className="text-[10px] text-[#816729] uppercase font-semibold">
          Feature Selection Funnel: Dimensionality Compression
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded bg-[#f5f5f5] border border-[#e8e8e8]">
            <div className="text-[#828282] text-[10px] uppercase">1. Raw Sensor Space</div>
            <div className="text-xl font-semibold text-[#202020] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              15 Pollutants
            </div>
            <div className="text-[10px] text-[#828282] mt-1">XKDR Parquet schema</div>
          </div>

          <div className="p-4 rounded bg-[#f5f5f5] border border-[#e8e8e8]">
            <div className="text-[#828282] text-[10px] uppercase">2. Engineered Features</div>
            <div className="text-xl font-semibold text-[#202020] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              32 Features
            </div>
            <div className="text-[10px] text-[#828282] mt-1">Lags, rolling, z-scores</div>
          </div>

          <div className="p-4 rounded bg-[#f5f5f5] border border-[#e8e8e8]">
            <div className="text-[#828282] text-[10px] uppercase">3. Selected Subset</div>
            <div className="text-xl font-semibold text-[#816729] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              14 Retained
            </div>
            <div className="text-[10px] text-[#828282] mt-1">RFE + Mutual Info</div>
          </div>

          <div className="p-4 rounded bg-[#f5f5f5] border border-[#e8e8e8]">
            <div className="text-[#828282] text-[10px] uppercase">4. PCA Eigenvectors</div>
            <div className="text-xl font-semibold text-[#ff682c] mt-1" style={{ fontFamily: 'var(--font-heading)' }}>
              8 Components
            </div>
            <div className="text-[10px] text-[#828282] mt-1">95.4% Variance</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#efefef] gap-2 font-mono text-xs">
        <button
          onClick={() => setActiveTab('engineered')}
          className={`px-4 py-2.5 transition-all ${
            activeTab === 'engineered'
              ? 'border-b-2 border-[#202020] text-[#202020] font-medium'
              : 'text-[#828282] hover:text-[#202020]'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          All 32 Engineered Features
        </button>
        <button
          onClick={() => setActiveTab('selection')}
          className={`px-4 py-2.5 transition-all ${
            activeTab === 'selection'
              ? 'border-b-2 border-[#202020] text-[#202020] font-medium'
              : 'text-[#828282] hover:text-[#202020]'
          }`}
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          Feature Importance (Tree-based &amp; SHAP)
        </button>
      </div>

      {/* TAB 1 */}
      {activeTab === 'engineered' && (
        <div className="space-y-6">
          {engineeredGroups.map((group) => (
            <div key={group.group} className="card-data-dashboard p-6 space-y-3">
              <div>
                <h3 className="text-base text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                  {group.group}
                </h3>
                <p className="text-xs text-[#828282] mt-0.5">{group.description}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full editorial-table">
                  <thead>
                    <tr>
                      <th>Feature Identifier</th>
                      <th>Data Type</th>
                      <th>Engineering Logic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((feat) => (
                      <tr key={feat.name}>
                        <td className="font-mono font-semibold text-[#202020]">{feat.name}</td>
                        <td className="font-mono text-[#816729]">{feat.type}</td>
                        <td className="text-xs text-[#4d4d4d] font-sans">{feat.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2 */}
      {activeTab === 'selection' && (
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="border-b border-[#efefef] pb-3">
            <span className="text-[11px] font-mono uppercase text-[#816729]">Selection Results</span>
            <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
              Top Predictive Features Ranked by Tree-Based Importance &amp; SHAP
            </h2>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between text-[11px] text-[#828282] uppercase">
              <span>Feature Name &amp; Category</span>
              <span>Importance Weight</span>
            </div>

            <div className="space-y-2">
              {FEATURE_IMPORTANCE_LIST.map((feat) => {
                const widthPct = Math.round((feat.importance_score / 0.35) * 100);
                return (
                  <div key={feat.feature_name} className="p-3 bg-[#f5f5f5] rounded border border-[#e8e8e8] space-y-1">
                    <div className="flex justify-between items-center text-[#202020]">
                      <div>
                        <span className="font-semibold">{feat.feature_name}</span>
                        <span className="text-[10px] text-[#828282] ml-2 font-normal">
                          ({feat.category})
                        </span>
                      </div>
                      <span className="text-[#816729]">
                        {(feat.importance_score * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-[#e8e8e8] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#202020]"
                        style={{ width: `${widthPct}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-[#4d4d4d] font-sans pt-1">
                      {feat.description}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
