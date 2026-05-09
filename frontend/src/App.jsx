import { useState, useEffect } from 'react'
import { API } from './config'
import './index.css'
import Header from './components/Header'
import PredictionForm from './components/PredictionForm'
import ResultPanel from './components/ResultPanel'
import DataInsights from './components/DataInsights'
import ParticleBackground from './components/ParticleBackground'
import StatsBar from './components/StatsBar'

export default function App() {
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modelStats, setModelStats] = useState(null)
  const [activeTab, setActiveTab] = useState('predict')
  const [formData, setFormData] = useState({
    SquareFeet: 1800,
    Bedrooms: 3,
    Bathrooms: 2,
    Neighborhood: 'Suburb',
    YearBuilt: 2000
  })

  useEffect(() => {
    fetch(API.stats)
      .then(r => r.json())
      .then(setModelStats)
      .catch(() => { })
  }, [])

  const handlePredict = async (data) => {
    setLoading(true)
    setPrediction(null)
    try {
      const res = await fetch(API.predict, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json()
      setPrediction(result)
      setActiveTab('result')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'predict', label: '🏠 Predict Price' },
    { id: 'result', label: '📊 Results', disabled: !prediction },
    { id: 'insights', label: '📈 Data Insights' }
  ]

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 20% 20%, rgba(59,130,246,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(139,92,246,0.07) 0%, transparent 50%)',
        zIndex: 0
      }} />

      <div className="relative z-10">
        <Header modelStats={modelStats} />
        {modelStats && <StatsBar modelStats={modelStats} />}

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
          <div className="flex gap-1 p-1 rounded-2xl w-fit"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => !tab.disabled && setActiveTab(tab.id)}
                disabled={tab.disabled}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
                  ? 'text-white'
                  : tab.disabled
                    ? 'text-gray-600 cursor-not-allowed opacity-40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                style={activeTab === tab.id ? {
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.4)'
                } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {activeTab === 'predict' && (
            <PredictionForm
              formData={formData}
              setFormData={setFormData}
              onPredict={handlePredict}
              loading={loading}
              modelStats={modelStats}
            />
          )}
          {activeTab === 'result' && prediction && (
            <ResultPanel
              prediction={prediction}
              formData={formData}
              onBack={() => setActiveTab('predict')}
            />
          )}
          {activeTab === 'insights' && <DataInsights />}
        </div>

        <footer className="text-center py-8 text-gray-600 text-sm border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p>🏡 House Price Prediction System — Powered by Gradient Boosting ML</p>
          <p className="mt-1 text-xs text-gray-700">
            Model Accuracy: {modelStats ? `R² = ${(modelStats.r2 * 100).toFixed(1)}%` : '—'}
          </p>
        </footer>
      </div>
    </div>
  )
}
