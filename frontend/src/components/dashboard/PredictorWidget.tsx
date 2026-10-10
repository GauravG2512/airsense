'use client';

import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  Navigation,
  MapPin,
  Sliders,
  RotateCcw,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { AqiCategory, getApiBaseUrl } from '@/lib/api';

const API_BASE = getApiBaseUrl();

interface PredictionResponse {
  city: string;
  target_timestamp: string;
  target_horizon?: string;
  mode?: string;
  advanced_inputs?: Record<string, number>;
  latest_observed_aqi: number;
  latest_observed_category: string;
  predicted_aqi: number;
  predicted_category: string;
  dominant_pollutant: string;
  aqi_difference: number;
  health_advisory?: string;
  atmospheric_summary?: string;
  model_name: string;
  is_ml_forecast: boolean;
  disclaimer: string;
}

const DEFAULT_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'Jaipur',
  'Lucknow',
  'Patna',
  'Chandigarh',
  'Varanasi',
  'Agra',
  'Faridabad',
  'Gurugram',
];

export const PredictorWidget: React.FC = () => {
  // Mode selection: 'basic' or 'advanced'
  const [forecastMode, setForecastMode] = useState<'basic' | 'advanced'>('basic');

  // Basic Parameters
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const [targetHorizon, setTargetHorizon] = useState<string>('Next-Hour (t+1)');
  const [targetTime, setTargetTime] = useState<string>(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });

  // Advanced Optional Pollutant Inputs (CPCB Criteria Pollutants)
  const [pm25, setPm25] = useState<string>('');
  const [pm10, setPm10] = useState<string>('');
  const [co, setCo] = useState<string>('');
  const [no2, setNo2] = useState<string>('');
  const [so2, setSo2] = useState<string>('');
  const [o3, setO3] = useState<string>('');
  const [nh3, setNh3] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [humidity, setHumidity] = useState<string>('');

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/ml-prediction/cities`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.cities && Array.isArray(data.cities)) {
          setCities(data.cities);
          if (!data.cities.includes(selectedCity)) {
            setSelectedCity(data.cities[0] || 'Delhi');
          }
        }
      })
      .catch(() => {
        // Fallback to DEFAULT_CITIES list
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setLocationMessage(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const res = await fetch(
            `${API_BASE}/api/location/nearest-station?latitude=${coords.latitude}&longitude=${coords.longitude}`
          );
          if (res.ok) {
            const data = await res.json();
            if (data.city) {
              const cityName = data.city;
              if (!cities.includes(cityName)) {
                setCities((prev) => [cityName, ...prev]);
              }
              setSelectedCity(cityName);
              setLocationMessage(`Location matched: ${cityName} (${data.station_name || 'Nearest Monitor'})`);
            }
          } else {
            setLocationMessage('Location detected, using city fallback.');
          }
        } catch {
          setLocationMessage('Location service error. Select city manually.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationMessage('Location permission denied.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 8000 }
    );
  };

  const applyPreset = (preset: 'smog' | 'moderate' | 'clean') => {
    if (preset === 'smog') {
      setPm25('210');
      setPm10('360');
      setCo('2.6');
      setNo2('68');
      setSo2('22');
      setO3('42');
      setNh3('55');
      setTemperature('18');
      setHumidity('78');
    } else if (preset === 'moderate') {
      setPm25('68');
      setPm10('130');
      setCo('1.2');
      setNo2('35');
      setSo2('12');
      setO3('30');
      setNh3('25');
      setTemperature('28');
      setHumidity('55');
    } else if (preset === 'clean') {
      setPm25('18');
      setPm10('42');
      setCo('0.4');
      setNo2('15');
      setSo2('5');
      setO3('22');
      setNh3('10');
      setTemperature('25');
      setHumidity('60');
    }
  };

  const handleClearAdvanced = () => {
    setPm25('');
    setPm10('');
    setCo('');
    setNo2('');
    setSo2('');
    setO3('');
    setNh3('');
    setTemperature('');
    setHumidity('');
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);

    const payload: Record<string, string | number | null> = {
      city: selectedCity,
      target_timestamp: targetTime,
      horizon: targetHorizon,
    };

    if (forecastMode === 'advanced') {
      if (pm25.trim()) payload.pm25 = parseFloat(pm25);
      if (pm10.trim()) payload.pm10 = parseFloat(pm10);
      if (co.trim()) payload.co = parseFloat(co);
      if (no2.trim()) payload.no2 = parseFloat(no2);
      if (so2.trim()) payload.so2 = parseFloat(so2);
      if (o3.trim()) payload.o3 = parseFloat(o3);
      if (nh3.trim()) payload.nh3 = parseFloat(nh3);
      if (temperature.trim()) payload.temperature = parseFloat(temperature);
      if (humidity.trim()) payload.humidity = parseFloat(humidity);
    }

    try {
      const response = await fetch(`${API_BASE}/api/predict-aqi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Forecasting service error (${response.status}): ${errorText}`);
      }

      const data: PredictionResponse = await response.json();
      setPrediction(data);
    } catch (err: unknown) {
      setPrediction(null);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to connect to backend prediction engine.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-asymmetric p-6 border border-[#e8e8e8] bg-[#ffffff] space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#efefef] pb-4">
        <div>
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#ff682c]" />
            <span>AI Atmospheric Intelligence</span>
          </div>
          <h2
            className="text-2xl font-normal text-[#202020] tracking-[-0.02em] mt-0.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            CPCB AQI Forecast Studio
          </h2>
        </div>

        {/* Engine Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efefef] text-[#202020] border border-[#e8e8e8] font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Engine: AirSense Neural Atmospheric Model</span>
        </div>
      </div>

      {/* Mode Selector Tabs: Basic vs Advanced */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#efefef] pb-3">
        <button
          type="button"
          onClick={() => setForecastMode('basic')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded ${
            forecastMode === 'basic'
              ? 'bg-[#202020] text-white font-medium'
              : 'bg-[#f5f5f5] text-[#4d4d4d] hover:text-[#202020]'
          }`}
        >
          1. Basic Parameters
        </button>
        <button
          type="button"
          onClick={() => setForecastMode('advanced')}
          className={`px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors rounded flex items-center gap-1.5 ${
            forecastMode === 'advanced'
              ? 'bg-[#816729] text-white font-medium'
              : 'bg-[#f5f5f5] text-[#4d4d4d] hover:text-[#202020]'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>2. Advanced Parameters (Optional Pollutants)</span>
        </button>
      </div>

      {/* Control Inputs */}
      <div className="space-y-4 bg-[#f9f9f9] p-5 border border-[#e8e8e8]">
        {/* Row 1: Common Basic Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* City Selector */}
          <div className="sm:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-[#4d4d4d] uppercase">
                Target City
              </label>
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locating || loading}
                className="text-[10px] font-mono text-[#ff682c] hover:text-[#202020] flex items-center gap-1 font-medium transition-colors disabled:opacity-50"
                title="Detect nearest city using browser location"
              >
                <Navigation className={`w-3 h-3 ${locating ? 'animate-spin' : ''}`} />
                <span>{locating ? 'Locating...' : 'Use current location'}</span>
              </button>
            </div>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              disabled={loading}
              className="w-full bg-[#ffffff] border border-[#e8e8e8] px-3 py-2 text-sm text-[#202020] font-sans focus:outline-none focus:border-[#202020] transition-colors"
            >
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Forecast Horizon */}
          <div className="sm:col-span-3 space-y-1.5">
            <label className="block text-xs font-mono text-[#4d4d4d] uppercase">
              Forecast Horizon
            </label>
            <select
              value={targetHorizon}
              onChange={(e) => setTargetHorizon(e.target.value)}
              disabled={loading}
              className="w-full bg-[#ffffff] border border-[#e8e8e8] px-3 py-2 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020] transition-colors"
            >
              <option value="Next-Hour (t+1)">Next-Hour (t+1)</option>
              <option value="6-Hour Window">6-Hour Window</option>
              <option value="24-Hour Diurnal">24-Hour Diurnal</option>
            </select>
          </div>

          {/* Target Timestamp */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono text-[#4d4d4d] uppercase">
              Target Timestamp
            </label>
            <input
              type="datetime-local"
              value={targetTime.slice(0, 16)}
              onChange={(e) => setTargetTime(e.target.value + ':00')}
              disabled={loading}
              className="w-full bg-[#ffffff] border border-[#e8e8e8] px-3 py-2 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020] transition-colors"
            />
          </div>
        </div>

        {locationMessage && (
          <div className="text-[11px] font-mono text-[#816729] bg-[#ffffff] p-2 border border-[#e8e8e8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#ff682c] shrink-0" />
            <span>{locationMessage}</span>
          </div>
        )}

        {/* Row 2: Advanced Pollutant Parameters (Optional) */}
        {forecastMode === 'advanced' && (
          <div className="pt-3 border-t border-[#e8e8e8] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] font-mono uppercase text-[#816729] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#816729]" />
                <span>Optional Criteria Pollutants (Leave blank to use city historical baselines):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#828282]">Presets:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('smog')}
                  className="px-2 py-0.5 bg-[#ffffff] border border-[#e8e8e8] text-[10px] font-mono hover:bg-[#efefef] text-[#202020]"
                >
                  Heavy Smog
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('moderate')}
                  className="px-2 py-0.5 bg-[#ffffff] border border-[#e8e8e8] text-[10px] font-mono hover:bg-[#efefef] text-[#202020]"
                >
                  Moderate
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('clean')}
                  className="px-2 py-0.5 bg-[#ffffff] border border-[#e8e8e8] text-[10px] font-mono hover:bg-[#efefef] text-[#202020]"
                >
                  Clean Air
                </button>
                <button
                  type="button"
                  onClick={handleClearAdvanced}
                  className="px-2 py-0.5 bg-[#ffffff] border border-[#e8e8e8] text-[10px] font-mono hover:bg-red-50 text-red-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  Clear
                </button>
              </div>
            </div>

            {/* Pollutants Input Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {/* PM2.5 */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  PM2.5 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 75"
                  value={pm25}
                  onChange={(e) => setPm25(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* PM10 */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  PM10 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 135"
                  value={pm10}
                  onChange={(e) => setPm10(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* CO */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  CO <span className="text-[9px] text-[#828282]">(mg/m³)</span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 1.2"
                  value={co}
                  onChange={(e) => setCo(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* NO2 */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  NO2 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={no2}
                  onChange={(e) => setNo2(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* SO2 */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  SO2 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 15"
                  value={so2}
                  onChange={(e) => setSo2(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* O3 (Ozone) */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  O3 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 35"
                  value={o3}
                  onChange={(e) => setO3(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>

              {/* NH3 */}
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#202020] font-medium">
                  NH3 <span className="text-[9px] text-[#828282]">(µg/m³)</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25"
                  value={nh3}
                  onChange={(e) => setNh3(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>
            </div>

            {/* Environmental Conditions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#4d4d4d]">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 26"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-mono text-[#4d4d4d]">
                  Relative Humidity (%)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 62"
                  value={humidity}
                  onChange={(e) => setHumidity(e.target.value)}
                  disabled={loading}
                  className="w-full bg-[#ffffff] border border-[#e8e8e8] px-2.5 py-1.5 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full btn-primary-sharp text-xs py-3 px-6 flex items-center justify-center gap-2 bg-[#202020] text-white hover:bg-[#333333] disabled:opacity-50 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>
              {loading
                ? 'Consulting AirSense Neural Forecasting Engine...'
                : `Run AI Forecast (${forecastMode === 'advanced' ? 'Advanced Pollutants Mode' : 'Basic Mode'})`}
            </span>
          </button>
        </div>
      </div>

      {/* Guide State when no prediction has been requested yet */}
      {!prediction && !loading && !error && (
        <div className="p-6 bg-[#f9f9f9] border border-dashed border-[#d8d8d8] text-center space-y-2">
          <Cpu className="w-8 h-8 text-[#816729] mx-auto opacity-60" />
          <div className="text-sm font-sans font-medium text-[#202020]">
            Ready for AI Atmospheric Forecast
          </div>
          <p className="text-xs text-[#666666] max-w-lg mx-auto leading-relaxed">
            Select a target city under <strong className="text-[#202020]">Basic Parameters</strong>, or switch to{' '}
            <strong className="text-[#202020]">Advanced Parameters</strong> to test custom PM2.5, PM10, CO, NO2, or SO2 readings.
            AirSense Neural Engine will compute the official CPCB standard AQI and tailored health guidance.
          </p>
        </div>
      )}

      {/* Error Alert State */}
      {error && (
        <div className="p-4 border border-[#ff682c]/30 bg-[#ff682c]/5 text-[#ff682c] flex items-start gap-3 text-xs font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono font-semibold uppercase">Prediction Engine Notice</span>
            <p className="text-[#4d4d4d] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {prediction && !error && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Observed Baseline */}
            <div className="p-4 bg-[#efefef] border border-[#e8e8e8] space-y-2">
              <div className="text-[11px] font-mono text-[#828282] uppercase tracking-tight flex items-center justify-between">
                <span>Baseline Observed</span>
                <span className="text-[10px] text-[#4d4d4d]">{prediction.city}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-mono font-semibold text-[#202020]">
                  {prediction.latest_observed_aqi}
                </span>
                <AqiBadge
                  category={prediction.latest_observed_category as AqiCategory}
                  showNumber={false}
                  size="sm"
                />
              </div>
              <div className="text-[11px] text-[#4d4d4d] font-mono">
                Historical baseline prior to forecast
              </div>
            </div>

            {/* Box 2: Neural Predicted AQI */}
            <div className="p-4 bg-[#ffffff] border-2 border-[#202020] space-y-2 shadow-sm">
              <div className="text-[11px] font-mono text-[#ff682c] uppercase font-semibold flex items-center justify-between">
                <span>Predicted Forecast</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#ff682c]/10 text-[#ff682c] rounded border border-[#ff682c]/20">
                  {prediction.mode || (forecastMode === 'advanced' ? 'ADVANCED' : 'BASIC')}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-mono font-bold text-[#202020]">
                  {prediction.predicted_aqi}
                </span>
                <AqiBadge
                  category={prediction.predicted_category as AqiCategory}
                  showNumber={false}
                  size="md"
                />
              </div>
              <div className="text-[11px] text-[#4d4d4d] font-mono flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#816729]" />
                <span>Target: {prediction.target_timestamp} ({prediction.target_horizon || targetHorizon})</span>
              </div>
            </div>

            {/* Box 3: Dominant Pollutant & Delta */}
            <div className="p-4 bg-[#efefef] border border-[#e8e8e8] space-y-2">
              <div className="text-[11px] font-mono text-[#828282] uppercase tracking-tight flex items-center justify-between">
                <span>Dominant Driver</span>
                <span className="text-xs px-2 py-0.5 bg-[#202020] text-white font-mono rounded">
                  {prediction.dominant_pollutant}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-3xl font-mono font-semibold ${
                    prediction.aqi_difference > 0
                      ? 'text-[#ff682c]'
                      : prediction.aqi_difference < 0
                      ? 'text-emerald-700'
                      : 'text-[#202020]'
                  }`}
                >
                  {prediction.aqi_difference > 0 ? `+${prediction.aqi_difference}` : prediction.aqi_difference}
                </span>
                {prediction.aqi_difference > 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-[#ff682c]" />
                ) : prediction.aqi_difference < 0 ? (
                  <ArrowDownRight className="w-6 h-6 text-emerald-700" />
                ) : null}
              </div>
              <div className="text-[11px] text-[#4d4d4d] font-mono">
                {prediction.aqi_difference > 0
                  ? 'Forecast indicates deteriorating conditions'
                  : prediction.aqi_difference < 0
                  ? 'Forecast indicates improving conditions'
                  : 'Stable air quality projection'}
              </div>
            </div>
          </div>

          {/* AI Insights & Health Advisory Cards */}
          {(prediction.health_advisory || prediction.atmospheric_summary) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Health Advisory */}
              {prediction.health_advisory && (
                <div className="p-4 bg-[#fdfbf7] border border-[#816729]/30 rounded space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-[#816729] font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#816729]" />
                    <span>AirSense Health &amp; Activity Advisory</span>
                  </div>
                  <p className="text-xs text-[#202020] leading-relaxed font-sans">
                    {prediction.health_advisory}
                  </p>
                </div>
              )}

              {/* Atmospheric Summary */}
              {prediction.atmospheric_summary && (
                <div className="p-4 bg-[#f5f5f5] border border-[#e8e8e8] rounded space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-[#4d4d4d] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#ff682c]" />
                    <span>Atmospheric &amp; Meteorological Diagnostics</span>
                  </div>
                  <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
                    {prediction.atmospheric_summary}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Technical Metadata Footer */}
          <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8] text-[11px] font-mono text-[#4d4d4d] flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-[#828282]">Model Engine:</span>{' '}
              <span className="text-[#202020] font-semibold">{prediction.model_name}</span>
            </div>
            <div>
              <span className="text-[#828282]">Standard:</span>{' '}
              <span className="text-[#816729] font-medium">CPCB 24-Hour Breakpoint Formula</span>
            </div>
            <div>
              <span className="text-[#828282]">Status:</span>{' '}
              <span className="text-emerald-700 font-medium">Verified Active</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
