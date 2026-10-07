'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, ShieldAlert, Sparkles, Navigation, MapPin } from 'lucide-react';
import { AqiBadge } from '@/components/ui/AqiBadge';
import { AqiCategory } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface PredictionResponse {
  city: string;
  target_timestamp: string;
  latest_observed_aqi: number;
  latest_observed_category: string;
  predicted_aqi: number;
  predicted_category: string;
  aqi_difference: number;
  model_name: string;
  target_horizon: string;
  evaluation_holdout: string;
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
  'Chandigarh'
];

export const PredictorWidget: React.FC = () => {
  const [cities, setCities] = useState<string[]>(DEFAULT_CITIES);
  const [selectedCity, setSelectedCity] = useState<string>('Delhi');
  const [targetTime, setTargetTime] = useState<string>(() => {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  });

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
          const res = await fetch(`${API_BASE}/api/location/nearest-station?latitude=${coords.latitude}&longitude=${coords.longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data.city) {
              const cityName = data.city;
              if (!cities.includes(cityName)) {
                setCities((prev) => [cityName, ...prev]);
              }
              setSelectedCity(cityName);
              setLocationMessage(`Location detected: ${cityName} (${data.station_name || 'Nearest Station'})`);
            }
          } else {
            setLocationMessage('Location detected, but nearest monitoring station could not be resolved.');
          }
        } catch {
          setLocationMessage('Failed to connect to location resolution service.');
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocationMessage('Location access permission was denied.');
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const handlePredict = async (cityToPredict = selectedCity) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/predict-aqi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          city: cityToPredict,
          target_timestamp: targetTime,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Prediction service error (${response.status}): ${errorText}`);
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
            <span>AI Predictive Intelligence</span>
          </div>
          <h2
            className="text-2xl font-normal text-[#202020] tracking-[-0.02em] mt-0.5"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Next-Hour AQI Forecast Engine
          </h2>
        </div>

        {/* Disclaimer Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#efefef] text-[#816729] border border-[#e8e8e8] font-mono text-[11px]">
          <ShieldAlert className="w-3.5 h-3.5 text-[#ff682c]" />
          <span>ML Forecast — Research Demonstration Only</span>
        </div>
      </div>

      {/* Control Strip */}
      <div className="space-y-3 bg-[#f5f5f5] p-4 border border-[#e8e8e8]">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* City Select + Location Button */}
          <div className="sm:col-span-5 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-mono text-[#4d4d4d] uppercase">
                Select Target City
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

          {/* Timestamp */}
          <div className="sm:col-span-4 space-y-1.5">
            <label className="block text-xs font-mono text-[#4d4d4d] uppercase">
              Prediction Target Time
            </label>
            <input
              type="datetime-local"
              value={targetTime.slice(0, 16)}
              onChange={(e) => setTargetTime(e.target.value + ':00')}
              disabled={loading}
              className="w-full bg-[#ffffff] border border-[#e8e8e8] px-3 py-2 text-xs font-mono text-[#202020] focus:outline-none focus:border-[#202020] transition-colors"
            />
          </div>

          {/* Predict Action */}
          <div className="sm:col-span-3">
            <button
              onClick={() => handlePredict()}
              disabled={loading}
              className="w-full btn-primary-sharp text-xs py-2 px-4 flex items-center justify-center gap-2 bg-[#202020] text-white hover:bg-[#4d4d4d] disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Computing...' : 'Run Forecast'}</span>
            </button>
          </div>
        </div>

        {locationMessage && (
          <div className="text-[11px] font-mono text-[#816729] bg-[#ffffff] p-2 border border-[#e8e8e8] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#ff682c] shrink-0" />
            <span>{locationMessage}</span>
          </div>
        )}
      </div>

      {/* Initial Guide State when no prediction has been requested yet */}
      {!prediction && !loading && !error && (
        <div className="p-6 bg-[#f9f9f9] border border-dashed border-[#d8d8d8] text-center space-y-2">
          <Cpu className="w-8 h-8 text-[#816729] mx-auto opacity-60" />
          <div className="text-sm font-sans font-medium text-[#202020]">Ready for Next-Hour AQI Prediction</div>
          <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
            Select a target city or use your current location, choose a target timestamp, then click <strong className="text-[#202020]">Run Forecast</strong> to calculate predictions.
          </p>
        </div>
      )}

      {/* Error Alert State */}
      {error && (
        <div className="p-4 border border-[#ff682c]/30 bg-[#ff682c]/5 text-[#ff682c] flex items-start gap-3 text-xs font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-mono font-semibold uppercase">Prediction Engine Offline</span>
            <p className="text-[#4d4d4d] leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {prediction && !error && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Box 1: Observed AQI */}
            <div className="p-4 bg-[#efefef] border border-[#e8e8e8] space-y-2">
              <div className="text-[11px] font-mono text-[#828282] uppercase tracking-tight">
                Current Observed Baseline
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
                Observation snapshot prior to t+1
              </div>
            </div>

            {/* Box 2: ML Predicted Next-Hour AQI */}
            <div className="p-4 bg-[#ffffff] border-2 border-[#202020] space-y-2 shadow-sm">
              <div className="text-[11px] font-mono text-[#ff682c] uppercase font-semibold flex items-center justify-between">
                <span>Predicted Next-Hour (t+1)</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#ff682c]/10 rounded border border-[#ff682c]/20">
                  ML FORECAST
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
                <span>Target: {prediction.target_timestamp}</span>
              </div>
            </div>

            {/* Box 3: Delta & Horizon */}
            <div className="p-4 bg-[#efefef] border border-[#e8e8e8] space-y-2">
              <div className="text-[11px] font-mono text-[#828282] uppercase tracking-tight">
                Observed vs Forecast Delta
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
                  ? 'Forecast indicates deteriorating air quality'
                  : prediction.aqi_difference < 0
                  ? 'Forecast indicates improving air quality'
                  : 'Forecast matches observed baseline'}
              </div>
            </div>
          </div>

          {/* Technical Metadata Footer */}
          <div className="p-3 bg-[#f5f5f5] border border-[#e8e8e8] text-[11px] font-mono text-[#4d4d4d] flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-[#828282]">Model Engine:</span>{' '}
              <span className="text-[#202020] font-semibold">{prediction.model_name}</span>
            </div>
            <div>
              <span className="text-[#828282]">Evaluation Holdout:</span>{' '}
              <span className="text-[#816729] font-medium">{prediction.evaluation_holdout}</span>
            </div>
            <div>
              <span className="text-[#828282]">Horizon:</span>{' '}
              <span className="text-[#202020]">{prediction.target_horizon}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
