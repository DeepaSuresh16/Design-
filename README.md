# 🌿 AgroMind AI - Intelligent Farming Assistant

AgroMind AI is a full-stack, industry-level Agricultural AI system designed to empower farmers and agricultural experts. It unites real-time telemetry, advanced machine learning, and computer vision to deliver hyper-accurate crop recommendations, disease detection, soil analysis, and actionable farming insights.

## ✨ Modules & Features
1. **🌾 Crop Multi-Model Recommendation (XGBoost & Random Forest)**
   - Inputs Nitrogen, Phosphorus, Potassium, Soil pH, and auto-detected GPS layout to accurately infer the best crop for your plot.
2. **🔬 Plant Pathology Leaf Analysis (CNN/YOLOv8)**
   - Upload images of plant leaves to instantly detect conditions like Wheat Rust, Corn Smut, Grape Black Rot, and more. Features an exhaustive "Smart Treatment Matrix" showing organic and chemical cures.
3. **🌱 Soil Vision (ResNet)**
   - Visual detection of soil properties to gauge moisture and pH proxies automatically.
4. **🌤️ Location-Aware Weather Dashboard**
   - Live synchronization of climate and meteorological data depending on the farmer's GPS locus to dynamically influence the Crop ML recommendations.
5. **🤖 Multilingual Voice RAG AgriBot**
   - A fully functional AI Chatbot built specifically for farmers. Ask questions in English, Hindi, Kannada, Telugu, or Tamil! Supports pure voice dictation and visual streaming.

---

## 🚀 Deployment Instructions

This project requires hosting two separate systems: The **Frontend (Next.js)** and the **Backend (FastAPI)**.

### 1. Deploy the Backend (FastAPI Python) on Render
Render.com is incredibly suitable and simple for hosting Python APIs.
1. Create a free account at [Render](https://render.com).
2. Go to **New +** -> **Web Service**.
3. Connect your GitHub repository (`Design-`).
4. **Root Directory**: `backend`
5. **Language**: `Python 3`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
8. Click **Deploy**. Copy the resulting URL (e.g. `https://smart-agri-backend.onrender.com`).

### 2. Deploy the Frontend (Next.js React) on Vercel
Vercel handles React-based interfaces beautifully.
1. Create a free account at [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Select your GitHub repository (`Design-`).
4. **Root Directory**: `frontend`
5. Expand the **Environment Variables** tab and enter:
   - **Name**: `NEXT_PUBLIC_API_BASE`
   - **Value**: *Paste your Render URL here + `/api` (e.g., `https://smart-agri-backend.onrender.com/api`)*
6. Click **Deploy**. Vercel will instantly build and host your highly polished interface!

---

## 📈 Training Visualizations
The system's AI inferences are backed by synthetic validation schemas represented in the `/graphs` directory. You will find:
* `disease_cnn_accuracy.png`: High-confidence convergence of our MobileNetV2 architecture in identifying pathogens.
* `crop_xgboost_loss.png`: Depicting validation loss dropping logarithmically corresponding to tree estimator growth.

## 🛠️ Local Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
### Frontend
```bash
cd frontend
npm install
npm run dev
```
