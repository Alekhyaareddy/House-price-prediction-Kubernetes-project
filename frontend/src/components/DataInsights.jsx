import { useState, useEffect } from 'react'
import { API } from '../config'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area, Cell
} from 'recharts'

const COLORS = { Urban: '#8b5cf6', Suburb: '#3b82f6', Rural: '#10b981' }

function StatCard({ label, value, sub, icon, color }) {
  return (
    <div className="p-5 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-2xl mb-2">{icon}</div>
          <div className="text-2xl font-black" style={{ color }}>{value}</div>
          <div className="text-sm font-semibold text-white mt-0.5">{label}</div>
          {sub && <div className="text-xs text-gray-500 mt-0.5">{sub}</div>}
        </div>
        <div className="w-2 h-2 rounded-full mt-1" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      </div>
    </div>
  )
}

export default function DataInsights() {
  const [data, setData] = useState(null)
  const [stats, setStats] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      fetch(API.distribution(filter)).then(r => r.json()),
      fetch(API.stats).then(r => r.json())
    ]).then(([dist, s]) => {
      setData(dist)
      setStats(s)
      setLoading(false)
    })
  }, [filter])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <div className="text-gray-500">Loading dataset insights...</div>
      </div>
    </div>
  )

  // Build sq ft buckets
  const sqftBuckets = {}
  ;(data.scatter_data || []).forEach(d => {
    const bucket = Math.round(d.SquareFeet / 250) * 250
    if (!sqftBuckets[bucket]) sqftBuckets[bucket] = { sqft: bucket, prices: [] }
    sqftBuckets[bucket].prices.push(d.Price)
  })
  const sqftTrend = Object.values(sqftBuckets)
    .sort((a, b) => a.sqft - b.sqft)
    .map(b => ({
      sqft: b.sqft,
      avg_price: Math.round(b.prices.reduce((s, v) => s + v, 0) / b.prices.length)
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white">Dataset Insights</h2>
          <p className="text-gray-500 text-sm mt-0.5">Explore {stats?.total_records?.toLocaleString()} housing records</p>
        </div>
        <div className="flex gap-2 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {['all', 'Urban', 'Suburb', 'Rural'].map(f => (
            <button key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 capitalize ${
                filter === f ? 'text-white' : 'text-gray-500 hover:text-white'
              }`}
              style={filter === f ? {
                background: f === 'all' ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)' : (COLORS[f] || '#3b82f6'),
                boxShadow: `0 2px 12px ${f === 'all' ? '#3b82f640' : (COLORS[f] || '#3b82f6') + '40'}`
              } : {}}>
              {f === 'all' ? '🌐 All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Homes" value={stats.total_records.toLocaleString()} icon="🏠" color="#3b82f6" />
          <StatCard label="Average Price" value={`$${(stats.price_mean / 1000).toFixed(0)}k`} sub="across all homes" icon="💰" color="#10b981" />
          <StatCard label="Price Range" value={`$${(stats.price_min / 1000).toFixed(0)}k–$${(stats.price_max / 1000).toFixed(0)}k`} icon="📊" color="#f59e0b" />
          <StatCard label="Model R²" value={`${(stats.r2 * 100).toFixed(1)}%`} sub={`MAE ±$${(stats.mae / 1000).toFixed(1)}k`} icon="🎯" color="#8b5cf6" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Price distribution */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Price Distribution</h3>
          <p className="text-xs text-gray-500 mb-5">Number of homes by price range</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data.price_distribution}>
              <XAxis dataKey="range" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                formatter={v => [v, 'Homes']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.price_distribution.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 12}, 80%, ${50 + i * 2}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Neighborhood avg comparison */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Neighborhood Comparison</h3>
          <p className="text-xs text-gray-500 mb-5">Average prices by neighborhood type</p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={data.neighborhood_stats} barCategoryGap="35%">
              <XAxis dataKey="Neighborhood" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                formatter={v => [`$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`, 'Avg Price']}
              />
              <Bar dataKey="avg_price" name="Avg Price" radius={[8, 8, 0, 0]}>
                {data.neighborhood_stats.map((entry, i) => (
                  <Cell key={i} fill={COLORS[entry.Neighborhood] || '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sqft vs Price trend */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Size vs Price Trend</h3>
          <p className="text-xs text-gray-500 mb-5">Average price by square footage</p>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={sqftTrend}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="sqft" tickFormatter={v => `${v}`} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1e2535', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
                formatter={v => [`$${Number(v).toLocaleString()}`, 'Avg Price']}
                labelFormatter={v => `${v} ft²`}
              />
              <Area type="monotone" dataKey="avg_price" stroke="#3b82f6" strokeWidth={2.5} fill="url(#priceGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Neighborhood detail bars */}
        <div className="p-6 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-base font-bold text-white mb-1">Neighborhood Details</h3>
          <p className="text-xs text-gray-500 mb-5">Price statistics by area type</p>
          <div className="space-y-5">
            {data.neighborhood_stats.map(n => {
              const color = COLORS[n.Neighborhood] || '#3b82f6'
              const maxPrice = Math.max(...data.neighborhood_stats.map(x => x.avg_price))
              const pct = (n.avg_price / maxPrice) * 100
              return (
                <div key={n.Neighborhood}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                      <span className="text-sm font-semibold text-white">{n.Neighborhood}</span>
                      <span className="text-xs text-gray-600">{n.count} homes</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black" style={{ color }}>
                        ${(n.avg_price / 1000).toFixed(0)}k avg
                      </div>
                      <div className="text-xs text-gray-600">
                        ${(n.min_price / 1000).toFixed(0)}k – ${(n.max_price / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}60` }} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Model summary */}
          {stats && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="text-xs font-semibold text-gray-400 mb-3">🤖 Model Info</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Algorithm', value: 'Gradient Boosting' },
                  { label: 'Features', value: '5 inputs' },
                  { label: 'R² Score', value: `${(stats.r2 * 100).toFixed(1)}%` },
                  { label: 'RMSE', value: `$${(stats.rmse / 1000).toFixed(1)}k` },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div className="text-xs text-gray-500">{m.label}</div>
                    <div className="text-sm font-bold text-white mt-0.5">{m.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
