'use client'
import { useState, useEffect } from 'react'
import { Sparkles, RefreshCw, AlertTriangle, TrendingUp, Phone, Tag } from 'lucide-react'
import EmptyState from '@/components/EmptyState'

export default function AIPage() {
  const [alerts, setAlerts]       = useState(null)
  const [insights, setInsights]   = useState(null)
  const [loadingAlerts, setLoadingAlerts] = useState(true)
  const [loadingAI, setLoadingAI] = useState(false)
  const [connected, setConnected] = useState(true)

  useEffect(() => {
    fetch('/api/ai/alerts')
      .then(r => r.json())
      .then(d => {
        if (d.error === 'NO_CONNECTION') { setConnected(false); setLoadingAlerts(false); return }
        setAlerts(d)
        setLoadingAlerts(false)
      })
      .catch(() => setLoadingAlerts(false))
  }, [])

  async function generateInsights() {
    setLoadingAI(true)
    try {
      const res = await fetch('/api/ai/insights', { method: 'POST' })
      const d = await res.json()
      setInsights(d)
    } catch {}
    setLoadingAI(false)
  }

  if (!connected) {
    return <EmptyState icon={Sparkles} title="Connect QuickBooks" description="Link your QuickBooks account to generate AI insights." action="Go to Settings" actionHref="/settings" />
  }

  const severityStyles = {
    high:   { bg: 'bg-red-50 border-red-200',    text: 'text-red-700',    icon: AlertTriangle },
    medium: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: AlertTriangle },
    low:    { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: AlertTriangle },
  }

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-600" />
          <h1 className="text-base font-semibold text-gray-900">AI Insights</h1>
        </div>
        <button
          onClick={generateInsights}
          disabled={loadingAI}
          className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={loadingAI ? 'animate-spin' : ''} />
          {loadingAI ? 'Generating…' : 'Generate Weekly Summary'}
        </button>
      </header>

      <main className="flex-1 p-6 space-y-5">
        {/* AI Weekly Summary */}
        {insights && (
          <div className="bg-white rounded-xl border border-blue-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <h2 className="text-sm font-semibold text-gray-900">Weekly Business Summary</h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{insights.summary}</p>
          </div>
        )}

        {!insights && !loadingAI && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-700">
            Click "Generate Weekly Summary" above to get an AI-powered analysis of your business this week.
          </div>
        )}

        {/* Rule-Based Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-500" />
            <h2 className="text-sm font-semibold text-gray-900">Risk Alerts</h2>
          </div>
          {loadingAlerts ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : alerts?.riskAlerts?.length === 0 ? (
            <p className="text-sm text-green-600">No risk alerts right now.</p>
          ) : (
            <div className="space-y-2">
              {alerts?.riskAlerts?.map((a, i) => {
                const s = severityStyles[a.severity] || severityStyles.low
                return (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${s.bg}`}>
                    <AlertTriangle size={14} className={`mt-0.5 shrink-0 ${s.text}`} />
                    <p className={s.text}>{a.message}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Call Recommendations */}
        {alerts?.callRecs?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Phone size={16} className="text-green-500" />
              <h2 className="text-sm font-semibold text-gray-900">Call Recommendations</h2>
            </div>
            <div className="space-y-2">
              {alerts.callRecs.map((r, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.customer}</p>
                    <p className="text-xs text-gray-500">{r.reason}</p>
                  </div>
                  {r.balance > 0 && (
                    <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      ${Number(r.balance).toLocaleString()} owed
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Product Promotions */}
        {alerts?.promotions?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Tag size={16} className="text-purple-500" />
              <h2 className="text-sm font-semibold text-gray-900">Suggested Promotions</h2>
              <span className="text-xs text-gray-400">Products to push this week</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {alerts.promotions.map((p, i) => (
                <div key={i} className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800">{p.name}</p>
                  <p className="text-xs text-purple-600">{p.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Full Response */}
        {insights?.calls && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">AI Call Recommendations</h2>
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{insights.calls}</p>
          </div>
        )}
      </main>
    </div>
  )
}
