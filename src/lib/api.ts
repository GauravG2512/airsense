/**
 * AirSense - Environmental Intelligence Platform API Contract
 * Source of Truth: AirSense Product Specification (XKDR India Air Quality Database)
 */

export type AqiCategory =
  | 'Good'
  | 'Satisfactory'
  | 'Moderate'
  | 'Poor'
  | 'Very Poor'
  | 'Severe';

export interface AqiScaleDefinition {
  category: AqiCategory;
  min: number;
  max: number;
  color: string;
  bgLight: string;
  borderColor: string;
  textColor: string;
  description: string;
  healthStatement: string;
}

export const CPCB_AQI_CATEGORIES: Record<AqiCategory, AqiScaleDefinition> = {
  Good: {
    category: 'Good',
    min: 0,
    max: 50,
    color: '#16a34a',
    bgLight: '#f0fdf4',
    borderColor: '#bbf7d0',
    textColor: '#15803d',
    description: 'Minimal impact',
    healthStatement: 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
  },
  Satisfactory: {
    category: 'Satisfactory',
    min: 51,
    max: 100,
    color: '#65a30d',
    bgLight: '#f7fee7',
    borderColor: '#d9f99d',
    textColor: '#4d7c0f',
    description: 'Minor breathing discomfort to sensitive people',
    healthStatement: 'Air quality is acceptable; however, sensitive individuals may experience minor irritation.',
  },
  Moderate: {
    category: 'Moderate',
    min: 101,
    max: 200,
    color: '#d97706',
    bgLight: '#fffbeb',
    borderColor: '#fde68a',
    textColor: '#b45309',
    description: 'Breathing discomfort to people with lungs, asthma and heart diseases',
    healthStatement: 'May cause breathing discomfort to people with lung disease such as asthma, and discomfort to people with heart disease.',
  },
  Poor: {
    category: 'Poor',
    min: 201,
    max: 300,
    color: '#ea580c',
    bgLight: '#fff7ed',
    borderColor: '#fed7aa',
    textColor: '#c2410c',
    description: 'Breathing discomfort to most people on prolonged exposure',
    healthStatement: 'Prolonged exposure may lead to breathing discomfort in most individuals.',
  },
  'Very Poor': {
    category: 'Very Poor',
    min: 301,
    max: 400,
    color: '#dc2626',
    bgLight: '#fef2f2',
    borderColor: '#fecaca',
    textColor: '#b91c1c',
    description: 'Respiratory illness on prolonged exposure',
    healthStatement: 'May cause respiratory illness to the people on prolonged exposure. Pronounced effect on people with existing conditions.',
  },
  Severe: {
    category: 'Severe',
    min: 401,
    max: 500,
    color: '#991b1b',
    bgLight: '#450a0a',
    borderColor: '#7f1d1d',
    textColor: '#f87171',
    description: 'Affects healthy people and seriously impacts those with existing diseases',
    healthStatement: 'May cause severe health impacts even in healthy adults and serious health impairment to people with pulmonary conditions.',
  },
};

export function getAqiCategory(aqi: number): AqiCategory {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export interface Station {
  station_id: string;
  station_name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  station_type: 'CAAQM' | 'US_EMBASSY' | 'STATE_BOARD';
  source: string;
  status: 'Active' | 'Inactive';
  elevation_m?: number;
  installation_year: number;
}

export interface PollutantReading {
  pollutant_id: string;
  pollutant_name: string;
  symbol: string;
  value: number;
  unit: string;
  sub_index: number;
  historical_station_mean: number;
  is_dominant: boolean;
  standard_cpcb_24h: number;
}

export interface AirReading {
  reading_id: string;
  station_id: string;
  station_name: string;
  city: string;
  state: string;
  timestamp: string;
  is_observed: boolean;
  aqi: number;
  aqi_category: AqiCategory;
  dominant_pollutant: string;
  pollutants: PollutantReading[];
  temperature_c?: number;
  humidity_pct?: number;
  wind_speed_kmh?: number;
}

export interface ForecastPoint {
  forecast_hour: number; // +1, +3, +6, +12, +24
  timestamp: string;
  predicted_aqi: number;
  predicted_category: AqiCategory;
  confidence_interval_low: number;
  confidence_interval_high: number;
  dominant_pollutant: string;
}

export interface HistoricalComparison {
  pollutant: string;
  current_value: number;
  historical_baseline: number;
  deviation_percentage: number;
  is_unusual: boolean;
  z_score: number;
  historical_percentile: number;
}

export interface AnomalyReport {
  anomaly_id: string;
  station_id: string;
  station_name: string;
  city: string;
  timestamp: string;
  pollutant: string;
  observed_value: number;
  historical_baseline: number;
  deviation_pct: number;
  z_score: number;
  severity: 'NOTABLE' | 'UNUSUAL' | 'CRITICAL';
  detection_method: 'IQR' | 'Z-score' | 'Isolation Forest' | 'DBSCAN';
  evidence_summary: string;
}

export interface StationCluster {
  cluster_id: number;
  cluster_name: string;
  description: string;
  stations_count: number;
  avg_pm25: number;
  avg_pm10: number;
  avg_no2: number;
  pollution_variability: 'Low' | 'Moderate' | 'High' | 'Extreme';
  peak_frequency: 'Morning' | 'Evening' | 'Bimodal' | 'Uniform';
  sample_stations: string[];
}

export interface ModelMetrics {
  model_id: string;
  model_name: string;
  task_type: 'Regression' | 'Classification' | 'Forecasting';
  target: string;
  version: string;
  mae?: number;
  rmse?: number;
  r2?: number;
  accuracy?: number;
  precision?: number;
  recall?: number;
  macro_f1?: number;
  inference_latency_ms: number;
  status: 'Production' | 'Candidate' | 'Archived';
  selected_rationale?: string;
  training_split: string;
}

export interface FeatureImportanceItem {
  feature_name: string;
  category: 'Pollutant Lag' | 'Rolling Metric' | 'Temporal' | 'Cross-Pollutant' | 'Baseline Deviation';
  importance_score: number;
  shap_direction: 'Positive' | 'Negative';
  description: string;
}

export interface OLAPQueryRequest {
  measure: 'avg_pm25' | 'max_pm25' | 'avg_pm10' | 'avg_no2' | 'avg_so2' | 'avg_co' | 'avg_o3' | 'aqi';
  dimension: 'Time' | 'Location' | 'Station' | 'Pollutant';
  hierarchy_level: 'Year' | 'Quarter' | 'Month' | 'Day' | 'Hour' | 'State' | 'City' | 'Station';
  operation: 'Roll-up' | 'Drill-down' | 'Slice' | 'Dice' | 'Pivot';
  filters?: {
    cities?: string[];
    years?: number[];
    pollutants?: string[];
    seasons?: string[];
  };
}

export interface OLAPQueryResult {
  dimensions: string[];
  records: Array<Record<string, string | number>>;
  generated_sql: string;
  execution_source: 'PostgreSQL Fact Constellation (Simulation)' | 'DuckDB Parquet Scan';
}

export interface DataQualitySummary {
  raw_observations: number; // 196,500,000
  total_stations: number; // 558
  total_pollutants: number; // 15
  time_coverage: string; // January 2009 to March 2026
  missing_pct: number;
  duplicate_pct: number;
  invalid_pct: number;
  outlier_pct: number;
  final_usable_records: number;
  station_coverage_pct: number;
  pollutant_coverage_summary: Array<{
    pollutant: string;
    missing_pct: number;
    station_count: number;
    longest_gap_days: number;
  }>;
}

export interface ETLRunStatus {
  run_id: string;
  stage: 'INGESTION' | 'VALIDATION' | 'CLEANING' | 'TRANSFORMATION' | 'WAREHOUSE_LOAD' | 'AGGREGATION' | 'ML_FEATURE_MART';
  status: 'Completed' | 'Running' | 'Failed';
  records_processed: number;
  records_rejected: number;
  duration_seconds: number;
  rows_inserted: number;
  rows_updated: number;
  timestamp: string;
}
