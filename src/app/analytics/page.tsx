'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { getAqiCategory } from '@/lib/api';
import {
  AqiHeatmap,
  ChartCardWithPlot,
  LineChart,
  Scatter3DChart,
  ScatterChart,
  type AnalyticsChartsData,
  type ChartRecord,
  type LineSeries,
} from '@/components/analytics/NotebookCharts';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const SERIES_COLORS = [
  '#ff682c',
  '#0284c7',
  '#16a34a',
  '#7c3aed',
  '#d97706',
  '#0891b2',
  '#db2777',
  '#4f46e5',
];
const EMPTY_CHART_RECORDS: ChartRecord[] = [];

function numericValue(row: ChartRecord, key: string) {
  const value = row[key];
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function AnalyticsPage() {
  const [charts, setCharts] = useState<AnalyticsChartsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisCity, setAnalysisCity] = useState('Delhi');
  const [pollutionMetric, setPollutionMetric] = useState<'average_aqi' | 'average_pm25'>('average_aqi');
  const [leaderboardYear, setLeaderboardYear] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/api/analytics/visualizations`, {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
        }
        return response.json() as Promise<AnalyticsChartsData>;
      })
      .then(setCharts)
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

  const yearlyPm25 = useMemo<LineSeries[]>(() => [{
    name: 'Annual mean',
    color: '#ff682c',
    points: (charts?.pm25_yearly || []).flatMap((row) => {
      const year = numericValue(row, 'year');
      const mean = numericValue(row, 'pm25_mean');
      return year !== null && mean !== null
        ? [{ x: year, y: mean, label: String(year) }]
        : [];
    }),
  }], [charts]);

  const pcaVariance = useMemo<LineSeries[]>(() => [{
    name: 'Cumulative explained variance',
    color: '#0284c7',
    points: (charts?.pca_variance || []).flatMap((row, index) => {
      const variance = numericValue(row, 'cumulative_variance');
      return variance !== null
        ? [{ x: index + 1, y: variance, label: String(row.component || `PC${index + 1}`) }]
        : [];
    }),
  }], [charts]);

  const forecast = useMemo<LineSeries[]>(() => [{
    name: 'Predicted AQI',
    color: '#d97706',
    points: (charts?.aqi_forecast || []).flatMap((row) => {
      const horizon = numericValue(row, 'horizon_hours');
      const predicted = numericValue(row, 'predicted_aqi');
      return horizon !== null && predicted !== null
        ? [{ x: horizon, y: predicted, label: `${horizon}h` }]
        : [];
    }),
  }], [charts]);

  const cityTrendSeries = useMemo<LineSeries[]>(() => {
    const cityGroups = new Map<string, Array<{ year: number; pm25: number }>>();
    (charts?.warehouse_pm25_by_city || []).forEach((row) => {
      const city = String(row.city_name || '');
      const year = numericValue(row, 'year');
      const pm25 = numericValue(row, 'average_pm25');
      if (!city || year === null || pm25 === null) return;
      const values = cityGroups.get(city) || [];
      values.push({ year, pm25 });
      cityGroups.set(city, values);
    });

    return [...cityGroups.entries()]
      .map(([city, values]) => ({
        city,
        mean: values.reduce((total, value) => total + value.pm25, 0) / values.length,
        values,
      }))
      .sort((a, b) => b.mean - a.mean)
      .slice(0, 8)
      .map((entry, index) => ({
        name: entry.city,
        color: SERIES_COLORS[index],
        points: entry.values
          .sort((a, b) => a.year - b.year)
          .map((value) => ({
            x: value.year,
            y: value.pm25,
            label: String(value.year),
          })),
      }));
  }, [charts]);

  const cityYearRows = charts?.warehouse_city_year ?? EMPTY_CHART_RECORDS;
  const availableCities = useMemo(
    () => [...new Set([
      ...cityYearRows.map((row) => String(row.city_name || '')).filter(Boolean),
      ...(charts?.aqi_month_heatmap || []).map((row) => String(row.city_name || '')).filter(Boolean),
    ])].sort((a, b) => a.localeCompare(b)),
    [charts, cityYearRows]
  );
  const selectedAnalysisCity = availableCities.includes(analysisCity)
    ? analysisCity
    : availableCities[0] || analysisCity;
  const metricLabel = pollutionMetric === 'average_aqi' ? 'Average AQI' : 'Average PM2.5 (µg/m³)';

  const selectedCityAnnualValues = useMemo(
    () => cityYearRows
      .filter((row) => String(row.city_name || '').toLowerCase() === selectedAnalysisCity.toLowerCase())
      .flatMap((row) => {
        const year = numericValue(row, 'year');
        const value = numericValue(row, pollutionMetric);
        return year !== null && value !== null ? [{ year, value }] : [];
      })
      .sort((a, b) => a.year - b.year),
    [cityYearRows, pollutionMetric, selectedAnalysisCity]
  );
  const selectedCityAnnualSeries = useMemo<LineSeries[]>(() => [{
    name: `${selectedAnalysisCity} · annual average`,
    color: '#ff682c',
    points: selectedCityAnnualValues.map(({ year, value }) => ({
      x: year,
      y: value,
      label: year === new Date().getFullYear() ? `${year}*` : String(year),
    })),
  }], [selectedAnalysisCity, selectedCityAnnualValues]);
  const selectedCityYearChange = selectedCityAnnualValues.length > 1
    ? {
        latest: selectedCityAnnualValues[selectedCityAnnualValues.length - 1],
        previous: selectedCityAnnualValues[selectedCityAnnualValues.length - 2],
      }
    : null;
  const selectedCityChangePercent = selectedCityYearChange
    ? ((selectedCityYearChange.latest.value - selectedCityYearChange.previous.value) /
      Math.max(Math.abs(selectedCityYearChange.previous.value), 0.001)) * 100
    : null;

  const selectedCityMonthlyValues = useMemo(() => {
    const row = (charts?.aqi_month_heatmap || []).find(
      (item) => String(item.city_name || '').toLowerCase() === selectedAnalysisCity.toLowerCase()
    );
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const value = row ? numericValue(row, String(month)) : null;
      return value === null ? null : { month, value };
    }).filter((item): item is { month: number; value: number } => item !== null);
  }, [charts, selectedAnalysisCity]);
  const selectedCityMonthlySeries = useMemo<LineSeries[]>(() => [{
    name: `${selectedAnalysisCity} · monthly AQI average`,
    color: '#0284c7',
    points: selectedCityMonthlyValues.map(({ month, value }) => ({
      x: month,
      y: value,
      label: new Date(2024, month - 1, 1).toLocaleString('en', { month: 'short' }),
    })),
  }], [selectedAnalysisCity, selectedCityMonthlyValues]);
  const mostPollutedMonth = selectedCityMonthlyValues.reduce<{ month: number; value: number } | null>(
    (highest, value) => !highest || value.value > highest.value ? value : highest,
    null
  );
  const leastPollutedMonth = selectedCityMonthlyValues.reduce<{ month: number; value: number } | null>(
    (lowest, value) => !lowest || value.value < lowest.value ? value : lowest,
    null
  );

  const leaderboardYears = useMemo(() => {
    const counts = new Map<number, number>();
    cityYearRows.forEach((row) => {
      const year = numericValue(row, 'year');
      const value = numericValue(row, pollutionMetric);
      if (year !== null && value !== null) counts.set(year, (counts.get(year) || 0) + 1);
    });
    return [...counts.entries()]
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year - a.year);
  }, [cityYearRows, pollutionMetric]);
  const maxLeaderboardCoverage = Math.max(0, ...leaderboardYears.map(({ count }) => count));
  const bestCoveredYear = leaderboardYears.find(({ count }) => count >= maxLeaderboardCoverage * 0.75)?.year
    ?? leaderboardYears[0]?.year
    ?? null;
  const selectedLeaderboardYear = leaderboardYear !== null &&
    leaderboardYears.some(({ year }) => year === leaderboardYear)
    ? leaderboardYear
    : bestCoveredYear;
  const selectedLeaderboardCoverage = leaderboardYears.find(({ year }) => year === selectedLeaderboardYear)?.count ?? 0;
  const leaderboardRows = useMemo(
    () => cityYearRows
      .filter((row) => numericValue(row, 'year') === selectedLeaderboardYear && numericValue(row, pollutionMetric) !== null)
      .sort((a, b) => (numericValue(b, pollutionMetric) ?? 0) - (numericValue(a, pollutionMetric) ?? 0)),
    [cityYearRows, pollutionMetric, selectedLeaderboardYear]
  );

  const formatMonth = (month: number) =>
    new Date(2024, month - 1, 1).toLocaleString('en', { month: 'long' });

  const loadAgain = () => {
    setCharts(null);
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/analytics/visualizations`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`AirSense API ${response.status}: ${await response.text()}`);
        }
        return response.json() as Promise<AnalyticsChartsData>;
      })
      .then(setCharts)
      .catch((requestError: unknown) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : `Unable to reach the AirSense API at ${API_BASE}.`
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#ffffff]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider">
            Spatiotemporal Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-[#202020] tracking-[-0.02em] mt-1">
            Air Quality Visualizations
          </h1>
          <p className="text-xs text-[#828282] mt-2">
            Recreated from the Matplotlib figures in AirSense_DWM_ML_COMPLETE using the saved backend artifacts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAgain}
            disabled={loading}
            className="btn-ghost-sharp text-xs py-1.5 px-3 flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh charts
          </button>
          <Link href="/olap" className="btn-ghost-sharp text-xs py-1.5 px-3">
            OLAP Explorer →
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !charts && (
        <div className="card-data-dashboard min-h-48 flex items-center justify-center gap-3 text-xs text-[#828282]">
          <RefreshCw className="w-4 h-4 text-[#ff682c] animate-spin" />
          Querying bounded chart datasets...
        </div>
      )}

      {charts && (
        <div className="space-y-6">
          <section className="card-data-dashboard p-5 sm:p-6 space-y-4">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-[#efefef] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#816729]">
                  City leaderboard
                </div>
                <h2 className="text-lg text-[#202020] mt-1">Most polluted cities by annual average</h2>
                <p className="text-xs text-[#828282] mt-1">
                  Ranked from saved warehouse measurements; the default year prioritizes broad city coverage.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="text-[10px] font-mono text-[#828282] flex items-center gap-2">
                  Measure
                  <select
                    value={pollutionMetric}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'average_aqi' || value === 'average_pm25') setPollutionMetric(value);
                      setLeaderboardYear(null);
                    }}
                    className="border border-[#e8e8e8] bg-white px-2 py-1.5 text-xs text-[#202020]"
                  >
                    <option value="average_aqi">Annual average AQI</option>
                    <option value="average_pm25">Annual average PM2.5</option>
                  </select>
                </label>
                <label className="text-[10px] font-mono text-[#828282] flex items-center gap-2">
                  Year
                  <select
                    value={selectedLeaderboardYear ?? ''}
                    onChange={(event) => setLeaderboardYear(Number(event.target.value))}
                    className="border border-[#e8e8e8] bg-white px-2 py-1.5 text-xs text-[#202020]"
                  >
                    {leaderboardYears.map(({ year, count }) => (
                      <option key={year} value={year}>{year} · {count} cities</option>
                    ))}
                  </select>
                </label>
              </div>
            </header>

            {leaderboardRows.length ? (
              <>
                <div className="text-[10px] font-mono text-[#828282]">
                  Showing {leaderboardRows.length} cities with values for {selectedLeaderboardYear}; coverage: {selectedLeaderboardCoverage} cities.
                  {selectedLeaderboardYear === new Date().getFullYear() ? ' This calendar year may be incomplete.' : ''}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-xs">
                    <thead>
                      <tr className="text-left text-[10px] font-mono uppercase text-[#828282] border-b border-[#efefef]">
                        <th className="py-2 pr-3">Rank</th>
                        <th className="py-2 pr-3">City</th>
                        <th className="py-2 pr-3 text-right">{metricLabel}</th>
                        {pollutionMetric === 'average_aqi' && <th className="py-2 text-right">AQI category</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardRows.slice(0, 10).map((row, index) => {
                        const city = String(row.city_name || 'Unknown');
                        const value = numericValue(row, pollutionMetric);
                        return (
                          <tr key={`${selectedLeaderboardYear}-${city}`} className="border-b border-[#f1f1f1] last:border-0">
                            <td className="py-2.5 pr-3 font-mono text-[#828282]">{String(index + 1).padStart(2, '0')}</td>
                            <td className="py-2.5 pr-3">
                              <button type="button" onClick={() => setAnalysisCity(city)} className="text-[#202020] hover:text-[#ff682c] hover:underline">
                                {city}
                              </button>
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono text-[#202020]">{value?.toFixed(1) ?? '—'}</td>
                            {pollutionMetric === 'average_aqi' && (
                              <td className="py-2.5 text-right text-[#4d4d4d]">{value === null ? '—' : getAqiCategory(value)}</td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-xs text-[#828282] py-8 text-center">No annual city values are available for this measure.</div>
            )}
          </section>

          <section className="card-data-dashboard p-5 sm:p-6 space-y-5">
            <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 border-b border-[#efefef] pb-3">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#816729]">
                  City-wise analysis
                </div>
                <h2 className="text-lg text-[#202020] mt-1">Annual and seasonal pollution trends</h2>
                <p className="text-xs text-[#828282] mt-1">
                  Select a city and measure to inspect yearly averages and its historical month-of-year AQI profile.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="text-[10px] font-mono text-[#828282] flex items-center gap-2">
                  City
                  <select
                    value={selectedAnalysisCity}
                    onChange={(event) => setAnalysisCity(event.target.value)}
                    className="max-w-[220px] border border-[#e8e8e8] bg-white px-2 py-1.5 text-xs text-[#202020]"
                  >
                    {availableCities.map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                </label>
                <label className="text-[10px] font-mono text-[#828282] flex items-center gap-2">
                  Measure
                  <select
                    value={pollutionMetric}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === 'average_aqi' || value === 'average_pm25') setPollutionMetric(value);
                      setLeaderboardYear(null);
                    }}
                    className="border border-[#e8e8e8] bg-white px-2 py-1.5 text-xs text-[#202020]"
                  >
                    <option value="average_aqi">Average AQI</option>
                    <option value="average_pm25">Average PM2.5</option>
                  </select>
                </label>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                <div className="text-[10px] font-mono uppercase text-[#828282]">Latest annual mean</div>
                <div className="text-lg font-mono text-[#202020] mt-1">
                  {selectedCityAnnualValues.length
                    ? `${selectedCityAnnualValues[selectedCityAnnualValues.length - 1].value.toFixed(1)} ${pollutionMetric === 'average_aqi' ? 'AQI' : 'µg/m³'}`
                    : 'Unavailable'}
                </div>
                {selectedCityAnnualValues.length > 0 && (
                  <div className="text-[10px] text-[#828282] mt-1">
                    {selectedCityAnnualValues[selectedCityAnnualValues.length - 1].year}
                    {selectedCityAnnualValues[selectedCityAnnualValues.length - 1].year === new Date().getFullYear() ? ' · partial year' : ''}
                  </div>
                )}
              </div>
              <div className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                <div className="text-[10px] font-mono uppercase text-[#828282]">Change vs previous available year</div>
                {selectedCityYearChange ? (
                  <>
                    <div className={`text-lg font-mono mt-1 ${selectedCityChangePercent !== null && selectedCityChangePercent > 0 ? 'text-red-700' : selectedCityChangePercent !== null && selectedCityChangePercent < 0 ? 'text-emerald-700' : 'text-[#202020]'}`}>
                      {selectedCityChangePercent === null || selectedCityChangePercent === 0
                        ? 'No change'
                        : `${selectedCityChangePercent > 0 ? 'Increase' : 'Decrease'} ${Math.abs(selectedCityChangePercent).toFixed(1)}%`}
                    </div>
                    <div className="text-[10px] text-[#828282] mt-1">
                      {selectedCityYearChange.previous.year} → {selectedCityYearChange.latest.year}
                    </div>
                  </>
                ) : <div className="text-xs text-[#828282] mt-2">At least two annual values are needed.</div>}
              </div>
              <div className="p-3 bg-[#f5f5f5] border border-[#efefef]">
                <div className="text-[10px] font-mono uppercase text-[#828282]">Month-of-year AQI extremes</div>
                {mostPollutedMonth && leastPollutedMonth ? (
                  <div className="text-xs text-[#202020] mt-2 space-y-1">
                    <div>Highest: <strong>{formatMonth(mostPollutedMonth.month)}</strong> · AQI {mostPollutedMonth.value.toFixed(1)}</div>
                    <div>Lowest: <strong>{formatMonth(leastPollutedMonth.month)}</strong> · AQI {leastPollutedMonth.value.toFixed(1)}</div>
                  </div>
                ) : <div className="text-xs text-[#828282] mt-2">Monthly profile unavailable.</div>}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
              <ChartCardWithPlot
                title={`Annual ${metricLabel} · ${selectedAnalysisCity}`}
                description="Year-by-year average from the saved city warehouse aggregates. A star marks the current, potentially incomplete year."
                source="warehouse_year_city.csv · grouped by year and city"
              >
                <LineChart
                  series={selectedCityAnnualSeries}
                  xLabel="Year"
                  yLabel={metricLabel}
                />
              </ChartCardWithPlot>
              <ChartCardWithPlot
                title={`Most and least polluted months · ${selectedAnalysisCity}`}
                description="Historical average AQI for each calendar month; this is a month-of-year profile, not a current-year forecast."
                source="warehouse_aqi_month_heatmap.csv · city monthly AQI means"
              >
                <LineChart
                  series={selectedCityMonthlySeries}
                  xLabel="Month"
                  yLabel="Average AQI"
                />
              </ChartCardWithPlot>
            </div>
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          <ChartCardWithPlot
            title="Historical Daily Mean PM2.5"
            description="Annual average of daily mean PM2.5 measurements."
            source="clean_air_daily.parquet · grouped by year and PM2.5"
          >
            <LineChart series={yearlyPm25} xLabel="Year" yLabel="Mean PM2.5 (µg/m³)" />
          </ChartCardWithPlot>

          <ChartCardWithPlot
            title="PCA Cumulative Explained Variance"
            description="Cumulative share of variance explained as principal components are added."
            source="pca_variance.csv"
          >
            <LineChart
              series={pcaVariance}
              xLabel="Principal component"
              yLabel="Cumulative explained variance"
              yMaximum={1}
              threshold={0.9}
              thresholdLabel="90% variance"
            />
          </ChartCardWithPlot>

          <ChartCardWithPlot
            title="Next 24-Hour AQI Forecast"
            description="Saved model predictions at each forecast horizon."
            source="aqi_forecast_next_24h.parquet"
          >
            <LineChart series={forecast} xLabel="Hours ahead" yLabel="Predicted AQI" />
          </ChartCardWithPlot>

          <ChartCardWithPlot
            title="Warehouse-Derived Historical PM2.5"
            description="Annual PM2.5 trends for the eight cities with the highest available warehouse mean."
            source="warehouse_year_city.csv · top 8 city averages"
          >
            <LineChart
              series={cityTrendSeries}
              xLabel="Year"
              yLabel="Average PM2.5 (µg/m³)"
            />
          </ChartCardWithPlot>

          <ChartCardWithPlot
            title="PCA 2D Projection"
            description="Sampled observations projected onto the first two principal components."
            source={`pca_2d_projection.parquet · ${charts.pca_sample_size.toLocaleString()}-row sample`}
          >
            <ScatterChart rows={charts.pca_2d} dimensions={['PC1', 'PC2']} title="PCA 2D Projection" />
          </ChartCardWithPlot>

          <ChartCardWithPlot
            title="PCA 3D Projection"
            description="The notebook's three component coordinates rendered as an isometric scatter plot."
            source={`pca_3d_projection.parquet · ${charts.pca_sample_size.toLocaleString()}-row sample`}
          >
            <Scatter3DChart rows={charts.pca_3d} sampleSize={charts.pca_sample_size} />
          </ChartCardWithPlot>

          <div className="xl:col-span-2">
            <ChartCardWithPlot
              title="Warehouse AQI Month Heatmap"
              description="Monthly average AQI by city; darker colors indicate higher AQI categories."
              source="warehouse_aqi_month_heatmap.csv · top 30 cities by annual monthly mean"
            >
              <AqiHeatmap rows={charts.aqi_month_heatmap} />
            </ChartCardWithPlot>
          </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
