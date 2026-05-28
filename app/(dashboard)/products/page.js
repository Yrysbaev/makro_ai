'use client'
import { useState, useEffect } from 'react'
import { Package } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import EmptyState from '@/components/EmptyState'
import { fmt } from '@/lib/utils'

const TABS = [
  { key: 'best',  label: 'Best Sellers' },
  { key: 'slow',  label: 'Slow Movers' },
]

export default function ProductsPage() {
  const [tab, setTab]     = useState('best')
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard/products')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const notConnected = !loading && data?.error === 'NO_CONNECTION'
  if (notConnected) {
    return <EmptyState icon={Package} title="Connect QuickBooks" description="Link your QuickBooks account to see product intelligence." action="Go to Settings" actionHref="/settings" />
  }

  const rows = data?.[tab] || []
  const chartData = (data?.best || []).slice(0, 10).map(r => ({
    name: (r.item_name || '').length > 18 ? r.item_name.slice(0, 18) + '…' : (r.item_name || 'Unknown'),
    revenue: Number(r.revenue),
  }))

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-base font-semibold text-gray-900">Product Intelligence</h1>
      </header>

      <div className="bg-white border-b border-gray-200 px-6 flex">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6 space-y-4">
        {/* Chart (only on best sellers tab) */}
        {tab === 'best' && !loading && chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue by Product (Top 10, 90 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 40 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-35} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
                <Tooltip formatter={v => [fmt(v), 'Revenue']} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Product</th>
                {tab === 'best' ? (
                  <>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Qty Sold</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Orders</th>
                  </>
                ) : (
                  <>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Last Ordered</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-sm text-gray-400">No data</td>
                </tr>
              ) : tab === 'best' ? (
                rows.map((r, i) => (
                  <tr key={r.item_id || i} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{r.item_name || '(unnamed)'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(r.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{Number(r.total_quantity || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.order_count}</td>
                  </tr>
                ))
              ) : (
                rows.map((r, i) => {
                  const days = r.last_ordered ? Math.floor((Date.now() - new Date(r.last_ordered).getTime()) / 86400000) : null
                  return (
                    <tr key={r.id || i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{r.name || '(unnamed)'}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{r.last_ordered ? `${days}d ago` : 'Never'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${days == null ? 'bg-gray-100 text-gray-500' : days > 90 ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'}`}>
                          {days == null ? 'No orders' : days > 90 ? 'Very slow' : 'Slow'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
