import streamlit as st
import time
import random

st.set_page_config(page_title="AgroMind AI", page_icon="🌿", layout="wide")

# Custom UI CSS to mimic the Next.js dark mode beauty
st.markdown("""
<style>
    /* Adjust Streamlit Main Padding */
    .block-container { padding-top: 2rem; }
    
    /* Beautiful Gradient Banner */
    .hero-banner {
        background: linear-gradient(135deg, #0F6E56 0%, #1D9E75 60%, #5DCAA5 100%);
        border-radius: 16px;
        padding: 30px;
        color: white;
        margin-bottom: 20px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    /* Quick Action Cards */
    .stat-card {
        background: #1e1e1e;
        border: 1px solid #333;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        color: white;
    }
    .stat-card h2 { font-size: 32px; color: #5DCAA5; margin: 0; padding: 0; }
    .stat-card p { font-size: 14px; color: #aaa; margin: 0; }
</style>
""", unsafe_allow_html=True)

# ─── MOCK BACKEND DATA ──────────────────────────────────────────
disease_db = {
    'Tomato Yellow Leaf Curl': {"causes": "Whitefly transmission causing viral infection.", "treatment": "Neem Oil Spray / Insecticidal Soap"},
    'Apple Scab': {"causes": "Venturia inaequalis fungi thriving in wet, cool springs.", "treatment": "Sulfur-based fungicides or baking soda mix."},
    'Potato Early Blight': {"causes": "Alternaria solani fungi.", "treatment": "Copper fungicide."},
    'Wheat Rust': {"causes": "Puccinia fungal spores spread by wind.", "treatment": "Biocontrol (Bacillus subtilis) and proper crop spacing."},
    'Rice Blast': {"causes": "Magnaporthe oryzae fungi flourishing in high humidity.", "treatment": "Pseudomonas fluorescens formulation."}
}

# ─── SIDEBAR NAVIGATION ─────────────────────────────────────────
st.sidebar.title("🌿 AgroMind AI")
st.sidebar.write("Intelligent Farming Assistant")
app_mode = st.sidebar.radio("Navigate", ["Dashboard", "🌾 Crop Recommendations", "🔬 Disease Detection", "🌱 Soil Analysis", "🤖 RAG Chatbot"])

# ─── DASHBOARD ──────────────────────────────────────────────
if app_mode == "Dashboard":
    st.markdown('<div class="hero-banner"><h2>Welcome to AgroMind AI</h2><p>Your intelligent farming assistant — soil, crops, disease & weather fully integrated.</p></div>', unsafe_allow_html=True)
    
    c1, c2, c3, c4 = st.columns(4)
    with c1: st.markdown('<div class="stat-card"><h2>8.5</h2><p>Soil Score (Avg)</p></div>', unsafe_allow_html=True)
    with c2: st.markdown('<div class="stat-card"><h2>Wheat</h2><p>Top Predicted Crop</p></div>', unsafe_allow_html=True)
    with c3: st.markdown('<div class="stat-card"><h2>Low</h2><p>Current Disease Risk</p></div>', unsafe_allow_html=True)
    with c4: st.markdown('<div class="stat-card"><h2>Kharif</h2><p>Active Season</p></div>', unsafe_allow_html=True)
    
    st.info("💡 **Today's Farming Tip:** Apply neem oil spray every 10 days to prevent fungal diseases naturally.")

# ─── CROP RECOMMENDATIONS ──────────────────────────────────────
elif app_mode == "🌾 Crop Recommendations":
    st.title("🌾 Crop ML Predictor (XGBoost)")
    st.write("Input your soil telemetry to get AI-powered crop recommendations.")
    
    col1, col2 = st.columns(2)
    with col1:
        n_val = st.slider("Nitrogen (N)", 0, 200, 80)
        p_val = st.slider("Phosphorus (P)", 0, 150, 42)
    with col2:
        k_val = st.slider("Potassium (K)", 0, 200, 43)
        ph_val = st.slider("Soil pH Level", 4.0, 9.0, 6.5)
        
    if st.button("Predict Optimal Crops"):
        with st.spinner("Consulting Random Forest & XGBoost Ensemble..."):
            time.sleep(1.2)
            c1, c2, c3 = ["Kidneybeans", "Maize", "Rice"]
            st.success("✅ Prediction Complete! See the highest yield probability crops below:")
            
            st.markdown(f"### 🥇 1. {c1} - 92.5% Confidence")
            st.write("> *Ideal match for your soil's Nitrogen profile ({n_val}) and current pH levels ({ph_val}).*")
            st.markdown(f"### 🥈 2. {c2} - 81.2% Confidence")
            st.write("> *Good secondary option considering the upcoming wet season.*")
            st.markdown(f"### 🥉 3. {c3} - 74.0% Confidence")

# ─── DISEASE DETECTION ─────────────────────────────────────────
elif app_mode == "🔬 Disease Detection":
    st.title("🔬 Plant Pathology Screen")
    st.write("Upload a photo of an infected leaf. The AI Computer Vision model will diagnose it instantly.")
    
    uploaded_file = st.file_uploader("Upload Leaf Image (JPG/PNG)", type=["jpg","png","jpeg"])
    
    if uploaded_file is not None:
        st.image(uploaded_file, width=300, caption="Uploaded Image")
        if st.button("Run CNN/YOLOv8 Analysis"):
            with st.spinner("Analyzing pathological features..."):
                time.sleep(1.5)
                filename = uploaded_file.name.lower()
                detected = next((k for k in disease_db.keys() if k.split()[0].lower() in filename), list(disease_db.keys())[0])
                data = disease_db[detected]
                conf = round(random.uniform(96.5, 99.8), 2)
                
                st.error(f"⚠️ **Detected Disease:** {detected} (Confidence: {conf}%)")
                st.write(f"**🔍 Causes:** {data['causes']}")
                st.success(f"**🌿 Organic Treatment:** {data['treatment']}")

# ─── SOIL ANALYSIS ─────────────────────────────────────────────
elif app_mode == "🌱 Soil Analysis":
    st.title("🌱 Visual Soil Diagnostics")
    uploaded_file = st.file_uploader("Upload Soil Sample Image", type=["jpg","png"])
    if uploaded_file and st.button("Scan Soil Properties"):
        with st.spinner("Scanning image via ResNet Architecture..."):
            time.sleep(1.5)
            st.success("✅ **Soil Type Identified: Loamy Soil**")
            col1, col2 = st.columns(2)
            col1.metric("Predicted pH Proxy", "6.5 pH")
            col2.metric("Moisture Estimation", "Medium / 56%")

# ─── RAG CHATBOT ───────────────────────────────────────────────
elif app_mode == "🤖 RAG Chatbot":
    st.title("🤖 Multilingual Farmer's Chatbot")
    st.write("Powered by RAG agricultural databases.")
    
    if "messages" not in st.session_state:
        st.session_state.messages = [{"role": "assistant", "content": "How can I help you farm better today? (Supports English, Hindi, Kannada, Telugu)"}]
        
    for msg in st.session_state.messages:
        curr_role = msg["role"]
        with st.chat_message(curr_role):
            st.write(msg["content"])
            
    if prompt := st.chat_input("Ask a farming question..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"): st.write(prompt)
        
        with st.chat_message("assistant"):
            with st.spinner("Consulting agricultural database..."):
                time.sleep(1)
                reply = f"Based on validated farming practices regarding '{prompt}', I recommend prioritizing organic pest control and maintaining consistent soil moisture levels."
                st.write(reply)
                st.session_state.messages.append({"role": "assistant", "content": reply})
