'use client'
import { useState, useEffect, useCallback } from 'react'
import { BarChart3, AlertTriangle } from 'lucide-react'
import KPICard from '@/components/KPICard'
import RevenueChart from '@/components/RevenueChart'
import EmptyState from '@/components/EmptyState'
import { fmt, fmtFull, fmtDate } from '@/lib/utils'

export default function RevenuePage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [meta, setMeta]       = useState({ email: '', company: '' })

  useEffect(() => {
    const el = document.getElementById('dashboard-meta')
    if (el) setMeta({ email: el.dataset.email, company: el.dataset.company })
    load()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard/revenue')
      const json = await res.json()
      setData(json)
    } catch {}
    setLoading(false)
  }, [])

  async function sync() {
    setSyncing(true)
    await fetch('/api/sync', { method: 'POST', body: JSON.stringify({ incremental: true }), headers: { 'Content-Type': 'application/json' } })
    setSyncing(false)
    load()
  }

  const notConnected = !loading && data?.error === 'NO_CONNECTION'

  if (notConnected) {
    return (
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <h1 className="text-base font-semibold text-gray-900">Revenue Overview</h1>
        </header>
        <div className="flex-1">
          <EmptyState
            icon={BarChart3}
            title="Connect QuickBooks to get started"
            description="Link your QuickBooks Online account to start pulling sales data and building your intelligence dashboard."
            action="Go to Settings"
            actionHref="/settings"
          />
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {}
  const trend = data?.trend || []
  const topCustomers = data?.topCustomers || []
  const alerts = data?.alerts || []

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div>
          <h1 className="text-base font-semibold text-gray-900">Revenue Overview</h1>
          {meta.company && <p className="text-xs text-gray-400">{meta.company}</p>}
        </div>
        <button
          onClick={sync}
          disabled={syncing}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <span className={syncing ? 'animate-spin inline-block' : ''}>↻</span>
          {syncing ? 'Syncing…' : 'Sync Now'}
        </button>
      </header>

      <main className="flex-1 p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Revenue This Month"
            value={fmt(kpis.revenueMTD)}
            change={kpis.revenueGrowth}
            changeLabel="vs last month"
            color="blue"
            loading={loading}
          />
          <KPICard
            label="Average Order Value"
            value={fmt(kpis.aov)}
            change={kpis.aovGrowth}
            changeLabel="vs last period"
            color="green"
            loading={loading}
          />
          <KPICard
            label="Open AR Balance"
            value={fmt(kpis.openAR)}
            sub={kpis.openCount ? `${kpis.openCount} open invoices` : null}
            color="orange"
            loading={loading}
          />
          <KPICard
            label="Overdue Balance"
            value={fmt(kpis.overdueAR)}
            sub={kpis.overdueCount ? `${kpis.overdueCount} overdue` : null}
            color="red"
            loading={loading}
          />
        </div>

        {/* Revenue Trend + Top Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">Revenue Trend (12 months)</h2>
              {kpis.revenueYTD && (
                <span className="text-xs text-gray-500">YTD: {fmt(kpis.revenueYTD)}</span>
              )}
            </div>
            <RevenueChart data={trend} loading={loading} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Top Customers</h2>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : topCustomers.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {topCustomers.slice(0, 8).map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                      <span className="text-sm text-gray-700 truncate">{c.display_name || c.company_name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 ml-2 shrink-0">{fmt(c.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-orange-500" />
              <h2 className="text-sm font-semibold text-gray-900">Alerts</h2>
            </div>
            <div className="space-y-2">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg text-sm ${
                  a.severity === 'high' ? 'bg-red-50 border border-red-100' :
                  a.severity === 'medium' ? 'bg-orange-50 border border-orange-100' :
                  'bg-yellow-50 border border-yellow-100'
                }`}>
                  <span className={`font-medium ${
                    a.severity === 'high' ? 'text-red-700' :
                    a.severity === 'medium' ? 'text-orange-700' : 'text-yellow-700'
                  }`}>{a.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
