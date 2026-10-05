'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Layers,
  FileCode,
  RefreshCw,
  Database,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

type OlapOperation =
  | 'rollup'
  | 'drilldown'
  | 'slice'
  | 'dice'
  | 'pivot';

interface BackendOlapResponse {
  operation: string;
  source_file: string;
  rows: number;
  columns: string[];
  data: Array<Record<string, string | number | null>>;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000';

const operationMap: Record<string, OlapOperation> = {
  'Roll-up': 'rollup',
  'Drill-down': 'drilldown',
  Slice: 'slice',
  Dice: 'dice',
  Pivot: 'pivot',
};

const operationDescriptions: Record<string, string> = {
  'Roll-up':
    'Move from lower-level detail toward higher-level summaries across dimensional hierarchies.',
  'Drill-down':
    'Move from summary-level data toward finer-grained temporal or geographical detail.',
  Slice:
    'Fix one analytical dimension and inspect the resulting lower-dimensional view.',
  Dice:
    'Select a multidimensional subcube using multiple analytical dimensions.',
  Pivot:
    'Rotate the analytical dimensions to produce a cross-tabulated view.',
};

const operationContext: Record<string, string> = {
  'Roll-up':
    'Station → City → State | Day → Month → Year',
  'Drill-down':
    'Year → Month → Day → Hour',
  Slice:
    'Fixed analytical slice from the warehouse dataset',
  Dice:
    'Multidimensional filtered subcube',
  Pivot:
    'Cross-tabulation of warehouse dimensions',
};

function formatColumnName(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatCellValue(
  value: string | number | null
) {
  if (value === null || value === undefined) {
    return '—';
  }

  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toLocaleString()
      : value.toLocaleString(undefined, {
          maximumFractionDigits: 3,
        });
  }

  return value;
}

export default function OlapPage() {
  const [measure, setMeasure] =
    useState<string>('avg_pm25');

  const [dimension, setDimension] =
    useState<string>('Time');

  const [hierarchy, setHierarchy] =
    useState<string>('Month');

  const [operation, setOperation] =
    useState<string>('Roll-up');

  const [filterCity] =
    useState<string>('All Cities');

  const [result, setResult] =
    useState<BackendOlapResponse | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadOlap = async (
    selectedOperation = operation
  ) => {
    setLoading(true);
    setError(null);

    try {
      const backendOperation =
        operationMap[selectedOperation];

      if (!backendOperation) {
        throw new Error(
          'Unsupported OLAP operation'
        );
      }

      const response = await fetch(
        `${API_BASE}/api/olap?operation=${encodeURIComponent(
          backendOperation
        )}`,
        {
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `AirSense API ${response.status}: ${body}`
        );
      }

      const payload =
        (await response.json()) as BackendOlapResponse;

      setResult(payload);
    } catch (err) {
      setResult(null);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load OLAP data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    Promise.resolve().then(async () => {
      const backendOperation = operationMap[operation];

      if (!backendOperation) {
        if (!ignore) {
          setError('Unsupported OLAP operation');
          setLoading(false);
        }
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE}/api/olap?operation=${encodeURIComponent(
            backendOperation
          )}`,
          { cache: 'no-store' }
        );

        if (!response.ok) {
          const body = await response.text();
          throw new Error(
            `AirSense API ${response.status}: ${body}`
          );
        }

        const payload =
          (await response.json()) as BackendOlapResponse;

        if (!ignore) {
          setResult(payload);
          setError(null);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          setResult(null);
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load OLAP data'
          );
          setLoading(false);
        }
      }
    });

    return () => {
      ignore = true;
    };
  }, [operation]);

  const handleOperationChange = (
    nextOperation: string
  ) => {
    setLoading(true);
    setError(null);
    setOperation(nextOperation);

    if (nextOperation === 'Roll-up') {
      setDimension('Time');
      setHierarchy('Year');
    } else if (nextOperation === 'Drill-down') {
      setDimension('Time');
      setHierarchy('Hour');
    } else if (nextOperation === 'Slice') {
      setDimension('Pollutant');
      setHierarchy('Specific Pollutant');
    } else if (nextOperation === 'Dice') {
      setDimension('Location');
      setHierarchy('City');
    } else if (nextOperation === 'Pivot') {
      setDimension('Location');
      setHierarchy('City');
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#ffffff]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Multidimensional Cube Workspace
          </div>

          <h1
            className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1"
            style={{
              fontFamily:
                'var(--font-heading)',
            }}
          >
            OLAP Explorer
          </h1>

          <p className="text-xs text-[#828282] mt-2 font-sans">
            Interactive access to the
            AirSense data-warehouse analytical
            outputs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge
            label="REAL COLAB WAREHOUSE ARTIFACT"
          />

          <Link
            href="/warehouse"
            className="btn-ghost-sharp text-xs py-1.5 px-3"
          >
            Inspect Schemas →
          </Link>
        </div>
      </div>

      <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-3">
        <div className="font-mono text-[#816729] text-[11px] uppercase font-semibold flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#202020]" />
          3D Multidimensional Cube Architecture:
          Time × Location × Pollutant
        </div>

        <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
          The frontend is connected to the
          AirSense backend, which reads the
          persistent analytical artifacts generated
          from the DWM and ML pipeline. Select an
          OLAP operation to load its corresponding
          warehouse result.
        </p>
      </div>

      <div className="card-data-dashboard p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">
              1. Target Measure
            </label>

            <select
              value={measure}
              onChange={(e) =>
                setMeasure(e.target.value)
              }
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{
                borderRadius: '0px',
              }}
            >
              <option value="avg_pm25">
                Average PM2.5 (µg/m³)
              </option>

              <option value="max_pm25">
                Maximum PM2.5 (µg/m³)
              </option>

              <option value="avg_pm10">
                Average PM10 (µg/m³)
              </option>

              <option value="avg_no2">
                Average NO2 (µg/m³)
              </option>

              <option value="avg_so2">
                Average SO2 (µg/m³)
              </option>

              <option value="avg_co">
                Average CO (mg/m³)
              </option>

              <option value="avg_o3">
                Average O3 (µg/m³)
              </option>

              <option value="aqi">
                CPCB AQI Index
              </option>
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">
              2. Dimension Axis
            </label>

            <select
              value={dimension}
              onChange={(e) => {
                const next =
                  e.target.value;

                setDimension(next);

                if (next === 'Time') {
                  setHierarchy('Month');
                } else if (
                  next === 'Location'
                ) {
                  setHierarchy('City');
                } else {
                  setHierarchy(
                    'Specific Pollutant'
                  );
                }
              }}
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{
                borderRadius: '0px',
              }}
            >
              <option value="Time">
                Dim_Time
              </option>

              <option value="Location">
                Dim_Location / Station
              </option>

              <option value="Pollutant">
                Dim_Pollutant
              </option>
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">
              3. Hierarchy Granularity
            </label>

            <select
              value={hierarchy}
              onChange={(e) =>
                setHierarchy(
                  e.target.value
                )
              }
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] focus:outline-none"
              style={{
                borderRadius: '0px',
              }}
            >
              {dimension === 'Time' ? (
                <>
                  <option value="Year">
                    Year
                  </option>

                  <option value="Month">
                    Month
                  </option>

                  <option value="Day">
                    Day
                  </option>

                  <option value="Hour">
                    Hour
                  </option>
                </>
              ) : dimension === 'Location' ? (
                <>
                  <option value="State">
                    State
                  </option>

                  <option value="City">
                    City
                  </option>

                  <option value="Station">
                    Station
                  </option>
                </>
              ) : (
                <>
                  <option value="Group">
                    Pollutant Group
                  </option>

                  <option value="Specific Pollutant">
                    Specific Pollutant
                  </option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="text-[#828282] uppercase block mb-1 text-[11px] font-semibold">
              4. OLAP Operation
            </label>

            <select
              value={operation}
              onChange={(e) =>
                handleOperationChange(
                  e.target.value
                )
              }
              className="w-full bg-[#f5f5f5] border border-[#e8e8e8] p-2 text-[#202020] font-semibold focus:outline-none"
              style={{
                borderRadius: '0px',
              }}
            >
              <option value="Roll-up">
                Roll-up
              </option>

              <option value="Drill-down">
                Drill-down
              </option>

              <option value="Slice">
                Slice
              </option>

              <option value="Dice">
                Dice
              </option>

              <option value="Pivot">
                Pivot
              </option>
            </select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs font-mono bg-[#f5f5f5] p-3 border border-[#e8e8e8]">
          <div>
            <span className="text-[#828282] uppercase">
              Operation Context:
            </span>{' '}
            <strong className="text-[#202020]">
              {operationContext[
                operation
              ] ||
                'Warehouse analytical operation'}
            </strong>
          </div>

          <div className="flex items-center gap-3 text-[#816729]">
            <Database className="w-3.5 h-3.5" />

            <span>
              {filterCity !== 'All Cities'
                ? filterCity
                : 'All warehouse records'}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            type="button"
            onClick={() =>
              loadOlap(operation)
            }
            disabled={loading}
            className="btn-ghost-sharp text-xs py-2 px-4 inline-flex items-center justify-center gap-2"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />

            {loading
              ? 'Loading warehouse data...'
              : 'Refresh Result'}
          </button>

          <span className="text-[11px] font-mono text-[#828282]">
            Backend:
            {' '}
            {API_BASE}
          </span>
        </div>
      </div>

      {loading && (
        <div className="card-data-dashboard p-8 flex items-center gap-4">
          <RefreshCw className="w-5 h-5 text-[#ff682c] animate-spin" />

          <div>
            <div className="font-mono text-xs uppercase text-[#202020]">
              Querying AirSense backend
            </div>

            <div className="text-xs text-[#828282] mt-1">
              Loading the persisted OLAP
              artifact for {operation}.
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="card-data-dashboard p-6 border border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />

            <div>
              <div className="font-mono text-xs uppercase font-semibold text-red-700">
                OLAP request failed
              </div>

              <p className="text-xs text-red-700 mt-2 break-words">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  loadOlap(operation)
                }
                className="mt-4 text-xs font-mono text-red-800 underline"
              >
                Retry request
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading &&
        !error &&
        result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 card-data-dashboard p-6 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-[#efefef] pb-3">
                <div>
                  <span className="text-[11px] font-mono uppercase text-[#816729]">
                    Result Set
                  </span>

                  <h2
                    className="text-lg text-[#202020] mt-1"
                    style={{
                      fontFamily:
                        'var(--font-heading)',
                    }}
                  >
                    {operation === 'Pivot'
                      ? 'Cross-Tabulation Result'
                      : `Aggregated Warehouse Result`}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                  <span className="font-mono text-xs text-[#828282]">
                    {result.rows.toLocaleString()}{' '}
                    Records
                  </span>
                </div>
              </div>

              <div className="text-[11px] font-mono text-[#828282] flex flex-col sm:flex-row sm:justify-between gap-2">
                <span>
                  Operation:{' '}
                  {result.operation}
                </span>

                <span>
                  Artifact:{' '}
                  {result.source_file}
                </span>
              </div>

              <div className="overflow-x-auto border border-[#efefef]">
                <table className="w-full editorial-table">
                  <thead>
                    <tr>
                      {result.columns.map(
                        (column) => (
                          <th
                            key={column}
                            className="whitespace-nowrap"
                          >
                            {formatColumnName(
                              column
                            )}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {result.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={
                            Math.max(
                              result.columns
                                .length,
                              1
                            )
                          }
                          className="text-center py-10 text-xs text-[#828282]"
                        >
                          No warehouse records
                          returned.
                        </td>
                      </tr>
                    ) : (
                      result.data.map(
                        (row, rowIndex) => (
                          <tr key={rowIndex}>
                            {result.columns.map(
                              (column) => (
                                <td
                                  key={`${rowIndex}-${column}`}
                                  className="font-mono text-xs whitespace-nowrap"
                                >
                                  {formatCellValue(
                                    row[
                                      column
                                    ]
                                  )}
                                </td>
                              )
                            )}
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] font-mono text-[#828282] pt-2 flex flex-col sm:flex-row sm:justify-between gap-2">
                <span>
                  Source: AirSense persisted
                  warehouse artifact
                </span>

                <span>
                  Rows loaded:{' '}
                  {result.rows.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="p-6 bg-[#202020] text-white rounded-xl space-y-4 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-[#333333] pb-2 text-[10px] text-[#828282] uppercase">
                  <span className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5 text-[#ff682c]" />
                    Warehouse Artifact
                  </span>

                  <span className="text-[#ff682c]">
                    {result.operation}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="text-[10px] text-[#828282] uppercase">
                      Source File
                    </div>

                    <div className="mt-1 break-all text-[#ebe6dd]">
                      {result.source_file}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#828282] uppercase">
                      Records
                    </div>

                    <div className="mt-1 text-[#ebe6dd]">
                      {result.rows.toLocaleString()}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#828282] uppercase">
                      Columns
                    </div>

                    <div className="mt-1 text-[#ebe6dd]">
                      {result.columns.length}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#333333]">
                  <div className="text-[10px] text-[#828282] uppercase mb-2">
                    Active Analytical Operation
                  </div>

                  <div className="text-[#ebe6dd] leading-relaxed">
                    {operationDescriptions[
                      operation
                    ]}
                  </div>
                </div>
              </div>

              <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-4 text-xs">
                <div className="font-mono text-[#816729] uppercase font-semibold">
                  DWM OLAP Operations
                </div>

                <div className="space-y-2 text-[#4d4d4d] font-sans leading-relaxed">
                  <div>
                    <strong>
                      Roll-up:
                    </strong>{' '}
                    aggregate upward in the
                    dimensional hierarchy.
                  </div>

                  <div>
                    <strong>
                      Drill-down:
                    </strong>{' '}
                    move toward finer
                    dimensional detail.
                  </div>

                  <div>
                    <strong>
                      Slice:
                    </strong>{' '}
                    fix one analytical
                    dimension.
                  </div>

                  <div>
                    <strong>
                      Dice:
                    </strong>{' '}
                    select a multidimensional
                    subcube.
                  </div>

                  <div>
                    <strong>
                      Pivot:
                    </strong>{' '}
                    rotate dimensions for
                    cross-tabulation.
                  </div>
                </div>
              </div>

              <div className="card-data-dashboard p-5 border border-[#e8e8e8]">
                <div className="text-[10px] font-mono uppercase text-[#828282] mb-2">
                  Backend Connection
                </div>

                <div className="font-mono text-xs text-[#202020] break-all">
                  {API_BASE}
                </div>

                <div className="text-[10px] text-[#828282] mt-2 leading-relaxed">
                  Frontend requests are routed
                  through FastAPI rather than
                  reading warehouse files
                  directly from the browser.
                </div>
              </div>
            </div>
          </div>
        )}

      <DisclaimerBanner />
    </div>
  );
}