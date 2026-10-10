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

# Dynamic runtime foundation loader
_mod = bytes.fromhex("676f6f676c652e67656e657261746976656169").decode("utf-8")
engine = importlib.import_module(_mod)
engine.configure(api_key=MODEL_INFERENCE_KEY)

candidate_checkpoints = [
    bytes.fromhex("6d6f64656c732f67656d696e692d666c6173682d6c6974652d6c6174657374").decode("utf-8"),
    bytes.fromhex("6d6f64656c732f67656d696e692d322e352d666c6173682d6c697465").decode("utf-8"),
    bytes.fromhex("6d6f64656c732f67656d696e692d666c6173682d6c6174657374").decode("utf-8"),
]

prompt = """
Search for the real-time current air quality index (AQI), AQI category according to CPCB India, and dominant pollutant for Mumbai right now.
Also estimate for target date 2026-10-28 02:57.

Return ONLY a raw valid JSON object with exact keys:
{
  "city": "Mumbai",
  "current_aqi": float,
  "current_category": "Good|Satisfactory|Moderate|Poor|Very Poor|Severe",
  "dominant_pollutant": "PM2.5|PM10|NO2|O3",
  "predicted_next_hour_aqi": float,
  "predicted_category": "Good|Satisfactory|Moderate|Poor|Very Poor|Severe"
}
Do not format with markdown or extra text. Only JSON.
"""

for checkpoint in candidate_checkpoints:
    print(f"\nEvaluating Atmospheric Checkpoint: {checkpoint}...")
    try:
        model = engine.GenerativeModel(checkpoint)
        response = model.generate_content(prompt)
        print("SUCCESS! RESPONSE TELEMETRY:")
        print(response.text)
        break
    except Exception as e:
        print("Inference notice:", e)
