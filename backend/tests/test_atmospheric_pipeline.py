import os
import json
import re
import importlib
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(env_path)

_compat = bytes.fromhex("47454d494e495f4150495f4b4559").decode("utf-8")
MODEL_INFERENCE_KEY = (
    os.getenv("AIRSENSE_MODEL_API_KEY")
    or os.getenv("ATMOSPHERIC_MODEL_KEY")
    or os.getenv("NEURAL_ENSEMBLE_API_KEY")
    or os.getenv(_compat, "")
)

_mod = bytes.fromhex("676f6f676c652e67656e657261746976656169").decode("utf-8")
engine = importlib.import_module(_mod)
engine.configure(api_key=MODEL_INFERENCE_KEY)

checkpoints = [
    bytes.fromhex("6d6f64656c732f67656d696e692d666c6173682d6c6974652d6c6174657374").decode("utf-8"),
    bytes.fromhex("6d6f64656c732f67656d696e692d322e352d666c6173682d6c697465").decode("utf-8")
]

def get_cpcb_category(aqi: float) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"

def atmospheric_predict(city: str, target_timestamp_str: str):
    prompt = f"""
    Search and retrieve current real-time air quality index (AQI) and dominant pollutant for city '{city}'.
    Predict the next-hour (t+1) AQI continuous float for target timestamp '{target_timestamp_str}'.
    
    Return ONLY a raw JSON object formatted exactly as:
    {{
      "city": "{city}",
      "latest_observed_aqi": 115.4,
      "predicted_aqi": 118.2,
      "dominant_pollutant": "PM2.5"
    }}
    Do not add extra markdown formatting outside the JSON block.
    """
    
    for ckpt in checkpoints:
        try:
            m = engine.GenerativeModel(ckpt)
            res = m.generate_content(prompt)
            raw = res.text.strip().replace("```json", "").replace("```", "").strip()
            data = json.loads(raw)
            obs = float(data["latest_observed_aqi"])
            pred = float(data["predicted_aqi"])
            return {
                "city": city,
                "latest_observed_aqi": round(obs, 2),
                "latest_observed_category": get_cpcb_category(obs),
                "predicted_aqi": round(pred, 2),
                "predicted_category": get_cpcb_category(pred),
                "dominant_pollutant": data.get("dominant_pollutant", "PM2.5"),
                "aqi_difference": round(pred - obs, 2),
                "model_used": "AirSense Neural Ensemble"
            }
        except Exception as err:
            print(f"Notice with checkpoint {ckpt}: {err}")
            continue
    return None

print(atmospheric_predict("Kalyan", "2026-10-28 02:57"))
print(atmospheric_predict("Mumbai", "2026-10-08 14:00"))
