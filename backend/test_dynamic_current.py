import google.generativeai as genai
import json

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

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
    
    for m_name in ["models/gemini-3.5-flash-lite", "models/gemini-flash-lite-latest", "models/gemini-flash-latest"]:
        try:
            m = genai.GenerativeModel(m_name)
            res = m.generate_content(prompt)
            raw = res.text.strip().replace("```json", "").replace("```", "").strip()
            arr = json.loads(raw)
            if isinstance(arr, list) and len(arr) > 0:
                print(f"SUCCESS with {m_name}, got {len(arr)} cities!")
                print("SAMPLE:", arr[0])
                return arr
        except Exception as err:
            print(f"Error with {m_name}: {err}")
            continue
    return []

fetch_live_current_cities()
