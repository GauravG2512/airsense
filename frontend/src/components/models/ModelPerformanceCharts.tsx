'use client';

import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { getApiBaseUrl } from '@/lib/api';

const API_BASE = getApiBaseUrl();
const COLORS = ['#ff682c', '#0284c7', '#16a34a', '#7c3aed', '#d97706'];

type MetricRow = Record<string, string | number | null | undefined> & {
  model: string;
};

type ModelMetricsResponse = {
  regression?: MetricRow[];
  classification_required?: MetricRow[];
  forecast?: MetricRow[];
};

type MetricDefinition = {
  key: string;
  label: string;
  format: (value: number) => string;
  higherIsBetter: boolean;
};

type TaskFilter = 'all' | 'regression' | 'classification';

function numericValue(row: MetricRow, key: string) {
  const value = row[key];
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function MetricLineChart({
  title,
  rows,
  metric,
  color = '#ff682c',
}: {
  title: string;
  rows: MetricRow[];
  metric: MetricDefinition;
  color?: string;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const values = rows.flatMap((row) => {
    const value = numericValue(row, metric.key);
    return value === null ? [] : [{ model: row.model, value }];
  });

  if (values.length === 0) {
    return (
      <section className="rounded-lg border border-[#e8e8e8] bg-white p-4" aria-label={title}>
        <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-[#efefef] pb-2">
          <h4 className="text-sm font-medium text-[#202020]">{title}</h4>
        </div>
        <p className="text-xs text-[#828282]">No values available for this metric.</p>
      </section>
    );
  }

  const best = values.reduce((current, item) =>
    metric.higherIsBetter
      ? item.value > current.value ? item : current
      : item.value < current.value ? item : current
  );

  const rawMin = Math.min(...values.map((v) => v.value));
  const rawMax = Math.max(...values.map((v) => v.value));

  const paddingMargin = (rawMax - rawMin) * 0.18 || Math.abs(rawMax * 0.1) || 1;
  const minY = Math.max(0, rawMin - paddingMargin);
  const maxY = rawMax + paddingMargin;
  const yRange = maxY - minY || 1;

  const svgWidth = 520;
  const svgHeight = 220;
  const padLeft = 55;
  const padRight = 35;
  const padTop = 32;
  const padBottom = 58;

  const plotWidth = svgWidth - padLeft - padRight;
  const plotHeight = svgHeight - padTop - padBottom;

  const points = values.map((item, idx) => {
    const x =
      values.length > 1
        ? padLeft + (idx / (values.length - 1)) * plotWidth
        : padLeft + plotWidth / 2;
    const norm = (item.value - minY) / yRange;
    const y = padTop + plotHeight - norm * plotHeight;
    const isBest = item.model === best.model;
    const isChampion = item.model.toLowerCase().includes('champion');
    return { ...item, x, y, idx, isBest, isChampion };
  });

  const polylinePoints = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaPath = `M ${points[0].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} ` +
    points.map((p) => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
    ` L ${points[points.length - 1].x.toFixed(1)} ${(padTop + plotHeight).toFixed(1)} Z`;

  const yTicks = [0, 0.33, 0.66, 1].map((ratio) => {
    const val = minY + ratio * yRange;
    const y = padTop + plotHeight - ratio * plotHeight;
    return { val, y };
  });

  const gradientId = `line-grad-${metric.key}-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <section className="rounded-lg border border-[#e8e8e8] bg-white p-4 space-y-3" aria-label={title}>
      {/* Chart Header */}
      <div className="flex items-baseline justify-between gap-2 border-b border-[#efefef] pb-2">
        <div>
          <h4 className="text-sm font-medium text-[#202020]">{title}</h4>
          <span className="text-[10px] font-mono text-[#828282]">
            {metric.higherIsBetter ? 'Higher is better' : 'Lower is better'}
          </span>
        </div>
        {best && (
          <div className="flex items-center gap-1.5 font-mono text-[11px] bg-[#fdfbf7] border border-[#816729]/30 px-2 py-0.5 rounded">
            <span className="text-[#816729] font-medium">Champion:</span>
            <span className="text-[#202020] font-semibold truncate max-w-[150px]">
              {best.model}
            </span>
            <span className="text-[#ff682c] font-bold">({metric.format(best.value)})</span>
          </div>
        )}
      </div>

      {/* SVG Line Graph */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines & Y-labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padLeft}
                y1={tick.y}
                x2={svgWidth - padRight}
                y2={tick.y}
                stroke="#ebebeb"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padLeft - 8}
                y={tick.y + 3}
                textAnchor="end"
                className="text-[9px] fill-[#888888] font-mono"
              >
                {metric.format(tick.val)}
              </text>
            </g>
          ))}

          {/* Area Fill */}
          <path d={areaPath} fill={`url(#${gradientId})`} />

          {/* Connecting Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={polylinePoints}
          />

          {/* Data Points & Drop Lines */}
          {points.map((pt) => {
            const isHovered = hoveredIdx === pt.idx;
            const isSpecial = pt.isChampion || pt.isBest;

            return (
              <g
                key={pt.model}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(pt.idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Vertical drop line */}
                <line
                  x1={pt.x}
                  y1={pt.y}
                  x2={pt.x}
                  y2={padTop + plotHeight}
                  stroke={isHovered ? color : '#e5e5e5'}
                  strokeDasharray="2 2"
                  strokeWidth={isHovered ? 1.5 : 1}
                />

                {/* Outer halo for champion or hovered */}
                {(isSpecial || isHovered) && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 8 : 6.5}
                    fill={color}
                    fillOpacity={isHovered ? 0.35 : 0.2}
                  />
                )}

                {/* Point circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isSpecial || isHovered ? 4.5 : 3.5}
                  fill={isSpecial ? '#ff682c' : '#ffffff'}
                  stroke={isSpecial ? '#ff682c' : color}
                  strokeWidth={isSpecial ? 2.5 : 2}
                />

                {/* Metric value callout above point */}
                <g transform={`translate(${pt.x}, ${pt.y - 10})`}>
                  <rect
                    x={-24}
                    y={-14}
                    width={48}
                    height={14}
                    rx={3}
                    fill={isSpecial ? '#202020' : '#ffffff'}
                    stroke={isSpecial ? '#ff682c' : '#e0e0e0'}
                    strokeWidth="1"
                    opacity={isHovered || isSpecial ? 1 : 0.9}
                  />
                  <text
                    x={0}
                    y={-4}
                    textAnchor="middle"
                    className={`text-[9px] font-mono font-semibold ${
                      isSpecial ? 'fill-[#ffffff]' : 'fill-[#202020]'
                    }`}
                  >
                    {metric.format(pt.value)}
                  </text>
                </g>

                {/* Model name below X-axis */}
                <g transform={`translate(${pt.x}, ${padTop + plotHeight + 14})`}>
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    className={`text-[9px] font-mono transition-colors ${
                      isSpecial
                        ? 'fill-[#ff682c] font-bold'
                        : isHovered
                        ? 'fill-[#202020] font-semibold'
                        : 'fill-[#666666]'
                    }`}
                    transform="rotate(-20)"
                  >
                    {pt.model.length > 15 ? `${pt.model.slice(0, 13)}...` : pt.model}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Model Legend & Metric List */}
      <div className="pt-2 border-t border-[#f0f0f0] flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-mono">
        {points.map((pt) => {
          const isSpecial = pt.isChampion || pt.isBest;
          return (
            <div
              key={pt.model}
              onMouseEnter={() => setHoveredIdx(pt.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                hoveredIdx === pt.idx
                  ? 'bg-[#f0f0f0]'
                  : isSpecial
                  ? 'bg-[#fdfbf7] text-[#202020]'
                  : 'text-[#4d4d4d]'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: isSpecial ? '#ff682c' : color }}
              />
              <span className={`truncate max-w-[130px] ${isSpecial ? 'font-semibold text-[#202020]' : ''}`}>
                {pt.model}
              </span>
              <span className={`font-semibold ${isSpecial ? 'text-[#ff682c]' : 'text-[#202020]'}`}>
                {metric.format(pt.value)}
              </span>
              {isSpecial && (
                <span className="text-[8px] uppercase tracking-wider px-1 py-0.2 bg-[#ff682c] text-white rounded">
                  Leader
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ChartGroup({
  title,
  description,
  rows,
  metrics,
}: {
  title: string;
  description: string;
  rows: MetricRow[];
  metrics: MetricDefinition[];
}) {
  return (
    <section className="card-data-dashboard p-5 space-y-4">
      <div className="border-b border-[#efefef] pb-3">
        <h3 className="text-lg text-[#202020]">{title}</h3>
        <p className="mt-1 text-[11px] text-[#828282]">{description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metrics.map((metric, idx) => (
          <MetricLineChart
            key={metric.key}
            title={metric.label}
            rows={rows}
            metric={metric}
            color={COLORS[idx % COLORS.length]}
          />
        ))}
      </div>
    </section>
  );
}

const regressionMetrics: MetricDefinition[] = [
  { key: 'mae', label: 'Regression · MAE', format: (value) => value.toFixed(2), higherIsBetter: false },
  { key: 'rmse', label: 'Regression · RMSE', format: (value) => value.toFixed(2), higherIsBetter: false },
  { key: 'r2', label: 'Regression · R²', format: (value) => value.toFixed(3), higherIsBetter: true },
  {
    key: 'elapsed_seconds',
    label: 'Regression · Benchmark runtime',
    format: (value) => `${value.toFixed(2)} s`,
    higherIsBetter: false,
  },
];

const classificationMetrics: MetricDefinition[] = [
  {
    key: 'accuracy',
    label: 'Classification · Accuracy',
    format: (value) => `${(value * 100).toFixed(1)}%`,
    higherIsBetter: true,
  },
  {
    key: 'f1_macro',
    label: 'Classification · Macro F1',
    format: (value) => value.toFixed(3),
    higherIsBetter: true,
  },
  {
    key: 'precision_macro',
    label: 'Classification · Macro precision',
    format: (value) => value.toFixed(3),
    higherIsBetter: true,
  },
  {
    key: 'recall_macro',
    label: 'Classification · Macro recall',
    format: (value) => value.toFixed(3),
    higherIsBetter: true,
  },
  {
    key: 'elapsed_seconds',
    label: 'Classification · Benchmark runtime',
    format: (value) => `${value.toFixed(2)} s`,
    higherIsBetter: false,
  },
];

const forecastMetrics: MetricDefinition[] = [
  { key: 'mae', label: 'Forecast · MAE', format: (value) => value.toFixed(2), higherIsBetter: false },
  { key: 'rmse', label: 'Forecast · RMSE', format: (value) => value.toFixed(2), higherIsBetter: false },
  { key: 'r2', label: 'Forecast · R²', format: (value) => value.toFixed(3), higherIsBetter: true },
];

export function ModelPerformanceCharts({ taskFilter }: { taskFilter: TaskFilter }) {
  const [metrics, setMetrics] = useState<ModelMetricsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/models`, { cache: 'no-store', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
        }
        return response.json() as Promise<ModelMetricsResponse>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setMetrics(result);
      })
      .catch((requestError: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : `Unable to reach the AirSense API at ${API_BASE}.`
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <section className="space-y-5" aria-label="Model performance visualizations">
      <div className="border-b border-[#efefef] pb-3">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#816729]">
          Evaluation Visualizations
        </div>
        <h2 className="mt-1 text-2xl text-[#202020]">Model comparison &amp; performance</h2>
        <p className="mt-1 text-xs text-[#828282]">
          Comparisons use saved backend evaluation metrics. Runtime is measured evaluation elapsed time, not inference latency.
        </p>
      </div>

      {loading && (
        <div className="card-data-dashboard flex min-h-28 items-center justify-center gap-2 text-xs text-[#828282]">
          <RefreshCw className="h-4 w-4 animate-spin text-[#ff682c]" />
          Loading evaluation metrics...
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!loading && metrics && (
        <div className="space-y-5">
          {(taskFilter === 'all' || taskFilter === 'regression')
            && metrics.regression && metrics.regression.length > 0 && (
            <ChartGroup
              title="AQI regression comparison"
              description="Validation error and goodness-of-fit across saved regression model evaluations."
              rows={metrics.regression}
              metrics={regressionMetrics}
            />
          )}
          {(taskFilter === 'all' || taskFilter === 'classification')
            && metrics.classification_required && metrics.classification_required.length > 0 && (
            <ChartGroup
              title="AQI category classification comparison"
              description="Accuracy, macro-averaged metrics, and evaluation runtime across saved classification runs."
              rows={metrics.classification_required}
              metrics={classificationMetrics}
            />
          )}
          {(taskFilter === 'all' || taskFilter === 'regression')
            && metrics.forecast && metrics.forecast.length > 0 && (
            <ChartGroup
              title="24-hour forecast benchmark"
              description="Seasonal-naive baseline compared with the saved XGBoost forecast evaluation."
              rows={metrics.forecast}
              metrics={forecastMetrics}
            />
          )}
        </div>
      )}
      {!loading && !error && !metrics && (
        <div className="card-data-dashboard p-4 text-xs text-[#828282]">
          No model evaluation metrics were returned by the backend.
        </div>
      )}
    </section>
  );
}
