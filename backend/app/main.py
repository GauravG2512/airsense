import os
from pathlib import Path
import math

try:
    from dotenv import load_dotenv

    env_path = Path(__file__).resolve().parents[1] / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

import duckdb
import pandas as pd

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

BASE = Path(__file__).resolve().parents[1]

DATA = BASE / "data"
FEATURES = BASE / "features"
MINING = BASE / "mining"
MODELS = BASE / "models"
UI_OUTPUTS = BASE / "ui_outputs"
REPORTS = BASE / "reports"
QUALITY = BASE / "quality_reports"
WAREHOUSE = BASE / "warehouse"

DB_PATH = WAREHOUSE / "airsense_dw.duckdb"

app = FastAPI(
    title="AirSense API",
    description="AirSense DWM + ML backend",
    version="1.0.0"
)

configured_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", "").split(",")
    if origin.strip()
]

default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:3002",
    "http://127.0.0.1:3002",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(default_origins + configured_origins)),
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

warehouse = None

if DB_PATH.exists():
    warehouse = duckdb.connect(
        str(DB_PATH),
        read_only=True
    )


def query_file_response(path: Path, limit: int = 200, offset: int = 0, city: str | None = None):
    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {path.name}"
        )

    suffix = path.suffix.lower()
    if suffix == ".parquet":
        table_func = "read_parquet(?)"
    elif suffix == ".csv":
        table_func = "read_csv_auto(?)"
    else:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported data file type: {suffix or 'unknown'}"
        )

    query = f"SELECT * FROM {table_func}"
    parameters = [str(path)]

    if city:
        query += " WHERE lower(city_name) = lower(?)"
        parameters.append(city.strip())

    query += " LIMIT ? OFFSET ?"
    parameters.extend([limit, offset])

    connection = duckdb.connect(
        ":memory:",
        config={
            "threads": "2",
            "memory_limit": "256MB"
        }
    )

    try:
        df = connection.execute(query, parameters).fetchdf()
    finally:
        connection.close()

    return {
        "data": df.replace({float("nan"): None}).to_dict(
            orient="records"
        )
    }


def csv_response(filename, limit: int = 200, offset: int = 0):
    return query_file_response(UI_OUTPUTS / filename, limit=limit, offset=offset)


def parquet_response(filename, limit: int = 200, offset: int = 0):
    return query_file_response(UI_OUTPUTS / filename, limit=limit, offset=offset)


def city_parquet_response(
    filename: str,
    city: str | None,
    limit: int,
    offset: int = 0
):
    return query_file_response(UI_OUTPUTS / filename, limit=limit, offset=offset, city=city)


@app.get("/")
def root():
    return {
        "project": "AirSense",
        "status": "running",
        "version": "1.0.0"
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "database_available": DB_PATH.exists(),
        "models_available": MODELS.exists(),
        "ui_outputs_available": UI_OUTPUTS.exists()
    }


@app.get("/api/air/current")
def current_air(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("latest_city_air_quality.csv", limit=limit, offset=offset)


@app.get("/api/air/map")
def air_map(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("pollution_map_data.csv", limit=limit, offset=offset)


@app.get("/api/analytics/visualizations")
def analytics_visualizations():
    annual_path = DATA / "clean_air_daily.parquet"
    city_year_path = UI_OUTPUTS / "warehouse_year_city.csv"
    heatmap_path = UI_OUTPUTS / "warehouse_aqi_month_heatmap.csv"
    variance_path = FEATURES / "pca_variance.csv"
    forecast_path = UI_OUTPUTS / "aqi_forecast_next_24h.parquet"
    pca_2d_path = FEATURES / "pca_2d_projection.parquet"
    pca_3d_path = FEATURES / "pca_3d_projection.parquet"

    required_paths = [
        annual_path,
        city_year_path,
        heatmap_path,
        variance_path,
        forecast_path,
        pca_2d_path,
        pca_3d_path
    ]
    missing = [path.name for path in required_paths if not path.exists()]
    if missing:
        raise HTTPException(
            status_code=503,
            detail=f"Analytics artifacts unavailable: {', '.join(missing)}"
        )

    connection = duckdb.connect(
        ":memory:",
        config={
            "threads": "2",
            "memory_limit": "256MB"
        }
    )

    try:
        annual = connection.execute(
            """
            SELECT
                EXTRACT(YEAR FROM CAST(period_start AS TIMESTAMP))::INTEGER AS year,
                AVG(mean_value) AS pm25_mean,
                MAX(mean_value) AS pm25_peak
            FROM read_parquet(?)
            WHERE parameter_name = 'PM2.5'
            GROUP BY year
            ORDER BY year
            """,
            [str(annual_path)]
        ).fetchdf()
        city_year = connection.execute(
            """
            SELECT
                TRY_CAST(year AS INTEGER) AS year,
                city_name,
                TRY_CAST(average_aqi AS DOUBLE) AS average_aqi,
                TRY_CAST(average_pm25 AS DOUBLE) AS average_pm25
            FROM read_csv_auto(?)
            WHERE TRY_CAST(average_aqi AS DOUBLE) IS NOT NULL
               OR TRY_CAST(average_pm25 AS DOUBLE) IS NOT NULL
            ORDER BY year, city_name
            """,
            [str(city_year_path)]
        ).fetchdf()
        heatmap = connection.execute(
            """
            SELECT *
            FROM read_csv_auto(?, header = true)
            ORDER BY city_name
            """,
            [str(heatmap_path)]
        ).fetchdf()
        variance = connection.execute(
            "SELECT * FROM read_csv_auto(?) ORDER BY component",
            [str(variance_path)]
        ).fetchdf()
        forecast = connection.execute(
            """
            SELECT *
            FROM read_parquet(?)
            ORDER BY horizon_hours
            """,
            [str(forecast_path)]
        ).fetchdf()
        pca_2d = connection.execute(
            """
            SELECT PC1, PC2
            FROM read_parquet(?)
            USING SAMPLE 1200 ROWS
            """,
            [str(pca_2d_path)]
        ).fetchdf()
        pca_3d = connection.execute(
            """
            SELECT PC1, PC2, PC3
            FROM read_parquet(?)
            USING SAMPLE 1200 ROWS
            """,
            [str(pca_3d_path)]
        ).fetchdf()
    finally:
        connection.close()

    def records(frame):
        return frame.astype(object).where(pd.notna(frame), None).to_dict(
            orient="records"
        )

    return {
        "pm25_yearly": records(annual),
        "warehouse_city_year": records(city_year),
        "warehouse_pm25_by_city": records(
            city_year[city_year["average_pm25"].notna()]
        ),
        "aqi_month_heatmap": records(heatmap),
        "pca_variance": records(variance),
        "aqi_forecast": records(forecast),
        "pca_2d": records(pca_2d),
        "pca_3d": records(pca_3d),
        "pca_sample_size": 1200
    }


@app.get("/api/air/history")
def air_history(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
    city: str | None = Query(default=None)
):
    path = DATA / "city_daily_aqi.parquet"
    return query_file_response(path, limit=limit, offset=offset, city=city)


@app.get("/api/air/forecast")
def air_forecast(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    path = UI_OUTPUTS / "aqi_forecast_next_24h.parquet"
    if not path.exists():
        path = UI_OUTPUTS / "forecast_next_24h.parquet"
    return query_file_response(path, limit=limit, offset=offset)


@app.get("/api/air/anomalies")
def anomalies(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    path = MINING / "anomalies.parquet"
    if not path.exists():
        return {"data": []}
    return query_file_response(path, limit=limit, offset=offset)


@app.get("/api/air/clusters")
def clusters(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    candidates = [
        MINING / "station_cluster_results_enhanced.parquet",
        MINING / "station_cluster_results.parquet"
    ]
    path = next((p for p in candidates if p.exists()), None)
    if path is None:
        return {"data": []}
    return query_file_response(path, limit=limit, offset=offset)


@app.get("/api/air/baseline")
def baseline(
    city: str | None = Query(default=None, min_length=1, max_length=100),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    return city_parquet_response("is_this_normal.parquet", city, limit, offset)


@app.get("/api/air/explain")
def explain(
    city: str | None = Query(default=None, min_length=1, max_length=100),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    return city_parquet_response("why_is_my_air_bad.parquet", city, limit, offset)


@app.get("/api/air/better-area")
def better_area(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return parquet_response("find_better_area.parquet", limit=limit, offset=offset)


@app.get("/api/air/better-time")
def better_time(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("find_better_time.csv", limit=limit, offset=offset)


@app.get("/api/air/activity")
def activity(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("activity_profiles.csv", limit=limit, offset=offset)


@app.get("/api/features")
def features(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    path_candidates = [
        FEATURES / "selected_feature_dataset.parquet",
        FEATURES / "feature_dataset.parquet",
        FEATURES / "feature_dataset_enhanced.parquet"
    ]
    path = next((p for p in path_candidates if p.exists()), None)
    if path is None:
        raise HTTPException(status_code=404, detail="Feature dataset not found")

    connection = duckdb.connect(":memory:", config={"threads": "2", "memory_limit": "256MB"})
    try:
        count_df = connection.execute("SELECT count(*) FROM read_parquet(?)", [str(path)]).fetchdf()
        total_rows = int(count_df.iloc[0, 0]) if not count_df.empty else 0

        df = connection.execute("SELECT * FROM read_parquet(?) LIMIT ? OFFSET ?", [str(path), limit, offset]).fetchdf()
    finally:
        connection.close()

    return {
        "rows": total_rows,
        "returned_rows": len(df),
        "columns": df.columns.tolist(),
        "data": df.replace({float("nan"): None}).to_dict(orient="records")
    }


@app.get("/api/features/pca")
def pca(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    path = FEATURES / "pca_components.parquet"
    if not path.exists():
        path = FEATURES / "pca_2d_projection.parquet"
    if not path.exists():
        return {"data": []}
    return query_file_response(path, limit=limit, offset=offset)


@app.get("/api/models")
def models():
    result = {}
    regression_path = MODELS / "regression_metrics.csv"
    classification_path = MODELS / "classification_metrics.csv"
    required_classification_path = MODELS / "classification_required_metrics.csv"
    forecast_path = MODELS / "forecast_metrics.csv"
    aqi_forecast_path = MODELS / "aqi_forecast_metrics.csv"

    if regression_path.exists():
        result["regression"] = pd.read_csv(regression_path).to_dict(orient="records")
    if classification_path.exists():
        result["classification"] = pd.read_csv(classification_path).to_dict(orient="records")
    if required_classification_path.exists():
        result["classification_required"] = pd.read_csv(required_classification_path).to_dict(orient="records")
    if forecast_path.exists():
        result["forecast"] = pd.read_csv(forecast_path).to_dict(orient="records")
    if aqi_forecast_path.exists():
        result["aqi_forecast"] = pd.read_csv(aqi_forecast_path).to_dict(orient="records")

    return result


@app.get("/api/olap")
def olap(
    operation: str = Query(...),
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    operation = operation.strip().lower()
    files = {
        "rollup": ["olap_rollup_final.csv", "olap_rollup.csv"],
        "drilldown": ["olap_drilldown_final.csv", "olap_drilldown.csv"],
        "slice": ["olap_slice_final.csv", "olap_slice_pm25.csv"],
        "dice": ["olap_dice_final.csv", "olap_dice.csv"],
        "pivot": ["olap_pivot_final.csv", "olap_pivot.csv"],
        "cube": ["olap_cube_final.csv", "olap_cube.csv"],
        "grouping_sets": ["olap_grouping_sets_final.csv", "olap_grouping_sets.csv"]
    }

    if operation not in files:
        raise HTTPException(
            status_code=400,
            detail={"message": "Unknown OLAP operation", "allowed_operations": list(files.keys())}
        )

    selected_file = None
    for filename in files[operation]:
        candidate = UI_OUTPUTS / filename
        if candidate.exists():
            selected_file = candidate
            break

    if selected_file is None:
        raise HTTPException(
            status_code=404,
            detail={"message": "OLAP output file not found", "operation": operation, "checked_files": files[operation], "directory": str(UI_OUTPUTS)}
        )

    try:
        res = query_file_response(selected_file, limit=limit, offset=offset)
        connection = duckdb.connect(":memory:", config={"threads": "2", "memory_limit": "256MB"})
        try:
            count_df = connection.execute("SELECT count(*) FROM read_csv_auto(?)", [str(selected_file)]).fetchdf()
            total_rows = int(count_df.iloc[0, 0]) if not count_df.empty else len(res["data"])
            sample_df = connection.execute("SELECT * FROM read_csv_auto(?) LIMIT 1", [str(selected_file)]).fetchdf()
            columns = sample_df.columns.tolist()
        except Exception:
            total_rows = len(res["data"])
            columns = list(res["data"][0].keys()) if res["data"] else []
        finally:
            connection.close()

        return {
            "operation": operation,
            "source_file": selected_file.name,
            "rows": total_rows,
            "returned_rows": len(res["data"]),
            "columns": columns,
            "data": res["data"]
        }
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail={"message": "Failed to read OLAP artifact", "operation": operation, "file": str(selected_file), "error": str(exc)}
        )


@app.get("/api/dwm/concepts")
def dwm_concepts(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("dwm_concepts.csv", limit=limit, offset=offset)


@app.get("/api/ml/concepts")
def ml_concepts(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    return csv_response("ml_concepts.csv", limit=limit, offset=offset)


@app.get("/api/warehouse/tables")
def warehouse_tables():
    if warehouse is None:
        raise HTTPException(status_code=503, detail="Warehouse unavailable")

    df = warehouse.sql("""
        SELECT
            table_schema,
            table_name
        FROM information_schema.tables
        WHERE table_schema NOT IN (
            'information_schema',
            'pg_catalog'
        )
        ORDER BY
            table_schema,
            table_name
    """).df()

    return {
        "data": df.replace({float("nan"): None}).to_dict(orient="records")
    }


@app.get("/api/warehouse/table")
def warehouse_table(
    schema: str,
    table: str,
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0)
):
    if warehouse is None:
        raise HTTPException(status_code=503, detail="Warehouse unavailable")

    allowed = warehouse.sql("""
        SELECT
            table_schema,
            table_name
        FROM information_schema.tables
    """).df()

    valid = (
        (allowed["table_schema"] == schema)
        &
        (allowed["table_name"] == table)
    )

    if not valid.any():
        raise HTTPException(status_code=404, detail="Warehouse table not found")

    df = warehouse.sql(
        f'SELECT * FROM "{schema}"."{table}" LIMIT {limit} OFFSET {offset}'
    ).df()

    return {
        "schema": schema,
        "table": table,
        "columns": df.columns.tolist(),
        "data": df.replace({float("nan"): None}).to_dict(orient="records")
    }


@app.get("/api/warehouse/schema")
def warehouse_schema():
    if warehouse is None:
        raise HTTPException(status_code=503, detail="Warehouse unavailable")

    columns = warehouse.sql("""
        SELECT
            table_schema,
            table_name,
            column_name,
            data_type
        FROM information_schema.columns
        WHERE table_schema NOT IN (
            'information_schema',
            'pg_catalog'
        )
        ORDER BY
            table_schema,
            table_name,
            ordinal_position
    """).df()

    return {
        "data": columns.replace({float("nan"): None}).to_dict(orient="records")
    }


@app.get("/api/etl")
def etl(
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0)
):
    path = REPORTS / "etl_reconciliation_final.csv"
    if not path.exists():
        candidates = list(REPORTS.glob("*reconciliation*.csv"))
        if not candidates:
            return {"data": []}
        path = candidates[0]
    return query_file_response(path, limit=limit, offset=offset)


@app.get("/api/data-quality")
def data_quality(
    limit: int = Query(default=100, ge=1, le=500)
):
    files = list(QUALITY.glob("*.csv"))
    result = {}

    for path in files:
        try:
            df = pd.read_csv(path, nrows=limit)
            result[path.stem] = df.replace({float("nan"): None}).to_dict(orient="records")
        except Exception:
            continue

    return result


@app.get("/api/location/nearest-station")
def nearest_station(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180)
):
    path = UI_OUTPUTS / "pollution_map_data.csv"
    if not path.exists():
        raise HTTPException(status_code=404, detail="Pollution map data not found")

    df = pd.read_csv(path)
    df = df.dropna(subset=["latitude", "longitude"])
    if df.empty:
        raise HTTPException(status_code=404, detail="No geocoded stations available")

    latitude_radians = math.radians(latitude)
    longitude_radians = math.radians(longitude)

    def distance_km(row):
        station_latitude = math.radians(float(row["latitude"]))
        station_longitude = math.radians(float(row["longitude"]))
        latitude_delta = station_latitude - latitude_radians
        longitude_delta = station_longitude - longitude_radians
        haversine = (
            math.sin(latitude_delta / 2) ** 2
            + math.cos(latitude_radians)
            * math.cos(station_latitude)
            * math.sin(longitude_delta / 2) ** 2
        )
        return 6371.0088 * 2 * math.asin(math.sqrt(min(1.0, haversine)))

    df["distance_km"] = df.apply(distance_km, axis=1)

    row = df.loc[df["distance_km"].idxmin()]

    return {
        "station_id": row.get("station_id"),
        "station_name": row.get("station_name"),
        "city": row.get("city_name"),
        "state": row.get("state_name"),
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
        "aqi": row.get("aqi_estimate"),
        "category": row.get("aqi_category"),
        "dominant_pollutant": row.get("dominant_pollutant"),
        "distance_km": round(float(row["distance_km"]), 2)
    }
