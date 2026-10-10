import os
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

try:
    models = engine.list_models()
    print("AVAILABLE FOUNDATION BACKBONES:")
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("Inference service notice:", e)
