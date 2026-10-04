# AirSense Optimization and Integration Plan

## Goal
Optimize backend memory usage (preventing 100% RAM saturation caused by loading unpaginated large Parquet/CSV files into Pandas/FastAPI memory) and fully integrate FastAPI backend with the Next.js frontend across all modules (DWM, ML, OLAP, Maps, Analytics, Citizen Dashboard).

---

## Architecture & Root Cause Analysis
1. **Memory Bottlenecks (100% RAM Issue)**:
   - FastAPI endpoints (`/api/air/history`, `/api/features`, `/api/features/pca`, `/api/data-quality`, etc.) load entire multi-megabyte Parquet and CSV files into memory as Pandas DataFrames and serialize all records to JSON.
   - `/api/data-quality` iterates over all CSV files in `quality_reports/` and reads them fully.
   - DuckDB queries without limits pull massive intermediate results into Python.
   - Unpaginated React requests fetch massive payloads concurrently.

2. **Backend Optimization Strategy**:
   - Implement strict pagination (`limit` default 100, max 500 or 1000) on heavy endpoints (`/api/air/history`, `/api/features`, `/api/features/pca`, `/api/air/clusters`, `/api/air/anomalies`).
   - Use DuckDB limits/filtering or Pandas `.head()` / chunked reading.
   - Summarize data quality reports instead of dumping all rows.

3. **Frontend & API Integration**:
   - Ensure all Next.js pages correctly point to FastAPI backend (`http://127.0.0.1:8000`).
   - Implement robust error handling, loading states, and memoization in frontend data hooks/components.

---

## Detailed Execution Steps

### Phase 1: Backend Memory Optimization (`airsense/backend/app/main.py`)
1. **Add Pagination & Limits**:
   - Update `/api/air/history` to accept `limit` and `offset` parameters (default `limit=200`).
   - Update `/api/features` and `/api/features/pca` to enforce strict limits (default `limit=200`, max `500`).
   - Update `/api/air/clusters` and `/api/air/anomalies` to support pagination/capping.
   - Optimize `/api/data-quality` to return summarized metadata or top rows per report.

2. **DuckDB & Pandas Resource Management**:
   - Ensure read-only connections and garbage collection/efficient slicing.

### Phase 2: Frontend API Client & Component Robustness
1. **Verify Frontend API Integration**:
   - Check `airsense/src/lib/backend-api.ts` and component fetch calls.
   - Ensure graceful fallbacks when backend is unreachable or returning paginated items.

### Phase 3: Verification & Build
1. Run backend tests / startup check.
2. Run Next.js build (`npm run build`) to verify type safety and compilation.
