'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Server,
  Activity,
  Cpu,
  Database,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';
import { useAuth } from '@/context/AuthContext';
import { MONITORED_STATIONS, DATA_QUALITY_METRICS, ETL_PIPELINE_RUNS } from '@/lib/mock-data';

export default function AdminDashboardPage() {
  const { user, role, switchRole, logout } = useAuth();
  const isAdmin = role === 'admin';

  // Active admin tab
  type AdminTab = 'stations' | 'pipeline' | 'models' | 'anomalies' | 'warehouse' | 'audit';
  const [activeTab, setActiveTab] = useState<AdminTab>('stations');

  // Simulation interactive states
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [pipelineMessage, setPipelineMessage] = useState<string | null>(null);
  const [vacuumRunning, setVacuumRunning] = useState<boolean>(false);
  const [vacuumMessage, setVacuumMessage] = useState<string | null>(null);
  const [retrainRunning, setRetrainRunning] = useState<boolean>(false);
  const [retrainMessage, setRetrainMessage] = useState<string | null>(null);

  // Anomaly threshold state
  const [zScoreThreshold, setZScoreThreshold] = useState<number>(3.0);
  const [iqrMultiplier, setIqrMultiplier] = useState<number>(1.5);
  const [quarantinedStations, setQuarantinedStations] = useState<string[]>([]);

  // Station status list simulation
  const [stationsList, setStationsList] = useState(
    MONITORED_STATIONS.map((s, idx) => ({
      ...s,
      status: idx === 1 ? 'Degraded' : idx === 3 ? 'Calibration' : 'Online',
      latencyMs: 14 + (idx * 7) % 45,
      driftSigma: (0.12 + (idx * 0.08) % 0.8).toFixed(2),
      uptimePct: (99.8 - (idx * 0.3) % 4).toFixed(1),
    }))
  );

  // Trigger simulated actions
  const handleTriggerPipeline = () => {
    setPipelineRunning(true);
    setPipelineMessage('Starting DuckDB pushdown extraction across 196.5M observations...');
    setTimeout(() => {
      setPipelineMessage('Schema validated. Normalizing IST timestamps and imputing missing records...');
    }, 1200);
    setTimeout(() => {
      setPipelineMessage('Success: Ingested 161.32M rows into PostgreSQL Fact_Air_Measurement in 38.4s. 0 memory spikes.');
      setPipelineRunning(false);
    }, 2800);
  };

  const handleTriggerVacuum = () => {
    setVacuumRunning(true);
    setVacuumMessage('Running PostgreSQL VACUUM ANALYZE on fact_air_measurement and fact_air_daily...');
    setTimeout(() => {
      setVacuumMessage('Completed: 14 partitions analyzed. Indexes recomputed. Dead tuples reclaimed: 48,290.');
      setVacuumRunning(false);
    }, 2200);
  };

  const handleTriggerRetrain = () => {
    setRetrainRunning(true);
    setRetrainMessage('Executing 5-Fold TimeSeriesSplit on 2009-2026 data. Training XGBoost Regressor...');
    setTimeout(() => {
      setRetrainMessage('Challenger XGBoost Model trained: RMSE dropped from 16.7 to 16.2. Baseline updated.');
      setRetrainRunning(false);
    }, 2600);
  };

  const toggleQuarantine = (stationId: string) => {
    if (quarantinedStations.includes(stationId)) {
      setQuarantinedStations(quarantinedStations.filter((id) => id !== stationId));
    } else {
      setQuarantinedStations([...quarantinedStations, stationId]);
    }
  };

  // If user is not admin, show graceful elevation gate
  if (!isAdmin) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-16 space-y-8">
        <div className="card-data-dashboard p-8 sm:p-10 space-y-6 text-center">
          <div className="w-12 h-12 bg-[#ebe6dd] rounded-full flex items-center justify-center mx-auto text-[#ff682c]">
            <ShieldCheck className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729]">
              Authentication Required
            </div>
            <h1 className="font-display font-normal text-3xl text-[#202020] tracking-[-0.02em]">
              Administrator &amp; Evaluator Access Only
            </h1>
            <p className="text-xs sm:text-sm text-[#828282] font-sans max-w-md mx-auto leading-relaxed">
              This area contains hardware telemetry control, DuckDB ETL orchestration, TimeSeriesSplit model training, and database partition maintenance.
            </p>
          </div>

          <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric max-w-md mx-auto text-xs font-mono text-[#4d4d4d] space-y-2">
            <div className="text-[#816729] uppercase tracking-wider text-[10px]">Current Session Status:</div>
            <div>
              Logged in as: <strong className="text-[#202020]">{user ? user.name : 'Guest User'}</strong> ({user?.role || 'unauthenticated'})
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => switchRole('admin')}
              className="btn-primary-sharp px-6 py-3 text-xs font-mono uppercase tracking-wider flex items-center gap-2"
            >
              <span>Instant Evaluator Elevation</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
            </button>
            <Link
              href="/dashboard"
              className="btn-ghost-sharp px-6 py-3 text-xs font-mono text-[#202020]"
            >
              Return to Citizen View
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c] animate-pulse" />
            Operations Command Center : Elevated Privileges
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
            System Administration
          </h1>
          <p className="text-sm font-sans text-[#828282] mt-1">
            Real-time telemetry, DuckDB pipeline execution, model retraining, and warehouse health governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block text-xs font-mono">
            <div className="text-[#202020] font-medium">{user?.name}</div>
            <div className="text-[#816729] text-[10px] uppercase">Admin Operator</div>
          </div>
          <button
            onClick={() => switchRole('citizen')}
            className="btn-ghost-sharp text-xs font-mono py-1.5 px-3 text-[#202020] flex items-center gap-1.5"
            title="Switch back to citizen view"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#ff682c]" />
            Citizen Mode
          </button>
          <button
            onClick={logout}
            className="btn-ghost-sharp text-xs font-mono py-1.5 px-3 text-[#828282] hover:text-[#202020]"
            title="Sign out of administration"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-time System Heartbeat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
          <div className="text-[10px] text-[#828282] uppercase">Active Monitored Stations</div>
          <div className="text-xl font-mono text-[#202020] font-medium mt-1">512 / 558</div>
          <div className="text-[10px] text-emerald-700 mt-0.5">91.7% Operational</div>
        </div>

        <div className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
          <div className="text-[10px] text-[#828282] uppercase">DuckDB Pushdown Engine</div>
          <div className="text-xl font-mono text-[#202020] font-medium mt-1">Online</div>
          <div className="text-[10px] text-[#ff682c] mt-0.5">Zero-Memory Spikes</div>
        </div>

        <div className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
          <div className="text-[10px] text-[#828282] uppercase">PostgreSQL DW Fact Rows</div>
          <div className="text-xl font-mono text-[#202020] font-medium mt-1">161.32M</div>
          <div className="text-[10px] text-[#828282] mt-0.5">Partitioned Q1 2026</div>
        </div>

        <div className="p-3.5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
          <div className="text-[10px] text-[#828282] uppercase">Active Model Champion</div>
          <div className="text-xl font-mono text-[#202020] font-medium mt-1">XGBoost v2.4</div>
          <div className="text-[10px] text-[#816729] mt-0.5">Validation RMSE: 16.7</div>
        </div>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex flex-wrap gap-1.5 border-b border-[#efefef] pb-3 text-xs font-mono">
        {[
          { id: 'stations', label: '1. Station Telemetry & Hardware' },
          { id: 'pipeline', label: '2. DuckDB ETL Orchestration' },
          { id: 'models', label: '3. Model Registry & Retraining' },
          { id: 'anomalies', label: '4. Anomaly Quarantine' },
          { id: 'warehouse', label: '5. Warehouse Partition Maintenance' },
          { id: 'audit', label: '6. System Audit Logs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`px-3 py-1.5 transition-all rounded-none ${
              activeTab === tab.id
                ? 'bg-[#202020] text-white font-medium'
                : 'bg-[#f5f5f5] text-[#4d4d4d] hover:bg-[#efefef]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STATION HARDWARE & TELEMETRY HEALTH */}
      {/* ========================================================================= */}
      {activeTab === 'stations' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#efefef] pb-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
                Hardware Health
              </div>
              <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
                558 Monitored Continuous Stations : Hardware Health
              </h2>
            </div>
            <button
              onClick={() => {
                setStationsList((prev) =>
                  prev.map((s) => ({
                    ...s,
                    latencyMs: Math.floor(12 + Math.random() * 25),
                  }))
                );
              }}
              className="btn-ghost-sharp text-xs font-mono px-3 py-1.5 text-[#202020] flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#ff682c]" />
              Ping Monitored Nodes
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full editorial-table text-xs">
              <thead>
                <tr>
                  <th className="text-left">Station ID</th>
                  <th className="text-left">Station Name</th>
                  <th className="text-left">City &amp; State</th>
                  <th className="text-left">Hardware Status</th>
                  <th className="text-right">Latency</th>
                  <th className="text-right">Sensor Drift</th>
                  <th className="text-right">30d Uptime</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stationsList.map((stn) => {
                  const isQuarantined = quarantinedStations.includes(stn.station_id);
                  return (
                    <tr key={stn.station_id}>
                      <td className="font-mono text-[#202020] font-medium">{stn.station_id}</td>
                      <td className="font-sans text-[#202020] font-medium">{stn.station_name}</td>
                      <td className="font-mono text-[#828282]">{stn.city}, {stn.state}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-mono rounded-none ${
                            isQuarantined
                              ? 'bg-[#202020] text-white'
                              : stn.status === 'Online'
                              ? 'bg-emerald-100 text-emerald-900'
                              : stn.status === 'Degraded'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-rose-100 text-rose-900'
                          }`}
                        >
                          {isQuarantined ? 'Quarantined' : stn.status}
                        </span>
                      </td>
                      <td className="font-mono text-right text-[#4d4d4d]">{stn.latencyMs}ms</td>
                      <td className="font-mono text-right text-[#4d4d4d]">{stn.driftSigma}σ</td>
                      <td className="font-mono text-right text-[#202020]">{stn.uptimePct}%</td>
                      <td className="text-right">
                        <button
                          onClick={() => toggleQuarantine(stn.station_id)}
                          className={`px-2 py-1 text-[10px] font-mono border rounded-none ${
                            isQuarantined
                              ? 'border-[#202020] bg-white text-[#202020]'
                              : 'border-[#ff682c] bg-white text-[#ff682c] hover:bg-[#ff682c]/10'
                          }`}
                        >
                          {isQuarantined ? 'Release Node' : 'Quarantine'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: DUCKDB ETL ORCHESTRATION */}
      {/* ========================================================================= */}
      {activeTab === 'pipeline' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#efefef] pb-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
              Data Engineering
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              DuckDB Pushdown ETL Batch Orchestrator
            </h2>
            <p className="text-xs text-[#828282] font-sans mt-1">
              Enforce Section 52 Zero Full-Memory Loading rule across monthly Parquet archives.
            </p>
          </div>

          <div className="p-5 bg-[#ebe6dd] border border-[#e0dacd] card-asymmetric space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#816729] uppercase tracking-wider font-medium flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
                Interactive Batch Trigger
              </span>
              <span className="text-[10px] font-mono text-[#828282]">PostgreSQL Target: localhost:5432/airsense_dw</span>
            </div>
            <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
              Initiates column projection and predicate pushdown on Parquet chunks, validates IST timestamps, runs temporal spline interpolation, and executes batch COPY into PostgreSQL.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <button
                onClick={handleTriggerPipeline}
                disabled={pipelineRunning}
                className="btn-primary-sharp px-4 py-2 text-xs font-mono flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 text-[#ff682c]" />
                {pipelineRunning ? 'Executing Pipeline...' : 'Run 12-Stage Batch Ingestion'}
              </button>
              <button
                onClick={() => setPipelineMessage('DuckDB local caching cleared. 0 active temporary tables in memory.')}
                className="btn-ghost-sharp px-3 py-2 text-xs font-mono text-[#202020]"
              >
                Purge Temporary Cache
              </button>
            </div>

            {pipelineMessage && (
              <div className="p-3 bg-white border border-[#d8d1c1] font-mono text-xs text-[#202020]">
                {pipelineMessage}
              </div>
            )}
          </div>

          {/* Audit Logs of recent runs */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-mono text-[#828282] uppercase tracking-wider">
              Recent Batch Ingestion Execution Records
            </div>
            <div className="overflow-x-auto">
              <table className="w-full editorial-table text-xs">
                <thead>
                  <tr>
                    <th className="text-left">Run ID</th>
                    <th className="text-left">Stage</th>
                    <th className="text-right">Processed</th>
                    <th className="text-right">Rejected</th>
                    <th className="text-right">Duration</th>
                    <th className="text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ETL_PIPELINE_RUNS.slice(0, 4).map((r, i) => (
                    <tr key={i}>
                      <td className="font-mono text-[#202020] font-medium">{r.run_id}</td>
                      <td className="font-mono text-[#4d4d4d]">{r.stage}</td>
                      <td className="font-mono text-right text-[#202020]">{r.records_processed.toLocaleString()}</td>
                      <td className="font-mono text-right text-[#828282]">{r.records_rejected.toLocaleString()}</td>
                      <td className="font-mono text-right text-[#4d4d4d]">{r.duration_seconds}s</td>
                      <td>
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-emerald-100 text-emerald-900">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MODEL REGISTRY & RETRAINING */}
      {/* ========================================================================= */}
      {activeTab === 'models' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#efefef] pb-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
              Machine Learning Operations (MLOps)
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Model Registry &amp; TimeSeriesSplit Retraining
            </h2>
            <p className="text-xs text-[#828282] font-sans mt-1">
              Prevent temporal data leakage using chronological expanding window validation on out-of-fold testing sets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Champion Model */}
            <div className="p-5 border border-[#202020] bg-[#f5f5f5] card-asymmetric space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase tracking-wider text-[#ff682c] font-medium">
                  Champion Model (In Production)
                </span>
                <span className="px-2 py-0.5 bg-[#202020] text-white text-[10px] font-mono">Active</span>
              </div>
              <div className="font-display font-normal text-xl text-[#202020]">
                XGBoost Regressor (32 Engineered Features)
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2">
                <div>
                  <div className="text-[#828282] text-[10px]">Test RMSE</div>
                  <div className="text-lg text-[#202020] font-medium">16.7</div>
                </div>
                <div>
                  <div className="text-[#828282] text-[10px]">Test MAE</div>
                  <div className="text-lg text-[#202020] font-medium">12.9</div>
                </div>
                <div>
                  <div className="text-[#828282] text-[10px]">Test R²</div>
                  <div className="text-lg text-[#202020] font-medium">0.89</div>
                </div>
              </div>
            </div>

            {/* Challenger Model */}
            <div className="p-5 border border-[#efefef] bg-white card-asymmetric space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono uppercase tracking-wider text-[#828282]">
                  Challenger Candidate
                </span>
                <span className="px-2 py-0.5 bg-[#efefef] text-[#4d4d4d] text-[10px] font-mono">Staged</span>
              </div>
              <div className="font-display font-normal text-xl text-[#202020]">
                LightGBM Regressor + PCA (8 Components)
              </div>
              <div className="grid grid-cols-3 gap-2 font-mono text-xs pt-2">
                <div>
                  <div className="text-[#828282] text-[10px]">Test RMSE</div>
                  <div className="text-lg text-[#4d4d4d]">17.1</div>
                </div>
                <div>
                  <div className="text-[#828282] text-[10px]">Test MAE</div>
                  <div className="text-lg text-[#4d4d4d]">13.2</div>
                </div>
                <div>
                  <div className="text-[#828282] text-[10px]">Test R²</div>
                  <div className="text-lg text-[#4d4d4d]">0.88</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-3">
            <div className="text-xs font-mono text-[#202020] font-medium uppercase tracking-wider">
              Model Governance Actions:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTriggerRetrain}
                disabled={retrainRunning}
                className="btn-primary-sharp px-4 py-2 text-xs font-mono flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#ff682c] ${retrainRunning ? 'animate-spin' : ''}`} />
                {retrainRunning ? 'Retraining XGBoost...' : 'Trigger TimeSeriesSplit 5-Fold Retrain'}
              </button>
              <button
                onClick={() => setRetrainMessage('TreeSHAP additive expectation baseline recalculated: E[f(x)] = 82.4 AQI.')}
                className="btn-ghost-sharp px-3 py-2 text-xs font-mono text-[#202020]"
              >
                Recalculate SHAP Baselines
              </button>
            </div>
            {retrainMessage && (
              <div className="p-3 bg-white border border-[#efefef] font-mono text-xs text-[#202020]">
                {retrainMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: ANOMALY QUARANTINE */}
      {/* ========================================================================= */}
      {activeTab === 'anomalies' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#efefef] pb-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
              Data Quality Governance
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              Statistical Anomaly Calibration &amp; Quarantine
            </h2>
            <p className="text-xs text-[#828282] font-sans mt-1">
              Tune IQR multiplier and Z-Score sigma thresholds to separate sensor contamination from authentic industrial spikes.
            </p>
          </div>

          {/* Interactive Threshold Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-[#f5f5f5] border border-[#efefef] card-asymmetric">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#828282]">Z-Score Threshold (σ):</span>
                <span className="font-medium text-[#202020]">{zScoreThreshold.toFixed(1)}σ</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="4.5"
                step="0.1"
                value={zScoreThreshold}
                onChange={(e) => setZScoreThreshold(parseFloat(e.target.value))}
                className="w-full accent-[#202020]"
              />
              <p className="text-[11px] text-[#828282] font-sans">
                Observations exceeding {zScoreThreshold.toFixed(1)} standard deviations from seasonal historical mean are flagged for audit.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#828282]">IQR Outlier Multiplier:</span>
                <span className="font-medium text-[#202020]">{iqrMultiplier.toFixed(1)}x IQR</span>
              </div>
              <input
                type="range"
                min="1.0"
                max="3.0"
                step="0.5"
                value={iqrMultiplier}
                onChange={(e) => setIqrMultiplier(parseFloat(e.target.value))}
                className="w-full accent-[#202020]"
              />
              <p className="text-[11px] text-[#828282] font-sans">
                Flag points outside Q3 + {iqrMultiplier.toFixed(1)} * IQR.
              </p>
            </div>
          </div>

          {/* Flagged Sensors Table */}
          <div className="space-y-3">
            <div className="text-xs font-mono text-[#828282] uppercase tracking-wider">
              Currently Flagged Anomalous Readings (Last 24h)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full editorial-table text-xs">
                <thead>
                  <tr>
                    <th className="text-left">Timestamp</th>
                    <th className="text-left">Station</th>
                    <th className="text-left">Pollutant</th>
                    <th className="text-right">Observed</th>
                    <th className="text-right">Expected Mean</th>
                    <th className="text-right">Z-Score</th>
                    <th className="text-left">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="font-mono text-[#828282]">2026-03-28 14:00</td>
                    <td className="font-medium text-[#202020]">Andheri East, Mumbai</td>
                    <td className="font-mono text-[#202020]">PM2.5</td>
                    <td className="font-mono text-right text-[#ff682c] font-medium">324 µg/m³</td>
                    <td className="font-mono text-right text-[#4d4d4d]">68 µg/m³</td>
                    <td className="font-mono text-right text-[#ff682c]">+3.82σ</td>
                    <td>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-rose-100 text-rose-900">
                        Quarantined
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="font-mono text-[#828282]">2026-03-28 16:30</td>
                    <td className="font-medium text-[#202020]">Bawana, Delhi</td>
                    <td className="font-mono text-[#202020]">CO</td>
                    <td className="font-mono text-right text-[#ff682c] font-medium">4.8 mg/m³</td>
                    <td className="font-mono text-right text-[#4d4d4d]">1.2 mg/m³</td>
                    <td className="font-mono text-right text-[#ff682c]">+3.15σ</td>
                    <td>
                      <span className="px-2 py-0.5 text-[10px] font-mono bg-amber-100 text-amber-900">
                        Pending Audit
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: WAREHOUSE PARTITION MAINTENANCE */}
      {/* ========================================================================= */}
      {activeTab === 'warehouse' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#efefef] pb-4">
            <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
              Storage Engine Governance
            </div>
            <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
              PostgreSQL 16 Fact Constellation &amp; Partition Health
            </h2>
            <p className="text-xs text-[#828282] font-sans mt-1">
              Monitor table bloat, trigger vacuum analyze, and maintain conformed dimension indexes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
            <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-1">
              <span className="text-[#828282] text-[10px] uppercase">Fact_Air_Measurement Size</span>
              <div className="text-xl text-[#202020] font-medium">18.4 GB</div>
              <div className="text-[10px] text-[#828282] font-sans">Partitioned by Year-Month</div>
            </div>

            <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-1">
              <span className="text-[#828282] text-[10px] uppercase">Fact_Air_Daily Size</span>
              <div className="text-xl text-[#202020] font-medium">1.2 GB</div>
              <div className="text-[10px] text-[#828282] font-sans">Roll-up aggregated grain</div>
            </div>

            <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-1">
              <span className="text-[#828282] text-[10px] uppercase">Buffer Cache Hit Ratio</span>
              <div className="text-xl text-emerald-700 font-medium">99.4%</div>
              <div className="text-[10px] text-[#828282] font-sans">Optimal memory hit rate</div>
            </div>
          </div>

          <div className="p-4 bg-[#f5f5f5] border border-[#efefef] card-asymmetric space-y-3">
            <div className="text-xs font-mono text-[#202020] font-medium uppercase tracking-wider">
              Warehouse Operations:
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTriggerVacuum}
                disabled={vacuumRunning}
                className="btn-primary-sharp px-4 py-2 text-xs font-mono flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-[#ff682c]" />
                {vacuumRunning ? 'Running Vacuum...' : 'Execute VACUUM ANALYZE'}
              </button>
              <button
                onClick={() => setVacuumMessage('Refreshed Materialized Views: mv_city_daily_summary, mv_station_monthly_rollup in 1.4s.')}
                className="btn-ghost-sharp px-3 py-2 text-xs font-mono text-[#202020]"
              >
                Refresh Materialized Views
              </button>
            </div>
            {vacuumMessage && (
              <div className="p-3 bg-white border border-[#efefef] font-mono text-xs text-[#202020]">
                {vacuumMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SYSTEM AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#efefef] pb-4 flex justify-between items-center">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
                Audit Trail
              </div>
              <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
                Administrative Security &amp; Access Log
              </h2>
            </div>
            <span className="text-xs font-mono text-[#828282]">PostgreSQL pg_stat_activity</span>
          </div>

          <div className="space-y-2 font-mono text-xs">
            <div className="p-3 bg-[#f5f5f5] border border-[#efefef] card-asymmetric flex justify-between items-center">
              <div>
                <span className="text-[#ff682c] font-medium">[SECURITY]</span> Admin login elevated: <strong className="text-[#202020]">Dr. Vikram Malhotra</strong> (admin@airsense.org)
              </div>
              <span className="text-[#828282] text-[10px]">Just now</span>
            </div>

            <div className="p-3 bg-[#f5f5f5] border border-[#efefef] card-asymmetric flex justify-between items-center">
              <div>
                <span className="text-emerald-700 font-medium">[PIPELINE]</span> Parquet scan executed: 196,500,000 observations verified. DuckDB pushdown OK.
              </div>
              <span className="text-[#828282] text-[10px]">22m ago</span>
            </div>

            <div className="p-3 bg-[#f5f5f5] border border-[#efefef] card-asymmetric flex justify-between items-center">
              <div>
                <span className="text-[#816729] font-medium">[MLOPS]</span> TreeSHAP expectation baseline confirmed: E[f(x)] = 82.4 AQI across 32 features.
              </div>
              <span className="text-[#828282] text-[10px]">1h ago</span>
            </div>

            <div className="p-3 bg-[#f5f5f5] border border-[#efefef] card-asymmetric flex justify-between items-center">
              <div>
                <span className="text-[#4d4d4d] font-medium">[DATABASE]</span> SCD Type 2 dimension version check completed. 0 corrupted valid_to intervals.
              </div>
              <span className="text-[#828282] text-[10px]">3h ago</span>
            </div>
          </div>
        </div>
      )}

      <DisclaimerBanner />
    </div>
  );
}
