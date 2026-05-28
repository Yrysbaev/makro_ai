'use client'
import { useState, useEffect } from 'react'
import { Users } from 'lucide-react'
import EmptyState from '@/components/EmptyState'
import { fmt, fmtDate, daysAgo } from '@/lib/utils'

const TABS = [
  { key: 'top',      label: 'Top Customers' },
  { key: 'growing',  label: 'Growing' },
  { key: 'new',      label: 'New' },
  { key: 'inactive', label: 'Inactive' },
  { key: 'overdue',  label: 'Overdue Balance' },
]

const statusColors = {
  growing:  'bg-green-50 text-green-700',
  new:      'bg-blue-50 text-blue-700',
  inactive: 'bg-gray-100 text-gray-600',
  overdue:  'bg-red-50 text-red-700',
}

export default function CustomersPage() {
  const [tab, setTab]     = useState('top')
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/dashboard/customers')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const notConnected = !loading && data?.error === 'NO_CONNECTION'
  if (notConnected) {
    return <EmptyState icon={Users} title="Connect QuickBooks" description="Link your QuickBooks account to see customer intelligence." action="Go to Settings" actionHref="/settings" />
  }

  const rows = data?.[tab] || []

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-base font-semibold text-gray-900">Customer Intelligence</h1>
        <div className="ml-4 flex items-center gap-1 text-sm text-gray-400">
          <Users size={14} />
          <span>{data?.totalActive || 0} active customers</span>
        </div>
      </header>

      <div className="bg-white border-b border-gray-200 px-6 flex gap-0">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {t.label}
            {data?.[t.key]?.length > 0 && (
              <span className="ml-1.5 bg-gray-100 text-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                {data[t.key].length}
              </span>
            )}
          </button>
        ))}
      </div>

      <main className="flex-1 p-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">City</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Revenue (90d)</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Balance</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Last Order</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Rep</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-sm text-gray-400">
                    No customers in this segment
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const days = daysAgo(c.last_order)
                  return (
                    <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{c.display_name || c.company_name}</div>
                        {c.email && <div className="text-xs text-gray-400">{c.email}</div>}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{c.billing_city || '—'}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">{c.revenue ? fmt(c.revenue) : '—'}</td>
                      <td className={`px-4 py-3 text-right font-medium ${c.balance > 0 ? 'text-orange-600' : 'text-gray-400'}`}>
                        {c.balance > 0 ? fmt(c.balance) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-500">
                        {c.last_order ? (
                          <span title={fmtDate(c.last_order)}>
                            {days != null && days > 0 ? `${days}d ago` : 'Today'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{c.sales_rep || '—'}</td>
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
