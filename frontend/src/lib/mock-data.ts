import {
  Station,
  AirReading,
  ForecastPoint,
  HistoricalComparison,
  AnomalyReport,
  StationCluster,
  ModelMetrics,
  FeatureImportanceItem,
  DataQualitySummary,
  ETLRunStatus,
  OLAPQueryResult,
  getAqiCategory,
  CPCB_AQI_CATEGORIES,
} from './api';

export const MONITORED_STATIONS: Station[] = [
  {
    station_id: 'DL_001',
    station_name: 'Anand Vihar, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6476,
    longitude: 77.3158,
    station_type: 'CAAQM',
    source: 'CPCB',
    status: 'Active',
    installation_year: 2011,
  },
  {
    station_id: 'DL_002',
    station_name: 'ITO Crossing, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.6318,
    longitude: 77.2410,
    station_type: 'CAAQM',
    source: 'CPCB',
    status: 'Active',
    installation_year: 2010,
  },
  {
    station_id: 'DL_003',
    station_name: 'R K Puram, Delhi',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5638,
    longitude: 77.1869,
    station_type: 'CAAQM',
    source: 'CPCB',
    status: 'Active',
    installation_year: 2012,
  },
  {
    station_id: 'DL_004',
    station_name: 'US Embassy, Chanakyapuri',
    city: 'Delhi',
    state: 'Delhi',
    latitude: 28.5983,
    longitude: 77.1895,
    station_type: 'US_EMBASSY',
    source: 'AirNow / US Dept of State',
    status: 'Active',
    installation_year: 2014,
  },
  {
    station_id: 'MH_001',
    station_name: 'BKC, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.0664,
    longitude: 72.8682,
    station_type: 'CAAQM',
    source: 'MPCB / CPCB',
    status: 'Active',
    installation_year: 2015,
  },
  {
    station_id: 'MH_002',
    station_name: 'Andheri East, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 19.1197,
    longitude: 72.8697,
    station_type: 'CAAQM',
    source: 'MPCB / CPCB',
    status: 'Active',
    installation_year: 2016,
  },
  {
    station_id: 'MH_003',
    station_name: 'Colaba, Mumbai',
    city: 'Mumbai',
    state: 'Maharashtra',
    latitude: 18.9067,
    longitude: 72.8147,
    station_type: 'CAAQM',
    source: 'MPCB / CPCB',
    status: 'Active',
    installation_year: 2014,
  },
  {
    station_id: 'KA_001',
    station_name: 'BTM Layout, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 12.9135,
    longitude: 77.6101,
    station_type: 'CAAQM',
    source: 'KSPCB / CPCB',
    status: 'Active',
    installation_year: 2015,
  },
  {
    station_id: 'KA_002',
    station_name: 'Peenya Industrial Area, Bengaluru',
    city: 'Bengaluru',
    state: 'Karnataka',
    latitude: 13.0285,
    longitude: 77.5197,
    station_type: 'CAAQM',
    source: 'KSPCB / CPCB',
    status: 'Active',
    installation_year: 2013,
  },
  {
    station_id: 'MH_004',
    station_name: 'Shivajinagar, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5314,
    longitude: 73.8446,
    station_type: 'CAAQM',
    source: 'MPCB / CPCB',
    status: 'Active',
    installation_year: 2016,
  },
  {
    station_id: 'MH_005',
    station_name: 'Pashan, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    latitude: 18.5362,
    longitude: 73.7928,
    station_type: 'CAAQM',
    source: 'IITM / SAFAR',
    status: 'Active',
    installation_year: 2015,
  },
  {
    station_id: 'TS_001',
    station_name: 'Sanathnagar, Hyderabad',
    city: 'Hyderabad',
    state: 'Telangana',
    latitude: 17.4589,
    longitude: 78.4358,
    station_type: 'CAAQM',
    source: 'TSPCB / CPCB',
    status: 'Active',
    installation_year: 2014,
  },
  {
    station_id: 'WB_001',
    station_name: 'Victoria Memorial, Kolkata',
    city: 'Kolkata',
    state: 'West Bengal',
    latitude: 22.5448,
    longitude: 88.3426,
    station_type: 'CAAQM',
    source: 'WBPCB / CPCB',
    status: 'Active',
    installation_year: 2013,
  },
  {
    station_id: 'TN_001',
    station_name: 'Alandur Bus Depot, Chennai',
    city: 'Chennai',
    state: 'Tamil Nadu',
    latitude: 13.0033,
    longitude: 80.2015,
    station_type: 'CAAQM',
    source: 'TNPCB / CPCB',
    status: 'Active',
    installation_year: 2014,
  },
  {
    station_id: 'UP_001',
    station_name: 'Lalbagh, Lucknow',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    latitude: 26.8504,
    longitude: 80.9388,
    station_type: 'CAAQM',
    source: 'UPPCB / CPCB',
    status: 'Active',
    installation_year: 2015,
  },
  {
    station_id: 'RJ_001',
    station_name: 'Adarsh Nagar, Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    latitude: 26.9028,
    longitude: 75.8344,
    station_type: 'CAAQM',
    source: 'RSPCB / CPCB',
    status: 'Active',
    installation_year: 2016,
  },
  {
    station_id: 'BR_001',
    station_name: 'Muradpur, Patna',
    city: 'Patna',
    state: 'Bihar',
    latitude: 25.6207,
    longitude: 85.1666,
    station_type: 'CAAQM',
    source: 'BSPCB / CPCB',
    status: 'Active',
    installation_year: 2016,
  },
];

export const ALL_15_POLLUTANTS = [
  { id: 'POL_01', name: 'PM2.5', symbol: 'PM2.5', unit: 'µg/m³', group: 'Particulate', aqi_supported: true },
  { id: 'POL_02', name: 'PM10', symbol: 'PM10', unit: 'µg/m³', group: 'Particulate', aqi_supported: true },
  { id: 'POL_03', name: 'Nitrogen Dioxide', symbol: 'NO2', unit: 'µg/m³', group: 'Gaseous', aqi_supported: true },
  { id: 'POL_04', name: 'Sulphur Dioxide', symbol: 'SO2', unit: 'µg/m³', group: 'Gaseous', aqi_supported: true },
  { id: 'POL_05', name: 'Carbon Monoxide', symbol: 'CO', unit: 'mg/m³', group: 'Gaseous', aqi_supported: true },
  { id: 'POL_06', name: 'Ozone', symbol: 'O3', unit: 'µg/m³', group: 'Gaseous', aqi_supported: true },
  { id: 'POL_07', name: 'Ammonia', symbol: 'NH3', unit: 'µg/m³', group: 'Gaseous', aqi_supported: true },
  { id: 'POL_08', name: 'Lead', symbol: 'Pb', unit: 'µg/m³', group: 'Particulate', aqi_supported: true },
  { id: 'POL_09', name: 'Nitric Oxide', symbol: 'NO', unit: 'µg/m³', group: 'Gaseous', aqi_supported: false },
  { id: 'POL_10', name: 'Oxides of Nitrogen', symbol: 'NOx', unit: 'ppb', group: 'Gaseous', aqi_supported: false },
  { id: 'POL_11', name: 'Benzene', symbol: 'Benzene', unit: 'µg/m³', group: 'VOC', aqi_supported: false },
  { id: 'POL_12', name: 'Toluene', symbol: 'Toluene', unit: 'µg/m³', group: 'VOC', aqi_supported: false },
  { id: 'POL_13', name: 'Xylene', symbol: 'Xylene', unit: 'µg/m³', group: 'VOC', aqi_supported: false },
  { id: 'POL_14', name: 'Ethylbenzene', symbol: 'Ethylbenzene', unit: 'µg/m³', group: 'VOC', aqi_supported: false },
  { id: 'POL_15', name: 'MP-Xylene', symbol: 'MP-Xylene', unit: 'µg/m³', group: 'VOC', aqi_supported: false },
];

export function getStationAirReading(stationId: string): AirReading {
  const station = MONITORED_STATIONS.find((s) => s.station_id === stationId) || MONITORED_STATIONS[4]; // BKC Mumbai default

  // Realistic deterministic simulation based on station profile
  let pm25 = 72;
  let pm10 = 111;
  let no2 = 43;
  let so2 = 21;
  let co = 1.2;
  let o3 = 38;
  let nh3 = 18;

  if (station.city === 'Delhi') {
    pm25 = 168;
    pm10 = 245;
    no2 = 68;
    so2 = 24;
    co = 2.1;
    o3 = 45;
    nh3 = 32;
  } else if (station.city === 'Bengaluru') {
    pm25 = 38;
    pm10 = 62;
    no2 = 26;
    so2 = 12;
    co = 0.8;
    o3 = 28;
    nh3 = 11;
  } else if (station.city === 'Patna' || station.city === 'Lucknow') {
    pm25 = 152;
    pm10 = 215;
    no2 = 54;
    so2 = 19;
    co = 1.8;
    o3 = 41;
    nh3 = 28;
  } else if (station.city === 'Chennai') {
    pm25 = 48;
    pm10 = 74;
    no2 = 22;
    so2 = 14;
    co = 0.9;
    o3 = 31;
    nh3 = 14;
  }

  // CPCB sub-index approximation
  // PM2.5 sub-index: 0-30 => 0-50, 31-60 => 51-100, 61-90 => 101-200, 91-120 => 201-300, 121-250 => 301-400, 250+ => 401-500
  let subPm25 = 0;
  if (pm25 <= 30) subPm25 = (pm25 / 30) * 50;
  else if (pm25 <= 60) subPm25 = 50 + ((pm25 - 30) / 30) * 50;
  else if (pm25 <= 90) subPm25 = 100 + ((pm25 - 60) / 30) * 100;
  else if (pm25 <= 120) subPm25 = 200 + ((pm25 - 90) / 30) * 100;
  else if (pm25 <= 250) subPm25 = 300 + ((pm25 - 120) / 130) * 100;
  else subPm25 = 400 + Math.min(100, ((pm25 - 250) / 130) * 100);

  const aqiValue = Math.round(subPm25);
  const category = getAqiCategory(aqiValue);

  return {
    reading_id: `RDG_${station.station_id}_CURRENT`,
    station_id: station.station_id,
    station_name: station.station_name,
    city: station.city,
    state: station.state,
    timestamp: '2026-03-28T19:00:00+05:30 (Simulation)',
    is_observed: true,
    aqi: aqiValue,
    aqi_category: category,
    dominant_pollutant: 'PM2.5',
    temperature_c: 28.4,
    humidity_pct: 64,
    wind_speed_kmh: 9.8,
    pollutants: [
      {
        pollutant_id: 'POL_01',
        pollutant_name: 'Particulate Matter 2.5',
        symbol: 'PM2.5',
        value: pm25,
        unit: 'µg/m³',
        sub_index: aqiValue,
        historical_station_mean: 58.2,
        is_dominant: true,
        standard_cpcb_24h: 60,
      },
      {
        pollutant_id: 'POL_02',
        pollutant_name: 'Particulate Matter 10',
        symbol: 'PM10',
        value: pm10,
        unit: 'µg/m³',
        sub_index: Math.round(pm10 * 0.95),
        historical_station_mean: 98.4,
        is_dominant: false,
        standard_cpcb_24h: 100,
      },
      {
        pollutant_id: 'POL_03',
        pollutant_name: 'Nitrogen Dioxide',
        symbol: 'NO2',
        value: no2,
        unit: 'µg/m³',
        sub_index: Math.round(no2 * 1.1),
        historical_station_mean: 36.1,
        is_dominant: false,
        standard_cpcb_24h: 80,
      },
      {
        pollutant_id: 'POL_04',
        pollutant_name: 'Sulphur Dioxide',
        symbol: 'SO2',
        value: so2,
        unit: 'µg/m³',
        sub_index: Math.round(so2 * 0.6),
        historical_station_mean: 18.5,
        is_dominant: false,
        standard_cpcb_24h: 80,
      },
      {
        pollutant_id: 'POL_05',
        pollutant_name: 'Carbon Monoxide',
        symbol: 'CO',
        value: co,
        unit: 'mg/m³',
        sub_index: Math.round(co * 40),
        historical_station_mean: 1.1,
        is_dominant: false,
        standard_cpcb_24h: 2.0,
      },
      {
        pollutant_id: 'POL_06',
        pollutant_name: 'Ozone',
        symbol: 'O3',
        value: o3,
        unit: 'µg/m³',
        sub_index: Math.round(o3 * 0.7),
        historical_station_mean: 34.0,
        is_dominant: false,
        standard_cpcb_24h: 100,
      },
      {
        pollutant_id: 'POL_07',
        pollutant_name: 'Ammonia',
        symbol: 'NH3',
        value: nh3,
        unit: 'µg/m³',
        sub_index: Math.round(nh3 * 0.3),
        historical_station_mean: 16.2,
        is_dominant: false,
        standard_cpcb_24h: 400,
      },
    ],
  };
}

export function getStationForecast(stationId: string): ForecastPoint[] {
  const baseReading = getStationAirReading(stationId);
  const baseAqi = baseReading.aqi;

  const intervals = [
    { hour: 1, delta: -3, err: 6 },
    { hour: 3, delta: +8, err: 12 },
    { hour: 6, delta: +22, err: 18 },
    { hour: 12, delta: -15, err: 24 },
    { hour: 24, delta: -5, err: 30 },
  ];

  return intervals.map((int) => {
    const predicted = Math.max(20, Math.min(480, baseAqi + int.delta));
    return {
      forecast_hour: int.hour,
      timestamp: `+${int.hour}h (${new Date(Date.now() + int.hour * 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      predicted_aqi: predicted,
      predicted_category: getAqiCategory(predicted),
      confidence_interval_low: Math.max(10, predicted - int.err),
      confidence_interval_high: Math.min(500, predicted + int.err),
      dominant_pollutant: 'PM2.5',
    };
  });
}

export function getStationHistoricalBaseline(stationId: string): HistoricalComparison[] {
  const current = getStationAirReading(stationId);

  return [
    {
      pollutant: 'PM2.5',
      current_value: current.pollutants[0].value,
      historical_baseline: current.pollutants[0].historical_station_mean,
      deviation_percentage: Number(
        (((current.pollutants[0].value - current.pollutants[0].historical_station_mean) /
          current.pollutants[0].historical_station_mean) *
          100).toFixed(1)
      ),
      is_unusual: current.pollutants[0].value > current.pollutants[0].historical_station_mean * 1.35,
      z_score: 1.42,
      historical_percentile: 74,
    },
    {
      pollutant: 'PM10',
      current_value: current.pollutants[1].value,
      historical_baseline: current.pollutants[1].historical_station_mean,
      deviation_percentage: Number(
        (((current.pollutants[1].value - current.pollutants[1].historical_station_mean) /
          current.pollutants[1].historical_station_mean) *
          100).toFixed(1)
      ),
      is_unusual: false,
      z_score: 0.88,
      historical_percentile: 62,
    },
    {
      pollutant: 'NO2',
      current_value: current.pollutants[2].value,
      historical_baseline: current.pollutants[2].historical_station_mean,
      deviation_percentage: Number(
        (((current.pollutants[2].value - current.pollutants[2].historical_station_mean) /
          current.pollutants[2].historical_station_mean) *
          100).toFixed(1)
      ),
      is_unusual: false,
      z_score: 0.65,
      historical_percentile: 57,
    },
  ];
}

export const ANOMALIES_SAMPLE: AnomalyReport[] = [
  {
    anomaly_id: 'ANOM_2026_03_01',
    station_id: 'MH_002',
    station_name: 'Andheri East, Mumbai',
    city: 'Mumbai',
    timestamp: '2026-03-24T22:00:00+05:30',
    pollutant: 'PM2.5',
    observed_value: 234.8,
    historical_baseline: 64.2,
    deviation_pct: 265.7,
    z_score: 3.82,
    severity: 'CRITICAL',
    detection_method: 'Isolation Forest',
    evidence_summary: 'Sudden 3.8σ spike between 21:00 and 23:00 unmatched by nearby Colaba/BKC monitors; isolated localized combustion pattern.',
  },
  {
    anomaly_id: 'ANOM_2026_03_02',
    station_id: 'DL_001',
    station_name: 'Anand Vihar, Delhi',
    city: 'Delhi',
    timestamp: '2026-03-21T03:00:00+05:30',
    pollutant: 'NO2',
    observed_value: 198.4,
    historical_baseline: 52.1,
    deviation_pct: 280.8,
    z_score: 3.41,
    severity: 'UNUSUAL',
    detection_method: 'Z-score',
    evidence_summary: 'Severe midnight NO2 accumulation exceeding CPCB 24h standard by 2.48x under low planetary boundary layer conditions.',
  },
  {
    anomaly_id: 'ANOM_2026_03_03',
    station_id: 'KA_002',
    station_name: 'Peenya Industrial Area, Bengaluru',
    city: 'Bengaluru',
    timestamp: '2026-03-18T14:00:00+05:30',
    pollutant: 'SO2',
    observed_value: 112.0,
    historical_baseline: 16.4,
    deviation_pct: 582.9,
    z_score: 4.12,
    severity: 'CRITICAL',
    detection_method: 'IQR',
    evidence_summary: 'Observed value exceeds Q3 + 3.0*IQR threshold; localized industrial batch discharge event in Peenya sector.',
  },
  {
    anomaly_id: 'ANOM_2026_03_04',
    station_id: 'UP_001',
    station_name: 'Lalbagh, Lucknow',
    city: 'Lucknow',
    timestamp: '2026-03-15T18:00:00+05:30',
    pollutant: 'PM10',
    observed_value: 412.5,
    historical_baseline: 135.0,
    deviation_pct: 205.5,
    z_score: 2.94,
    severity: 'UNUSUAL',
    detection_method: 'DBSCAN',
    evidence_summary: 'Distance to density core exceeded epsilon boundary during localized dust squall.',
  },
];

export const STATION_CLUSTERS: StationCluster[] = [
  {
    cluster_id: 1,
    cluster_name: 'Coastal & Southern Lower Particulate',
    description: 'Stations with marine boundary layer dispersion, relatively lower average particulate concentration and moderate ozone cycles.',
    stations_count: 142,
    avg_pm25: 42.6,
    avg_pm10: 74.1,
    avg_no2: 24.8,
    pollution_variability: 'Low',
    peak_frequency: 'Evening',
    sample_stations: ['Colaba, Mumbai', 'BTM Layout, Bengaluru', 'Alandur, Chennai'],
  },
  {
    cluster_id: 2,
    cluster_name: 'Indo-Gangetic Plain High Particulate',
    description: 'Landlocked northern plains experiencing winter thermal inversion, biomass trapping, and consistently elevated particulate matter.',
    stations_count: 218,
    avg_pm25: 148.2,
    avg_pm10: 236.4,
    avg_no2: 61.2,
    pollution_variability: 'Extreme',
    peak_frequency: 'Bimodal',
    sample_stations: ['Anand Vihar, Delhi', 'Muradpur, Patna', 'Lalbagh, Lucknow'],
  },
  {
    cluster_id: 3,
    cluster_name: 'Dense Traffic Multi-Pollutant Corridors',
    description: 'Urban traffic and mixed commercial hubs characterized by high primary NO2 and CO emissions with sharp morning and evening rush peaks.',
    stations_count: 114,
    avg_pm25: 84.5,
    avg_pm10: 138.2,
    avg_no2: 78.4,
    pollution_variability: 'Moderate',
    peak_frequency: 'Bimodal',
    sample_stations: ['ITO Crossing, Delhi', 'BKC, Mumbai', 'Shivajinagar, Pune'],
  },
  {
    cluster_id: 4,
    cluster_name: 'Industrial Concentrated Heavy SO2/PM10',
    description: 'Clustered around manufacturing clusters, point-source industrial emission zones with elevated SO2 and PM10 to PM2.5 coarse fractions.',
    stations_count: 84,
    avg_pm25: 96.1,
    avg_pm10: 182.7,
    avg_no2: 44.5,
    pollution_variability: 'High',
    peak_frequency: 'Uniform',
    sample_stations: ['Peenya, Bengaluru', 'Bollaram, Hyderabad', 'Manali, Chennai'],
  },
];

export const MODEL_REGRESSION_METRICS: ModelMetrics[] = [
  {
    model_id: 'REG_01',
    model_name: 'Linear Regression (Baseline)',
    task_type: 'Regression',
    target: 'AQI (+1h to +24h)',
    version: '1.0.0',
    mae: 24.31,
    rmse: 38.12,
    r2: 0.640,
    inference_latency_ms: 0.2,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'REG_02',
    model_name: 'Random Forest Regressor',
    task_type: 'Regression',
    target: 'AQI (+1h to +24h)',
    version: '1.2.0',
    mae: 14.82,
    rmse: 28.51,
    r2: 0.762,
    inference_latency_ms: 8.4,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'REG_03',
    model_name: 'XGBoost Regressor (Evaluated Runner-Up)',
    task_type: 'Regression',
    target: 'AQI (+1h to +24h)',
    version: '1.3.0',
    mae: 10.607,
    rmse: 24.493,
    r2: 0.8148,
    inference_latency_ms: 4.66,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'REG_04',
    model_name: 'LightGBM Regressor (Production Champion)',
    task_type: 'Regression',
    target: 'AQI (+1h to +24h)',
    version: '1.4.0',
    mae: 10.706,
    rmse: 24.478,
    r2: 0.8150,
    inference_latency_ms: 2.15,
    status: 'Production',
    selected_rationale: 'Lowest validation RMSE (24.478) penalizing large tail spikes + High R² (0.8150) + Sub-3ms inference latency + Superior histogram binning speed on 1.5M rows.',
    training_split: 'Chronological Train (2009-2023) / Val (2024) / Test (2025-2026)',
  },
];

export const MODEL_CLASSIFICATION_METRICS: ModelMetrics[] = [
  {
    model_id: 'CLS_01',
    model_name: 'Logistic Regression (Baseline)',
    task_type: 'Classification',
    target: 'CPCB 6-Category AQI',
    version: '1.0.0',
    accuracy: 0.71,
    precision: 0.69,
    recall: 0.68,
    macro_f1: 0.68,
    inference_latency_ms: 1.1,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'CLS_02',
    model_name: 'Decision Tree Classifier',
    task_type: 'Classification',
    target: 'CPCB 6-Category AQI',
    version: '1.1.0',
    accuracy: 0.77,
    precision: 0.75,
    recall: 0.76,
    macro_f1: 0.75,
    inference_latency_ms: 1.5,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'CLS_03',
    model_name: 'Random Forest Classifier',
    task_type: 'Classification',
    target: 'CPCB 6-Category AQI',
    version: '1.2.0',
    accuracy: 0.85,
    precision: 0.84,
    recall: 0.83,
    macro_f1: 0.83,
    inference_latency_ms: 9.2,
    status: 'Candidate',
    training_split: 'TimeSeriesSplit (5 folds)',
  },
  {
    model_id: 'CLS_04',
    model_name: 'XGBoost Multi-Class Classifier',
    task_type: 'Classification',
    target: 'CPCB 6-Category AQI',
    version: '1.3.0',
    accuracy: 0.88,
    precision: 0.87,
    recall: 0.86,
    macro_f1: 0.86,
    inference_latency_ms: 3.4,
    status: 'Production',
    selected_rationale: 'Highest Macro-F1 (0.86) across minority Severe/Good classes without boundary calibration drift.',
    training_split: 'Chronological Train (2009-2023) / Val (2024) / Test (2025-2026)',
  },
];

export const FEATURE_IMPORTANCE_LIST: FeatureImportanceItem[] = [
  {
    feature_name: 'PM25_rolling_6h',
    category: 'Rolling Metric',
    importance_score: 0.284,
    shap_direction: 'Positive',
    description: '6-hour trailing average of fine particulate concentration.',
  },
  {
    feature_name: 'PM25_lag_1',
    category: 'Pollutant Lag',
    importance_score: 0.192,
    shap_direction: 'Positive',
    description: 'Previous hour measured PM2.5 observation.',
  },
  {
    feature_name: 'zscore_vs_station_history',
    category: 'Baseline Deviation',
    importance_score: 0.126,
    shap_direction: 'Positive',
    description: 'Current reading standardized against same-station, same-month historical distribution.',
  },
  {
    feature_name: 'PM10_rolling_12h',
    category: 'Rolling Metric',
    importance_score: 0.098,
    shap_direction: 'Positive',
    description: '12-hour trailing average of coarse particulate concentration.',
  },
  {
    feature_name: 'hour_of_day',
    category: 'Temporal',
    importance_score: 0.082,
    shap_direction: 'Negative',
    description: 'Diurnal boundary layer expansion and collapse cycle.',
  },
  {
    feature_name: 'PM25_PM10_ratio',
    category: 'Cross-Pollutant',
    importance_score: 0.065,
    shap_direction: 'Positive',
    description: 'Ratio of fine to coarse particulate fraction indicative of combustion vs mechanical dust.',
  },
  {
    feature_name: 'season_winter_flag',
    category: 'Temporal',
    importance_score: 0.054,
    shap_direction: 'Positive',
    description: 'Binary indicator for winter inversion period (November to February).',
  },
  {
    feature_name: 'NO2_lag_3',
    category: 'Pollutant Lag',
    importance_score: 0.043,
    shap_direction: 'Positive',
    description: '3-hour lag of nitrogen dioxide representing vehicular buildup.',
  },
  {
    feature_name: 'rate_of_change',
    category: 'Rolling Metric',
    importance_score: 0.032,
    shap_direction: 'Positive',
    description: 'First temporal derivative of particulate concentration.',
  },
  {
    feature_name: 'is_weekend',
    category: 'Temporal',
    importance_score: 0.024,
    shap_direction: 'Negative',
    description: 'Binary indicator for reduced commercial fleet transport during weekends.',
  },
];

export const DATA_QUALITY_METRICS: DataQualitySummary = {
  raw_observations: 196500000,
  total_stations: 558,
  total_pollutants: 15,
  time_coverage: 'January 2009 to March 2026',
  missing_pct: 14.8,
  duplicate_pct: 0.62,
  invalid_pct: 1.15,
  outlier_pct: 2.34,
  final_usable_records: 161326500,
  station_coverage_pct: 92.4,
  pollutant_coverage_summary: [
    { pollutant: 'PM2.5', missing_pct: 11.2, station_count: 512, longest_gap_days: 14 },
    { pollutant: 'PM10', missing_pct: 12.8, station_count: 526, longest_gap_days: 12 },
    { pollutant: 'NO2', missing_pct: 9.4, station_count: 541, longest_gap_days: 7 },
    { pollutant: 'SO2', missing_pct: 13.1, station_count: 504, longest_gap_days: 18 },
    { pollutant: 'CO', missing_pct: 10.5, station_count: 518, longest_gap_days: 9 },
    { pollutant: 'O3', missing_pct: 15.6, station_count: 489, longest_gap_days: 21 },
    { pollutant: 'NH3', missing_pct: 28.3, station_count: 382, longest_gap_days: 35 },
    { pollutant: 'Pb', missing_pct: 64.1, station_count: 142, longest_gap_days: 62 },
  ],
};

export const ETL_PIPELINE_RUNS: ETLRunStatus[] = [
  {
    run_id: 'ETL_2026_BATCH_M03',
    stage: 'WAREHOUSE_LOAD',
    status: 'Completed',
    records_processed: 196500000,
    records_rejected: 2212000,
    duration_seconds: 4120,
    rows_inserted: 161326500,
    rows_updated: 34100,
    timestamp: '2026-03-27T04:12:00Z',
  },
  {
    run_id: 'ETL_2026_BATCH_M03',
    stage: 'AGGREGATION',
    status: 'Completed',
    records_processed: 161326500,
    records_rejected: 0,
    duration_seconds: 640,
    rows_inserted: 2840000,
    rows_updated: 1200,
    timestamp: '2026-03-27T04:22:40Z',
  },
  {
    run_id: 'ETL_2026_BATCH_M03',
    stage: 'ML_FEATURE_MART',
    status: 'Completed',
    records_processed: 2840000,
    records_rejected: 140,
    duration_seconds: 310,
    rows_inserted: 2839860,
    rows_updated: 0,
    timestamp: '2026-03-27T04:27:50Z',
  },
];

export function executeOLAPQuery(
  measure: string,
  dimension: string,
  hierarchy: string,
  operation: string,
  filterCity?: string
): OLAPQueryResult {
  let records: Array<Record<string, string | number>> = [];
  let generated_sql = '';

  if (dimension === 'Time') {
    if (hierarchy === 'Year') {
      records = [
        { Year: '2021', [measure]: 98.4, record_count: 1420000 },
        { Year: '2022', [measure]: 94.2, record_count: 1450000 },
        { Year: '2023', [measure]: 91.8, record_count: 1460000 },
        { Year: '2024', [measure]: 88.5, record_count: 1480000 },
        { Year: '2025', [measure]: 86.2, record_count: 1490000 },
        { Year: '2026', [measure]: 84.1, record_count: 380000 },
      ];
      generated_sql = `SELECT dt.year AS "Year", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_daily f
JOIN dim_time dt ON f.time_id = dt.time_id
GROUP BY dt.year
ORDER BY dt.year ASC;`;
    } else if (hierarchy === 'Month') {
      records = [
        { Month: 'January', [measure]: 142.5, record_count: 128000 },
        { Month: 'February', [measure]: 118.2, record_count: 116000 },
        { Month: 'March', [measure]: 84.6, record_count: 129000 },
        { Month: 'April', [measure]: 68.3, record_count: 124000 },
        { Month: 'May', [measure]: 62.1, record_count: 128000 },
        { Month: 'June', [measure]: 44.8, record_count: 124000 },
        { Month: 'July', [measure]: 36.2, record_count: 128000 },
        { Month: 'August', [measure]: 34.9, record_count: 128000 },
        { Month: 'September', [measure]: 41.5, record_count: 124000 },
        { Month: 'October', [measure]: 92.4, record_count: 128000 },
        { Month: 'November', [measure]: 164.8, record_count: 124000 },
        { Month: 'December', [measure]: 172.1, record_count: 128000 },
      ];
      generated_sql = `SELECT dt.month_name AS "Month", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_daily f
JOIN dim_time dt ON f.time_id = dt.time_id
GROUP BY dt.month, dt.month_name
ORDER BY dt.month ASC;`;
    } else {
      records = [
        { Hour: '00:00', [measure]: 118.4, record_count: 62000 },
        { Hour: '04:00', [measure]: 104.2, record_count: 62000 },
        { Hour: '08:00', [measure]: 142.1, record_count: 62000 },
        { Hour: '12:00', [measure]: 82.6, record_count: 62000 },
        { Hour: '16:00', [measure]: 76.8, record_count: 62000 },
        { Hour: '20:00', [measure]: 134.9, record_count: 62000 },
      ];
      generated_sql = `SELECT dt.hour AS "Hour", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_measurement f
JOIN dim_time dt ON f.time_id = dt.time_id
GROUP BY dt.hour
ORDER BY dt.hour ASC;`;
    }
  } else if (dimension === 'Location') {
    if (hierarchy === 'State') {
      records = [
        { State: 'Delhi', [measure]: 148.6, record_count: 3400000 },
        { State: 'Bihar', [measure]: 132.4, record_count: 1850000 },
        { State: 'Uttar Pradesh', [measure]: 128.9, record_count: 2450000 },
        { State: 'Maharashtra', [measure]: 78.4, record_count: 2900000 },
        { State: 'West Bengal', [measure]: 88.2, record_count: 1650000 },
        { State: 'Karnataka', [measure]: 46.5, record_count: 2100000 },
        { State: 'Tamil Nadu', [measure]: 44.8, record_count: 1800000 },
      ];
      generated_sql = `SELECT ds.state AS "State", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_daily f
JOIN dim_station ds ON f.station_id = ds.station_id
GROUP BY ds.state
ORDER BY "${measure}" DESC;`;
    } else {
      records = [
        { City: 'Delhi', [measure]: 148.6, record_count: 3400000 },
        { City: 'Patna', [measure]: 136.2, record_count: 980000 },
        { City: 'Lucknow', [measure]: 126.8, record_count: 1120000 },
        { City: 'Kolkata', [measure]: 88.2, record_count: 1650000 },
        { City: 'Mumbai', [measure]: 78.4, record_count: 2150000 },
        { City: 'Pune', [measure]: 64.9, record_count: 750000 },
        { City: 'Hyderabad', [measure]: 56.4, record_count: 1200000 },
        { City: 'Bengaluru', [measure]: 46.5, record_count: 2100000 },
        { City: 'Chennai', [measure]: 44.8, record_count: 1800000 },
      ];
      generated_sql = `SELECT ds.city AS "City", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_daily f
JOIN dim_station ds ON f.station_id = ds.station_id
GROUP BY ds.city
ORDER BY "${measure}" DESC;`;
    }
  } else {
    // Pollutant
    records = [
      { Pollutant: 'PM2.5', [measure]: 82.4, unit: 'µg/m³', record_count: 18900000 },
      { Pollutant: 'PM10', [measure]: 134.8, unit: 'µg/m³', record_count: 19400000 },
      { Pollutant: 'NO2', [measure]: 44.1, unit: 'µg/m³', record_count: 20100000 },
      { Pollutant: 'SO2', [measure]: 18.2, unit: 'µg/m³', record_count: 17200000 },
      { Pollutant: 'CO', [measure]: 1.25, unit: 'mg/m³', record_count: 18600000 },
      { Pollutant: 'O3', [measure]: 36.4, unit: 'µg/m³', record_count: 16800000 },
      { Pollutant: 'NH3', [measure]: 21.0, unit: 'µg/m³', record_count: 12400000 },
    ];
    generated_sql = `SELECT dp.pollutant_name AS "Pollutant", AVG(f.measurement_value) AS "${measure}", COUNT(*) AS record_count
FROM fact_air_measurement f
JOIN dim_pollutant dp ON f.pollutant_id = dp.pollutant_id
WHERE dp.aqi_supported = true
GROUP BY dp.pollutant_name
ORDER BY record_count DESC;`;
  }

  return {
    dimensions: Object.keys(records[0] || {}),
    records,
    generated_sql,
    execution_source: 'PostgreSQL Fact Constellation (Simulation)',
  };
}
