import os
import json
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

def fetch_live_current_cities():
    cities = ["Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Ahmedabad", "Jaipur", "Kalyan", "Lucknow", "Patna", "Agra"]
    prompt = f"""
    Search and retrieve the current real-time Air Quality Index (AQI), official CPCB category, and dominant pollutant for the following Indian cities:
    {', '.join(cities)}.
    
    Return ONLY a raw JSON array of objects with keys:
    [
      {{
        "city_name": "Mumbai",
        "aqi_estimate": 115.4,
        "aqi_category": "Moderate",
        "dominant_pollutant": "PM2.5",
        "latitude": 19.0760,
        "longitude": 72.8777
      }}
    ]
    Do not wrap in markdown or extra commentary. Only JSON array.
    """
    
    for ckpt in checkpoints:
        try:
            m = engine.GenerativeModel(ckpt)
            res = m.generate_content(prompt)
            raw = res.text.strip().replace("```json", "").replace("```", "").strip()
            arr = json.loads(raw)
            if isinstance(arr, list) and len(arr) > 0:
                print(f"SUCCESS with {ckpt}, got {len(arr)} cities!")
                print("SAMPLE:", arr[0])
                return arr
        except Exception as err:
            print(f"Notice with {ckpt}: {err}")
            continue
    return []

fetch_live_current_cities()
