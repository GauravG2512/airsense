'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Layers,
  BarChart3,
  GitCompare,
  AlertTriangle,
  Database,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { PredictorWidget } from '@/components/dashboard/PredictorWidget';
import { getApiBaseUrl } from '@/lib/api';

const API_BASE = getApiBaseUrl();

interface FeatureImportanceItem {
  feature: string;
  importance: number;
}

export default function PredictPage() {
  const [featureImportance, setFeatureImportance] = useState<FeatureImportanceItem[]>([]);
  const [loadingFeatures, setLoadingFeatures] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`${API_BASE}/api/ml-prediction/feature-importance`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.top_features && Array.isArray(data.top_features)) {
          setFeatureImportance(data.top_features.slice(0, 15));
        }
      })
      .catch(() => {
        // Fallback default top features if API unavailable
        if (isMounted) {
          setFeatureImportance([
            { feature: 'city_code', importance: 7227 },
            { feature: 'aqi_estimate', importance: 2079 },
            { feature: 'PM10', importance: 1967 },
            { feature: 'PM2_5', importance: 1804 },
            { feature: 'aqi_roll_std_3', importance: 1205 },
            { feature: 'pm25_lag_1', importance: 1120 },
            { feature: 'CO', importance: 1060 },
            { feature: 'pm10_lag_1', importance: 1046 },
            { feature: 'hour_sin', importance: 998 },
            { feature: 'NO2', importance: 915 },
            { feature: 'aqi_roll_mean_24', importance: 874 },
            { feature: 'no2_lag_1', importance: 839 },
            { feature: 'hour_cos', importance: 792 },
            { feature: 'aqi_lag_1', importance: 745 },
            { feature: 'O3', importance: 616 }
          ]);
        }
      })
      .finally(() => {
        if (isMounted) setLoadingFeatures(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const maxImportance = featureImportance.length > 0 ? Math.max(...featureImportance.map((f) => f.importance)) : 1;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 bg-[#ffffff]">
      {/* Page Header */}
      <div className="border-b border-[#efefef] pb-6 space-y-3">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-[11px] font-mono uppercase text-[#816729] font-medium tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#ff682c]" />
            <span>Machine Learning Intelligence &amp; Forecasting Suite</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#202020] text-white text-xs font-mono">
              Engine: AirSense Neural Atmospheric Model
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-mono border border-emerald-200">
              Active Multimodal Inference
            </span>
          </div>
        </div>

        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-normal text-[#202020] tracking-[-0.02em]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          AI AQI Forecast &amp; Predictive Intelligence
        </h1>
        <p className="text-base text-[#4d4d4d] leading-relaxed max-w-3xl">
          Atmospheric intelligence powered by AirSense Deep Neural Engine with support for both Basic Urban Parameters and Advanced Criteria Pollutant inputs (PM2.5, PM10, CO, NO2, SO2, O3, NH3) calibrated under Indian CPCB standards.
        </p>
      </div>

      {/* DATA LIMITATION & REGULATORY DISCLAIMER BANNER (Requirements 8 & 9) */}
      <div className="p-4 border border-[#816729]/30 bg-[#ebe6dd]/40 space-y-2 text-xs">
        <div className="flex items-center gap-2 font-mono text-[#816729] font-semibold uppercase">
          <AlertTriangle className="w-4 h-4 text-[#816729]" />
          <span>Evaluation Methodology &amp; Data Boundary Notice</span>
        </div>
        <p className="text-[#4d4d4d] leading-relaxed">
          The validated LightGBM model was evaluated on the official <strong>2026 final holdout dataset through 2026-03-27</strong>. 
          Results are presented as regression evaluation metrics (<strong>R² = 0.9131 on the 2026 final holdout</strong>). 
          This forecast is intended for academic and analytical demonstration and is not an official regulatory CPCB measurement.
        </p>
      </div>

      {/* SECTION 1: LIVE INTERACTIVE PREDICTION TOOL */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#efefef] pb-3 font-mono text-xs text-[#828282] uppercase tracking-wider">
          <Cpu className="w-4 h-4 text-[#202020]" />
          <span>1. Interactive Live Forecast Studio</span>
        </div>
        <PredictorWidget />
      </section>

      {/* SECTION 2: END-TO-END ML WORKFLOW & FEATURE GROUPS (Requirement 3) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#828282] uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#202020]" />
            <span>2. Pipeline Architecture &amp; Feature Engineering</span>
          </div>
          <span className="text-xs font-mono text-[#816729]">73 Total Engineered Features</span>
        </div>

        {/* Visual Workflow Diagram */}
        <div className="p-6 bg-[#f5f5f5] border border-[#e8e8e8] space-y-4">
          <div className="text-xs font-mono text-[#202020] uppercase font-semibold">
            End-to-End Prediction Pipeline Flow:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs font-mono">
            <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] space-y-1">
              <Database className="w-4 h-4 mx-auto text-[#816729]" />
              <div className="font-semibold text-[#202020]">Historical Data</div>
              <div className="text-[10px] text-[#828282]">196.5M XKDR Rows</div>
            </div>
            <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] space-y-1">
              <Layers className="w-4 h-4 mx-auto text-[#4d4d4d]" />
              <div className="font-semibold text-[#202020]">Preprocessing</div>
              <div className="text-[10px] text-[#828282]">Imputation &amp; Quality</div>
            </div>
            <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] space-y-1">
              <Cpu className="w-4 h-4 mx-auto text-[#4d4d4d]" />
              <div className="font-semibold text-[#202020]">Feature Eng.</div>
              <div className="text-[10px] text-[#828282]">32 Base Vectors</div>
            </div>
            <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] space-y-1">
              <TrendingUp className="w-4 h-4 mx-auto text-[#ff682c]" />
              <div className="font-semibold text-[#202020]">Lag &amp; Rolling</div>
              <div className="text-[10px] text-[#828282]">1h–72h Windows</div>
            </div>
            <div className="p-3 bg-[#ffffff] border border-[#e8e8e8] space-y-1">
              <BarChart3 className="w-4 h-4 mx-auto text-[#202020]" />
              <div className="font-semibold text-[#202020]">LightGBM</div>
              <div className="text-[10px] text-[#828282]">Gradient Boosting</div>
            </div>
            <div className="p-3 bg-[#202020] text-white space-y-1">
              <Sparkles className="w-4 h-4 mx-auto text-[#ff682c]" />
              <div className="font-semibold">AQI Forecast</div>
              <div className="text-[10px] text-[#e8e8e8]">Next-Hour (t+1)</div>
            </div>
          </div>
        </div>

        {/* Feature Groups Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Group 1 */}
          <div className="p-5 bg-[#efefef] border border-[#e8e8e8] space-y-3">
            <div className="font-mono text-xs uppercase text-[#816729] font-semibold">
              Pollutant Measurements (8)
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Instantaneous concentrations for key regulatory criteria pollutants:
            </p>
            <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
              {['PM10', 'PM2.5', 'NO2', 'SO2', 'CO', 'O3', 'NH3', 'Pb'].map((p) => (
                <span key={p} className="px-2 py-0.5 bg-[#ffffff] border border-[#e8e8e8] text-[#202020]">
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Group 2 */}
          <div className="p-5 bg-[#efefef] border border-[#e8e8e8] space-y-3">
            <div className="font-mono text-xs uppercase text-[#816729] font-semibold">
              AQI Lags &amp; Rolling Stats (36)
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Temporal autocorrelation vectors capturing pollution momentum &amp; dispersion:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-[#202020]">
              <div>• Lags: 1, 3, 6, 12, 24, 48, 72 hours</div>
              <div>• Rolling Mean: 3, 6, 12, 24, 48 hours</div>
              <div>• Rolling Std: 3, 6, 12, 24, 48 hours</div>
            </div>
          </div>

          {/* Group 3 */}
          <div className="p-5 bg-[#efefef] border border-[#e8e8e8] space-y-3">
            <div className="font-mono text-xs uppercase text-[#816729] font-semibold">
              Temporal &amp; Location (29)
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed">
              Cyclical diurnal/seasonal components and geographical encoding:
            </p>
            <div className="space-y-1 font-mono text-[11px] text-[#202020]">
              <div>• Cyclical: hour_sin/cos, month_sin/cos</div>
              <div>• Temporal: day_of_week, is_weekend, hour</div>
              <div>• Spatial: latitude, longitude, city_code</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: MODEL PERFORMANCE & METRICS (Requirement 4) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#828282] uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-[#202020]" />
            <span>3. Current Model Performance (2026 Holdout Results)</span>
          </div>
          <span className="text-xs font-mono text-[#816729]">Validated Holdout</span>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-[#f5f5f5] border border-[#e8e8e8] space-y-1 text-center">
            <div className="text-[10px] font-mono text-[#828282] uppercase">Mean Absolute Error</div>
            <div className="text-2xl font-mono font-bold text-[#202020]">23.053</div>
            <div className="text-[10px] font-mono text-[#4d4d4d]">AQI Points</div>
          </div>
          <div className="p-4 bg-[#f5f5f5] border border-[#e8e8e8] space-y-1 text-center">
            <div className="text-[10px] font-mono text-[#828282] uppercase">Root Mean Sq Error</div>
            <div className="text-2xl font-mono font-bold text-[#202020]">33.230</div>
            <div className="text-[10px] font-mono text-[#4d4d4d]">AQI Points</div>
          </div>
          <div className="p-4 bg-[#ffffff] border-2 border-[#ff682c] space-y-1 text-center">
            <div className="text-[10px] font-mono text-[#ff682c] uppercase font-semibold">Variance Explained (R²)</div>
            <div className="text-2xl font-mono font-bold text-[#202020]">0.9131</div>
            <div className="text-[10px] font-mono text-[#816729]">91.31% Variance</div>
          </div>
          <div className="p-4 bg-[#f5f5f5] border border-[#e8e8e8] space-y-1 text-center">
            <div className="text-[10px] font-mono text-[#828282] uppercase">Mean Abs Pct Error</div>
            <div className="text-2xl font-mono font-bold text-[#202020]">14.98%</div>
            <div className="text-[10px] font-mono text-[#4d4d4d]">MAPE Score</div>
          </div>
          <div className="p-4 bg-[#f5f5f5] border border-[#e8e8e8] space-y-1 text-center col-span-2 md:col-span-1">
            <div className="text-[10px] font-mono text-[#828282] uppercase">Category Accuracy</div>
            <div className="text-2xl font-mono font-bold text-[#202020]">72.79%</div>
            <div className="text-[10px] font-mono text-[#4d4d4d]">CPCB Match</div>
          </div>
        </div>

        {/* Evaluation Metadata List */}
        <div className="p-4 bg-[#efefef] border border-[#e8e8e8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-[#4d4d4d]">
          <div><strong className="text-[#202020]">Model Architecture:</strong> LightGBM Regressor</div>
          <div><strong className="text-[#202020]">Training Data:</strong> 1,500,000 Feature Rows</div>
          <div><strong className="text-[#202020]">Validation Window:</strong> 2025 Temporal Walk-Forward</div>
        </div>
      </section>

      {/* SECTION 4: MODEL ANALYSIS & EVALUATION INTERPRETATION (Requirement 5) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#efefef] pb-3 font-mono text-xs text-[#828282] uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-[#202020]" />
          <span>4. Model Evaluation &amp; Statistical Analysis</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-3">
            <h3 className="font-mono text-sm uppercase text-[#816729] font-semibold">
              Regression Metrics Breakdown
            </h3>
            <ul className="space-y-2.5 text-xs text-[#4d4d4d] leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>R² = 0.9131:</strong> Indicates that the LightGBM model explains <strong>91.31% of total AQI variance</strong> on the 2026 holdout set without temporal lookahead contamination.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>MAE = 23.053 AQI:</strong> Demonstrates that across all 246 monitored cities, the average absolute error per next-hour forecast is about 23 index points.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>RMSE = 33.230 AQI:</strong> The higher penalty relative to MAE indicates occasional larger prediction errors during sudden atmospheric inversions or agricultural stubble burning spikes.
                </span>
              </li>
            </ul>
          </div>

          <div className="card-asymmetric p-6 border border-[#e8e8e8] space-y-3">
            <h3 className="font-mono text-sm uppercase text-[#816729] font-semibold">
              Evaluation Methodology Rationale
            </h3>
            <div className="space-y-3 text-xs text-[#4d4d4d] leading-relaxed">
              <p>
                <strong>Why Regression Metrics vs. Classification Accuracy?</strong><br />
                Continuous AQI estimation is inherently a continuous numerical regression problem. Evaluating solely on generic classification accuracy ignores distance errors (e.g. predicting AQI 199 vs 201 counts as a total failure under classification, despite an error of only 2 index points).
              </p>
              <p>
                <strong>Exact Category Agreement (72.79%):</strong><br />
                Measures how frequently the predicted continuous AQI lands in the exact same CPCB health band (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) as the observed true value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURE IMPORTANCE (Requirement 6) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#828282] uppercase tracking-wider">
            <BarChart3 className="w-4 h-4 text-[#202020]" />
            <span>5. Feature Importance Analysis (Top Predictors)</span>
          </div>
          <span className="text-xs font-mono text-[#816729]">LightGBM Split Gain Importance</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chart */}
          <div className="lg:col-span-7 p-6 bg-[#f5f5f5] border border-[#e8e8e8] space-y-4">
            <div className="text-xs font-mono text-[#202020] uppercase font-semibold">
              Top 12 Most Important Model Features
            </div>

            {loadingFeatures ? (
              <div className="py-12 text-center font-mono text-xs text-[#828282]">
                Loading feature importance...
              </div>
            ) : (
              <div className="space-y-2.5">
                {featureImportance.slice(0, 12).map((item) => {
                  const pct = Math.round((item.importance / maxImportance) * 100);
                  return (
                    <div key={item.feature} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-[#202020] font-medium">{item.feature}</span>
                        <span className="text-[#816729]">{item.importance.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-[#e8e8e8] h-2.5 rounded-none overflow-hidden">
                        <div
                          className="bg-[#202020] h-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Explanation */}
          <div className="lg:col-span-5 card-asymmetric p-6 border border-[#e8e8e8] space-y-4">
            <h3 className="font-mono text-sm uppercase text-[#816729] font-semibold">
              Key Feature Interpretations
            </h3>
            <div className="space-y-3 text-xs text-[#4d4d4d] leading-relaxed">
              <div>
                <strong className="text-[#202020]">1. City Code (`city_code`):</strong><br />
                Highest split gain (7,227). Captures geographic baseline air pollution levels across different regional topographies.
              </div>
              <div>
                <strong className="text-[#202020]">2. Baseline AQI &amp; Particulates (`aqi_estimate`, `PM10`, `PM2_5`):</strong><br />
                Directly reflect recent continuous particulate loading prior to the forecast window.
              </div>
              <div>
                <strong className="text-[#202020]">3. 3-Hour Volatility (`aqi_roll_std_3`):</strong><br />
                High rolling standard deviation indicates rapid atmospheric change, signaling incoming stagnation or clearing.
              </div>
              <div>
                <strong className="text-[#202020]">4. Diurnal Cyclical Signals (`hour_sin`, `hour_cos`):</strong><br />
                Account for morning/evening rush hour emissions and night-time boundary layer compression.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: MODEL COMPARISON (Requirement 7) */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#efefef] pb-3">
          <div className="flex items-center gap-2 font-mono text-xs text-[#828282] uppercase tracking-wider">
            <GitCompare className="w-4 h-4 text-[#202020]" />
            <span>6. Validation Model Comparison (LightGBM vs XGBoost)</span>
          </div>
          <span className="text-xs font-mono text-[#816729]">2025 Temporal Validation</span>
        </div>

        <div className="overflow-x-auto border border-[#e8e8e8]">
          <table className="w-full text-left font-sans text-xs border-collapse">
            <thead>
              <tr className="bg-[#202020] text-white font-mono text-[11px] uppercase">
                <th className="p-3 border-b border-[#e8e8e8]">Model Architecture</th>
                <th className="p-3 border-b border-[#e8e8e8]">Validation MAE</th>
                <th className="p-3 border-b border-[#e8e8e8]">Validation RMSE</th>
                <th className="p-3 border-b border-[#e8e8e8]">Validation R²</th>
                <th className="p-3 border-b border-[#e8e8e8]">Selection Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8e8e8]">
              <tr className="bg-[#ffffff] font-medium">
                <td className="p-3 font-mono text-[#202020] flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff682c]" />
                  <span>LightGBM (Champion)</span>
                </td>
                <td className="p-3 font-mono">10.706</td>
                <td className="p-3 font-mono font-bold text-[#ff682c]">24.478</td>
                <td className="p-3 font-mono">0.8150</td>
                <td className="p-3 font-mono text-emerald-700 font-semibold">SELECTED (Lowest RMSE)</td>
              </tr>
              <tr className="bg-[#f5f5f5]">
                <td className="p-3 font-mono text-[#4d4d4d]">XGBoost (Evaluated)</td>
                <td className="p-3 font-mono">10.607</td>
                <td className="p-3 font-mono">24.493</td>
                <td className="p-3 font-mono">0.8148</td>
                <td className="p-3 font-mono text-[#828282]">Evaluated Runner-Up</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-[#efefef] border border-[#e8e8e8] text-xs text-[#4d4d4d] space-y-1 font-sans">
          <strong className="text-[#202020] font-mono uppercase text-[11px]">Selection Rationale:</strong>
          <p className="leading-relaxed">
            While XGBoost achieved a fractionally lower MAE (10.607 vs 10.706), <strong>LightGBM was selected as the production champion</strong> because it achieved the lower validation RMSE (<strong>24.478 vs 24.493</strong>), penalizing large tail forecast errors more effectively while executing faster on 1.5M rows.
          </p>
        </div>
      </section>

      {/* Footer Navigation Link */}
      <div className="pt-6 border-t border-[#efefef] flex justify-between items-center">
        <Link href="/models" className="text-xs font-mono text-[#828282] hover:text-[#202020] transition-colors">
          ← Back to Model Evaluation Suite
        </Link>
        <Link href="/explain" className="btn-primary-sharp text-xs py-2 px-4 flex items-center gap-2">
          <span>Explore TreeSHAP Explainability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
