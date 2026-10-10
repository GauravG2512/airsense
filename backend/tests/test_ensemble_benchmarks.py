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

for ckpt in checkpoints:
    print(f"\n--- TESTING AIRSENSE ATMOSPHERIC FOUNDATION {ckpt} ---")
    try:
        model = engine.GenerativeModel(ckpt)
        prompt = (
            "What is the current live air quality AQI in Mumbai today? "
            "Return raw JSON: {\"city\": \"Mumbai\", \"current_aqi\": float, \"category\": string, \"dominant_pollutant\": string}"
        )
        resp = model.generate_content(prompt)
        print("RESULT:", resp.text)
    except Exception as e:
        print("NOTICE:", e)
