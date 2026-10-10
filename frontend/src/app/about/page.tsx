'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

export default function AboutPage() {
  const teamMembers = [
    {
      role: 'Member 1: DWM & Data Engineering Lead',
      responsibilities: [
        'Data Acquisition & Parquet Lake Architecture',
        'DuckDB Ingestion, Pushdown Queries & Temporal Cleaning',
        '12-Stage Big-Data Preprocessing Pipeline',
        'PostgreSQL Fact Constellation (Fact_Air_Measurement + Fact_Air_Daily)',
        'Star & Snowflake Relational Schemas',
        'SCD Type 2 Dimensional Historization',
        'OLAP Cube Engine & Aggregation Views',
        'Data Quality Auditing & Ingestion Metrics',
      ],
    },
    {
      role: 'Member 2: ML & Data Mining Lead',
      responsibilities: [
        'Feature Engineering (32 Lags, Rolling Windows, Baseline Ratios)',
        'Feature Selection (Mutual Information, RFE, Tree-based Importance)',
        'Principal Component Analysis (PCA Scree Plot & 2D Projection)',
        'Station Clustering (K-Means & DBSCAN Archetypes)',
        'Statistical Anomaly Detection (IQR, Z-score, Isolation Forest)',
        'AQI Numerical Regression Models (Linear, RF, LightGBM, XGBoost)',
        'CPCB 6-Category Classification Models',
        'Model Explainability & TreeSHAP Attribution Diagnostics',
      ],
    },
    {
      role: 'Member 3: Full-Stack Platform Lead',
      responsibilities: [
        'Next.js 16 + React 19 App Router Frontend Architecture',
        'Ventriloc Design System & Editorial Token Architecture',
        'Interactive Leaflet Geospatial Pollution Map & Replay Scrubber',
        'Citizen Dashboard, Activity Planner & Geolocation Fallback',
        'OLAP Explorer Multidimensional Workspace',
        'FastAPI API Contract Specification (/lib/api.ts)',
        'End-to-End Pipeline Observability Interfaces',
        'Production Optimization, Accessibility, Performance & SEO',
      ],
    },
  ];

  const academicDeliverables = [
    'Comprehensive Project Report & Academic Research Methodology',
    'Enterprise Data Dictionary (Facts, Dimensions, Measures, Keys)',
    '12-Stage Big-Data ETL Pipeline Documentation',
    'Relational Star Schema & Snowflake Schema Architectural DDLs',
    'PostgreSQL Warehouse SQL Scripts & Materialized Views',
    'Multidimensional OLAP Cube Query Scripts (ROLLUP / CUBE)',
    'Data Preprocessing & Cleaning Notebooks',
    'Feature Engineering, Selection & PCA Extraction Notebooks',
    'Station Clustering & Anomaly Detection Artifacts',
    'Machine Learning Model Training & Comparison Notebooks',
    'SHAP Interpretability & Explainability Notebooks',
    'FastAPI Backend Architecture Specification',
    'Production-Grade Next.js Web Application Repository',
    'Complete Project README, Video Demonstration & Presentation Deck',
  ];

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            Project Overview &amp; Specifications
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
            About AirSense
          </h1>
          <p className="text-sm font-sans text-[#828282] mt-1 max-w-2xl">
            Environmental data observatory synthesizing 196.5 million historical air-quality observations into structured intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge label="RESEARCH SPECIFICATION" />
        </div>
      </div>

      {/* Purpose Banner on Warm Ivory */}
      <div className="card-asymmetric p-6 sm:p-8 bg-[#ebe6dd] border border-[#e0dacd] space-y-4">
        <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
          The Purpose of AirSense
        </h2>
        <p className="text-xs sm:text-sm text-[#4d4d4d] leading-relaxed font-sans">
          AirSense transforms 196.5 million historical air-quality observations into understandable environmental intelligence. 
          While standard municipal dashboards merely present an isolated AQI number without context, AirSense builds a 
          rigorous institutional bridge connecting <strong>Big Data Warehousing</strong>, <strong>Multidimensional OLAP</strong>, 
          <strong>Unsupervised Data Mining</strong>, and <strong>Supervised Machine Learning</strong> to answer the critical questions citizens and researchers actually ask:
        </p>
        <div className="border-l-2 border-[#ff682c] pl-4 py-2 font-mono text-xs text-[#202020] bg-white/70">
          &quot;Do not build an AQI prediction model and then attach a dashboard. Build: Large-scale data -&gt; Data Warehouse -&gt; OLAP / Data Mining -&gt; ML -&gt; Citizen Intelligence UI.&quot;
        </div>
      </div>

      {/* The Core Philosophy in Dark Graphite */}
      <div className="card-asymmetric p-6 sm:p-8 bg-[#202020] text-white space-y-6">
        <div className="text-[11px] font-mono text-[#816729] uppercase tracking-[0.2em]">
          The Unifying Philosophy: Three Audiences, One System
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2 card-asymmetric">
            <span className="text-[#ff682c] font-mono text-[10px] uppercase tracking-wider">The Citizen</span>
            <div className="text-sm font-sans text-white font-medium">&quot;What is happening around me?&quot;</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              Plain-language AQI, dominant pollutant drivers, is-this-normal baselines, forecast horizons, and outdoor activity windows.
            </p>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2 card-asymmetric">
            <span className="text-[#816729] font-mono text-[10px] uppercase tracking-wider">The DWM Evaluator</span>
            <div className="text-sm font-sans text-white font-medium">196.5M Obs -&gt; ETL -&gt; DW -&gt; OLAP -&gt; Mining</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              Fact Constellation, Star and Snowflake schemas, conformed dimensions, SCD Type 2 tracking, and roll-up/slice/dice operations.
            </p>
          </div>

          <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] space-y-2 card-asymmetric">
            <span className="text-[#f5f5f5] font-mono text-[10px] uppercase tracking-wider">The ML Evaluator</span>
            <div className="text-sm font-sans text-white font-medium">Features -&gt; PCA -&gt; Reg. -&gt; Class. -&gt; SHAP</div>
            <p className="text-[#828282] text-xs font-sans leading-relaxed">
              32 engineered features, TimeSeriesSplit validation, XGBoost regression and multi-class classification, and additive SHAP attribution.
            </p>
          </div>
        </div>
      </div>

      {/* Citations & Source Data Attribution */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
            Formal Attribution &amp; Citations
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            Data Provenance &amp; Public Monitoring Networks
          </h2>
        </div>

        <div className="space-y-3 text-xs text-[#4d4d4d] font-sans leading-relaxed">
          <p>
            AirSense is built upon the public <strong>XKDR India Air Quality Database</strong>. We gratefully acknowledge the following data sources and institutions:
          </p>
          <ul className="list-disc pl-5 space-y-2 font-mono text-[11px] text-[#202020]">
            <li>
              <strong>Primary Citation:</strong> XKDR Forum (2026), <em>India Air Quality Database</em>.
            </li>
            <li>
              <strong>Government Monitoring Network:</strong> Central Pollution Control Board (CPCB) Continuous Ambient Air Quality Monitoring (CAAQM) network.
            </li>
            <li>
              <strong>Diplomatic Monitors:</strong> US Department of State monitoring sites via AirNow (Chanakyapuri, Mumbai, Kolkata, Chennai, Hyderabad).
            </li>
            <li>
              <strong>Data Licensing:</strong> Released under the Creative Commons Attribution 4.0 International License (CC BY 4.0).
            </li>
          </ul>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
            Software Engineering
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric">
            <span className="text-[#828282] uppercase text-[10px] tracking-wider">Data &amp; ETL</span>
            <div className="font-medium text-[#202020] mt-1 text-sm">DuckDB + PyArrow</div>
            <div className="text-[10px] text-[#828282] mt-1 font-sans">Parquet scanning &amp; projection</div>
          </div>
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric">
            <span className="text-[#828282] uppercase text-[10px] tracking-wider">Data Warehouse</span>
            <div className="font-medium text-[#202020] mt-1 text-sm">PostgreSQL 16</div>
            <div className="text-[10px] text-[#828282] mt-1 font-sans">Partitioned Fact Constellation</div>
          </div>
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric">
            <span className="text-[#828282] uppercase text-[10px] tracking-wider">ML &amp; Mining</span>
            <div className="font-medium text-[#202020] mt-1 text-sm">XGBoost &amp; Scikit-Learn</div>
            <div className="text-[10px] text-[#828282] mt-1 font-sans">Regression, Class., SHAP, PCA</div>
          </div>
          <div className="p-4 border border-[#efefef] bg-[#f5f5f5] card-asymmetric">
            <span className="text-[#828282] uppercase text-[10px] tracking-wider">Frontend UI</span>
            <div className="font-medium text-[#202020] mt-1 text-sm">Next.js 16 + React 19</div>
            <div className="text-[10px] text-[#828282] mt-1 font-sans">TypeScript, Tailwind v4, Leaflet</div>
          </div>
        </div>
      </div>

      {/* Team Member Ownership */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-1">
            Team Work Breakdown
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            System Ownership &amp; Responsibilities
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.role} className="p-5 border border-[#efefef] bg-[#f5f5f5] card-asymmetric space-y-3 font-mono text-xs">
              <div className="text-[#202020] font-medium text-xs border-b border-[#efefef] pb-2">
                {member.role}
              </div>
              <ul className="space-y-2 text-[#4d4d4d] font-sans text-xs">
                {member.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#ff682c] mt-2 flex-shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Deliverables Checklist */}
      <div className="card-data-dashboard p-6 sm:p-8 space-y-5">
        <div className="border-b border-[#efefef] pb-4">
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#ff682c] mb-1">
            Academic Submission
          </div>
          <h2 className="font-display font-normal text-2xl text-[#202020] tracking-[-0.02em]">
            Required Academic Deliverables Checklist
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          {academicDeliverables.map((item, i) => (
            <div key={i} className="p-3 border border-[#efefef] bg-[#f5f5f5] flex items-center gap-2.5 card-asymmetric">
              <CheckCircle2 className="w-4 h-4 text-[#ff682c] flex-shrink-0" />
              <span className="text-[#202020] font-sans text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <DisclaimerBanner />
    </div>
  );
}
