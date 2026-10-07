import google.generativeai as genai
import json
import re

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

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

def dynamic_predict(city: str, target_timestamp_str: str):
    models = ["models/gemini-3.5-flash-lite", "models/gemini-flash-lite-latest", "models/gemini-flash-latest"]
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
    
    for m_name in models:
        try:
            m = genai.GenerativeModel(m_name)
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
                "model_used": m_name
            }
        except Exception as err:
            print(f"Failed with model {m_name}: {err}")
            continue
    return None

print(dynamic_predict("Kalyan", "2026-10-28 02:57"))
print(dynamic_predict("Mumbai", "2026-10-08 14:00"))
