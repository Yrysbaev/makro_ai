'use client'
import { useState, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { fmt } from '@/lib/utils'

export default function RegionsPage() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard/regions')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const notConnected = !loading && data?.error === 'NO_CONNECTION'
  if (notConnected) {
    return <EmptyState icon={MapPin} title="Connect QuickBooks" description="Link your QuickBooks account to see region intelligence." action="Go to Settings" actionHref="/settings" />
  }

  const cities = data?.cities || []
  const maxRev = cities[0]?.revenue || 1

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-base font-semibold text-gray-900">Region Intelligence</h1>
      </header>

      <main className="flex-1 p-6 space-y-4">
        {/* Summary cards */}
        {!loading && data?.summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Active Cities</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.city_count}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Top City Revenue</p>
              <p className="text-2xl font-bold text-blue-700">{fmt(data.summary.top_city_revenue)}</p>
              <p className="text-xs text-gray-400">{data.summary.top_city}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 mb-1">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.total_customers}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">City</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">State</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (90d)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customers</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Invoices</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Share</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : cities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-sm text-gray-400">
                    No billing address data found. Make sure customer records have billing cities in QuickBooks.
                  </td>
                </tr>
              ) : (
                cities.map((c, i) => (
                  <tr key={`${c.billing_city}-${i}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.billing_city || 'Unknown'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.billing_state || '—'}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(c.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.customer_count}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{c.invoice_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(c.revenue / maxRev) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 text-right">
                          {((c.revenue / maxRev) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
