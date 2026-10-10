import React from 'react';

export type ChartRecord = Record<string, string | number | null | undefined>;

export interface AnalyticsChartsData {
  pm25_yearly: ChartRecord[];
  warehouse_pm25_by_city: ChartRecord[];
  warehouse_city_year?: ChartRecord[];
  aqi_month_heatmap: ChartRecord[];
  pca_variance: ChartRecord[];
  aqi_forecast: ChartRecord[];
  pca_2d: ChartRecord[];
  pca_3d: ChartRecord[];
  pca_sample_size: number;
}

interface ChartCardProps {
  title: string;
  description: string;
  source: string;
  children: React.ReactNode;
}

function ChartCard({ title, description, source, children }: ChartCardProps) {
  return (
    <section className="card-data-dashboard p-5 sm:p-6 space-y-4 min-w-0">
      <header className="border-b border-[#efefef] pb-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#816729]">
          Notebook visualization
        </div>
        <h2 className="text-lg text-[#202020] mt-1">{title}</h2>
        <p className="text-xs text-[#828282] mt-1">{description}</p>
      </header>
      {children}
      <p className="text-[10px] font-mono text-[#828282] border-t border-[#efefef] pt-2">
        Source: {source}
      </p>
    </section>
  );
}

export interface LineSeries {
  name: string;
  color: string;
  points: Array<{ x: number; y: number; label?: string }>;
}

interface LineChartProps {
  series: LineSeries[];
  xLabel: string;
  yLabel: string;
  yMaximum?: number;
  threshold?: number;
  thresholdLabel?: string;
}

export function LineChart({
  series,
  xLabel,
  yLabel,
  yMaximum,
  threshold,
  thresholdLabel,
}: LineChartProps) {
  const width = 760;
  const height = 330;
  const padding = { top: 18, right: 20, bottom: 58, left: 64 };
  const points = series.flatMap((item) => item.points).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return <ChartEmpty />;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const maxY = yMaximum ?? Math.max(...points.map((point) => point.y)) * 1.12;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xPosition = (x: number) =>
    padding.left + ((x - minX) / (maxX - minX || 1)) * plotWidth;
  const yPosition = (y: number) =>
    padding.top + plotHeight - (y / (maxY || 1)) * plotHeight;
  const yTicks = Array.from({ length: 5 }, (_, index) => (maxY * index) / 4);
  const allX = [...new Set(points.map((point) => point.x))].sort((a, b) => a - b);
  const step = Math.max(1, Math.ceil(allX.length / 6));
  const xTicks = allX.filter((_, index) => index % step === 0 || index === allX.length - 1);
  const formatY = (value: number) => (maxY <= 1 ? `${Math.round(value * 100)}%` : `${Math.round(value)}`);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[540px]" role="img" aria-label={`${yLabel} by ${xLabel}`}>
        <title>{`${yLabel} by ${xLabel}`}</title>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={yPosition(tick)} y2={yPosition(tick)} stroke="#e8e8e8" />
            <text x={padding.left - 10} y={yPosition(tick) + 4} textAnchor="end" fill="#828282" fontSize="10">
              {formatY(tick)}
            </text>
          </g>
        ))}
        <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="#828282" />
        <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="#828282" />
        {threshold !== undefined && (
          <g>
            <line x1={padding.left} x2={width - padding.right} y1={yPosition(threshold)} y2={yPosition(threshold)} stroke="#ff682c" strokeDasharray="6 5" />
            <text x={width - padding.right} y={yPosition(threshold) - 5} textAnchor="end" fill="#c2410c" fontSize="10">
              {thresholdLabel || `Threshold ${threshold}`}
            </text>
          </g>
        )}
        {series.map((item) => {
          const valid = item.points.filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
          return (
            <g key={item.name}>
              <polyline
                points={valid.map((point) => `${xPosition(point.x)},${yPosition(point.y)}`).join(' ')}
                fill="none"
                stroke={item.color}
                strokeWidth="2"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {valid.map((point, index) => (
                <circle key={`${item.name}-${point.x}-${index}`} cx={xPosition(point.x)} cy={yPosition(point.y)} r="3.5" fill={item.color}>
                  <title>{`${item.name}: ${point.label || point.x}, ${point.y.toFixed(2)}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
        {xTicks.map((tick) => {
          const point = points.find((item) => item.x === tick);
          return (
            <text key={tick} x={xPosition(tick)} y={height - padding.bottom + 18} textAnchor="middle" fill="#828282" fontSize="10">
              {point?.label || tick}
            </text>
          );
        })}
        <text x={padding.left + plotWidth / 2} y={height - 8} textAnchor="middle" fill="#4d4d4d" fontSize="11">
          {xLabel}
        </text>
        <text transform={`translate(14 ${padding.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fill="#4d4d4d" fontSize="11">
          {yLabel}
        </text>
      </svg>
      {series.length > 1 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-mono mt-2">
          {series.map((item) => (
            <span key={item.name} className="inline-flex items-center gap-1.5 text-[#4d4d4d]">
              <span className="inline-block w-3 h-0.5" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface ScatterChartProps {
  rows: ChartRecord[];
  dimensions: [string, string];
  title: string;
}

export function ScatterChart({ rows, dimensions, title }: ScatterChartProps) {
  const width = 760;
  const height = 330;
  const padding = { top: 18, right: 20, bottom: 52, left: 62 };
  const points = rows
    .map((row) => ({
      x: Number(row[dimensions[0]]),
      y: Number(row[dimensions[1]]),
    }))
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y));
  if (!points.length) return <ChartEmpty />;

  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const xPosition = (value: number) => padding.left + ((value - minX) / (maxX - minX || 1)) * plotWidth;
  const yPosition = (value: number) => padding.top + plotHeight - ((value - minY) / (maxY - minY || 1)) * plotHeight;
  const xTicks = Array.from({ length: 5 }, (_, index) => minX + ((maxX - minX) * index) / 4);
  const yTicks = Array.from({ length: 5 }, (_, index) => minY + ((maxY - minY) * index) / 4);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[540px]" role="img" aria-label={title}>
        <title>{title}</title>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={padding.left} x2={width - padding.right} y1={yPosition(tick)} y2={yPosition(tick)} stroke="#e8e8e8" />
            <text x={padding.left - 8} y={yPosition(tick) + 3} textAnchor="end" fill="#828282" fontSize="9">{tick.toFixed(1)}</text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={tick}>
            <line x1={xPosition(tick)} x2={xPosition(tick)} y1={padding.top} y2={height - padding.bottom} stroke="#f1f1f1" />
            <text x={xPosition(tick)} y={height - padding.bottom + 17} textAnchor="middle" fill="#828282" fontSize="9">{tick.toFixed(1)}</text>
          </g>
        ))}
        {points.map((point, index) => (
          <circle key={`${point.x}-${point.y}-${index}`} cx={xPosition(point.x)} cy={yPosition(point.y)} r="2.4" fill="#ff682c" fillOpacity="0.45">
            <title>{`${dimensions[0]}: ${point.x.toFixed(3)}, ${dimensions[1]}: ${point.y.toFixed(3)}`}</title>
          </circle>
        ))}
        <line x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} stroke="#828282" />
        <line x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} stroke="#828282" />
        <text x={padding.left + plotWidth / 2} y={height - 8} textAnchor="middle" fill="#4d4d4d" fontSize="11">{dimensions[0]}</text>
        <text transform={`translate(14 ${padding.top + plotHeight / 2}) rotate(-90)`} textAnchor="middle" fill="#4d4d4d" fontSize="11">{dimensions[1]}</text>
      </svg>
      <div className="text-[10px] font-mono text-[#828282] mt-1">{points.length.toLocaleString()} sampled observations</div>
    </div>
  );
}

export function Scatter3DChart({ rows, sampleSize }: { rows: ChartRecord[]; sampleSize: number }) {
  const points = rows.map((row) => ({
    x: Number(row.PC1),
    y: Number(row.PC2),
    z: Number(row.PC3),
  })).filter((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && Number.isFinite(point.z));
  if (!points.length) return <ChartEmpty />;

  const project = (x: number, y: number, z: number) => ({
    x: (x - y) * 0.62,
    y: (x + y) * 0.28 - z * 0.72,
  });
  const projected = points.map((point) => project(point.x, point.y, point.z));
  const minX = Math.min(...projected.map((point) => point.x));
  const maxX = Math.max(...projected.map((point) => point.x));
  const minY = Math.min(...projected.map((point) => point.y));
  const maxY = Math.max(...projected.map((point) => point.y));
  const width = 760;
  const height = 330;
  const pad = 34;
  const xPosition = (value: number) => pad + ((value - minX) / (maxX - minX || 1)) * (width - 2 * pad);
  const yPosition = (value: number) => height - pad - ((value - minY) / (maxY - minY || 1)) * (height - 2 * pad);
  const axisOrigin = { x: 92, y: height - 58 };

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[540px]" role="img" aria-label="Three-dimensional PCA projection using PC1, PC2, and PC3">
        <title>Three-dimensional PCA projection using PC1, PC2, and PC3</title>
        {points.map((point, index) => {
          const position = projected[index];
          return (
            <circle key={`${point.x}-${point.y}-${point.z}-${index}`} cx={xPosition(position.x)} cy={yPosition(position.y)} r="2.4" fill="#0284c7" fillOpacity="0.42">
              <title>{`PC1 ${point.x.toFixed(3)}, PC2 ${point.y.toFixed(3)}, PC3 ${point.z.toFixed(3)}`}</title>
            </circle>
          );
        })}
        <line x1={axisOrigin.x} y1={axisOrigin.y} x2={axisOrigin.x + 150} y2={axisOrigin.y - 38} stroke="#ef4444" strokeWidth="2" />
        <line x1={axisOrigin.x} y1={axisOrigin.y} x2={axisOrigin.x + 92} y2={axisOrigin.y + 38} stroke="#16a34a" strokeWidth="2" />
        <line x1={axisOrigin.x} y1={axisOrigin.y} x2={axisOrigin.x} y2={axisOrigin.y - 105} stroke="#2563eb" strokeWidth="2" />
        <text x={axisOrigin.x + 154} y={axisOrigin.y - 40} fill="#b91c1c" fontSize="11">PC1</text>
        <text x={axisOrigin.x + 96} y={axisOrigin.y + 44} fill="#15803d" fontSize="11">PC2</text>
        <text x={axisOrigin.x - 4} y={axisOrigin.y - 112} fill="#1d4ed8" fontSize="11">PC3</text>
      </svg>
      <div className="text-[10px] font-mono text-[#828282] mt-1">
        Isometric 2D rendering of a 3D PCA scatter · {points.length.toLocaleString()} of {sampleSize.toLocaleString()} sampled rows
      </div>
    </div>
  );
}

export function AqiHeatmap({ rows }: { rows: ChartRecord[] }) {
  const monthFields = Array.from({ length: 12 }, (_, index) => String(index + 1));
  const scored = rows.map((row) => {
    const values = monthFields.map((month) => {
      const value = Number(row[month]);
      return row[month] !== null && row[month] !== undefined && Number.isFinite(value)
        ? value
        : null;
    });
    const availableValues = values.filter((value): value is number => value !== null);
    return {
      city: String(row.city_name || 'Unknown'),
      values,
      mean: availableValues.length
        ? availableValues.reduce((total, value) => total + value, 0) / availableValues.length
        : 0,
    };
  }).sort((a, b) => b.mean - a.mean).slice(0, 30);

  if (!scored.length) return <ChartEmpty />;

  const categoryColor = (aqi: number) => {
    if (aqi <= 50) return '#16a34a';
    if (aqi <= 100) return '#65a30d';
    if (aqi <= 200) return '#d97706';
    if (aqi <= 300) return '#ea580c';
    if (aqi <= 400) return '#dc2626';
    return '#991b1b';
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full min-w-[670px] border-separate border-spacing-[2px] text-[9px] font-mono">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="text-left text-[#828282] font-normal px-1 py-1">City</th>
              {monthFields.map((month) => <th key={month} className="text-center text-[#828282] font-normal px-1 py-1">{month.padStart(2, '0')}</th>)}
            </tr>
          </thead>
          <tbody>
            {scored.map((row) => (
              <tr key={row.city}>
                <th className="text-left text-[#4d4d4d] font-normal px-1 whitespace-nowrap">{row.city}</th>
                {monthFields.map((month, index) => {
                  const value = row.values[index];
                  const hasValue = value !== null;
                  return (
                    <td key={month} className="p-0">
                      <div
                        className="h-5 min-w-8 flex items-center justify-center text-white"
                        style={{ backgroundColor: hasValue ? categoryColor(value) : '#e8e8e8' }}
                        title={hasValue ? `${row.city} · Month ${month} · AQI ${value.toFixed(1)}` : `${row.city} · Month ${month} · No value`}
                      >
                        {hasValue ? Math.round(value) : '—'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[9px] font-mono text-[#4d4d4d]">
        {[
          ['Good', '#16a34a'],
          ['Satisfactory', '#65a30d'],
          ['Moderate', '#d97706'],
          ['Poor', '#ea580c'],
          ['Very Poor', '#dc2626'],
          ['Severe', '#991b1b'],
        ].map(([label, color]) => (
          <span key={label} className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
      </div>
      <div className="text-[10px] font-mono text-[#828282]">Top 30 cities ranked by mean AQI across available months; cell labels show AQI.</div>
    </div>
  );
}

export function ChartCardWithPlot({
  title,
  description,
  source,
  children,
}: ChartCardProps) {
  return <ChartCard title={title} description={description} source={source}>{children}</ChartCard>;
}

export function ChartEmpty() {
  return (
    <div className="min-h-40 flex items-center justify-center bg-[#f5f5f5] border border-[#efefef] text-xs text-[#828282]">
      No plot data is available.
    </div>
  );
}
