
CREATE SCHEMA IF NOT EXISTS dw;
CREATE SCHEMA IF NOT EXISTS marts;
CREATE SCHEMA IF NOT EXISTS ml;
CREATE SCHEMA IF NOT EXISTS metadata;

CREATE TABLE IF NOT EXISTS dw.dim_time (
    time_id BIGINT PRIMARY KEY,
    timestamp TIMESTAMP,
    date DATE NOT NULL,
    hour INTEGER,
    day INTEGER,
    weekday INTEGER,
    week INTEGER,
    month INTEGER,
    quarter INTEGER,
    year INTEGER,
    season VARCHAR(32),
    is_weekend BOOLEAN,
    time_of_day VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS dw.dim_state (
    state_id BIGINT PRIMARY KEY,
    state_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_city (
    city_id BIGINT PRIMARY KEY,
    state_id BIGINT REFERENCES dw.dim_state(state_id),
    city_name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS dw.dim_station (
    station_id BIGINT PRIMARY KEY,
    source_station_id VARCHAR(128) UNIQUE NOT NULL,
    station_name VARCHAR(255),
    city_id BIGINT REFERENCES dw.dim_city(city_id),
    state_id BIGINT REFERENCES dw.dim_state(state_id),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    station_type VARCHAR(128),
    source VARCHAR(255),
    status VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS dw.dim_location (
    location_id BIGINT PRIMARY KEY,
    city_id BIGINT REFERENCES dw.dim_city(city_id),
    city_name VARCHAR(255),
    state_name VARCHAR(255),
    region VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS dw.dim_pollutant (
    pollutant_id BIGINT PRIMARY KEY,
    pollutant_name VARCHAR(128) UNIQUE NOT NULL,
    unit VARCHAR(64),
    pollutant_group VARCHAR(128),
    aqi_supported BOOLEAN
);

CREATE TABLE IF NOT EXISTS dw.dim_source (
    source_id BIGINT PRIMARY KEY,
    source_name VARCHAR(255),
    network VARCHAR(255),
    country VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS dw.fact_air_daily (
    fact_daily_id BIGINT PRIMARY KEY,
    time_id BIGINT NOT NULL REFERENCES dw.dim_time(time_id),
    station_id BIGINT NOT NULL REFERENCES dw.dim_station(station_id),
    location_id BIGINT REFERENCES dw.dim_location(location_id),
    source_id BIGINT NOT NULL REFERENCES dw.dim_source(source_id),
    pollution_date DATE NOT NULL,
    avg_pm25 DOUBLE PRECISION,
    max_pm25 DOUBLE PRECISION,
    avg_pm10 DOUBLE PRECISION,
    max_pm10 DOUBLE PRECISION,
    avg_no2 DOUBLE PRECISION,
    avg_so2 DOUBLE PRECISION,
    avg_co DOUBLE PRECISION,
    avg_o3 DOUBLE PRECISION,
    avg_nh3 DOUBLE PRECISION,
    aqi DOUBLE PRECISION,
    aqi_category VARCHAR(32),
    dominant_pollutant VARCHAR(128),
    anomaly_score DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS dw.fact_air_measurement (
    measurement_id BIGINT,
    time_id BIGINT REFERENCES dw.dim_time(time_id),
    station_id BIGINT REFERENCES dw.dim_station(station_id),
    location_id BIGINT REFERENCES dw.dim_location(location_id),
    pollutant_id BIGINT REFERENCES dw.dim_pollutant(pollutant_id),
    source_id BIGINT REFERENCES dw.dim_source(source_id),
    period_start TIMESTAMP,
    measurement_value DOUBLE PRECISION,
    quality_flag INTEGER
) PARTITION BY RANGE (period_start);

CREATE TABLE IF NOT EXISTS dw.dim_station_scd2 (
    station_version_id BIGINT PRIMARY KEY,
    source_station_id VARCHAR(128),
    station_name VARCHAR(255),
    city_name VARCHAR(255),
    state_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    valid_from DATE NOT NULL,
    valid_to DATE,
    is_current BOOLEAN NOT NULL,
    version_number INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_fact_air_daily_time
ON dw.fact_air_daily(time_id);

CREATE INDEX IF NOT EXISTS idx_fact_air_daily_station
ON dw.fact_air_daily(station_id);

CREATE INDEX IF NOT EXISTS idx_fact_air_daily_date
ON dw.fact_air_daily(pollution_date);

CREATE INDEX IF NOT EXISTS idx_fact_air_measurement_time
ON dw.fact_air_measurement(period_start);

CREATE INDEX IF NOT EXISTS idx_fact_air_measurement_station
ON dw.fact_air_measurement(station_id);

CREATE INDEX IF NOT EXISTS idx_fact_air_measurement_pollutant
ON dw.fact_air_measurement(pollutant_id);

CREATE MATERIALIZED VIEW IF NOT EXISTS marts.mv_city_monthly_pollution AS
SELECT
    t.year,
    t.month,
    s.city_name,
    AVG(f.avg_pm25) AS average_pm25,
    AVG(f.avg_pm10) AS average_pm10,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t
    ON f.time_id=t.time_id
JOIN dw.dim_station s
    ON f.station_id=s.station_id
GROUP BY
    t.year,
    t.month,
    s.city_name;
