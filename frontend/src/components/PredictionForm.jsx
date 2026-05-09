import { useState, useEffect } from 'react'

function SliderInput({ label, icon, value, min, max, step = 1, onChange, format, color = '#3b82f6', description }) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="group p-5 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{icon}</span>
            <span className="text-white font-semibold text-sm">{label}</span>
          </div>
          {description && <p className="text-xs text-gray-600">{description}</p>}
        </div>
        <div className="text-right">
          <span className="text-xl font-black" style={{ color }}>
            {format ? format(value) : value}
          </span>
        </div>
      </div>

      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="w-full"
          style={{
            background: `linear-gradient(to right, ${color} ${pct}%, rgba(255,255,255,0.08) ${pct}%)`
          }}
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>{format ? format(min) : min}</span>
          <span>{format ? format(max) : max}</span>
        </div>
      </div>
    </div>
  )
}

function BedroomBathroomPicker({ label, icon, value, min, max, onChange, color }) {
  return (
    <div className="p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{icon}</span>
        <span className="text-white font-semibold text-sm">{label}</span>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: max - min + 1 }, (_, i) => i + min).map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className="flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
            style={value === n ? {
              background: `linear-gradient(135deg, ${color}, ${color}99)`,
              color: '#fff',
              boxShadow: `0 4px 16px ${color}40`
            } : {
              background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

function NeighborhoodPicker({ value, onChange }) {
  const neighborhoods = [
    { id: 'Urban', label: 'Urban', icon: '🏙️', desc: 'City center, high density', color: '#8b5cf6', premium: '+15%' },
    { id: 'Suburb', label: 'Suburb', icon: '🏘️', desc: 'Residential areas', color: '#3b82f6', premium: '+8%' },
    { id: 'Rural', label: 'Rural', icon: '🌾', desc: 'Countryside, open space', color: '#10b981', premium: '-12%' }
  ]

  return (
    <div className="p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📍</span>
        <span className="text-white font-semibold text-sm">Neighborhood Type</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {neighborhoods.map(n => (
          <button
            key={n.id}
            onClick={() => onChange(n.id)}
            className="p-4 rounded-xl text-center transition-all duration-200 hover:scale-105 active:scale-95 relative overflow-hidden"
            style={value === n.id ? {
              background: `${n.color}22`,
              border: `2px solid ${n.color}`,
              boxShadow: `0 0 20px ${n.color}30`
            } : {
              background: 'rgba(255,255,255,0.03)',
              border: '2px solid rgba(255,255,255,0.08)'
            }}
          >
            {value === n.id && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: n.color }}>
                <span className="text-[8px] text-white font-bold">✓</span>
              </div>
            )}
            <div className="text-2xl mb-1">{n.icon}</div>
            <div className="text-sm font-bold text-white">{n.label}</div>
            <div className="text-xs mt-1" style={{ color: n.color }}>{n.premium}</div>
            <div className="text-xs text-gray-600 mt-0.5 leading-tight">{n.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function LivePreview({ formData, modelStats }) {
  const [liveEst, setLiveEst] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(async () => {
      try {
       
        const res = await fetch('/api/predict', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        
        if (!res.ok) throw new Error('Network response was not ok');
        
        const data = await res.json()
        setLiveEst(data)
      } catch (e) {
        console.error("LIVE ESTIMATE ERROR:", e)
      }
      setLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [formData])

  return (
    <div className="p-5 rounded-2xl sticky top-6"
      style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.08))',
        border: '1px solid rgba(59,130,246,0.2)'
      }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: '0 0 8px #10b981' }} />
        <span className="text-sm font-semibold text-gray-300">Live Estimate</span>
        {loading && <div className="ml-auto w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
      </div>

      {liveEst && !loading ? (
        <div className="number-roll">
          <div className="text-3xl font-black text-white mb-1">
            ${liveEst.predicted_price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Range: ${(liveEst.price_low / 1000).toFixed(0)}k – ${(liveEst.price_high / 1000).toFixed(0)}k
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Per sq ft</span>
              <span className="text-blue-400 font-semibold">${liveEst.price_per_sqft.toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">vs Neighborhood avg</span>
              <span className={`font-semibold ${liveEst.vs_neighborhood >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {liveEst.vs_neighborhood >= 0 ? '+' : ''}{liveEst.vs_neighborhood}%
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">vs Market avg</span>
              <span className={`font-semibold ${liveEst.vs_market >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {liveEst.vs_market >= 0 ? '+' : ''}{liveEst.vs_market}%
              </span>
            </div>
          </div>

          {/* Mini price bar */}
          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <div className="text-xs text-gray-500 mb-2">Market Position</div>
            <div className="relative h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              {modelStats && (
                <div className="absolute h-2 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    width: `${Math.min(100, Math.max(5, ((liveEst.predicted_price - modelStats.price_min) / (modelStats.price_max - modelStats.price_min)) * 100))}%`
                  }} />
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Low</span>
              <span>Mid</span>
              <span>High</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="h-8 rounded-lg shimmer" />
          <div className="h-4 rounded shimmer" />
          <div className="h-4 rounded shimmer w-3/4" />
        </div>
      )}
    </div>
  )
}

export default function PredictionForm({ formData, setFormData, onPredict, loading, modelStats }) {
  const [ripple, setRipple] = useState(null)

  const update = (key) => (val) => setFormData(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const btn = e.currentTarget.querySelector('button[type=submit]')
    const rect = btn.getBoundingClientRect()
    setRipple({ x: 50, y: 50 })
    setTimeout(() => setRipple(null), 600)
    onPredict(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-bold text-white">Property Details</h2>
          <span className="text-xs text-gray-500 px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)' }}>
            Adjust sliders to configure
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SliderInput
            label="Square Footage"
            icon="📐"
            value={formData.SquareFeet}
            min={500}
            max={4000}
            step={50}
            onChange={update('SquareFeet')}
            format={v => `${v.toLocaleString()} ft²`}
            color="#3b82f6"
            description="Total living area"
          />
          <SliderInput
            label="Year Built"
            icon="📅"
            value={formData.YearBuilt}
            min={1950}
            max={2024}
            step={1}
            onChange={update('YearBuilt')}
            format={v => `${v}`}
            color="#f59e0b"
            description="Construction year"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BedroomBathroomPicker
            label="Bedrooms"
            icon="🛏️"
            value={formData.Bedrooms}
            min={1}
            max={6}
            onChange={update('Bedrooms')}
            color="#8b5cf6"
          />
          <BedroomBathroomPicker
            label="Bathrooms"
            icon="🚿"
            value={formData.Bathrooms}
            min={1}
            max={4}
            onChange={update('Bathrooms')}
            color="#06b6d4"
          />
        </div>

        <NeighborhoodPicker value={formData.Neighborhood} onChange={update('Neighborhood')} />

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2 pt-2">
          {[
            { label: `${formData.SquareFeet.toLocaleString()} ft²`, color: '#3b82f6' },
            { label: `${formData.Bedrooms} bed`, color: '#8b5cf6' },
            { label: `${formData.Bathrooms} bath`, color: '#06b6d4' },
            { label: formData.Neighborhood, color: '#10b981' },
            { label: `Built ${formData.YearBuilt}`, color: '#f59e0b' },
          ].map(chip => (
            <span key={chip.label}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: `${chip.color}15`, color: chip.color, border: `1px solid ${chip.color}30` }}>
              {chip.label}
            </span>
          ))}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-lg relative overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          style={{
            background: loading
              ? 'rgba(59,130,246,0.5)'
              : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
            boxShadow: loading ? 'none' : '0 8px 32px rgba(59,130,246,0.4), 0 0 0 1px rgba(139,92,246,0.2)'
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing Property...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              🔮 Get Price Prediction
            </span>
          )}

          {ripple && (
            <span className="absolute rounded-full bg-white/20 w-8 h-8"
              style={{
                left: `${ripple.x}%`, top: `${ripple.y}%`,
                transform: 'translate(-50%, -50%)',
                animation: 'ripple 0.6s linear'
              }} />
          )}
        </button>
      </div>

      {/* Right column — live preview */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-lg font-bold text-white">Live Estimate</h2>
          <span className="w-2 h-2 rounded-full bg-green-400 float"
            style={{ boxShadow: '0 0 8px #10b981' }} />
        </div>
        <LivePreview formData={formData} modelStats={modelStats} />

        {/* Tips card */}
        <div className="mt-4 p-4 rounded-2xl"
          style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div className="text-xs font-semibold text-yellow-400 mb-2">💡 Price Factors</div>
          <ul className="space-y-1.5 text-xs text-gray-500">
            <li>• Larger homes typically command higher prices</li>
            <li>• Urban areas have ~15% premium over rural</li>
            <li>• Newer builds fetch higher market values</li>
            <li>• More bathrooms add significant value</li>
          </ul>
        </div>
      </div>
    </form>
  )
}
