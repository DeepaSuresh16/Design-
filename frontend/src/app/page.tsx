"use client";

import { useState, useRef, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

// ─── Constants ────────────────────────────────────────────────────────────────
const LANGS = {
  en: { name: "English", flag: "🇬🇧" },
  hi: { name: "हिंदी", flag: "🇮🇳" },
  kn: { name: "ಕನ್ನಡ", flag: "🇮🇳" },
  te: { name: "తెలుగు", flag: "🇮🇳" },
  ta: { name: "தமிழ்", flag: "🇮🇳" },
};

const MODULES = [
  { id: "dashboard", icon: "📊", label: "Dashboard" },
  { id: "soil", icon: "🌱", label: "Soil" },
  { id: "crop", icon: "🌾", label: "Crops" },
  { id: "disease", icon: "🍃", label: "Disease" },
  { id: "weather", icon: "🌤️", label: "Weather" },
  { id: "chat", icon: "🤖", label: "Chatbot" },
];

function parseJSON(raw) {
  try {
    return JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch { return null; }
}

// ─── Shared UI Components ─────────────────────────────────────────────────────
function Card({ children, style = {}, color = "" }) {
  return (
    <div style={{
      background: color ? `var(--color-background-${color})` : "var(--color-background-primary)",
      border: color ? `0.5px solid var(--color-border-${color})` : "0.5px solid var(--color-border-tertiary)",
      color: color ? `var(--color-text-${color})` : "var(--color-text-primary)",
      borderRadius: 12, padding: "1rem 1.25rem", ...style
    }}>{children}</div>
  );
}

function StatCard({ label, value, icon, color = "secondary" }) {
  return (
    <div style={{ background: `var(--color-background-${color})`, color: `var(--color-text-${color})`, borderRadius: 10, padding: "12px 14px", textAlign: "center" }}>
      <div style={{ fontSize: 22, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 500, fontSize: 18 }}>{value}</div>
      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>{label}</div>
    </div>
  );
}

function Loader({ icon, text }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>{text}</p>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 12 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-text-success)", animation: `agrobounce 1s ${i*0.2}s infinite` }}/>
        ))}
      </div>
    </div>
  );
}

function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ marginTop: 14, width: "100%", padding: "9px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
      ← Start Over
    </button>
  );
}

function PrimaryBtn({ onClick, disabled, children, color = "#1D9E75" }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", padding: "11px", background: disabled ? "var(--color-border-tertiary)" : color, color: "#fff", border: "none", borderRadius: 8, cursor: disabled ? "default" : "pointer", fontWeight: 500, fontSize: 14 }}>
      {children}
    </button>
  );
}

// ─── Image Upload Component ───────────────────────────────────────────────────
function ImageUpload({ onImage, label = "Upload Image", accept = "image/*", preview = true }) {
  const [img, setImg] = useState(null);
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  const handle = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImg(e.target.result);
      onImage && onImage(e.target.result, file);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <div
        onClick={() => ref.current.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragging ? "var(--color-border-success)" : "var(--color-border-secondary)"}`,
          borderRadius: 10, padding: img ? "8px" : "24px 16px",
          textAlign: "center", cursor: "pointer",
          background: dragging ? "var(--color-background-success)" : "var(--color-background-secondary)",
          transition: "all 0.2s"
        }}
      >
        {img && preview ? (
          <img src={img} alt="preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 8 }} />
        ) : (
          <>
            <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 4 }}>Drag & drop or click to browse</div>
          </>
        )}
      </div>
      <input ref={ref} type="file" accept={accept} onChange={e => handle(e.target.files[0])} style={{ display: "none" }} />
      {img && (
        <button onClick={() => { setImg(null); onImage && onImage(null, null); }} style={{ marginTop: 6, fontSize: 11, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer" }}>
          ✕ Remove image
        </button>
      )}
    </div>
  );
}

// ─── GPS Location Hook ────────────────────────────────────────────────────────
function useGPS() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const detect = useCallback(() => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude.toFixed(4), lon: pos.coords.longitude.toFixed(4) });
        setLoading(false);
      },
      err => { setError("Location access denied. Please allow location."); setLoading(false); },
      { timeout: 8000 }
    );
  }, []);

  return { location, loading, error, detect };
}

// ─── Voice Input Hook ─────────────────────────────────────────────────────────
function useVoice(onResult) {
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window));
  const recRef = useRef(null);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = true;
    rec.interimResults = true;
    
    rec.onresult = e => { 
      let transcript = '';
      for (let i = 0; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }
      onResult(transcript);
    };
    
    rec.onerror = (e) => { 
      setListening(false);
      if (e.error === "not-allowed") {
        alert("Microphone access denied! Either you blocked it, or you are testing on a mobile device without HTTPS running (Chrome blocks microphones on HTTP connections over a network). Try localhost or use an ngrok HTTPS tunnel.");
      }
    };
    
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }, [listening, supported, onResult]);

  return { listening, supported, toggle };
}

// ─── Voice Output ─────────────────────────────────────────────────────────────
function speak(text, lang = "en-IN") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
  utt.lang = lang;
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ setActive, dashData }) {
  const tips = [
    "Apply neem oil spray every 10 days to prevent fungal diseases",
    "Test soil pH before the next sowing season — optimal is 6.0–7.5",
    "Intercrop legumes with cereals to fix nitrogen naturally",
    "Use drip irrigation to reduce water usage by up to 60%",
    "Keep field borders clear to reduce pest harboring zones",
  ];
  const [tip, setTip] = useState("");
  useEffect(() => { setTip(tips[Math.floor(Math.random() * tips.length)]); }, []);

  const quickActions = [
    { icon: "🌱", label: "Analyze Soil", mod: "soil", color: "success" },
    { icon: "🌾", label: "Get Crop Tips", mod: "crop", color: "warning" },
    { icon: "🍃", label: "Check Disease", mod: "disease", color: "danger" },
    { icon: "🌤️", label: "Check Weather", mod: "weather", color: "info" },
  ];

  return (
    <div>
      {/* Welcome Banner */}
      <div style={{ background: "linear-gradient(135deg, #0F6E56 0%, #1D9E75 60%, #5DCAA5 100%)", borderRadius: 14, padding: "20px", marginBottom: 16, color: "#fff", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: -20, top: -20, fontSize: 80, opacity: 0.15 }}>🌾</div>
        <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Welcome to</div>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>AgroMind AI</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>Your intelligent farming assistant — soil, crops, disease & weather.</div>
        {dashData?.weather && (
          <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>📍 {dashData.weather.city}</span>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>🌡️ {dashData.weather.temp}°C</span>
            <span style={{ background: "rgba(255,255,255,0.2)", borderRadius: 20, padding: "4px 12px", fontSize: 12 }}>💧 {dashData.weather.humidity}% humidity</span>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
        <StatCard icon="🌱" label="Soil Score" value={dashData?.soilScore || "--"} color="success" />
        <StatCard icon="🌾" label="Top Crop" value={dashData?.topCrop || "--"} color="warning" />
        <StatCard icon="🍃" label="Disease Risk" value={dashData?.diseaseRisk || "--"} color={dashData?.diseaseRisk === "Low" ? "success" : "danger"} />
        <StatCard icon="🌤️" label="Season" value={dashData?.season || "Kharif"} color="info" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Quick Actions</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {quickActions.map(a => (
            <button key={a.mod} onClick={() => setActive(a.mod)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", background: `var(--color-background-${a.color})`, border: `0.5px solid var(--color-border-${a.color})`, borderRadius: 10, cursor: "pointer", textAlign: "left" }}>
              <span style={{ fontSize: 22 }}>{a.icon}</span>
              <span style={{ fontWeight: 500, fontSize: 13, color: `var(--color-text-${a.color})` }}>{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Tip */}
      <Card color="info">
        <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-info)", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>💡 Today's Farming Tip</div>
        <div style={{ fontSize: 13 }}>{tip}</div>
      </Card>

      {/* Activity Feed */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Recent Activity</div>
        {dashData?.activities?.length ? dashData.activities.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10 }}>
            <div style={{ fontSize: 16, marginTop: 1 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{a.detail}</div>
            </div>
          </div>
        )) : (
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", fontStyle: "italic" }}>
            No recent activity. Start by analyzing your soil or checking the weather! 🌱
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WEATHER MODULE ───────────────────────────────────────────────────────────
function WeatherModule({ onWeatherData }) {
  const { location, loading: gpsLoading, error: gpsError, detect } = useGPS();
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualCity, setManualCity] = useState("");
  const [forecast, setForecast] = useState(null);

  const fetchWeatherByCoords = async (lat, lon) => {
    setLoading(true);
    // Mocked for backend as it doesn't have weather endpoints
    setTimeout(() => {
      const data = {
        city: "Current Location", state: "India", temp: 28, feelsLike: 31, humidity: 65, windSpeed: 10, rainfall: 45,
        condition: "Sunny", uvIndex: 8, soilMoistureIndex: "Medium", farmingAdvice: "Good day for pesticide spray.",
        weekForecast: [{day: "Mon", temp: 28, condition: "Sunny", rain: 0}, {day: "Tue", temp: 29, condition: "Cloudy", rain: 0}], cropAlert: ""
      };
      setWeather(data); setForecast(data.weekForecast); onWeatherData && onWeatherData(data);
      setLoading(false);
    }, 1000);
  };

  const fetchByCity = async () => {
    if (!manualCity.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const data = {
        city: manualCity, state: "India", temp: 25, feelsLike: 27, humidity: 55, windSpeed: 12, rainfall: 10,
        condition: "Partly Cloudy", uvIndex: 5, soilMoistureIndex: "Medium", farmingAdvice: "Soil is moist, avoid heavy watering.",
        weekForecast: [{day: "Mon", temp: 25, condition: "Partly Cloudy", rain: 10}, {day: "Tue", temp: 26, condition: "Sunny", rain: 0}], cropAlert: ""
      };
      setWeather(data); setForecast(data.weekForecast); onWeatherData && onWeatherData(data);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (location) fetchWeatherByCoords(location.lat, location.lon);
  }, [location]);

  const conditionEmoji = { Sunny: "☀️", Cloudy: "☁️", "Partly Cloudy": "⛅", "Rainy": "🌧️", "Thunderstorm": "⛈️" };

  return (
    <div>
      {!weather && !loading && (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
            Get real-time weather data and farming advice for your location.
          </p>

          <Card style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>📍 Auto-detect with GPS</div>
            {location && (
              <div style={{ fontSize: 12, color: "var(--color-text-success)", marginBottom: 8 }}>
                ✓ Location: {location.lat}°N, {location.lon}°E
              </div>
            )}
            {gpsError && <div style={{ fontSize: 12, color: "var(--color-text-danger)", marginBottom: 8 }}>{gpsError}</div>}
            <PrimaryBtn onClick={detect} disabled={gpsLoading} color="#185FA5">
              {gpsLoading ? "Detecting location…" : "📡 Detect My Location"}
            </PrimaryBtn>
          </Card>

          <div style={{ textAlign: "center", fontSize: 12, color: "var(--color-text-secondary)", margin: "8px 0" }}>— or enter manually —</div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={manualCity}
              onChange={e => setManualCity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && fetchByCity()}
              placeholder="Enter city (e.g. Bangalore, Pune, Hyderabad)"
              style={{ flex: 1, borderRadius: 8, fontSize: 13, padding: "9px 12px", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
            />
            <button onClick={fetchByCity} disabled={!manualCity.trim()} style={{ padding: "0 16px", background: manualCity.trim() ? "#185FA5" : "var(--color-border-tertiary)", color: "#fff", border: "none", borderRadius: 8, cursor: manualCity.trim() ? "pointer" : "default", fontSize: 13 }}>
              Search
            </button>
          </div>
        </>
      )}

      {loading && <Loader icon="🌤️" text="Fetching weather data for your location…" />}

      {weather && !loading && (
        <div>
          <div style={{ background: "linear-gradient(135deg, #185FA5 0%, #378ADD 100%)", borderRadius: 14, padding: "20px", marginBottom: 14, color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", right: 10, top: 10, fontSize: 60, opacity: 0.2 }}>
              {conditionEmoji[weather.condition] || "🌤️"}
            </div>
            <div style={{ fontSize: 11, opacity: 0.8, marginBottom: 2 }}>📍 {weather.city}, {weather.state}</div>
            <div style={{ fontSize: 48, fontWeight: 300, lineHeight: 1 }}>{weather.temp}°</div>
            <div style={{ fontSize: 14, opacity: 0.9, marginBottom: 12 }}>{weather.condition} · Feels like {weather.feelsLike}°C</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {[["💧", "Humidity", weather.humidity + "%"], ["💨", "Wind", weather.windSpeed + " km/h"], ["🌧️", "Rain", weather.rainfall + " mm"], ["☀️", "UV", weather.uvIndex + "/11"]].map(([ic, lb, vl]) => (
                <div key={lb} style={{ background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "8px", textAlign: "center" }}>
                  <div style={{ fontSize: 16 }}>{ic}</div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{vl}</div>
                  <div style={{ fontSize: 10, opacity: 0.8 }}>{lb}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            <Card color={weather.soilMoistureIndex === "High" ? "info" : weather.soilMoistureIndex === "Low" ? "warning" : "success"}>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Soil Moisture Index</div>
              <div style={{ fontWeight: 500, fontSize: 16 }}>💧 {weather.soilMoistureIndex}</div>
            </Card>
            <Card color="warning">
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>GPS Coordinates</div>
              <div style={{ fontWeight: 500, fontSize: 13 }}>📍 AI-based</div>
            </Card>
          </div>

          {forecast && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>5-Day Forecast</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
                {forecast.map((d, i) => (
                  <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 10, padding: "10px 12px", textAlign: "center", minWidth: 70, flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>{d.day}</div>
                    <div style={{ fontSize: 16, marginBottom: 4 }}>{d.condition?.split(" ")[0] || "🌤️"}</div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{d.temp}°</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-info)" }}>💧{d.rain}mm</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Card color="success" style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-success)", marginBottom: 4 }}>🌱 Farming Advice</div>
            <div style={{ fontSize: 13 }}>{weather.farmingAdvice}</div>
          </Card>

          <BackBtn onClick={() => setWeather(null)} />
        </div>
      )}
    </div>
  );
}

// ─── SOIL MODULE ──────────────────────────────────────────────────────────────
function SoilModule({ onSoilData }) {
  const { location, loading: gpsLoading, error: gpsError, detect } = useGPS();
  const [soilFile, setSoilFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [form, setForm] = useState({ soilColor: "dark-brown", region: "Karnataka", season: "Kharif", rainfall: "medium", texture: "loamy" });

  const analyze = async () => {
    setLoading(true);
    try {
      let resData;
      if (soilFile) {
        // Use Backend Endpoint
        const fd = new FormData();
        fd.append("file", soilFile);
        const req = await fetch(`${API_BASE}/analyze/soil`, { method: "POST", body: fd });
        resData = await req.json();
      } else {
        // Fallback mock if no file is chosen (backend requires file right now)
        await new Promise(r => setTimeout(r, 1000));
        resData = { soil_type: "Loamy Soil", predicted_ph_proxy: 6.5, estimated_moisture: "40%" };
      }

      const formattedData = {
        soilType: resData.soil_type,
        pH: resData.predicted_ph_proxy,
        moisture: resData.estimated_moisture,
        organicMatter: "Medium",
        npk: {"N": "Low", "P": "Medium", "K": "High"},
        topCrops: ["Rice", "Wheat", "Maize"],
        improvements: ["Add compost", "Apply urea"],
        rating: 8,
        summary: "Good soil for various crops.",
        fertilizers: ["NPK 14-35-14"],
        waterRetention: "Medium"
      };
      setResult(formattedData);
      onSoilData && onSoilData(formattedData);
    } catch (e) {
      setResult({ error: "Analysis failed." });
    }
    setLoading(false);
  };

  return (
    <div>
      {!result && !loading && (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
            Upload a soil photo and use GPS for hyper-local fast API soil analysis.
          </p>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>📷 Soil Image (required for CNN)</div>
            <ImageUpload onImage={(_, file) => setSoilFile(file)} label="Upload soil photo for visual analysis" />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>📍 Location Detection</div>
            {location ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--color-background-success)", borderRadius: 8, padding: "8px 12px", border: "0.5px solid var(--color-border-success)" }}>
                <span style={{ color: "var(--color-text-success)" }}>✓</span>
                <span style={{ fontSize: 13 }}>GPS: {location.lat}°N, {location.lon}°E</span>
              </div>
            ) : (
              <button onClick={detect} disabled={gpsLoading} style={{ width: "100%", padding: "9px", background: "transparent", border: "0.5px solid var(--color-border-secondary)", borderRadius: 8, cursor: "pointer", fontSize: 13, color: "var(--color-text-secondary)" }}>
                {gpsLoading ? "📡 Detecting…" : "📡 Auto-detect my GPS location"}
              </button>
            )}
            {gpsError && <div style={{ fontSize: 11, color: "var(--color-text-danger)", marginTop: 4 }}>{gpsError}</div>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[["Soil Color", "soilColor", ["light-gray","red-brown","dark-brown","black","yellow","sandy"]],
              ["Texture", "texture", ["sandy","loamy","clay","silt","black cotton","red laterite"]],
              ["Region", "region", ["Karnataka","Maharashtra","Punjab","Tamil Nadu","Andhra Pradesh","Rajasthan","UP","West Bengal"]],
              ["Season", "season", ["Kharif (Jun-Nov)","Rabi (Nov-Apr)","Zaid (Mar-Jun)"]],
            ].map(([label, key, options]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "block", marginBottom: 4 }}>{label}</label>
                <select value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} style={{ width: "100%", borderRadius: 6, padding: "7px 10px", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontSize: 13 }}>
                  {options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            ))}
          </div>

          <PrimaryBtn onClick={analyze} disabled={!soilFile} color={soilFile ? "#1D9E75" : "#ccc"}>🌱 Analyze Soil with AI Engine</PrimaryBtn>
        </>
      )}

      {loading && <Loader icon="🧪" text="AI ResNet model analyzing your soil properties…" />}

      {result && !loading && (
        <div>
          {result.error ? <p style={{ color: "var(--color-text-danger)" }}>{result.error}</p> : (
            <>
              <Card color="success" style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>{result.soilType}</div>
                    <div style={{ fontSize: 13, opacity: 0.8, marginTop: 2 }}>{result.summary}</div>
                  </div>
                  <div style={{ background: "var(--color-background-primary)", borderRadius: 8, padding: "4px 12px", textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 20, fontWeight: 500, color: "var(--color-text-primary)" }}>{result.rating}/10</div>
                    <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>Score</div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                  {[["pH", result.pH], ["Moisture", result.moisture], ["Organic", result.organicMatter], ["Water", result.waterRetention]].map(([k,v]) => (
                    <div key={k} style={{ background: "var(--color-background-primary)", borderRadius: 8, padding: "8px", textAlign: "center", color: "var(--color-text-primary)" }}>
                      <div style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{k}</div>
                      <div style={{ fontWeight: 500, fontSize: 12 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <BackBtn onClick={() => setResult(null)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CROP MODULE ──────────────────────────────────────────────────────────────
function CropModule() {
  const [form, setForm] = useState({ temp: 28, humidity: 70, ph: 6.5, N: 80, P: 40, K: 60, region: "Karnataka", season: "Kharif" });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const recommend = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/predict/crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          N: form.N, P: form.P, K: form.K, ph: form.ph, soil_type: form.region
        })
      });
      const data = await res.json();
      
      const formatted = data.recommendations.map((item, i) => ({
        rank: i + 1,
        crop: item.crop,
        score: Math.round(item.confidence),
        yieldEstimate: "Dynamic",
        revenue: "Dynamic",
        waterNeed: "See details",
        growthDays: 120,
        reasoning: item.reasoning,
        risks: data.explainability
      }));
      setResult(formatted);
    } catch (e) {
      setResult([{ error: "Failed to connect to backend ML API." }]);
    }
    setLoading(false);
  };

  return (
    <div>
      {!result && !loading && (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>Adjust parameters to get Random Forest ML-powered crop recommendations.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            {[["Nitrogen N", "N", 0, 200, 1], ["Phosphorus P", "P", 0, 150, 1], ["Potassium K", "K", 0, 200, 1], ["Soil pH", "ph", 4, 9, 0.1]].map(([label, key, min, max, step]) => (
              <div key={key}>
                <label style={{ fontSize: 12, color: "var(--color-text-secondary)", display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span>{label}</span><span style={{ fontWeight: 500, color: "var(--color-text-primary)" }}>{form[key]}</span>
                </label>
                <input type="range" min={min} max={max} step={step} value={form[key]} onChange={e => setForm(f => ({...f, [key]: parseFloat(e.target.value)}))} style={{ width: "100%" }}/>
              </div>
            ))}
          </div>
          <PrimaryBtn onClick={recommend} color="#0F6E56">🌾 Get Recommendations (XGBoost)</PrimaryBtn>
        </>
      )}

      {loading && <Loader icon="🌾" text="Random Forest making inferences…" />}

      {result && !loading && (
        <div>
          {result[0]?.error ? <p style={{ color: "var(--color-text-danger)" }}>{result[0].error}</p> : (
            <>
              <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 10 }}>
                Top crops based on telemetry:
              </div>
              {result.map((crop, i) => (
                <div key={i} style={{ background: i === 0 ? "var(--color-background-success)" : "var(--color-background-secondary)", border: i === 0 ? "1px solid var(--color-border-success)" : "0.5px solid var(--color-border-tertiary)", borderRadius: 10, padding: 12, marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontWeight: 500, fontSize: 15 }}>#{crop.rank} {crop.crop}</span>
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 16, color: crop.score >= 80 ? "var(--color-text-success)" : "var(--color-text-warning)" }}>{crop.score}% confidence</div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 4 }}>{crop.reasoning}</div>
                  <div style={{ fontSize: 11, color: "var(--color-text-warning)" }}>💡 Logic: {crop.risks}</div>
                </div>
              ))}
              <BackBtn onClick={() => setResult(null)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DISEASE MODULE ───────────────────────────────────────────────────────────
function DiseaseModule() {
  const [leafFile, setLeafFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const detect = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      if(leafFile) fd.append("file", leafFile);
      else fd.append("file", new Blob([""], {type: "image/jpeg"})); // fallback if empty
      
      const res = await fetch(`${API_BASE}/analyze/leaf`, { method: "POST", body: fd });
      const data = await res.json();
      
      setResult({
        disease: data.disease_name,
        confidence: data.confidence_score,
        severity: "Moderate",
        causes: [data.treatment_plan.causes],
        prevention: [data.treatment_plan.prevention],
        organicTreatment: [data.treatment_plan.organic_med],
        chemicalTreatment: [{name: data.treatment_plan.chemical_med, dosage: data.treatment_plan.dosage, frequency: "As needed"}],
        recoveryTime: "7 days",
        spreadRisk: "Medium"
      });
    } catch (e) {
      setResult({ error: "YOLOv8 Detection failed." });
    }
    setLoading(false);
  };

  const sev = { Mild: "success", Moderate: "warning", Severe: "danger" };

  return (
    <div>
      {!result && !loading && (
        <>
          <p style={{ color: "var(--color-text-secondary)", fontSize: 14, marginBottom: 16 }}>
            Upload a leaf photo for instant YOLOv8/CNN disease diagnosis.
          </p>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>📷 Upload Leaf Image (CNN Analysis)</div>
            <ImageUpload onImage={(_, file) => setLeafFile(file)} label="Upload diseased leaf photo" />
          </div>

          <PrimaryBtn onClick={detect} disabled={!leafFile} color={leafFile ? "#A32D2D" : "#ccc"}>
            🔬 Diagnose Disease with Vision API
          </PrimaryBtn>
        </>
      )}

      {loading && <Loader icon="🔬" text="Computer Vision inferring pathology…" />}

      {result && !loading && (
        <div>
          {result.error ? <p style={{ color: "var(--color-text-danger)" }}>{result.error}</p> : (
            <>
              <Card color={sev[result.severity] || "warning"} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontWeight: 500, fontSize: 16 }}>{result.disease}</div>
                  <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                    <span style={{ background: "var(--color-background-primary)", color: "var(--color-text-primary)", borderRadius: 10, padding: "2px 8px", fontSize: 11 }}>{result.confidence}%</span>
                  </div>
                </div>
              </Card>

              {[["🔍 Causes", result.causes, "secondary"], ["🛡️ Prevention", result.prevention, "secondary"], ["🌿 Organic Treatment", result.organicTreatment, "success"]].map(([title, items, c]) => (
                <div key={title} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>{title}</div>
                  {items?.map((item, i) => (
                    <div key={i} style={{ fontSize: 13, padding: "3px 0", display: "flex", gap: 8 }}>
                      <span style={{ color: "var(--color-text-secondary)" }}>•</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--color-text-secondary)", marginBottom: 6 }}>💊 Chemical Treatment</div>
                {result.chemicalTreatment?.map((t, i) => (
                  <div key={i} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>{t.dosage} · {t.frequency}</div>
                  </div>
                ))}
              </div>

              <BackBtn onClick={() => setResult(null)} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CHAT MODULE ──────────────────────────────────────────────────────────────
function ChatModule() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I'm your RAG Bot 🌱 Ask me anything about soil, crops, diseases, weather, or farming — in English, हिंदी, ಕನ್ನಡ, తెలుగు, or தமிழ்!" }
  ]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (textOverride = null) => {
    const messageText = typeof textOverride === "string" ? textOverride : input;
    if (!messageText.trim() || loading) return;
    const userMsg = { role: "user", content: messageText };
    setMessages(m => [...m, userMsg]);
    if (typeof textOverride !== "string") setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, language: lang })
      });
      const data = await res.json();
      setMessages(m => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "Sorry, I encountered an error. Please ensure FastAPI backend is running." }]);
    }
    setLoading(false);
  };

  const { listening, supported, toggle } = useVoice((text) => {
    setInput(text);
  });

  const speakLast = () => {
    const last = messages.filter(m => m.role === "assistant").pop();
    if (!last) return;
    setSpeaking(true);
    speak(last.content, lang === "hi" ? "hi-IN" : lang === "kn" ? "kn-IN" : lang === "te" ? "te-IN" : lang === "ta" ? "ta-IN" : "en-IN");
    setTimeout(() => setSpeaking(false), 4000);
  };

  const quickQ = ["Best crops for black soil?", "How to treat yellow leaves?", "ಭೂಮಿಯ pH ಸರಿಪಡಿಸುವುದು ಹೇಗೆ?", "मेरी फसल के लिए उर्वरक?", "நீர் பாசனம் எப்படி செய்வது?"];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 520 }}>
      {/* Lang + Voice controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {Object.entries(LANGS).map(([code, { name, flag }]) => (
            <button key={code} onClick={() => setLang(code)} style={{ padding: "3px 8px", borderRadius: 16, border: lang === code ? "1px solid var(--color-border-info)" : "0.5px solid var(--color-border-tertiary)", background: lang === code ? "var(--color-background-info)" : "transparent", color: lang === code ? "var(--color-text-info)" : "var(--color-text-secondary)", cursor: "pointer", fontSize: 11 }}>
              {flag} {name}
            </button>
          ))}
        </div>
        <button onClick={speakLast} title="Read last response aloud" style={{ padding: "4px 10px", borderRadius: 16, border: "0.5px solid var(--color-border-secondary)", background: "transparent", cursor: "pointer", fontSize: 12, color: speaking ? "var(--color-text-success)" : "var(--color-text-secondary)" }}>
          {speaking ? "🔊 Speaking…" : "🔊"}
        </button>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", marginBottom: 10 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
            {m.role === "assistant" && (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-background-success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0, marginTop: 2 }}>🌱</div>
            )}
            <div style={{ maxWidth: "75%", background: m.role === "user" ? "var(--color-background-info)" : "var(--color-background-secondary)", padding: "10px 14px", borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", fontSize: 13, lineHeight: 1.6, border: `0.5px solid ${m.role === "user" ? "var(--color-border-info)" : "var(--color-border-tertiary)"}`, color: "var(--color-text-primary)" }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-background-success)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🌱</div>
            <div style={{ background: "var(--color-background-secondary)", padding: "10px 14px", borderRadius: "16px 16px 16px 4px", fontSize: 13, color: "var(--color-text-secondary)" }}>Querying RAG…</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Row */}
      <div style={{ display: "flex", gap: 6 }}>
        {supported && (
          <button onClick={toggle} title="Voice input" style={{ padding: "0 12px", borderRadius: 8, border: listening ? "1px solid var(--color-border-danger)" : "0.5px solid var(--color-border-secondary)", background: listening ? "var(--color-background-danger)" : "transparent", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>
            {listening ? "🔴" : "🎙️"}
          </button>
        )}
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder={`Ask in any language… ${listening ? "(listening…)" : ""}`}
          style={{ flex: 1, borderRadius: 8, fontSize: 13, padding: "9px 12px", border: "0.5px solid var(--color-border-secondary)", background: "var(--color-background-primary)", color: "var(--color-text-primary)" }}
        />
        <button onClick={send} disabled={!input.trim() || loading} style={{ padding: "0 16px", background: input.trim() ? "#1D9E75" : "var(--color-border-tertiary)", color: "#fff", border: "none", borderRadius: 8, cursor: input.trim() ? "pointer" : "default", fontWeight: 500, fontSize: 13 }}>
          Send
        </button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function AgroMind() {
  const [activeModule, setActiveModule] = useState("dashboard");
  const [dashData, setDashData] = useState({ season: "Kharif", activities: [] });

  const handleWeatherData = (data) => {
    setDashData(prev => ({
      ...prev,
      weather: { city: data.city, temp: data.temp, humidity: data.humidity },
      activities: [{ icon: "🌤️", title: `Weather fetched for ${data.city}`, detail: `${data.temp}°C · ${data.condition}` }, ...prev.activities.slice(0, 3)]
    }));
  };

  const handleSoilData = (data) => {
    setDashData(prev => ({
      ...prev,
      soilScore: `${data.rating}/10`,
      topCrop: data.topCrops?.[0] || "--",
      activities: [{ icon: "🌱", title: `Soil analyzed: ${data.soilType}`, detail: `pH ${data.pH} · ${data.topCrops?.slice(0,2).join(", ")}` }, ...prev.activities.slice(0, 3)]
    }));
  };

  const currentMod = MODULES.find(m => m.id === activeModule);

  const moduleMap = {
    dashboard: <Dashboard setActive={setActiveModule} dashData={dashData} />,
    soil: <SoilModule onSoilData={handleSoilData} />,
    crop: <CropModule />,
    disease: <DiseaseModule />,
    weather: <WeatherModule onWeatherData={handleWeatherData} />,
    chat: <ChatModule />,
  };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", fontFamily: "var(--font-sans, system-ui, sans-serif)", padding: "16px" }}>
      <style>{`
        :root {
          --color-background-primary: #ffffff;
          --color-background-secondary: #f3f4f6;
          --color-border-primary: #d1d5db;
          --color-border-secondary: #e5e7eb;
          --color-border-tertiary: #f3f4f6;
          --color-text-primary: #111827;
          --color-text-secondary: #6b7280;
          
          --color-background-success: #def7ec;
          --color-text-success: #03543f;
          --color-border-success: #31c48d;
          
          --color-background-warning: #fdf6b2;
          --color-text-warning: #723b13;
          --color-border-warning: #faca15;
          
          --color-background-danger: #fde8e8;
          --color-text-danger: #9b1c1c;
          --color-border-danger: #f98080;
          
          --color-background-info: #e1effe;
          --color-text-info: #1e429f;
          --color-border-info: #76a9fa;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --color-background-primary: #1e1e1e;
            --color-background-secondary: #2d2d2d;
            --color-border-primary: #4b5563;
            --color-border-secondary: #374151;
            --color-border-tertiary: #2d2d2d;
            --color-text-primary: #f9fafb;
            --color-text-secondary: #9ca3af;
          }
        }

        @keyframes agrobounce { 0%,100%{opacity:0.4;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
      `}</style>


      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0 0.75rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#0F6E56,#5DCAA5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🌾</div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 16, lineHeight: 1.2 }}>AgroMind AI</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>AI-Powered Farming Intelligence</div>
          </div>
        </div>
        {dashData.weather && (
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", textAlign: "right" }}>
            📍 {dashData.weather.city}<br />
            <span style={{ fontWeight: 500 }}>{dashData.weather.temp}°C</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {MODULES.map(m => (
          <button key={m.id} onClick={() => setActiveModule(m.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 12px", borderRadius: 10, border: activeModule === m.id ? "1px solid var(--color-border-success)" : "0.5px solid var(--color-border-tertiary)", background: activeModule === m.id ? "var(--color-background-success)" : "transparent", cursor: "pointer", minWidth: 72, flexShrink: 0 }}>
            <span style={{ fontSize: 18, marginBottom: 2 }}>{m.icon}</span>
            <span style={{ fontSize: 10, color: activeModule === m.id ? "var(--color-text-success)" : "var(--color-text-secondary)", whiteSpace: "nowrap" }}>{m.label}</span>
          </button>
        ))}
      </div>

      <div style={{ background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: 14, padding: "1rem 1.25rem" }}>
        {activeModule !== "dashboard" && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, paddingBottom: 12, borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <span style={{ fontSize: 20 }}>{currentMod.icon}</span>
            <span style={{ fontWeight: 500, fontSize: 16 }}>{currentMod.label}</span>
          </div>
        )}
        {moduleMap[activeModule]}
      </div>

      <div style={{ textAlign: "center", padding: "0.75rem 0", fontSize: 11, color: "var(--color-text-secondary)" }}>
        AgroMind AI · GPS · Voice Input · Image Upload · 5 Languages · Powered by FastAPI
      </div>
    </div>
  );
}
