'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2 } from 'lucide-react';
import { DemoBadge } from '@/components/ui/DemoBadge';
import { DisclaimerBanner } from '@/components/ui/DisclaimerBanner';

interface ConceptItem {
  id: string;
  category: 'DWM' | 'ML';
  name: string;
  definition: string;
  whereAirSenseUsesIt: string;
  liveExample: string;
  projectLink: string;
}

export default function ConceptsPage() {
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'DWM' | 'ML'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const concepts: ConceptItem[] = [
    {
      id: 'dwm-etl',
      category: 'DWM',
      name: 'ETL (Extract, Transform, Load)',
      definition: 'A 3-step data integration pipeline that extracts raw data from disparate external sources, cleans and transforms it into structured warehouse schemas, and loads it into target analytical databases.',
      whereAirSenseUsesIt: 'The 12-stage ETL pipeline extracting monthly XKDR Parquet files using DuckDB, validating timestamps in IST, deduplicating records, imputing gaps, and committing to PostgreSQL 16.',
      liveExample: '196.5M raw readings -> DuckDB scan -> 161.3M cleaned measurements loaded into Fact_Air_Measurement via COPY.',
      projectLink: '/pipeline',
    },
    {
      id: 'dwm-star-schema',
      category: 'DWM',
      name: 'Star Schema',
      definition: 'A relational database modeling pattern consisting of a central fact table surrounded by completely denormalized dimension tables, optimizing read latency for decision support.',
      whereAirSenseUsesIt: 'The primary operational warehouse model where Fact_Air_Daily is directly joined with Dim_Time, Dim_Station, Dim_Pollutant, and Dim_Location without sub-dimension tables.',
      liveExample: 'SELECT AVG(f.avg_pm25) FROM fact_air_daily f JOIN dim_station ds ON f.station_id = ds.station_id GROUP BY ds.city;',
      projectLink: '/warehouse',
    },
    {
      id: 'dwm-snowflake-schema',
      category: 'DWM',
      name: 'Snowflake Schema',
      definition: 'A normalized variation of a star schema where dimension tables are decomposed into 3NF sub-dimension tables to eliminate data redundancy at the cost of additional JOIN operations.',
      whereAirSenseUsesIt: 'Normalized alternative view where Dim_Station branches into Dim_City and Dim_State, and Dim_Pollutant branches into Dim_Pollutant_Group.',
      liveExample: 'dim_station (station_key) -> dim_city (city_key) -> dim_state (state_key).',
      projectLink: '/warehouse',
    },
    {
      id: 'dwm-fact-constellation',
      category: 'DWM',
      name: 'Fact Constellation (Galaxy Schema)',
      definition: 'A warehouse architecture containing multiple fact tables that share conformed dimension tables, supporting multiple grains of data analysis.',
      whereAirSenseUsesIt: 'AirSense pairs atomic hourly measurements (Fact_Air_Measurement) with daily aggregated metrics (Fact_Air_Daily) across shared conformed dimensions.',
      liveExample: 'Both fact tables reference the same dim_time and dim_station dimensions, allowing micro-outlier audit and macro-trend roll-ups.',
      projectLink: '/warehouse',
    },
    {
      id: 'dwm-scd',
      category: 'DWM',
      name: 'Slowly Changing Dimensions (SCD Type 2)',
      definition: 'A technique to preserve full historical tracking of dimension attribute modifications by creating a new version record with effective date validity intervals.',
      whereAirSenseUsesIt: 'Used in Dim_Station to record monitor physical relocations or sensor replacements without corrupting historical sensor observations.',
      liveExample: 'Anand Vihar monitor version 1 (2011 to 2018) preserved alongside version 2 (2018 to present) with valid_from and valid_to intervals.',
      projectLink: '/warehouse',
    },
    {
      id: 'dwm-olap',
      category: 'DWM',
      name: 'OLAP (Online Analytical Processing)',
      definition: 'Multidimensional computing technology that enables business analysts and decision-makers to rapidly view data from different viewpoints and aggregation hierarchies.',
      whereAirSenseUsesIt: 'The interactive 3D cube (Time x Location x Pollutant) executing Roll-up, Drill-down, Slice, Dice, and Pivot operations on historical air data.',
      liveExample: 'Rolling up hourly data into annual station averages; dicing for winter particulate patterns in Delhi and Mumbai.',
      projectLink: '/olap',
    },
    {
      id: 'dwm-rollup',
      category: 'DWM',
      name: 'Roll-up',
      definition: 'An OLAP operation that performs aggregation on a data cube either by climbing up a concept hierarchy for a dimension or by dimension reduction.',
      whereAirSenseUsesIt: 'Station-level hourly readings are rolled up to City daily averages, State monthly summaries, and National annual trajectories.',
      liveExample: 'Station -> City -> State; Hour -> Day -> Month -> Year.',
      projectLink: '/olap',
    },
    {
      id: 'dwm-drilldown',
      category: 'DWM',
      name: 'Drill-down',
      definition: 'The reverse of roll-up, navigating from less detailed summary data to more highly detailed atomic data by stepping down a dimensional hierarchy.',
      whereAirSenseUsesIt: 'Drilling down from annual national trends into specific 24-hour diurnal pollution clocks for a single industrial station.',
      liveExample: 'Year 2025 -> Month November -> Day 15 -> Hour 19:00 IST.',
      projectLink: '/olap',
    },
    {
      id: 'dwm-slice-dice',
      category: 'DWM',
      name: 'Slice & Dice',
      definition: 'Slice performs a selection on one dimension resulting in a sub-plane. Dice defines a subcube by performing selections on two or more dimensions.',
      whereAirSenseUsesIt: 'Slicing by Pollutant = PM2.5; Dicing across [Mumbai, Pune] x [Winter Months] x [PM2.5, PM10].',
      liveExample: 'Slice: WHERE pollutant_id = "POL_01"; Dice: WHERE city IN ("Mumbai","Pune") AND season = "Winter".',
      projectLink: '/olap',
    },
    {
      id: 'dwm-pivot',
      category: 'DWM',
      name: 'Pivot (Rotate)',
      definition: 'A visual OLAP operation that rotates the data axes in view to provide an alternative cross-tabulation presentation.',
      whereAirSenseUsesIt: 'Pivoting the data matrix so that Cities appear on the vertical axis and Calendar Quarters span the horizontal columns.',
      liveExample: 'PostgreSQL CROSSTAB() generating city by season comparative particulate matrices.',
      projectLink: '/olap',
    },
    {
      id: 'ml-pca',
      category: 'ML',
      name: 'Principal Component Analysis (PCA)',
      definition: 'An unsupervised orthogonal linear transformation that converts correlated feature vectors into a set of linearly uncorrelated principal components explaining maximal variance.',
      whereAirSenseUsesIt: 'Compresses 32 collinear environmental and lag features down to 8 principal components explaining 95.4% cumulative variance.',
      liveExample: 'PC1 captures primary combustion smoke (PM2.5, PM10, CO); PC2 captures photochemical ozone smog.',
      projectLink: '/datamining',
    },
    {
      id: 'ml-clustering',
      category: 'ML',
      name: 'Station Clustering (K-Means & DBSCAN)',
      definition: 'Unsupervised partitioning of data objects into groups where objects in the same cluster share high similarity in feature space.',
      whereAirSenseUsesIt: 'Clusters 558 monitoring stations into 4 archetypal pollution profiles: Coastal Lower, Indo-Gangetic High, Traffic Corridors, and Industrial Concentrated.',
      liveExample: 'Evaluated with Silhouette Score (0.68) and Davies-Bouldin Index (0.72) with optimal k=4.',
      projectLink: '/datamining',
    },
    {
      id: 'ml-anomaly',
      category: 'ML',
      name: 'Statistical Anomaly Detection',
      definition: 'The identification of rare items, events, or observations that raise suspicions by differing significantly from the majority of the data.',
      whereAirSenseUsesIt: 'Flagging isolated particulate surges and uncharacteristic industrial batch emissions using IQR (Q3 + 3.0*IQR), Z-scores (>3sigma), and Isolation Forests.',
      liveExample: 'Andheri East sensor recording +265% sudden PM2.5 spike (3.82sigma) isolated from nearby urban monitors.',
      projectLink: '/datamining',
    },
    {
      id: 'ml-regression',
      category: 'ML',
      name: 'AQI Numerical Regression',
      definition: 'Supervised predictive modeling estimating continuous numerical targets from multidimensional feature inputs.',
      whereAirSenseUsesIt: 'Forecasting continuous numerical AQI across 1h, 3h, 6h, 12h, and 24h horizons using an XGBoost Regressor.',
      liveExample: 'Validation RMSE 16.7 and MAE 12.9 on 2024 to 2026 out-of-fold chronological test splits.',
      projectLink: '/models',
    },
    {
      id: 'ml-classification',
      category: 'ML',
      name: 'CPCB 6-Category Classification',
      definition: 'Supervised classification assigning discrete hazard labels to ambient air states based on regulatory decision boundaries.',
      whereAirSenseUsesIt: 'Predicting official CPCB categories (Good, Satisfactory, Moderate, Poor, Very Poor, Severe) using XGBoost Multi-Class.',
      liveExample: 'Achieving Macro-F1 of 0.86 and 88% overall accuracy without severe minority class distortion.',
      projectLink: '/models',
    },
    {
      id: 'ml-explain',
      category: 'ML',
      name: 'SHAP (Shapley Additive Explanations)',
      definition: 'A game-theoretic approach to explain individual predictions by computing the fair additive contribution of each feature to the model output.',
      whereAirSenseUsesIt: 'Explaining why an AQI forecast is elevated, breaking down base expectation E[f(x)] into positive and negative pollutant/inversion contributions.',
      liveExample: 'PM2.5 rolling 6h average contributing +28.4 AQI units toward an evening forecast spike.',
      projectLink: '/explain',
    },
  ];

  const filteredConcepts = concepts.filter((c) => {
    const matchesCategory = filterCategory === 'ALL' || c.category === filterCategory;
    const matchesQuery =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.whereAirSenseUsesIt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="border-b border-[#efefef] pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#816729] mb-2 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
            Academic Curriculum Mapping
          </div>
          <h1 className="font-display font-normal text-3xl sm:text-4xl text-[#202020] tracking-[-0.02em]">
            DWM &amp; Machine Learning Concepts
          </h1>
          <p className="text-sm font-sans text-[#828282] mt-1 max-w-2xl">
            Direct mapping of university syllabus definitions to production implementations across the AirSense data engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DemoBadge label="SYLLABUS MAP" />
        </div>
      </div>

      {/* Intro Box on Warm Ivory */}
      <div className="card-asymmetric p-6 bg-[#ebe6dd] border border-[#e0dacd] space-y-2">
        <div className="font-mono text-xs text-[#816729] uppercase tracking-wider flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff682c]" />
          Direct Syllabus-to-Implementation Traceability
        </div>
        <p className="text-xs text-[#4d4d4d] leading-relaxed font-sans">
          Every concept taught in university Data Warehouse &amp; Mining (DWM) and Machine Learning courses is 
          implemented as a living interactive component in AirSense. Click any concept card to jump to its live production implementation.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="card-asymmetric p-5 bg-white border border-[#efefef] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#828282] uppercase text-[11px] mr-1">Domain:</span>
          {(['ALL', 'DWM', 'ML'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-none transition-all ${
                filterCategory === cat
                  ? 'bg-[#202020] text-white font-medium'
                  : 'bg-[#f5f5f5] text-[#4d4d4d] hover:bg-[#efefef]'
              }`}
            >
              {cat === 'ALL' ? 'All (16)' : cat === 'DWM' ? 'DWM (10)' : 'ML (6)'}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search concepts or definitions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-72 bg-[#f5f5f5] border border-[#efefef] rounded-none px-3 py-1.5 text-xs text-[#202020] placeholder-[#828282] focus:outline-none focus:border-[#202020] font-sans"
          />
        </div>
      </div>

      {/* Concepts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredConcepts.map((c) => (
          <div
            key={c.id}
            className="card-asymmetric p-6 bg-white border border-[#efefef] flex flex-col justify-between space-y-5"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className={`px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wider rounded-none ${
                  c.category === 'DWM'
                    ? 'bg-[#f5f5f5] text-[#202020] border border-[#efefef]'
                    : 'bg-[#ebe6dd] text-[#816729] border border-[#e0dacd]'
                }`}>
                  {c.category} Module
                </span>
                <CheckCircle2 className="w-4 h-4 text-[#ff682c]" />
              </div>

              <h2 className="font-display font-normal text-xl text-[#202020] tracking-[-0.01em]">
                {c.name}
              </h2>

              <p className="text-xs text-[#4d4d4d] font-sans leading-relaxed">
                <strong className="text-[#202020] font-medium">Definition:</strong> {c.definition}
              </p>

              <div className="p-4 bg-[#f5f5f5] border border-[#efefef] space-y-2 card-asymmetric">
                <div className="text-[10px] font-mono text-[#816729] uppercase tracking-wider">
                  Where AirSense Uses It:
                </div>
                <div className="text-[#4d4d4d] text-xs font-sans leading-relaxed">
                  {c.whereAirSenseUsesIt}
                </div>

                <div className="text-[10px] font-mono text-[#828282] uppercase tracking-wider pt-2 border-t border-[#efefef]">
                  Live System Query / Example:
                </div>
                <div className="text-[#202020] text-xs font-mono bg-white p-2.5 border border-[#efefef] overflow-x-auto">
                  {c.liveExample}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#efefef]">
              <Link
                href={c.projectLink}
                className="text-xs font-mono text-[#202020] hover:text-[#ff682c] inline-flex items-center gap-1.5 transition-colors link-ember-underline"
              >
                Inspect Implementation <ArrowRight className="w-3.5 h-3.5 text-[#ff682c]" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <DisclaimerBanner />
    </div>
  );
}
