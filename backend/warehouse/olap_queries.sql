
SELECT
    t.year,
    st.state_name,
    c.city_name,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
LEFT JOIN dw.dim_state st ON s.state_id=st.state_id
GROUP BY ROLLUP(
    t.year,
    st.state_name,
    c.city_name
);

SELECT
    t.year,
    t.month,
    t.day,
    c.city_name,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
GROUP BY
    t.year,
    t.month,
    t.day,
    c.city_name;

SELECT
    t.year,
    c.city_name,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
WHERE c.city_name='Mumbai'
GROUP BY
    t.year,
    c.city_name;

SELECT
    t.year,
    c.city_name,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
WHERE c.city_name IN ('Mumbai','Pune')
  AND t.year BETWEEN 2024 AND 2026
GROUP BY
    t.year,
    c.city_name;

SELECT
    t.year,
    c.city_name,
    AVG(f.aqi) AS average_aqi
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
GROUP BY CUBE(
    t.year,
    c.city_name
);

SELECT
    t.year,
    st.state_name,
    c.city_name,
    AVG(f.aqi) AS average_aqi,
    GROUPING(t.year) AS year_total,
    GROUPING(st.state_name) AS state_total,
    GROUPING(c.city_name) AS city_total
FROM dw.fact_air_daily f
JOIN dw.dim_time t ON f.time_id=t.time_id
JOIN dw.dim_station s ON f.station_id=s.station_id
LEFT JOIN dw.dim_city c ON s.city_id=c.city_id
LEFT JOIN dw.dim_state st ON s.state_id=st.state_id
GROUP BY GROUPING SETS(
    (t.year,st.state_name,c.city_name),
    (t.year,st.state_name),
    (t.year,c.city_name),
    (st.state_name,c.city_name),
    ()
);
