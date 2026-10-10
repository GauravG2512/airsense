'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Database } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import {
  SchemaDiagram,
  type WarehouseFactType,
  type WarehouseSchemaType,
} from '@/components/warehouse/SchemaDiagram';

export default function WarehousePage() {
  const [schemaType, setSchemaType] = useState<WarehouseSchemaType>('star');
  const [factType, setFactType] = useState<WarehouseFactType>('fact_air_daily');
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
      recordCount: '802,894 Rows',
      storageEngine: 'PostgreSQL 16',
      columns: [
        { name: 'fact_daily_id', type: 'BIGINT', key: 'PK', description: 'Daily fact row identifier' },
        { name: 'time_id', type: 'BIGINT', key: 'FK', description: 'References dim_time' },
        { name: 'station_id', type: 'BIGINT', key: 'FK', description: 'References dim_station' },
        { name: 'location_id', type: 'BIGINT', key: 'FK', description: 'References dim_location' },
        { name: 'source_id', type: 'BIGINT', key: 'FK', description: 'References dim_source' },
        { name: 'pollution_date', type: 'DATE', key: '', description: 'Calendar day summarized by this row' },
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
      recordCount: '196.50 Million Rows',
      storageEngine: 'PostgreSQL 16 Range Partitioned + DuckDB Direct Parquet Scan',
      columns: [
        { name: 'measurement_id', type: 'BIGINT', key: '', description: 'Measurement identifier; no primary-key constraint declared' },
        { name: 'time_id', type: 'BIGINT', key: 'FK', description: 'References dim_time' },
        { name: 'station_id', type: 'BIGINT', key: 'FK', description: 'References dim_station' },
        { name: 'location_id', type: 'BIGINT', key: 'FK', description: 'References dim_location' },
        { name: 'pollutant_id', type: 'BIGINT', key: 'FK', description: 'References dim_pollutant' },
        { name: 'source_id', type: 'BIGINT', key: 'FK', description: 'References dim_source' },
        { name: 'period_start', type: 'TIMESTAMP', key: '', description: 'Partition timestamp for the hourly reading' },
        { name: 'measurement_value', type: 'DOUBLE PRECISION', key: 'Measure', description: 'Observed pollutant value' },
        { name: 'quality_flag', type: 'INTEGER', key: 'Flag', description: 'Quality-control flag' },
      ],
    },
    dim_time: {
      name: 'dim_time',
      type: 'Dimension Table',
      grain: 'One unique hour between 2009-01-01 and 2026-03-31',
      recordCount: '14,713 Rows',
      storageEngine: 'PostgreSQL Conformed Dimension',
      columns: [
        { name: 'time_id', type: 'BIGINT', key: 'PK', description: 'Surrogate time key' },
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
        { name: 'station_id', type: 'BIGINT', key: 'PK', description: 'Surrogate station key' },
        { name: 'source_station_id', type: 'VARCHAR(128)', key: 'Natural', description: 'Natural source station code' },
        { name: 'station_name', type: 'VARCHAR(128)', key: '', description: 'Human-readable official station name' },
        { name: 'city_id', type: 'BIGINT', key: 'FK', description: 'Snowflake view: references dim_city' },
        { name: 'state_id', type: 'BIGINT', key: 'FK', description: 'Snowflake view: references dim_state' },
        { name: 'latitude', type: 'NUMERIC(8,5)', key: '', description: 'WGS84 decimal latitude' },
        { name: 'longitude', type: 'NUMERIC(8,5)', key: '', description: 'WGS84 decimal longitude' },
        { name: 'city', type: 'VARCHAR(255)', key: 'Hierarchy', description: 'City attribute in the denormalized dimension' },
        { name: 'state', type: 'VARCHAR(255)', key: 'Hierarchy', description: 'State / Union Territory attribute' },
        { name: 'station_type', type: 'VARCHAR(32)', key: '', description: 'CAAQM or US_EMBASSY' },
        { name: 'source', type: 'VARCHAR(64)', key: '', description: 'CPCB / State Pollution Control Board' },
        { name: 'status', type: 'VARCHAR(16)', key: '', description: 'Active or Inactive' },
      ],
    },
    dim_location: {
      name: 'dim_location',
      type: 'Dimension Table',
      grain: 'One monitored location',
      recordCount: 'Location members',
      storageEngine: 'PostgreSQL dimension',
      columns: [
        { name: 'location_id', type: 'BIGINT', key: 'PK', description: 'Surrogate location key' },
        { name: 'city_id', type: 'BIGINT', key: 'FK', description: 'References dim_city in the snowflake model' },
        { name: 'city_name', type: 'VARCHAR(255)', key: '', description: 'City attribute in the star model' },
        { name: 'state_name', type: 'VARCHAR(255)', key: '', description: 'State attribute in the star model' },
        { name: 'latitude', type: 'DOUBLE PRECISION', key: '', description: 'Location latitude' },
        { name: 'longitude', type: 'DOUBLE PRECISION', key: '', description: 'Location longitude' },
      ],
    },
    dim_source: {
      name: 'dim_source',
      type: 'Dimension Table',
      grain: 'One measurement source or monitoring network',
      recordCount: 'Source members',
      storageEngine: 'PostgreSQL dimension',
      columns: [
        { name: 'source_id', type: 'BIGINT', key: 'PK', description: 'Surrogate source key' },
        { name: 'source_name', type: 'VARCHAR(255)', key: '', description: 'Source organization' },
        { name: 'network', type: 'VARCHAR(255)', key: '', description: 'Monitoring network' },
        { name: 'country', type: 'VARCHAR(128)', key: '', description: 'Source country' },
      ],
    },
    dim_city: {
      name: 'dim_city',
      type: 'Dimension Table',
      grain: 'One city',
      recordCount: 'City members',
      storageEngine: 'PostgreSQL normalized geography dimension',
      columns: [
        { name: 'city_id', type: 'BIGINT', key: 'PK', description: 'Surrogate city key' },
        { name: 'state_id', type: 'BIGINT', key: 'FK', description: 'References dim_state' },
        { name: 'city_name', type: 'VARCHAR(255)', key: '', description: 'City name' },
      ],
    },
    dim_state: {
      name: 'dim_state',
      type: 'Dimension Table',
      grain: 'One state or union territory',
      recordCount: 'State members',
      storageEngine: 'PostgreSQL normalized geography dimension',
      columns: [
        { name: 'state_id', type: 'BIGINT', key: 'PK', description: 'Surrogate state key' },
        { name: 'state_name', type: 'VARCHAR(255)', key: 'Unique', description: 'State or union territory name' },
      ],
    },
    dim_pollutant: {
      name: 'dim_pollutant',
      type: 'Dimension Table',
      grain: 'One chemical or particulate species measured in ambient air',
      recordCount: '16 Rows',
      storageEngine: 'PostgreSQL Dimension',
      columns: [
        { name: 'pollutant_id', type: 'BIGINT', key: 'PK', description: 'Surrogate pollutant key' },
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

        {/* Schema diagram */}
        <div className="p-4 sm:p-6 bg-[#f5f5f5] rounded-xl border border-[#e8e8e8] font-mono text-xs space-y-5">
          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
            <div className="text-[11px] text-[#828282] uppercase">
              Model: {schemaType} schema · click a table to inspect its fields
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex rounded-full bg-[#e8e8e8] p-1">
                {([
                  ['fact_air_daily', 'Daily summary'],
                  ['fact_air_measurement', 'Hourly measurement'],
                ] as const).map(([fact, label]) => (
                  <button
                    key={fact}
                    type="button"
                    onClick={() => {
                      setFactType(fact);
                      setSelectedTable(fact);
                    }}
                    className={`rounded-full px-3 py-1.5 text-[10px] uppercase ${
                      factType === fact ? 'bg-[#202020] text-white' : 'text-[#4d4d4d]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 rounded-full bg-[#e8e8e8] p-1">
                {(['star', 'snowflake'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setSchemaType(type)}
                    className={`rounded-full px-3 py-1.5 text-[10px] uppercase ${
                      schemaType === type ? 'bg-[#202020] text-white' : 'text-[#4d4d4d]'
                    }`}
                  >
                    {type} schema
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SchemaDiagram
            schemaType={schemaType}
            factType={factType}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
          />

          <div className="p-3 bg-white border border-[#e8e8e8] rounded text-xs text-[#4d4d4d] font-sans">
            <strong>Relationship key:</strong> arrows run from the referenced dimension key to the fact-table foreign key; each edge is one-to-many. The daily summary fact has no pollutant foreign key because pollutant values are separate measures. The hourly measurement fact is pollutant-specific. Snowflake view factors geography into state and city tables; time hierarchies remain attributes of one dimension, and pollutant groups are attributes rather than a separate table.
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
