import google.generativeai as genai
import json

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

for model_name in ["models/gemini-2.5-flash", "models/gemini-2.5-flash-lite", "models/gemini-flash-lite-latest"]:
    print(f"\n--- TESTING MODEL {model_name} ---")
    try:
        model = genai.GenerativeModel(model_name)
        prompt = (
            "What is the current live air quality AQI in Mumbai today? "
            "Return raw JSON: {\"city\": \"Mumbai\", \"current_aqi\": float, \"category\": string, \"dominant_pollutant\": string}"
        )
        resp = model.generate_content(prompt)
        print("RESULT:", resp.text)
    except Exception as e:
        print("ERROR:", e)
