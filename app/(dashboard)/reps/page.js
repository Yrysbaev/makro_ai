'use client'
import { useState, useEffect } from 'react'
import { UserCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import EmptyState from '@/components/EmptyState'
import { fmt } from '@/lib/utils'

export default function RepsPage() {
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard/reps')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const notConnected = !loading && data?.error === 'NO_CONNECTION'
  if (notConnected) {
    return <EmptyState icon={UserCheck} title="Connect QuickBooks" description="Link your QuickBooks account to see sales rep performance." action="Go to Settings" actionHref="/settings" />
  }

  const reps = data?.reps || []
  const noReps = !loading && reps.length === 0

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-base font-semibold text-gray-900">Sales Rep Intelligence</h1>
      </header>

      <main className="flex-1 p-6 space-y-4">
        {noReps && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
            <strong>No sales rep data found.</strong> To enable this view, add a custom field named "Sales Rep" to your customers in QuickBooks Online.
          </div>
        )}

        {!noReps && !loading && reps.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Revenue by Rep (90 days)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={reps} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="sales_rep" tick={{ fontSize: 11, fill: '#94a3b8' }} />
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Sales Rep</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (90d)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customers</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Invoices</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Avg Order</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Follow-Up Needed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : reps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-gray-400">No rep data available</td>
                </tr>
              ) : (
                reps.map(r => (
                  <tr key={r.sales_rep} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{r.sales_rep}</td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">{fmt(r.revenue)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.customer_count}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{r.invoice_count}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {r.invoice_count > 0 ? fmt(r.revenue / r.invoice_count) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {r.followup_count > 0 ? (
                        <span className="bg-orange-50 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          {r.followup_count} customers
                        </span>
                      ) : (
                        <span className="text-green-600 text-xs">All good</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Customers needing follow-up */}
        {data?.followups?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Customers Needing Follow-Up (30+ days inactive)</h2>
            <div className="space-y-2">
              {data.followups.map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="text-sm font-medium text-gray-900">{c.display_name}</span>
                    {c.sales_rep && <span className="ml-2 text-xs text-gray-400">{c.sales_rep}</span>}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{c.days_since > 0 ? `${c.days_since}d since last order` : 'No recent orders'}</span>
                    {c.balance > 0 && <span className="text-orange-600 font-medium">{fmt(c.balance)} owed</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
