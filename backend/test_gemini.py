import google.generativeai as genai
import json

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

# Try model with search / live lookup
model = genai.GenerativeModel('models/gemini-flash-latest')

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

try:
    response = model.generate_content(prompt)
    print("RESPONSE TEXT:")
    print(response.text)
except Exception as e:
    print("ERROR:", e)
