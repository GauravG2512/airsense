'use client';

import React, { useEffect, useState } from 'react';
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

function MetricBarChart({
  title,
  rows,
  metric,
}: {
  title: string;
  rows: MetricRow[];
  metric: MetricDefinition;
}) {
  const values = rows.flatMap((row) => {
    const value = numericValue(row, metric.key);
    return value === null ? [] : [{ model: row.model, value }];
  });
  const best = values.length
    ? values.reduce((current, item) =>
        metric.higherIsBetter
          ? item.value > current.value ? item : current
          : item.value < current.value ? item : current
      )
    : null;
  const maxValue = Math.max(...values.map(({ value }) => value), 0);

  return (
    <section className="rounded-lg border border-[#e8e8e8] bg-white p-4" aria-label={title}>
      <div className="mb-3 flex items-baseline justify-between gap-2 border-b border-[#efefef] pb-2">
        <h4 className="text-sm text-[#202020]">{title}</h4>
        <span className="text-[10px] font-mono text-[#828282]">
          {metric.higherIsBetter ? 'Higher is better' : 'Lower is better'}
        </span>
      </div>
      <div className="space-y-3">
        {values.map(({ model, value }, index) => (
          <div key={model} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="truncate text-[#4d4d4d]">
                {model}
                {best?.model === model && (
                  <span className="ml-1 text-[9px] font-semibold uppercase text-[#ff682c]">Best</span>
                )}
              </span>
              <span className="shrink-0 font-mono text-[#202020]">{metric.format(value)}</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-[#f0f0f0]"
              role="meter"
              aria-label={`${model} ${title}`}
              aria-valuemin={0}
              aria-valuemax={maxValue}
              aria-valuenow={value}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${maxValue > 0 ? Math.max((value / maxValue) * 100, 1) : 0}%`,
                  backgroundColor: COLORS[index % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-xs text-[#828282]">No values available for this metric.</p>
        )}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <MetricBarChart
            key={metric.key}
            title={metric.label}
            rows={rows}
            metric={metric}
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
