
import joblib
import numpy as np
import pandas as pd
from pathlib import Path

# Fallback when __file__ is not defined (e.g. in notebooks)
try:
    MODEL_PATH = (
        Path(__file__).resolve().parent
        / "airsense_aqi_next_hour_model.joblib"
    )
except NameError:
    MODEL_PATH = Path("/content/drive/MyDrive/AirSense/models/airsense_aqi_next_hour_model.joblib")

def load_bundle(path=MODEL_PATH):
    return joblib.load(path)

def aqi_category(value):
    if value <= 50:
        return "Good"
    if value <= 100:
        return "Satisfactory"
    if value <= 200:
        return "Moderate"
    if value <= 300:
        return "Poor"
    if value <= 400:
        return "Very Poor"
    return "Severe"

def build_prediction_row(
    history,
    city,
    target_timestamp,
    bundle
):
    required = [
        "city_name",
        "period_start",
        "PM10",
        "PM2_5",
        "NO2",
        "SO2",
        "CO",
        "O3",
        "NH3",
        "Pb",
        "aqi_estimate",
        "latitude",
        "longitude"
    ]

    missing = [
        col for col in required
        if col not in history.columns
    ]

    if missing:
        raise ValueError(
            "Missing history columns: "
            + str(missing)
        )

    target_timestamp = pd.Timestamp(
        target_timestamp
    )

    frame = history.copy()

    frame["period_start"] = (
        pd.to_datetime(
            frame["period_start"]
        )
    )

    frame = frame[
        frame["city_name"] == city
    ]

    frame = frame[
        frame["period_start"]
        < target_timestamp
    ]

    frame = (
        frame
        .sort_values(
            "period_start"
        )
        .drop_duplicates(
            "period_start"
        )
        .set_index(
            "period_start"
        )
        .asfreq("h")
    )

    for col in [
        "PM10",
        "PM2_5",
        "NO2",
        "SO2",
        "CO",
        "O3",
        "NH3",
        "Pb",
        "aqi_estimate",
        "latitude",
        "longitude"
    ]:
        frame[col] = pd.to_numeric(
            frame[col],
            errors="coerce"
        )

    frame["latitude"] = (
        frame["latitude"]
        .ffill()
        .bfill()
    )

    frame["longitude"] = (
        frame["longitude"]
        .ffill()
        .bfill()
    )

    if len(frame) < 72:
        raise ValueError(
            "At least 72 hours of history are required."
        ) 

    row = {}

    row["PM10"] = frame[
        "PM10"
    ].iloc[-1]

    row["PM2_5"] = frame[
        "PM2_5"
    ].iloc[-1]

    row["NO2"] = frame[
        "NO2"
    ].iloc[-1]

    row["SO2"] = frame[
        "SO2"
    ].iloc[-1]

    row["CO"] = frame[
        "CO"
    ].iloc[-1]

    row["O3"] = frame[
        "O3"
    ].iloc[-1]

    row["NH3"] = frame[
        "NH3"
    ].iloc[-1]

    row["Pb"] = frame[
        "Pb"
    ].iloc[-1]

    row["aqi_estimate"] = (
        frame[
            "aqi_estimate"
        ].iloc[-1]
    )

    row["latitude"] = (
        frame[
            "latitude"
        ].iloc[-1]
    )

    row["longitude"] = (
        frame[
            "longitude"
        ].iloc[-1]
    )

    row["city_code"] = bundle[
        "city_code_map"
    ][city]

    for source, prefix in [
        ("PM10", "pm10"),
        ("PM2_5", "pm25"),
        ("NO2", "no2")
    ]:

        for lag in [
            1,
            3,
            6,
            12,
            24,
            48
        ]:

            row[
                f"{prefix}_lag_{lag}"
            ] = (
                frame[source]
                .shift(lag)
                .iloc[-1]
            )

        for window in [
            3,
            6,
            12,
            24,
            48
        ]:

            row[
                f"{prefix}_roll_mean_{window}"
            ] = (
                frame[source]
                .rolling(window)
                .mean()
                .iloc[-1]
            )

    for lag in [
        1,
        3,
        6,
        12,
        24,
        48,
        72
    ]:

        row[
            f"aqi_lag_{lag}"
        ] = (
            frame[
                "aqi_estimate"
            ]
            .shift(lag)
            .iloc[-1]
        )

    for window in [
        3,
        6,
        12,
        24,
        48
    ]:

         row[
            f"aqi_roll_mean_{window}"
        ] = (
            frame[
                "aqi_estimate"
            ]
            .rolling(window)
            .mean()
            .iloc[-1]
        )

         row[
            f"aqi_roll_std_{window}"
        ] = (
            frame[
                "aqi_estimate"
            ]
            .rolling(window)
            .std()
            .iloc[-1]
        )

    row["year"] = target_timestamp.year
    row["month"] = target_timestamp.month
    row["day"] = target_timestamp.day
    row["day_of_year"] = (
        target_timestamp.dayofyear
    )
    row["day_of_week"] = (
        target_timestamp.dayofweek
    )
    row["hour"] = (
        target_timestamp.hour
    )

    row["is_weekend"] = int(
        target_timestamp.dayofweek >= 5
    )

    row["hour_sin"] = np.sin(
        2 * np.pi
        * target_timestamp.hour
        / 24
    )

    row["hour_cos"] = np.cos(
        2 * np.pi
        * target_timestamp.hour
        / 24
    )

    row["month_sin"] = np.sin(
        2 * np.pi
        * target_timestamp.month
        / 12
    )

    row["month_cos"] = np.cos(
        2 * np.pi
        * target_timestamp.month
        / 12
    )

    row["dow_sin"] = np.sin(
        2 * np.pi
        * target_timestamp.dayofweek
        / 7
    )

    row["dow_cos"] = np.cos(
        2 * np.pi
        * target_timestamp.dayofweek
        / 7
    )

    result = pd.DataFrame(
        [row]
    )

    for feature in bundle[
        "features"
    ]:

        if feature not in result.columns:
            result[feature] = np.nan

    return result[
        bundle["features"]
    ]

def predict_next_hour(
    history,
    city,
    target_timestamp,
    bundle=None
):
    if bundle is None:
        bundle = load_bundle()

    if city not in bundle[
        "city_code_map"
    ]:
        raise ValueError(
            f"City not found: {city}"
        )

    X = build_prediction_row(
        history,
        city,
        target_timestamp,
        bundle
    )

    prediction = float(
        bundle[
            "model"
        ].predict(X)[0]
    )

    prediction = max(
        0.0,
        prediction
    )

    return {
        "city": city,
        "target_timestamp": str(
            pd.Timestamp(
                target_timestamp
            )
        ),
        "predicted_aqi": prediction,
        "predicted_category":
            aqi_category(
                prediction
            )
    }
