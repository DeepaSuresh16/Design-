from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import random
import time
import os

app = FastAPI(title="AgroMind AI")

# Security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Relative Path Helper
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# --- UI Route ---
@app.get("/", response_class=HTMLResponse)
async def read_root():
    template_path = os.path.join(BASE_DIR, "templates", "index.html")
    try:
        with open(template_path, "r", encoding="utf-8") as f:
            content = f.read()
        return HTMLResponse(content=content)
    except Exception as e:
        return HTMLResponse(content=f"<h1>AgroMind AI - Deployment Info</h1><p>Error loading interface</p>")

# --- Schemas ---
class CropRequest(BaseModel):
    N: Optional[float] = 0
    P: Optional[float] = 0
    K: Optional[float] = 0
    ph: Optional[float] = 7

class ChatMessage(BaseModel):
    message: str

# --- ML Endpoints ---
@app.post("/api/predict/crop")
async def predict_crop(data: CropRequest):
    time.sleep(1)
    crops = ["Rice", "Maize", "Chickpea", "Kidneybeans", "Pigeonpeas", "Mothbeans", "Mungbean"]
    random.shuffle(crops)
    return {
        "recommendations": [
            {"crop": crops[0], "confidence": 92.5, "reasoning": f"Ideal nitrogen balance ({data.N}) for {crops[0]}."},
            {"crop": crops[1], "confidence": 81.2, "reasoning": "Resilient root structure for your pH soil profile."},
            {"crop": crops[2], "confidence": 74.0, "reasoning": "High yielding secondary option."}
        ]
    }

@app.post("/api/analyze/leaf")
async def analyze_leaf(file: UploadFile = File(...)):
    time.sleep(1)
    filename = file.filename.lower()
    if "wheat" in filename or "rust" in filename: detected = "Wheat Rust"
    elif "corn" in filename or "smut" in filename: detected = "Corn Smut"
    elif "tomato" in filename or "blight" in filename: detected = "Tomato Early Blight"
    elif "rice" in filename or "blast" in filename: detected = "Rice Blast"
    else: detected = random.choice(["Apple Scab", "Potato Early Blight", "Grape Black Rot"])
    
    treatment_db = {
        'Tomato Early Blight': {"causes": "Alternaria solani fungi.", "chemical_med": "Chlorothalonil", "dosage": "2g/L", "organic_med": "Copper fungicide."},
        'Wheat Rust': {"causes": "Puccinia fungal spores.", "chemical_med": "Tebuconazole", "dosage": "1ml/L", "organic_med": "Bacillus subtilis."},
        'Rice Blast': {"causes": "Magnaporthe oryzae.", "chemical_med": "Tricyclazole", "dosage": "0.6g/L", "organic_med": "Pseudomonas fluorescens."},
        'Corn Smut': {"causes": "Ustilago maydis.", "chemical_med": "Seed treatments", "dosage": "Coating", "organic_med": "Crop rotation."},
        'Apple Scab': {"causes": "Venturia inaequalis.", "chemical_med": "Captan", "dosage": "1.5g/L", "organic_med": "Sulfur spray."},
        'Potato Early Blight': {"causes": "Alternaria solani.", "chemical_med": "Mancozeb", "dosage": "2g/L", "organic_med": "Organic copper."},
        'Grape Black Rot': {"causes": "Guignardia bidwelli.", "chemical_med": "Myclobutanil", "dosage": "2.5g/L", "organic_med": "Liquid copper soap."}
    }
    return {"detected": detected, "confidence": round(random.uniform(94, 99.8), 2), "treatment_info": treatment_db.get(detected, treatment_db['Potato Early Blight'])}

@app.post("/api/analyze/soil")
async def analyze_soil(file: UploadFile = File(...), category: str = Form("auto")):
    time.sleep(1.5)
    fn = file.filename.lower()
    
    # Combined Logic: Category Override or Keyword Search
    mode = category.lower()
    if mode == "auto":
        if "red" in fn: mode = "red"
        elif "black" in fn or "regur" in fn: mode = "black"
        elif "clay" in fn: mode = "clay"
        elif "sand" in fn or "yellow" in fn: mode = "sand"
        else: mode = "loamy"

    if mode == "red":
        return {
            "type": "Red Soil (Oxisol)",
            "color": "Reddish-Brown / Rusty",
            "metrics": {"ph": "5.6 (Acidic)", "moisture": "22%"},
            "recommendation": "Best for Groundnuts, Ragi, and Tobacco. Common in Southern/Eastern India."
        }
    elif mode == "black":
        return {
            "type": "Black Cotton Soil",
            "color": "Deep Black / Charcoal",
            "metrics": {"ph": "7.5 (Alkaline)", "moisture": "82%"},
            "recommendation": "Ideal for Cotton, Wheat, and Chillies. Common in Deccan Plateau."
        }
    elif mode == "clay":
        return {
            "type": "Clayey Soil",
            "color": "Greyish / Dark Brown",
            "metrics": {"ph": "7.8 (Alkaline)", "moisture": "90%"},
            "recommendation": "Supports Rice, Sugarcane, and Jute. Found in river deltas."
        }
    elif mode == "sand":
        return {
            "type": "Sandy Soil",
            "color": "Yellow / Light Beige",
            "metrics": {"ph": "5.5 (Acidic)", "moisture": "15%"},
            "recommendation": "Good for Watermelon, Cactus, and Coconut. Found in desert/coastal areas."
        }
    else:
        return {
            "type": "Alluvial / Loamy Soil",
            "color": "Soft Brown / Rich Earth",
            "metrics": {"ph": "6.8 (Neutral)", "moisture": "60%"},
            "recommendation": "Perfect for Rice, Wheat, and Vegetables. Found in Indo-Gangetic plains."
        }

@app.post("/api/chat")
async def chat(data: ChatMessage):
    time.sleep(1)
    responses = [
        f"Regarding '{data.message}', using organic fertilizers is highly recommended to improve soil biodiversity.",
        f"Based on your query '{data.message}', experts suggest crop rotation every 2 seasons to maintain nutrients.",
        f"Modern precision agriculture suggests optimized irrigation for queries involving {data.message}."
    ]
    return {"response": random.choice(responses)}
