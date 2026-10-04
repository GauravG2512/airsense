'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { DATA_QUALITY_METRICS, ETL_PIPELINE_RUNS } from '@/lib/mock-data';

export default function PipelinePage() {
  const [selectedStage, setSelectedStage] = useState<string>('WAREHOUSE_LOAD');

  const pipelineStages = [
    { id: 'EXTRACT', label: '1. Parquet Extract', tool: 'DuckDB Pushdown', records: '196.50M', status: 'Passed' },
    { id: 'SCHEMA_VAL', label: '2. Schema Validation', tool: 'PyArrow / Pydantic', records: '196.50M', status: 'Passed' },
    { id: 'TIME_VAL', label: '3. Timestamp Alignment', tool: 'IST Normalization', records: '195.82M', status: 'Passed' },
    { id: 'STATION_VAL', label: '4. Station Validation', tool: 'CPCB Metadata Match', records: '195.40M', status: 'Passed' },
    { id: 'DEDUP', label: '5. Deduplication', tool: 'Hash Key Deduplication', records: '194.20M', status: 'Passed' },
    { id: 'MISSING', label: '6. Missing Value Profiling', tool: 'Temporal Spline Imputation', records: '165.40M', status: 'Passed' },
    { id: 'OUTLIERS', label: '7. Outlier Detection', tool: 'IQR + Z-Score Filter', records: '161.32M', status: 'Passed' },
    { id: 'UNIT_NORM', label: '8. Unit Normalization', tool: 'µg/m³ Standardizer', records: '161.32M', status: 'Passed' },
    { id: 'FEAT_ENG', label: '9. Feature Engineering', tool: 'Lag & Rolling Engine', records: '161.32M', status: 'Passed' },
    { id: 'AQI_DERIVE', label: '10. CPCB AQI Derivation', tool: 'CPCB Sub-Index Matrix', records: '161.32M', status: 'Passed' },
    { id: 'DIM_GEN', label: '11. Dimension Generation', tool: 'SCD Type 2 & Hierarchy', records: '5 Dimensions', status: 'Passed' },
    { id: 'WAREHOUSE_LOAD', label: '12. Warehouse Load', tool: 'PostgreSQL COPY Batch', records: '161.32M Rows', status: 'Passed' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            Data Engineering Observability
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
            ETL Pipeline &amp; Data Quality
          </h1>
          <p className="text-sm font-sans text-[#828282] mt-1 max-w-2xl">
            DuckDB zero-memory Parquet extraction, cleaning validation stages, and PostgreSQL warehouse load audit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge label="PIPELINE RUNS" />
          <Link
            href="/warehouse"
            className="btn-ghost-sharp text-xs font-mono text-[#202020] flex items-center gap-1.5"
          >
            Warehouse Schemas <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
          </Link>
        </div>
      </div>

      {/* Big Data Pushdown Architecture Banner */}
      <div className="p-6 sm:p-8 bg-[#202020] text-white card-asymmetric space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#333333] pb-3 text-[11px] font-mono">
          <span className="text-[#816729] uppercase tracking-[0.2em]">Big Data Rule (Spec Section 52)</span>
          <span className="text-[#828282]">Zero Full-Memory Loading Constraint</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Source Raw Volume</span>
            <div className="text-2xl font-mono text-white">196.50M</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              Distributed across monthly Parquet files (2009 to 2026). Ingestion avoids loading whole tables into Pandas at once.
            </p>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Extraction Engine</span>
            <div className="text-2xl font-mono text-[#ff682c]">DuckDB + PyArrow</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              Direct Parquet scanning with column projection and predicate pushdown. Filters temporal and spatial subsets in C++ cores.
            </p>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Warehouse Store</span>
            <div className="text-2xl font-mono text-white">PostgreSQL 16 DW</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              Partitioned fact tables, composite indexes, and materialized views designed for sub-second multidimensional queries.
            </p>
          </div>
        </div>
      </div>

      {/* 12-Stage Visual ETL Observability Flow */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
            Pipeline Execution Flow
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            12-Stage End-to-End ETL Pipeline
          </h2>
          <p className="text-xs text-[#828282] font-sans mt-1">
            Every step validates data schema, temporal order, or chemical plausibility before commit into PostgreSQL.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineStages.map((stage) => {
            const isSelected = selectedStage === stage.id;
            return (
              <div
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`p-4 border cursor-pointer transition-all card-asymmetric ${
                  isSelected
                    ? 'border-[#202020] bg-[#f5f5f5]'
                    : 'border-[#efefef] bg-white hover:border-[#828282]'
                }`}
              >
                <div className="flex justify-between items-center text-[10px] font-mono text-[#828282] mb-2">
                  <span className="uppercase">{stage.status}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#ff682c]" />
                </div>
                <div className="font-mono text-xs text-[#202020] font-medium">{stage.label}</div>
                <div className="text-[11px] text-[#828282] mt-1 font-sans">Engine: {stage.tool}</div>
                <div className="text-[10px] font-mono text-[#828282] mt-3 pt-2 border-t border-[#efefef] flex justify-between">
                  <span>Processed:</span>
                  <span className="text-[#202020] font-medium">{stage.records}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Quality Audit */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
            Data Quality Audit
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            Raw vs Usable Records &amp; Contamination Profiling
          </h2>
          <p className="text-xs text-[#828282] font-sans mt-1">
            The XKDR database is published as received from monitoring stations without synthetic smoothing, making rigorous cleaning essential.
          </p>
        </div>

        {/* Quality KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-1">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Total Missing</span>
            <div className="text-2xl font-mono text-[#202020]">{DATA_QUALITY_METRICS.missing_pct}%</div>
            <div className="text-[10px] text-[#828282] font-sans">Sensor downtime / power</div>
          </div>

          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-1">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Duplicates</span>
            <div className="text-2xl font-mono text-[#202020]">{DATA_QUALITY_METRICS.duplicate_pct}%</div>
            <div className="text-[10px] text-[#828282] font-sans">Duplicate timestamps</div>
          </div>

          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-1">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Invalid Values</span>
            <div className="text-2xl font-mono text-[#202020]">{DATA_QUALITY_METRICS.invalid_pct}%</div>
            <div className="text-[10px] text-[#828282] font-sans">Negative / uncalibrated</div>
          </div>

          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-1">
            <span className="text-[#828282] uppercase text-[10px] font-mono tracking-wider">Statistical Outliers</span>
            <div className="text-2xl font-mono text-[#202020]">{DATA_QUALITY_METRICS.outlier_pct}%</div>
            <div className="text-[10px] text-[#828282] font-sans">IQR / Z-score flagged</div>
          </div>

          <div className="p-4 border border-[#e0dacd] bg-[#ebe6dd] card-asymmetric space-y-1">
            <span className="text-[#816729] uppercase text-[10px] font-mono tracking-wider">Final Fact Volume</span>
            <div className="text-2xl font-mono text-[#202020]">161.32M</div>
            <div className="text-[10px] text-[#816729] font-sans">Committed to Warehouse</div>
          </div>
        </div>

        {/* Pollutant-Specific Coverage Table */}
        <div className="space-y-3 pt-4">
          <div className="text-xs font-mono uppercase tracking-wider text-[#828282]">
            Pollutant-Specific Missingness &amp; Station Coverage Breakdown
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table text-xs">
              <thead>
                <tr>
                  <th className="text-left">Pollutant Parameter</th>
                  <th className="text-right">Missing Rate</th>
                  <th className="text-left">Station Coverage</th>
                  <th className="text-left">Longest Continuous Gap</th>
                  <th className="text-left">Cleaning Strategy</th>
                </tr>
              </thead>
              <tbody>
                {DATA_QUALITY_METRICS.pollutant_coverage_summary.map((pol) => (
                  <tr key={pol.pollutant}>
                    <td className="font-mono text-[#202020] font-medium">{pol.pollutant}</td>
                    <td className="font-mono text-[#ff682c] text-right font-medium">{pol.missing_pct}%</td>
                    <td className="font-mono text-[#4d4d4d]">{pol.station_count} / 558 Stations</td>
                    <td className="font-mono text-[#828282]">{pol.longest_gap_days} Days</td>
                    <td className="text-xs text-[#828282] font-sans">
                      {pol.missing_pct < 15
                        ? 'Temporal cubic spline interpolation for gaps < 4h; forward-fill for gaps < 1h.'
                        : pol.missing_pct < 35
                        ? 'Spatial inverse distance weighting (IDW) from nearest active station.'
                        : 'Retained as sparse analytical dimension; excluded from real-time AQI derivation.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Batch Pipeline Runs Table */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4 flex justify-between items-center">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
              Execution Audit Log
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Batch Pipeline Runs
            </h2>
          </div>
          <span className="font-mono text-xs text-[#828282]">PostgreSQL COPY Logs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full editorial-table text-xs">
            <thead>
              <tr>
                <th className="text-left">Batch Run ID</th>
                <th className="text-left">Stage</th>
                <th className="text-left">Status</th>
                <th className="text-right">Ingested</th>
                <th className="text-right">Rejected</th>
                <th className="text-right">Duration</th>
                <th className="text-right">Rows Inserted</th>
                <th className="text-left">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {ETL_PIPELINE_RUNS.map((run, i) => (
                <tr key={i}>
                  <td className="font-mono text-[#202020] font-medium">{run.run_id}</td>
                  <td className="font-mono text-[#4d4d4d]">{run.stage}</td>
                  <td>
                    <span className="inline-block px-2 py-0.5 text-[10px] font-mono rounded-none bg-[#f5f5f5] text-[#202020] border border-[#efefef]">
                      {run.status}
                    </span>
                  </td>
                  <td className="font-mono text-[#4d4d4d] text-right">{run.records_processed.toLocaleString()}</td>
                  <td className="font-mono text-[#828282] text-right">{run.records_rejected.toLocaleString()}</td>
                  <td className="font-mono text-[#4d4d4d] text-right">{run.duration_seconds}s</td>
                  <td className="font-mono text-[#202020] font-medium text-right">{run.rows_inserted.toLocaleString()}</td>
                  <td className="font-mono text-[11px] text-[#828282]">{run.timestamp}</td>
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
