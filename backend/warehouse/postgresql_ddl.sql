
CREATE SCHEMA IF NOT EXISTS dw;
CREATE SCHEMA IF NOT EXISTS marts;
CREATE SCHEMA IF NOT EXISTS ml;
CREATE SCHEMA IF NOT EXISTS metadata;

CREATE TABLE IF NOT EXISTS dw.dim_time (
    time_key BIGINT PRIMARY KEY,
    date DATE,
    year INTEGER,
    quarter INTEGER,
    month INTEGER,
    week INTEGER,
    day INTEGER,
    day_of_week INTEGER,
    is_weekend BOOLEAN,
    season VARCHAR(32)
);

CREATE TABLE IF NOT EXISTS dw.dim_station (
    station_key BIGINT PRIMARY KEY,
    source_station_id VARCHAR(128),
    station_name VARCHAR(255),
    city_name VARCHAR(255),
    state_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    source VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS dw.dim_location (
    location_key BIGINT PRIMARY KEY,
    city_name VARCHAR(255),
    state_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS dw.dim_pollutant (
    pollutant_key BIGINT PRIMARY KEY,
    parameter_name VARCHAR(128),
    unit VARCHAR(64),
    parameter_code VARCHAR(128),
    pollutant_group VARCHAR(128)
);

CREATE TABLE IF NOT EXISTS dw.dim_source (
    source_key BIGINT PRIMARY KEY,
    source_name VARCHAR(255),
    source_description TEXT
);

CREATE TABLE IF NOT EXISTS dw.fact_air_daily (
    fact_daily_key BIGINT PRIMARY KEY,
    time_key BIGINT REFERENCES dw.dim_time(time_key),
    station_key BIGINT REFERENCES dw.dim_station(station_key),
    location_key BIGINT REFERENCES dw.dim_location(location_key),
    pollutant_key BIGINT REFERENCES dw.dim_pollutant(pollutant_key),
    source_key BIGINT REFERENCES dw.dim_source(source_key),
    mean_value DOUBLE PRECISION,
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    observation_count DOUBLE PRECISION
);

CREATE TABLE IF NOT EXISTS dw.dim_station_scd2 (
    station_version_key BIGINT PRIMARY KEY,
    source_station_id VARCHAR(128),
    station_name VARCHAR(255),
    city_name VARCHAR(255),
    state_name VARCHAR(255),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    source VARCHAR(255),
    valid_from DATE,
    valid_to DATE,
    is_current BOOLEAN,
    version_number INTEGER
);
