'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Leaf,
  Droplets,
  Thermometer,
  Target,
  Upload,
  MessageSquare,
  Activity,
  Bot
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('crop');

  const tabs = [
    { id: 'crop', label: 'Crop ML', icon: Target },
    { id: 'soil', label: 'Soil Vision', icon: Activity },
    { id: 'disease', label: 'Pathology', icon: Leaf },
    { id: 'chat', label: 'AgriBot', icon: Bot }
  ];

  return (
    <div className="min-h-screen bg-[#050B14] text-white relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-green/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/30 blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <nav className="w-full h-20 flex items-center justify-between px-8 glass-panel border-b-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-green to-emerald-400 flex items-center justify-center p-[2px]">
            <div className="w-full h-full bg-[#050B14] rounded-[10px] flex items-center justify-center">
              <Leaf className="text-brand-green w-5 h-5" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-green to-emerald-300 tracking-wide">
            Cerebro<span className="font-light">Agri</span>
          </h1>
        </div>
        <div className="flex gap-4">
          {/* Weather Widget Placeholder */}
          <div className="hidden md:flex items-center gap-4 bg-white/5 rounded-full px-4 py-2 border border-white/10">
            <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-orange-400" /> <span>28°C</span></div>
            <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400" /> <span>64%</span></div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 pt-12 z-10 relative">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight">
            Precision Farming <br className="hidden md:block" />
            Powered by <span className="text-brand-green drop-shadow-[0_0_15px_rgba(74,222,128,0.5)]">Artificial Intelligence</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Upload images, enter soil metrics, and get real-time recommendations driven by advanced Neural Networks and RAG engines.
          </p>
        </div>

        {/* Modular Dashboard */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-64 flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 hide-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-5 py-4 rounded-xl transition-all whitespace-nowrap min-w-[150px] lg:min-w-0 ${activeTab === tab.id
                    ? 'bg-brand-green/20 border border-brand-green/50 text-brand-green shadow-[0_0_20px_rgba(74,222,128,0.15)]'
                    : 'bg-white/5 hover:bg-white/10 border border-transparent text-gray-400'
                  }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Dynamic Content Area */}
          <div className="flex-1 glass-panel rounded-2xl p-6 min-h-[500px]">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {activeTab === 'crop' && <CropRecommendModule />}
              {activeTab === 'soil' && <ImageAnalysisModule title="Soil Classification" desc="Upload a soil image to detect its type (Alluvial, Black, Clay, etc.) via CNN." />}
              {activeTab === 'disease' && <ImageAnalysisModule title="Disease Detection" desc="Upload a leaf image to instantly diagnose diseases using YOLOv8." />}
              {activeTab === 'chat' && <ChatbotModule />}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ------ Subcomponents ------

function CropRecommendModule() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-2">Crop Recommendation Engine</h3>
      <p className="text-gray-400 mb-6 font-light">Input NPK values and climatic data to get the optimal crop.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'pH Level'].map((label) => (
          <div key={label} className="bg-white/5 p-4 rounded-xl border border-white/10 focus-within:border-brand-green/50 transition-colors">
            <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">{label}</label>
            <input type="number" placeholder="0.0" className="bg-transparent w-full outline-none text-xl font-mono text-white placeholder-gray-600" />
          </div>
        ))}
      </div>
      <div className="mt-auto flex justify-end">
        <button className="bg-brand-green hover:bg-brand-lightGreen text-[#050B14] font-bold py-3 px-8 rounded-xl transition-all shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)] transform hover:-translate-y-1">
          Run Inference
        </button>
      </div>
    </div>
  );
}

function ImageAnalysisModule({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center">
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400 mb-8">{desc}</p>

      <div className="w-full max-w-md aspect-video border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
        <div className="w-16 h-16 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Upload className="w-8 h-8" />
        </div>
        <p className="font-semibold">Drag & Drop Image</p>
        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
      </div>
    </div>
  );
}

function ChatbotModule() {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">AgriBot Assistant <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded border border-blue-500/30">RAG Powered</span></h3>
      <p className="text-gray-400 mb-6 font-light">Ask anything in English, Hindi, or Kannada.</p>

      <div className="flex-1 bg-black/50 rounded-xl border border-white/10 p-4 mb-4 flex flex-col overflow-y-auto">
        {/* Dummy Messages */}
        <div className="bg-white/10 self-end p-3 rounded-2xl rounded-tr-sm max-w-[80%] mb-4">
          How can I treat powdery mildew on my tomato plants?
        </div>
        <div className="bg-brand-green/10 border border-brand-green/20 text-green-50 self-start p-3 rounded-2xl rounded-tl-sm max-w-[80%]">
          Powdery mildew on tomatoes can be treated by applying sulfur-based fungicides or a mixture of baking soda and water (1 tbsp baking soda + 1 gallon water + half tsp liquid soap). Ensure good airflow around the plants.
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 rounded-xl border border-white/10 p-1 flex items-center focus-within:border-brand-green/50 transition-colors">
          <input type="text" placeholder="Type your farming query..." className="w-full bg-transparent outline-none px-4 text-white" />
        </div>
        <button className="bg-brand-green text-[#050B14] p-3 rounded-xl hover:bg-brand-lightGreen transition-colors flex items-center justify-center w-12 h-12">
          <MessageSquare className="w-5 h-5 fill-current" />
        </button>
      </div>
    </div>
  );
}
