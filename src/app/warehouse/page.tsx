'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Database,
  Layers,
  Table,
  ArrowDown,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function WarehousePage() {
  const [schemaType, setSchemaType] = useState<'star' | 'snowflake'>('star');
  const [selectedTable, setSelectedTable] = useState<string>('fact_air_daily');

  const tableMetadata: Record<
    string,
    {
      name: string;
      type: 'Fact Table' | 'Dimension Table' | 'Data Mart';
      grain: string;
      recordCount: string;
      storageEngine: string;
      columns: Array<{ name: string; type: string; key: string; description: string }>;
    }
  > = {
    fact_air_daily: {
      name: 'fact_air_daily',
      type: 'Fact Table',
      grain: 'One monitoring station × one calendar day',
      recordCount: '2.84 Million Rows',
      storageEngine: 'PostgreSQL 16 (Partitioned by Year)',
      columns: [
        { name: 'daily_fact_id', type: 'BIGSERIAL', key: 'PK', description: 'Surrogate primary key' },
        { name: 'time_id', type: 'INTEGER', key: 'FK', description: 'References dim_time' },
        { name: 'station_id', type: 'VARCHAR(32)', key: 'FK', description: 'References dim_station' },
        { name: 'location_id', type: 'INTEGER', key: 'FK', description: 'References dim_location' },
        { name: 'avg_pm25', type: 'NUMERIC(6,2)', key: 'Measure', description: '24-hour mean fine particulate concentration' },
        { name: 'max_pm25', type: 'NUMERIC(6,2)', key: 'Measure', description: 'Daily peak 1-hour PM2.5 concentration' },
        { name: 'avg_pm10', type: 'NUMERIC(6,2)', key: 'Measure', description: '24-hour mean coarse particulate concentration' },
        { name: 'max_pm10', type: 'NUMERIC(6,2)', key: 'Measure', description: 'Daily peak 1-hour PM10 concentration' },
        { name: 'avg_no2', type: 'NUMERIC(6,2)', key: 'Measure', description: '24-hour mean nitrogen dioxide' },
        { name: 'avg_so2', type: 'NUMERIC(6,2)', key: 'Measure', description: '24-hour mean sulphur dioxide' },
        { name: 'avg_co', type: 'NUMERIC(5,2)', key: 'Measure', description: '24-hour mean carbon monoxide' },
        { name: 'avg_o3', type: 'NUMERIC(6,2)', key: 'Measure', description: 'Daily peak 8-hour ozone average' },
        { name: 'avg_nh3', type: 'NUMERIC(6,2)', key: 'Measure', description: '24-hour mean ammonia' },
        { name: 'aqi', type: 'INTEGER', key: 'Derived', description: 'Calculated CPCB National Air Quality Index' },
        { name: 'dominant_pollutant', type: 'VARCHAR(16)', key: 'Derived', description: 'Sub-index driver pollutant symbol' },
        { name: 'anomaly_score', type: 'NUMERIC(5,3)', key: 'Derived', description: 'Z-score deviation from 17-year seasonal norm' },
      ],
    },
    fact_air_measurement: {
      name: 'fact_air_measurement',
      type: 'Fact Table',
      grain: 'One individual pollutant reading from one station at one hourly timestamp',
      recordCount: '196.50 Million Rows (161.3M post-cleaning)',
      storageEngine: 'PostgreSQL 16 Range Partitioned + DuckDB Direct Parquet Scan',
      columns: [
        { name: 'measurement_id', type: 'BIGSERIAL', key: 'PK', description: 'Surrogate primary key' },
        { name: 'time_id', type: 'INTEGER', key: 'FK', description: 'References dim_time (hourly granularity)' },
        { name: 'station_id', type: 'VARCHAR(32)', key: 'FK', description: 'References dim_station' },
        { name: 'location_id', type: 'INTEGER', key: 'FK', description: 'References dim_location' },
        { name: 'pollutant_id', type: 'VARCHAR(16)', key: 'FK', description: 'References dim_pollutant' },
        { name: 'source_id', type: 'INTEGER', key: 'FK', description: 'References dim_source' },
        { name: 'measurement_value', type: 'NUMERIC(8,3)', key: 'Measure', description: 'Raw/calibrated sensor concentration value' },
        { name: 'quality_flag', type: 'VARCHAR(16)', key: 'Flag', description: 'Data quality status (VALID, IMPUTED, OUTLIER)' },
      ],
    },
    dim_time: {
      name: 'dim_time',
      type: 'Dimension Table',
      grain: 'One unique hour between 2009-01-01 and 2026-03-31',
      recordCount: '151,200 Rows',
      storageEngine: 'PostgreSQL Conformed Dimension',
      columns: [
        { name: 'time_id', type: 'INTEGER', key: 'PK', description: 'Surrogate key (YYYYMMDDHH)' },
        { name: 'timestamp', type: 'TIMESTAMPTZ', key: '', description: 'Exact ISO-8601 timestamp in IST (+05:30)' },
        { name: 'date', type: 'DATE', key: '', description: 'Calendar date' },
        { name: 'hour', type: 'SMALLINT', key: 'Level', description: 'Hour of day (0-23)' },
        { name: 'day', type: 'SMALLINT', key: 'Level', description: 'Day of month (1-31)' },
        { name: 'weekday', type: 'VARCHAR(12)', key: '', description: 'Monday through Sunday' },
        { name: 'week', type: 'SMALLINT', key: '', description: 'ISO week of year (1-53)' },
        { name: 'month', type: 'SMALLINT', key: 'Level', description: 'Calendar month (1-12)' },
        { name: 'quarter', type: 'SMALLINT', key: 'Level', description: 'Financial/calendar quarter (Q1-Q4)' },
        { name: 'year', type: 'SMALLINT', key: 'Level', description: 'Calendar year (2009-2026)' },
        { name: 'season', type: 'VARCHAR(16)', key: '', description: 'Winter, Summer, Monsoon, Post-monsoon' },
        { name: 'is_weekend', type: 'BOOLEAN', key: '', description: 'True for Saturday and Sunday' },
        { name: 'time_of_day', type: 'VARCHAR(16)', key: '', description: 'Morning Peak, Afternoon, Evening, Night' },
      ],
    },
    dim_station: {
      name: 'dim_station',
      type: 'Dimension Table',
      grain: 'One continuous ambient air quality monitoring site',
      recordCount: '558 Rows (CPCB + 5 US Embassy/Consulate)',
      storageEngine: 'PostgreSQL Conformed Dimension (SCD Type 2 Enabled)',
      columns: [
        { name: 'station_key', type: 'INTEGER', key: 'PK', description: 'Surrogate SCD key' },
        { name: 'station_id', type: 'VARCHAR(32)', key: 'Natural', description: 'Natural station code (e.g. DL_001)' },
        { name: 'station_name', type: 'VARCHAR(128)', key: '', description: 'Human-readable official station name' },
        { name: 'latitude', type: 'NUMERIC(8,5)', key: '', description: 'WGS84 decimal latitude' },
        { name: 'longitude', type: 'NUMERIC(8,5)', key: '', description: 'WGS84 decimal longitude' },
        { name: 'city', type: 'VARCHAR(64)', key: 'Hierarchy', description: 'City name (normalized in Snowflake schema)' },
        { name: 'state', type: 'VARCHAR(64)', key: 'Hierarchy', description: 'State / Union Territory' },
        { name: 'station_type', type: 'VARCHAR(32)', key: '', description: 'CAAQM or US_EMBASSY' },
        { name: 'source', type: 'VARCHAR(64)', key: '', description: 'CPCB / State Pollution Control Board' },
        { name: 'status', type: 'VARCHAR(16)', key: '', description: 'Active or Inactive' },
        { name: 'valid_from', type: 'DATE', key: 'SCD', description: 'SCD Type 2 version start date' },
        { name: 'valid_to', type: 'DATE', key: 'SCD', description: 'SCD Type 2 version end date (NULL if current)' },
        { name: 'is_current', type: 'BOOLEAN', key: 'SCD', description: 'True for active version' },
      ],
    },
    dim_pollutant: {
      name: 'dim_pollutant',
      type: 'Dimension Table',
      grain: 'One chemical or particulate species measured in ambient air',
      recordCount: '15 Rows',
      storageEngine: 'PostgreSQL Dimension',
      columns: [
        { name: 'pollutant_id', type: 'VARCHAR(16)', key: 'PK', description: 'Primary pollutant identifier (POL_01)' },
        { name: 'pollutant_name', type: 'VARCHAR(64)', key: '', description: 'Full chemical name' },
        { name: 'symbol', type: 'VARCHAR(16)', key: '', description: 'Standard chemical symbol (PM2.5, NO2)' },
        { name: 'unit', type: 'VARCHAR(16)', key: '', description: 'µg/m³, mg/m³, or ppb' },
        { name: 'pollutant_group', type: 'VARCHAR(32)', key: 'Hierarchy', description: 'Particulate, Gaseous, or VOC' },
        { name: 'aqi_supported', type: 'BOOLEAN', key: '', description: 'True if among 8 CPCB designated pollutants' },
      ],
    },
  };

  const activeTable = tableMetadata[selectedTable] || tableMetadata.fact_air_daily;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Data Warehouse Architecture
          </div>
          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Fact Constellation &amp; Multidimensional Schema
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <DemoBadge label="WAREHOUSE METADATA CATALOG" />
          <Link
            href="/olap"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Launch OLAP Cube →
          </Link>
        </div>
      </div>

      {/* Evaluator Banner (Asymmetric Card on Ash #efefef) */}
      <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-2">
        <div className="font-mono text-[#816729] text-[11px] uppercase font-semibold flex items-center gap-2">
          <Database className="w-4 h-4 text-[#202020]" />
          Academic DWM Evaluation Overview
        </div>
        <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
          This architecture demonstrates complete Data Warehouse engineering: 
          <strong> Large-Scale Parquet Ingestion (196.5M obs)</strong>, 
          <strong> DuckDB Preprocessing</strong>, 
          <strong> Dual-Fact Constellation (Fact_Air_Measurement + Fact_Air_Daily)</strong>, 
          <strong> Conformed Dimensions</strong>, 
          <strong> Star vs Snowflake Schema Toggles</strong>, 
          <strong> Slowly Changing Dimensions (SCD Type 2)</strong>, and 
          <strong> Analytical Data Marts</strong>.
        </p>
      </div>

      {/* STAR VS SNOWFLAKE INTERACTIVE TOGGLE */}
      <div className="card-data-dashboard p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
          <div>
            <span className="text-[11px] font-mono uppercase text-[#816729]">Schema Modeling</span>
            <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
              Interactive Schema: Star vs. Snowflake
            </h2>
          </div>

          <div className="flex items-center gap-1 bg-[#efefef] p-1 rounded-full font-mono text-xs">
            <button
              onClick={() => setSchemaType('star')}
              className={`px-3 py-1 rounded-full transition-all ${
                schemaType === 'star'
                  ? 'bg-[#202020] text-white font-medium'
                  : 'text-[#4d4d4d] hover:text-[#202020]'
              }`}
            >
              STAR SCHEMA
            </button>
            <button
              onClick={() => setSchemaType('snowflake')}
              className={`px-3 py-1 rounded-full transition-all ${
                schemaType === 'snowflake'
                  ? 'bg-[#202020] text-white font-medium'
                  : 'text-[#4d4d4d] hover:text-[#202020]'
              }`}
            >
              SNOWFLAKE SCHEMA
            </button>
          </div>
        </div>

        {/* Visual Architecture Diagram */}
        <div className="p-6 bg-[#f5f5f5] rounded-xl border border-[#e8e8e8] font-mono text-xs space-y-6">
          <div className="text-[11px] text-[#828282] uppercase flex justify-between">
            <span>Model: {schemaType.toUpperCase()} SCHEMA</span>
            <span>Click any table to inspect fields</span>
          </div>

          {schemaType === 'star' ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedTable('dim_time')}
                  className={`p-3 rounded border text-center transition-all ${
                    selectedTable === 'dim_time'
                      ? 'bg-[#202020] text-white border-[#202020]'
                      : 'bg-[#ffffff] border-[#e8e8e8] text-[#202020]'
                  }`}
                >
                  <div className="font-semibold">DIM_TIME</div>
                  <div className="text-[10px] opacity-80">151.2K Rows • Year → Month → Hour</div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <button
                  onClick={() => setSelectedTable('dim_station')}
                  className={`p-3 rounded border text-center transition-all ${
                    selectedTable === 'dim_station'
                      ? 'bg-[#202020] text-white border-[#202020]'
                      : 'bg-[#ffffff] border-[#e8e8e8] text-[#202020]'
                  }`}
                >
                  <div className="font-semibold">DIM_STATION</div>
                  <div className="text-[10px] opacity-80">558 Monitors • SCD Type 2</div>
                </button>

                <div className="text-[#828282]">───</div>

                <button
                  onClick={() => setSelectedTable('fact_air_daily')}
                  className={`p-4 rounded border text-center transition-all ${
                    selectedTable === 'fact_air_daily'
                      ? 'bg-[#202020] text-white border-[#202020] ring-2 ring-[#ff682c]'
                      : 'bg-[#ffffff] border-[#e8e8e8] text-[#202020]'
                  }`}
                >
                  <div className="text-[10px] uppercase text-[#ff682c]">CENTRAL FACT</div>
                  <div className="text-sm font-semibold">FACT_AIR_DAILY</div>
                  <div className="text-[10px] opacity-80">2.84M Daily Records</div>
                </button>

                <div className="text-[#828282]">───</div>

                <button
                  onClick={() => setSelectedTable('dim_pollutant')}
                  className={`p-3 rounded border text-center transition-all ${
                    selectedTable === 'dim_pollutant'
                      ? 'bg-[#202020] text-white border-[#202020]'
                      : 'bg-[#ffffff] border-[#e8e8e8] text-[#202020]'
                  }`}
                >
                  <div className="font-semibold">DIM_POLLUTANT</div>
                  <div className="text-[10px] opacity-80">15 Species • Particulate/Gas</div>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedTable('dim_time')}
                  className="p-3 rounded border bg-[#ffffff] border-[#e8e8e8] text-[#202020]"
                >
                  <div className="font-semibold">DIM_TIME (Normalized into Dim_Date → Dim_Month → Dim_Year)</div>
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                <div className="flex flex-col items-center gap-1.5 p-2 bg-[#ffffff] rounded border border-[#e8e8e8]">
                  <span className="text-[10px] text-[#828282]">3NF NORMALIZED</span>
                  <div className="text-[11px] font-semibold">Dim_Station</div>
                  <ArrowDown className="w-3 h-3 text-[#828282]" />
                  <div className="text-[11px]">Dim_City</div>
                  <ArrowDown className="w-3 h-3 text-[#828282]" />
                  <div className="text-[11px]">Dim_State</div>
                </div>

                <div className="text-[#828282]">───</div>

                <button
                  onClick={() => setSelectedTable('fact_air_daily')}
                  className="p-4 rounded border bg-[#202020] text-white"
                >
                  <div className="text-[10px] text-[#ff682c]">CENTRAL FACT</div>
                  <div className="text-sm font-semibold">FACT_AIR_DAILY</div>
                </button>

                <div className="text-[#828282]">───</div>

                <div className="flex flex-col items-center gap-1.5 p-2 bg-[#ffffff] rounded border border-[#e8e8e8]">
                  <span className="text-[10px] text-[#828282]">3NF NORMALIZED</span>
                  <div className="text-[11px] font-semibold">Dim_Pollutant</div>
                  <ArrowDown className="w-3 h-3 text-[#828282]" />
                  <div className="text-[11px]">Dim_Pollutant_Group</div>
                </div>
              </div>
            </div>
          )}

          <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] rounded text-xs text-[#4d4d4d] font-sans">
            <strong>Architecture Distinction:</strong> The Star Schema provides maximum query speed for denormalized OLAP slices by minimizing JOIN overhead. The Snowflake Schema normalizes station and pollutant hierarchies into 3NF.
          </div>
        </div>

        {/* Selected Table Inspection */}
        <div className="space-y-4 pt-4 border-t border-[#efefef]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-mono uppercase text-[#816729]">Table Structure</span>
              <h3 className="text-lg font-mono text-[#202020] mt-0.5">
                {activeTable.name} ({activeTable.type})
              </h3>
            </div>
            <div className="font-mono text-xs text-[#828282] space-x-3">
              <span>Grain: <strong className="text-[#202020]">{activeTable.grain}</strong></span>
              <span>•</span>
              <span>Rows: <strong className="text-[#202020]">{activeTable.recordCount}</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table">
              <thead>
                <tr>
                  <th>Column Name</th>
                  <th>Data Type</th>
                  <th>Key / Constraint</th>
                  <th>Analytical Purpose</th>
                </tr>
              </thead>
              <tbody>
                {activeTable.columns.map((col) => (
                  <tr key={col.name}>
                    <td className="font-mono text-[#202020] font-semibold">{col.name}</td>
                    <td className="font-mono text-[#816729]">{col.type}</td>
                    <td className="font-mono">
                      {col.key ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                          col.key === 'PK'
                            ? 'bg-[#202020] text-white'
                            : col.key === 'FK'
                            ? 'bg-[#efefef] text-[#202020]'
                            : 'bg-[#f5f5f5] text-[#4d4d4d]'
                        }`}>
                          {col.key}
                        </span>
                      ) : (
                        <span className="text-[#828282]">—</span>
                      )}
                    </td>
                    <td className="text-xs text-[#4d4d4d] font-sans">{col.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SCD Type 2 */}
      <div className="card-data-dashboard p-6 space-y-4">
        <div className="border-b border-[#efefef] pb-3">
          <div className="text-[11px] font-mono uppercase text-[#816729]">Dimensional Historization</div>
          <h2 className="text-xl text-[#202020]" style={{ fontFamily: 'var(--font-heading)' }}>
            Slowly Changing Dimension (SCD Type 2) Demonstration
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full editorial-table">
            <thead>
              <tr>
                <th>Station Key (PK)</th>
                <th>Station ID (NK)</th>
                <th>Station Name</th>
                <th>City / Sector</th>
                <th>Valid From</th>
                <th>Valid To</th>
                <th>Is Current?</th>
                <th>Change Note</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-mono">10041</td>
                <td className="font-mono text-[#202020] font-semibold">DL_001</td>
                <td className="font-mono">Anand Vihar Monitor 1</td>
                <td className="font-mono">East Delhi Old Sector</td>
                <td className="font-mono">2011-04-01</td>
                <td className="font-mono">2018-09-30</td>
                <td><span className="editorial-tag bg-[#efefef] text-[#828282]">Expired</span></td>
                <td className="text-xs text-[#4d4d4d]">Version 1 (Initial sensor site prior to metro expansion)</td>
              </tr>
              <tr className="bg-[#f5f5f5]">
                <td className="font-mono text-[#202020] font-semibold">10042</td>
                <td className="font-mono text-[#202020] font-semibold">DL_001</td>
                <td className="font-mono text-[#202020] font-semibold">Anand Vihar ISBT Complex</td>
                <td className="font-mono text-[#202020] font-semibold">East Delhi Transit Hub</td>
                <td className="font-mono">2018-10-01</td>
                <td className="font-mono">9999-12-31</td>
                <td><span className="editorial-tag bg-[#202020] text-white">Active Current</span></td>
                <td className="text-xs text-[#202020] font-medium">Version 2 (Relocated to CPCB permanent CAAQM shelter)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
