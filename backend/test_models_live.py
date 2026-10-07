import google.generativeai as genai
import json

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

for model_name in ["models/gemini-3.5-flash-lite", "models/gemini-flash-lite-latest"]:
    print(f"\n--- TESTING MODEL {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        prompt = (
            "What is the current real-time live air quality AQI in Mumbai, Delhi, Kalyan, Bengaluru right now? "
            "Perform a web lookup to get dynamic real-time values. "
            "Return JSON array: [{\"city_name\": \"Mumbai\", \"aqi_estimate\": 115.2, \"aqi_category\": \"Moderate\", \"dominant_pollutant\": \"PM2.5\"}]"
        )
        resp = model.generate_content(prompt)
        print("RESULT:", resp.text)
    except Exception as e:
        print("ERROR:", e)
