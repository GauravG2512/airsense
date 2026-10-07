import google.generativeai as genai

import os

GEMINI_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY", "")
genai.configure(api_key=GEMINI_KEY)

try:
    models = genai.list_models()
    print("AVAILABLE MODELS:")
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print("ERROR listing models:", e)
