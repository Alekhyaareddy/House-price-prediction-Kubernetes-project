import { useState, useEffect } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Cell
} from 'recharts'

function AnimatedPrice({ value }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const target = value
    const duration = 1200
    const start = Date.now()
    const step = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 4)
      setDisplayed(Math.round(target * ease))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <>${displayed.toLocaleString()}</>
}

function ScoreGauge({ value, label, color }) {
  const [animated, setAnimated] = useState(0)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 200)
    return () => clearTimeout(t)
  }, [value])
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const dash = (animated / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="transform -rotate-90">
        <circle cx="50" cy="50" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
        <circle
          cx="50" cy="50" r={radius}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(0.34,1.56,0.64,1)', filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center -mt-2">
        <div className="text-lg font-black" style={{ color }}>{animated.toFixed(1)}%</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function SimilarHouseCard({ house, index }) {
  return (
    <div className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-default slide-up"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        animationDelay: `${index * 0.1}s`
      }}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏠</span>
          <span className="text-sm font-semibold text-white">
            {house.SquareFeet.toLocaleString()} ft²
          </span>
        </div>
        <span className="text-sm font-black text-green-400">
          ${house.Price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </span>
      </div>
      <div className="flex gap-3 text-xs text-gray-500">
        <span>🛏️ {house.Bedrooms} bed</span>
        <span>🚿 {house.Bathrooms} bath</span>
        <span>📅 {house.YearBuilt}</span>
      </div>
    </div>
  )
}

export default function ResultPanel({ prediction, formData, onBack }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const compData = [
    { name: 'Your Home', price: prediction.predicted_price, fill: '#3b82f6' },
    { name: `${formData.Neighborhood} Avg`, price: prediction.neighborhood_avg, fill: '#8b5cf6' },
    { name: 'Market Avg', price: prediction.overall_avg, fill: '#10b981' },
  ]

  const factors = [
    { subject: 'Size', value: Math.min(100, (formData.SquareFeet / 4000) * 100) },
    { subject: 'Age', value: Math.min(100, ((formData.YearBuilt - 1950) / 74) * 100) },
    { subject: 'Bedrooms', value: Math.min(100, (formData.Bedrooms / 6) * 100) },
    { subject: 'Bathrooms', value: Math.min(100, (formData.Bathrooms / 4) * 100) },
    { subject: 'Location', value: formData.Neighborhood === 'Urban' ? 90 : formData.Neighborhood === 'Suburb' ? 70 : 40 },
  ]

  return (
    <div className={`space-y-6 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transform: visible ? 'translateY(0)' : 'translateY(32px)' }}>

      {/* Back button */}
      <button onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
        ← Back to Form
      </button>

      {/* Main price card */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 50%, rgba(6,182,212,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.25)',
          boxShadow: '0 0 60px rgba(59,130,246,0.1)'
        }}>

        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.1), transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1), transparent)', filter: 'blur(40px)' }} />

        <div className="relative">
          <div className="text-sm font-semibold text-gray-400 tracking-widest uppercase mb-2">
            🎯 Predicted Market Value
          </div>

          <div className="text-6xl sm:text-7xl font-black bg-clip-text text-transparent mb-3"
            style={{ backgroundImage: 'linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)' }}>
            {visible && <AnimatedPrice value={prediction.predicted_price} />}
          </div>

          <div className="text-gray-400 text-sm mb-6">
            Price Range: <span className="text-yellow-400 font-semibold">
              ${prediction.price_low.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span> — <span className="text-yellow-400 font-semibold">
              ${prediction.price_high.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Price / Sqft', value: `$${prediction.price_per_sqft.toFixed(0)}`, color: '#60a5fa', icon: '📐' },
              { label: 'vs Neighborhood', value: `${prediction.vs_neighborhood >= 0 ? '+' : ''}${prediction.vs_neighborhood}%`, color: prediction.vs_neighborhood >= 0 ? '#34d399' : '#f87171', icon: '🏘️' },
              { label: 'vs Market', value: `${prediction.vs_market >= 0 ? '+' : ''}${prediction.vs_market}%`, color: prediction.vs_market >= 0 ? '#34d399' : '#f87171', icon: '📊' },
              { label: 'Model Accuracy', value: `${prediction.model_accuracy}%`, color: '#a78bfa', icon: '🎯' },
            ].map(m => (
              <div key={m.label} className="p-4 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-xl mb-1">{m.icon}</div>
                <div className="text-xl font-black" style={{ color: m.color }}>{m.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Comparison bar chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Price Comparison</h3>
          <p className="text-xs text-gray-500 mb-5">Your home vs neighborhood and market averages</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={v => [`$${v.toLocaleString()}`, 'Price']}
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              />
              <Bar dataKey="price" radius={[8, 8, 0, 0]}>
                {compData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Property factors radar */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Property Profile</h3>
          <p className="text-xs text-gray-500 mb-4">Feature strengths (0–100)</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={factors}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: score gauge + similar homes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Accuracy gauges */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Model Performance</h3>
          <p className="text-xs text-gray-500 mb-6">Trained on {'{'}1,000{'}'} housing records</p>
          <div className="flex justify-around">
            <ScoreGauge value={prediction.model_accuracy} label="R² Accuracy" color="#3b82f6" />
            <ScoreGauge value={Math.min(100, 100 - (Math.abs(prediction.vs_market)))} label="Market Fit" color="#10b981" />
            <ScoreGauge value={85} label="Confidence" color="#8b5cf6" />
          </div>
        </div>

        {/* Similar houses */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Similar Properties</h3>
          <p className="text-xs text-gray-500 mb-4">Most comparable homes in {formData.Neighborhood}</p>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {prediction.similar_houses.map((house, i) => (
              <SimilarHouseCard key={i} house={house} index={i} />
            ))}
          </div>
        </div>
      </div>

      {/* Input summary */}
      <div className="p-5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <h3 className="text-sm font-semibold text-gray-400 mb-3">📋 Input Summary</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Square Feet', value: `${formData.SquareFeet.toLocaleString()} ft²`, icon: '📐' },
            { label: 'Bedrooms', value: formData.Bedrooms, icon: '🛏️' },
            { label: 'Bathrooms', value: formData.Bathrooms, icon: '🚿' },
            { label: 'Neighborhood', value: formData.Neighborhood, icon: '📍' },
            { label: 'Year Built', value: formData.YearBuilt, icon: '📅' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span>{item.icon}</span>
              <span className="text-xs text-gray-500">{item.label}:</span>
              <span className="text-xs font-semibold text-white">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
