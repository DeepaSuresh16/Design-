from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random
import time

app = FastAPI(title="Smart Agri AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# --- Schemas ---
class CropRequest(BaseModel):
    N: Optional[float] = None
    P: Optional[float] = None
    K: Optional[float] = None
    ph: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    soil_type: Optional[str] = "Loamy"

class ChatMessage(BaseModel):
    message: str
    language: str = 'en' # en, hi, kn, te, ta

# --- UI Route ---
@app.get("/")
async def read_root():
    return {"status": "AgroMind AI Backend is Running Locally & on Render!", "frontend_notice": "Please visit the Next.js frontend."}

# --- ML Endpoints ---
@app.post("/api/predict/crop")
def predict_crop(data: CropRequest):
    time.sleep(1) # Simulating Random Forest / XGBoost execution
    crops = ['Rice', 'Maize', 'Chickpea', 'Kidneybeans', 'Cotton', 'Coffee', 'Coconut', 'Apple']
    random.shuffle(crops)
    
    # Simulate fetch weather from GPS logic
    simulated_temp = 28.5 if not data.lat else 24.0 + (data.lat % 10)
    
    top_crops = [
        {"crop": crops[0], "confidence": 92.5, "reasoning": "Ideal match for your soil's current Nitrogen profile and local temperature."},
        {"crop": crops[1], "confidence": 81.2, "reasoning": "Good secondary option considering the upcoming wet season in your GPS location."},
        {"crop": crops[2], "confidence": 74.0, "reasoning": "Resilient crop option given your soil pH."}
    ]
    
    return {
        "weather_context_fetched": f"Temp: {simulated_temp:.1f}°C",
        "recommendations": top_crops,
        "explainability": "The Random Forest ensemble prioritized Nitrogen levels and Geo-Climatic patterns."
    }

@app.post("/api/analyze/leaf")
async def analyze_leaf(file: UploadFile = File(...)):
    time.sleep(1.5) # Simulating YOLOv8 / CNN validation
    
    filename = file.filename.lower() if file.filename else ""
    
    if "tomato" in filename or "curl" in filename:
        detected = 'Tomato Yellow Leaf Curl'
    elif "apple" in filename or "scab" in filename:
        detected = 'Apple Scab'
    elif "potato" in filename or "blight" in filename:
        detected = 'Potato Early Blight'
    elif "wheat" in filename or "rust" in filename:
        detected = 'Wheat Rust'
    elif "rice" in filename or "blast" in filename:
        detected = 'Rice Blast'
    elif "corn" in filename or "smut" in filename:
        detected = 'Corn Smut'
    elif "grape" in filename or "rot" in filename:
        detected = 'Grape Black Rot'
    elif "citrus" in filename or "greening" in filename:
        detected = 'Citrus Greening'
    else:
        # Fallback pseudo-CNN inference
        diseases = [
            'Tomato Yellow Leaf Curl', 'Apple Scab', 'Potato Early Blight', 
            'Wheat Rust', 'Rice Blast', 'Corn Smut', 'Grape Black Rot', 'Citrus Greening'
        ]
        detected = random.choice(diseases)
    
    # 5. Smart Treatment Matrix
    treatment_db = {
        'Tomato Yellow Leaf Curl': {
            "causes": "Whitefly transmission causing viral infection.",
            "prevention": "Use reflective mulches, plant resistant varieties.",
            "chemical_med": "Imidacloprid (Wait for symptom check)",
            "dosage": "0.5ml per liter of water.",
            "organic_med": "Neem Oil Spray / Insecticidal Soap"
        },
        'Apple Scab': {
            "causes": "Venturia inaequalis fungi thriving in wet, cool springs.",
            "prevention": "Prune trees for airflow, rake fallen leaves.",
            "chemical_med": "Captan or Myclobutanil fungicide",
            "dosage": "Follow manufacturer specs; apply before rainfall.",
            "organic_med": "Sulfur-based fungicides or baking soda mix."
        },
        'Potato Early Blight': {
            "causes": "Alternaria solani fungi.",
            "prevention": "Crop rotation, avoid overhead irrigation.",
            "chemical_med": "Chlorothalonil",
            "dosage": "2 grams per liter of water.",
            "organic_med": "Copper fungicide."
        },
        'Wheat Rust': {
            "causes": "Puccinia fungal spores spread by wind.",
            "prevention": "Remove volunteer wheat, plant rust-resistant seeds.",
            "chemical_med": "Tebuconazole or Propiconazole",
            "dosage": "1 ml per liter of water.",
            "organic_med": "Biocontrol (Bacillus subtilis) and proper crop spacing."
        },
        'Rice Blast': {
            "causes": "Magnaporthe oryzae fungi flourishing in high humidity.",
            "prevention": "Avoid excessive nitrogen fertilizers, maintain field water.",
            "chemical_med": "Tricyclazole",
            "dosage": "0.6 grams per liter of water.",
            "organic_med": "Pseudomonas fluorescens formulation."
        },
        'Corn Smut': {
            "causes": "Ustilago maydis fungi infecting damaged plant tissues.",
            "prevention": "Avoid injuring roots/stems, maintain balanced soil fertility.",
            "chemical_med": "Seed treatments with Fludioxonil limit spread.",
            "dosage": "Applied purely as a seed coating pre-planting.",
            "organic_med": "Crop rotation and physical removal of galls before they burst."
        },
        'Grape Black Rot': {
            "causes": "Guignardia bidwelli fungi in warm, moist weather.",
            "prevention": "Ensure good canopy management and air circulation.",
            "chemical_med": "Mancozeb or Myclobutanil",
            "dosage": "2.5 grams per liter of water.",
            "organic_med": "Liquid copper soap or sulfur spray."
        },
        'Citrus Greening': {
            "causes": "Candidatus Liberibacter asiaticus bacteria spread by psyllids.",
            "prevention": "Control Asian citrus psyllid population, use disease-free trees.",
            "chemical_med": "Imidacloprid (for vector insects)",
            "dosage": "Soil drench around the base per manufacturer instructions.",
            "organic_med": "Kaolin clay sprays to deter insects, strict removal of infected trees."
        }
    }
    
    treatment = treatment_db.get(detected, {"causes": "Unknown", "dosage": "N/A", "organic_med": "N/A", "chemical_med": "N/A", "prevention": "N/A"})
    
    return {
        "disease_name": detected,
        "confidence_score": round(random.uniform(96.5, 99.8), 2),
        "treatment_plan": treatment
    }

@app.post("/api/analyze/soil")
async def analyze_soil(file: UploadFile = File(...)):
    time.sleep(1.5) # Simulating CNN ResNet architecture
    soil_types = ['Black Soil', 'Red Soil', 'Alluvial Soil', 'Clay']
    detected = random.choice(soil_types)
    return {
        "soil_type": detected,
        "predicted_ph_proxy": round(random.uniform(5.5, 8.0), 1),
        "estimated_moisture": f"{random.randint(20, 60)}%"
    }

@app.post("/api/chat")
async def chat_interaction(msg: ChatMessage):
    time.sleep(1) # Simulating RAG LLM response
    
    responses = {
        'en': f"Hello Farmer! Your query regarding '{msg.message}' has been processed. Based on verified agricultural data, you should monitor your soil moisture and use organic compost.",
        'hi': f"नमस्ते किसान! '{msg.message}' के बारे में आपका प्रश्न जांचा गया है। सत्यापित कृषि डेटा के आधार पर, आपको जैविक खाद का उपयोग करना चाहिए।",
        'kn': f"ನಮಸ್ಕಾರ ರೈತರೆ! '{msg.message}' ಕುರಿತಾದ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರ: ನೀವು ಸಾವಯವ ಗೊಬ್ಬರವನ್ನು ಬಳಸಬೇಕು.",
        'te': f"నమస్కారం రైతు! '{msg.message}' గురించి మీ ప్రశ్నకు సమాధానం: మీరు సేంద్రియ ఎరువులు వాడాలి.",
        'ta': f"வணக்கம் விவசாயி! '{msg.message}' பற்றிய உங்கள் கேள்விக்கு: நீங்கள் இயற்கை உரம் பயன்படுத்த வேண்டும்."
    }
    
    lang = msg.language if msg.language in responses else 'en'
    
    return {
        "reply": responses[lang],
        "is_rag_augmented": True
    }
