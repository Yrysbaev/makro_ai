import { TrendingUp, TrendingDown } from 'lucide-react'

export default function KPICard({ label, value, change, changeLabel, sub, color = 'blue', loading }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'text-blue-500' },
    green:  { bg: 'bg-green-50',  text: 'text-green-700',  icon: 'text-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-700', icon: 'text-orange-500' },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'text-red-500' },
  }
  const c = colors[color] || colors.blue

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
        <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-20" />
      </div>
    )
  }

  const positive = change >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${c.text}`}>{value}</p>
      {change != null && (
        <div className="flex items-center gap-1 mt-2">
          {positive
            ? <TrendingUp size={13} className="text-green-500" />
            : <TrendingDown size={13} className="text-red-500" />
          }
          <span className={`text-xs font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
            {positive ? '+' : ''}{typeof change === 'number' ? change.toFixed(1) + '%' : change}
          </span>
          {changeLabel && <span className="text-xs text-gray-400">{changeLabel}</span>}
        </div>
      )}
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}
