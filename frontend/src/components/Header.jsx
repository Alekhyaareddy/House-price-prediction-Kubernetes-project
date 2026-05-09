import { useState, useEffect } from 'react'

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [displayed, setDisplayed] = useState(0)
  useEffect(() => {
    const start = 0
    const end = value
    const duration = 1500
    const startTime = Date.now()
    const step = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - progress, 3)
      setDisplayed(start + (end - start) * ease)
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [value])
  return <span>{prefix}{displayed.toFixed(decimals)}{suffix}</span>
}

export default function Header({ modelStats }) {
  return (
    <header className="relative overflow-hidden py-12 px-4 sm:px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute -top-10 right-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.2), rgba(139,92,246,0.2), transparent)' }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Left: Title */}
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-3 justify-center lg:justify-start mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl spin-slow"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border: '1px solid rgba(59,130,246,0.3)' }}>
                🏡
              </div>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-400 px-3 py-1 rounded-full"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                AI-Powered
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3">
              <span className="text-white">House Price</span>
              <br />
              <span className="bg-clip-text text-transparent animate-gradient"
                style={{ backgroundImage: 'linear-gradient(-45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981)' }}>
                Prediction
              </span>
            </h1>

            <p className="text-gray-400 text-lg max-w-lg">
              Enter property details below to get an instant AI-powered price estimate using our Gradient Boosting model.
            </p>
          </div>

          {/* Right: Key metrics */}
          {modelStats && (
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              {[
                {
                  label: 'R² Accuracy',
                  value: modelStats.r2 * 100,
                  suffix: '%',
                  decimals: 1,
                  color: '#10b981',
                  icon: '🎯',
                  bg: 'rgba(16,185,129,0.1)',
                  border: 'rgba(16,185,129,0.2)'
                },
                {
                  label: 'Dataset Size',
                  value: modelStats.total_records,
                  suffix: ' homes',
                  decimals: 0,
                  color: '#3b82f6',
                  icon: '🗂️',
                  bg: 'rgba(59,130,246,0.1)',
                  border: 'rgba(59,130,246,0.2)'
                },
                {
                  label: 'Avg Error',
                  value: modelStats.mae / 1000,
                  prefix: '±$',
                  suffix: 'k',
                  decimals: 1,
                  color: '#f59e0b',
                  icon: '📏',
                  bg: 'rgba(245,158,11,0.1)',
                  border: 'rgba(245,158,11,0.2)'
                }
              ].map(m => (
                <div key={m.label}
                  className="text-center p-4 rounded-2xl transition-all duration-300 hover:scale-105 cursor-default"
                  style={{ background: m.bg, border: `1px solid ${m.border}` }}>
                  <div className="text-2xl mb-1">{m.icon}</div>
                  <div className="text-2xl font-black" style={{ color: m.color }}>
                    <AnimatedNumber value={m.value} prefix={m.prefix || ''} suffix={m.suffix} decimals={m.decimals} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">{m.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
