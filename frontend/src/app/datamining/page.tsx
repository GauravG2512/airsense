'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import {
  STATION_CLUSTERS,
  ANOMALIES_SAMPLE,
} from '@/lib/mock-data';

export default function DataMiningPage() {
  const [activeTab, setActiveTab] = useState<'pca' | 'clustering' | 'anomalies' | 'correlation'>('pca');
  const [corrCity, setCorrCity] = useState<string>('National (All)');
  const [corrSeason, setCorrSeason] = useState<string>('Annual');

  const pollutants = ['PM2.5', 'PM10', 'NO2', 'SO2', 'CO', 'O3', 'NH3'];
  const correlationMatrix: Record<string, Record<string, number>> = {
    'PM2.5': { 'PM2.5': 1.00, 'PM10': 0.88, 'NO2': 0.64, 'SO2': 0.38, 'CO': 0.72, 'O3': -0.22, 'NH3': 0.54 },
    'PM10':  { 'PM2.5': 0.88, 'PM10': 1.00, 'NO2': 0.61, 'SO2': 0.42, 'CO': 0.66, 'O3': -0.18, 'NH3': 0.49 },
    'NO2':   { 'PM2.5': 0.64, 'PM10': 0.61, 'NO2': 1.00, 'SO2': 0.45, 'CO': 0.78, 'O3': -0.34, 'NH3': 0.38 },
    'SO2':   { 'PM2.5': 0.38, 'PM10': 0.42, 'NO2': 0.45, 'SO2': 1.00, 'CO': 0.35, 'O3': -0.08, 'NH3': 0.22 },
    'CO':    { 'PM2.5': 0.72, 'PM10': 0.66, 'NO2': 0.78, 'SO2': 0.35, 'CO': 1.00, 'O3': -0.28, 'NH3': 0.44 },
    'O3':    { 'PM2.5': -0.22, 'PM10': -0.18, 'NO2': -0.34, 'SO2': -0.08, 'CO': -0.28, 'O3': 1.00, 'NH3': -0.12 },
    'NH3':   { 'PM2.5': 0.54, 'PM10': 0.49, 'NO2': 0.38, 'SO2': 0.22, 'CO': 0.44, 'O3': -0.12, 'NH3': 1.00 },
  };

  const pcaComponents = [
    { name: 'PC1 (Combustion / Primary Particulate)', variance: 44.2, cum_variance: 44.2, drivers: 'PM2.5 (+0.46), PM10 (+0.44), CO (+0.42), NO2 (+0.38)' },
    { name: 'PC2 (Photochemical / Secondary O3)', variance: 21.6, cum_variance: 65.8, drivers: 'Ozone (+0.62), Temperature (+0.54), NO2 (-0.39)' },
    { name: 'PC3 (Point-Source Industrial Emissions)', variance: 11.4, cum_variance: 77.2, drivers: 'SO2 (+0.68), NH3 (+0.48), Industrial Flag (+0.36)' },
    { name: 'PC4 (Diurnal Boundary Layer Dynamics)', variance: 6.8, cum_variance: 84.0, drivers: 'Hour (+0.58), Wind Speed (-0.51), Inversion (+0.42)' },
    { name: 'PC5 (Coarse Mechanical Dust Fraction)', variance: 4.2, cum_variance: 88.2, drivers: 'PM10/PM2.5 Ratio (+0.64), Humidity (-0.46)' },
    { name: 'PC6 (Seasonal Agricultural Shift)', variance: 3.1, cum_variance: 91.3, drivers: 'Post-Monsoon Biomass (+0.59), NH3 (+0.42)' },
    { name: 'PC7 (Weekend Anthropogenic Reduction)', variance: 2.3, cum_variance: 93.6, drivers: 'is_weekend (-0.68), Traffic Corridor (-0.44)' },
    { name: 'PC8 (Residual Station Topography)', variance: 1.8, cum_variance: 95.4, drivers: 'Elevation (+0.61), Coastal Latitude (-0.52)' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Unsupervised Discovery Lab
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Data Mining &amp; Pattern Discovery
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="SCIKIT-LEARN ARTIFACTS" />
          <Link
            href="/features"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Feature Lab →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#efefef] gap-2 font-mono text-xs">
        {(
          [
            { id: 'pca', label: '1. PCA Dimensionality Reduction' },
            { id: 'clustering', label: '2. Station Clustering & Profiles' },
            { id: 'anomalies', label: '3. Statistical Anomaly Detection' },
            { id: 'correlation', label: '4. Dynamic Correlation Matrix' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 transition-all ${
              activeTab === tab.id
                ? 'border-b-2 border-[#202020] text-[#202020] font-medium'
                : 'text-[#828282] hover:text-[#202020]'
            }`}
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: PCA */}
      {activeTab === 'pca' && (
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Eigenvector Projection</span>
              <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                Principal Component Analysis (32 Features → 8 Eigenvectors)
              </h2>
            </div>
            <span className="font-mono text-xs text-[#828282]">
              95.4% Cumulative Variance
            </span>
          </div>

          <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans max-w-4xl">
            Standardized observation vectors projected onto orthogonal eigenvectors. 
            The scree plot confirms that 8 principal components capture over 95% of information, 
            compressing collinear sensor streams before model ingestion.
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center text-[11px] text-[#828282] uppercase">
              <span>Principal Component Eigenvector</span>
              <span>Individual Variance | Cumulative</span>
            </div>

            <div className="space-y-2">
              {pcaComponents.map((pc) => (
                <div key={pc.name} className="p-3 bg-[#f5f5f5] rounded border border-[#e8e8e8] space-y-1">
                  <div className="flex justify-between items-center text-[#202020]">
                    <span className="font-semibold">{pc.name}</span>
                    <span>
                      {pc.variance}% <span className="text-[#828282] font-normal">(Cum: {pc.cum_variance}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-[#e8e8e8] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#202020]"
                      style={{ width: `${(pc.variance / 50) * 100}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-[#4d4d4d] font-sans pt-1">
                    <strong className="text-[#202020] font-mono">Dominant Loadings:</strong> {pc.drivers}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CLUSTERING */}
      {activeTab === 'clustering' && (
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Unsupervised Classification</span>
              <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                Station Clustering: K-Means &amp; DBSCAN Archetypes
              </h2>
            </div>
            <div className="font-mono text-xs text-[#828282]">
              Silhouette Score: <strong className="text-[#202020]">0.68</strong> | Davies-Bouldin: <strong className="text-[#202020]">0.72</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {STATION_CLUSTERS.map((cl) => (
              <div key={cl.cluster_id} className="card-asymmetric p-6 border border-[#e8e8e8] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs text-[#816729] uppercase">
                      Cluster 0{cl.cluster_id}
                    </span>
                    <h3 className="text-base text-[#202020] mt-0.5" style={{ fontFamily: 'var(--font-heading)' }}>
                      {cl.cluster_name}
                    </h3>
                  </div>
                  <span className="editorial-tag bg-[#ffffff] text-[#202020] border border-[#e8e8e8]">
                    {cl.stations_count} Stations
                  </span>
                </div>

                <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
                  {cl.description}
                </p>

                <div className="grid grid-cols-3 gap-2 p-3 bg-[#ffffff] rounded border border-[#e8e8e8] font-mono text-xs">
                  <div>
                    <span className="text-[#828282] text-[10px] uppercase">Avg PM2.5</span>
                    <div className="text-[#202020] font-semibold text-sm">{cl.avg_pm25} µg/m³</div>
                  </div>
                  <div>
                    <span className="text-[#828282] text-[10px] uppercase">Avg NO2</span>
                    <div className="text-[#202020] font-semibold text-sm">{cl.avg_no2} µg/m³</div>
                  </div>
                  <div>
                    <span className="text-[#828282] text-[10px] uppercase">Variability</span>
                    <div className="text-[#202020] font-semibold text-sm">{cl.pollution_variability}</div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-[#828282]">
                  <strong className="text-[#202020]">Sample Monitors:</strong> {cl.sample_stations.join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ANOMALIES */}
      {activeTab === 'anomalies' && (
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Outlier Detection</span>
              <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                Statistical Anomaly Evidence Table
              </h2>
            </div>
            <span className="font-mono text-xs text-[#828282]">
              Methods: IQR • Z-score • Isolation Forest
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table">
              <thead>
                <tr>
                  <th>Station &amp; City</th>
                  <th>Pollutant</th>
                  <th>Observed Value</th>
                  <th>Baseline</th>
                  <th>Deviation</th>
                  <th>Z-Score</th>
                  <th>Method</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {ANOMALIES_SAMPLE.map((anom) => (
                  <tr key={anom.anomaly_id}>
                    <td className="font-mono font-semibold text-[#202020]">
                      {anom.station_name}
                      <div className="text-[10px] font-normal text-[#828282]">{anom.timestamp}</div>
                    </td>
                    <td className="font-mono text-[#202020]">{anom.pollutant}</td>
                    <td className="font-mono text-[#ff682c] font-semibold">{anom.observed_value} µg/m³</td>
                    <td className="font-mono text-[#4d4d4d]">{anom.historical_baseline} µg/m³</td>
                    <td className="font-mono text-[#ff682c] font-semibold">+{anom.deviation_pct}%</td>
                    <td className="font-mono text-[#202020]">{anom.z_score}σ</td>
                    <td className="font-mono text-[#4d4d4d]">{anom.detection_method}</td>
                    <td>
                      <span className="editorial-tag bg-[#efefef] text-[#ff682c] border border-[#e8e8e8]">
                        {anom.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ANOMALIES_SAMPLE.map((anom) => (
              <div key={anom.anomaly_id} className="p-4 bg-[#f5f5f5] rounded border border-[#e8e8e8] text-xs space-y-1">
                <span className="font-mono font-semibold text-[#202020]">
                  {anom.station_name} ({anom.pollutant}):
                </span>
                <p className="text-[#4d4d4d] font-sans leading-relaxed">
                  {anom.evidence_summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CORRELATION MATRIX */}
      {activeTab === 'correlation' && (
        <div className="card-data-dashboard p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#efefef] pb-3">
            <div>
              <span className="text-[11px] font-mono uppercase text-[#816729]">Cross-Parameter Coupling</span>
              <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
                Dynamic Pollutant Correlation Matrix (Pearson r)
              </h2>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <select
                value={corrCity}
                onChange={(e) => setCorrCity(e.target.value)}
                className="bg-[#f5f5f5] border border-[#e8e8e8] p-1 text-[#202020]"
                style={{ borderRadius: '0px' }}
              >
                <option>National (All)</option>
                <option>Delhi CAAQM</option>
                <option>Mumbai CAAQM</option>
              </select>
              <select
                value={corrSeason}
                onChange={(e) => setCorrSeason(e.target.value)}
                className="bg-[#f5f5f5] border border-[#e8e8e8] p-1 text-[#202020]"
                style={{ borderRadius: '0px' }}
              >
                <option>Annual</option>
                <option>Winter</option>
                <option>Summer</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table">
              <thead>
                <tr>
                  <th>Pollutant</th>
                  {pollutants.map((p) => (
                    <th key={p}>{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pollutants.map((pRow) => (
                  <tr key={pRow}>
                    <td className="font-mono font-semibold text-[#202020]">{pRow}</td>
                    {pollutants.map((pCol) => {
                      const val = correlationMatrix[pRow][pCol];
                      const isHigh = val > 0.7 && val < 1.0;
                      return (
                        <td
                          key={pCol}
                          className={`font-mono text-center text-xs ${
                            val === 1.0 ? 'bg-[#efefef] text-[#202020]' : isHigh ? 'text-[#ff682c] font-semibold' : 'text-[#4d4d4d]'
                          }`}
                        >
                          {val.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
