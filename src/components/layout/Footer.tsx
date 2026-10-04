'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#ffffff] border-t border-[#e8e8e8] text-xs text-[#4d4d4d]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Core Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ff682c]" />
              <span
                className="text-base font-normal tracking-tight text-[#202020]"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                AirSense
              </span>
            </div>
            <p className="text-[#4d4d4d] text-xs leading-relaxed font-sans">
              Editorial environmental data observatory on historical urban air quality. Powered by a PostgreSQL Fact Constellation, DuckDB pushdown, and XGBoost machine learning.
            </p>
            <div className="font-mono text-[11px] text-[#828282]">
              Coverage: 2009–2026 (196.5M records)
            </div>
          </div>

          {/* Column 2: System Architecture */}
          <div>
            <h4
              className="text-[13px] font-normal tracking-[-0.02em] text-[#202020] mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Analytical Architecture
            </h4>
            <ul className="space-y-2.5 text-[#4d4d4d]">
              <li>
                <Link href="/warehouse" className="hover:text-[#202020] transition-colors">
                  Data Warehouse &amp; Schemas
                </Link>
              </li>
              <li>
                <Link href="/olap" className="hover:text-[#202020] transition-colors">
                  Multidimensional OLAP Cube
                </Link>
              </li>
              <li>
                <Link href="/pipeline" className="hover:text-[#202020] transition-colors">
                  ETL &amp; Big Data Preprocessing
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#202020] transition-colors">
                  Feature Engineering &amp; Selection
                </Link>
              </li>
              <li>
                <Link href="/datamining" className="hover:text-[#202020] transition-colors">
                  Clustering &amp; Anomaly Detection
                </Link>
              </li>
              <li>
                <Link href="/models" className="hover:text-[#202020] transition-colors">
                  ML Model Evaluation &amp; Forecasting
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Citizen & Scientific Access */}
          <div>
            <h4
              className="text-[13px] font-normal tracking-[-0.02em] text-[#202020] mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Observatory Access
            </h4>
            <ul className="space-y-2.5 text-[#4d4d4d]">
              <li>
                <Link href="/dashboard" className="hover:text-[#202020] transition-colors">
                  Personal Air Intelligence
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-[#202020] transition-colors">
                  National Station Cartography
                </Link>
              </li>
              <li>
                <Link href="/analytics" className="hover:text-[#202020] transition-colors">
                  Multi-City Historical Trends
                </Link>
              </li>
              <li>
                <Link href="/explain" className="hover:text-[#202020] transition-colors">
                  AQI Driver Explainability (SHAP)
                </Link>
              </li>
              <li>
                <Link href="/concepts" className="hover:text-[#202020] transition-colors">
                  Concepts &amp; Methods Guide
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-[#202020] transition-colors">
                  Academic Context &amp; Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Citations & Governance */}
          <div>
            <h4
              className="text-[13px] font-normal tracking-[-0.02em] text-[#202020] mb-4"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Attribution &amp; Governance
            </h4>
            <p className="text-[#4d4d4d] text-xs leading-relaxed mb-4 font-sans">
              Compiled by XKDR Forum (2026), sourcing CPCB Continuous Ambient Air Quality Monitoring (CAAQM) network and US Department of State monitors via AirNow.
            </p>
            <div className="text-[11px] text-[#828282] space-y-1.5">
              <div>License: Creative Commons Attribution 4.0</div>
              <div className="flex gap-4 pt-2">
                <Link href="/privacy" className="link-ember-underline text-[#202020]">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="link-ember-underline text-[#202020]">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Editorial Notice */}
        <div className="pt-8 border-t border-[#e8e8e8] text-[11px] text-[#828282] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            AirSense provides environmental information and model-based estimates for informational purposes. Not medical advice.
          </div>
          <div className="font-mono text-[#828282]">
            ENGINE: DuckDB + PostgreSQL Fact Constellation + XGBoost
          </div>
        </div>
      </div>
    </footer>
  );
};
