export default function StatsBar({ modelStats }) {
  const stats = [
    { label: 'Min Price', value: `$${(modelStats.price_min / 1000).toFixed(0)}k`, color: '#06b6d4' },
    { label: 'Avg Price', value: `$${(modelStats.price_mean / 1000).toFixed(0)}k`, color: '#3b82f6' },
    { label: 'Max Price', value: `$${(modelStats.price_max / 1000).toFixed(0)}k`, color: '#8b5cf6' },
    { label: 'Min Sqft', value: `${modelStats.sqft_min.toLocaleString()}`, color: '#10b981' },
    { label: 'Max Sqft', value: `${modelStats.sqft_max.toLocaleString()}`, color: '#f59e0b' },
    { label: 'Year Range', value: `${modelStats.year_min}–${modelStats.year_max}`, color: '#ec4899' },
    { label: 'Neighborhoods', value: modelStats.neighborhoods.join(', '), color: '#a78bfa' },
  ]

  return (
    <div className="border-y overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex gap-0 min-w-max mx-auto">
        {stats.map((s, i) => (
          <div key={s.label}
            className={`flex items-center gap-3 px-6 py-3 ${i < stats.length - 1 ? 'border-r' : ''}`}
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">{s.label}</span>
            <span className="text-sm font-bold whitespace-nowrap" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
