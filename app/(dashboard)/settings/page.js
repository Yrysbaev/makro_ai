'use client'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, RefreshCw, Plug, AlertCircle, Clock } from 'lucide-react'

function fmtAgo(str) {
  if (!str) return 'Never'
  const mins = Math.floor((Date.now() - new Date(str).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function SettingsPage() {
  const [conn, setConn]       = useState(null)
  const [syncLog, setSyncLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [fullSyncing, setFullSyncing] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    setLoading(true)
    const [statusRes] = await Promise.all([
      fetch('/api/sync/status').then(r => r.json()),
    ])
    setConn(statusRes.connection)
    setSyncLog(statusRes.log || [])
    setLoading(false)
  }

  async function connectQBO() {
    window.location.href = '/api/auth/qbo/connect'
  }

  async function disconnect() {
    if (!confirm('Disconnect QuickBooks? All synced data will be removed.')) return
    setDisconnecting(true)
    await fetch('/api/auth/qbo/disconnect', { method: 'POST' })
    setDisconnecting(false)
    setConn(null)
    setSyncLog([])
  }

  async function sync(full = false) {
    if (full) setFullSyncing(true)
    else setSyncing(true)
    await fetch('/api/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incremental: !full }),
    })
    if (full) setFullSyncing(false)
    else setSyncing(false)
    loadStatus()
  }

  const entities = ['items', 'customers', 'invoices', 'payments', 'sales_receipts']

  return (
    <div className="flex-1 flex flex-col">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6">
        <h1 className="text-base font-semibold text-gray-900">Settings</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl space-y-6">
        {/* QuickBooks Connection */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">QuickBooks Online</h2>

          {loading ? (
            <div className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ) : conn ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle size={20} className="text-green-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">{conn.company_name || 'Connected'}</p>
                  <p className="text-xs text-green-600">Realm ID: {conn.realm_id}</p>
                </div>
                <button
                  onClick={disconnect}
                  disabled={disconnecting}
                  className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {disconnecting ? 'Disconnecting…' : 'Disconnect'}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => sync(false)}
                  disabled={syncing}
                  className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={syncing ? 'animate-spin' : ''} />
                  {syncing ? 'Syncing…' : 'Sync (incremental)'}
                </button>
                <button
                  onClick={() => sync(true)}
                  disabled={fullSyncing}
                  className="flex items-center gap-1.5 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={13} className={fullSyncing ? 'animate-spin' : ''} />
                  {fullSyncing ? 'Syncing…' : 'Full Re-sync'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <XCircle size={20} className="text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Not connected</p>
                  <p className="text-xs text-gray-500">Connect your QuickBooks Online account to start syncing data</p>
                </div>
              </div>
              <button
                onClick={connectQBO}
                className="flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plug size={14} />
                Connect QuickBooks Online
              </button>
            </div>
          )}
        </div>

        {/* Sync Status */}
        {conn && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">Data Sync Status</h2>
            <div className="space-y-2">
              {loading ? (
                [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />)
              ) : entities.map(entity => {
                const log = syncLog.find(l => l.entity_type === entity)
                const label = entity.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                return (
                  <div key={entity} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {log?.status === 'success' ? (
                        <CheckCircle size={14} className="text-green-500" />
                      ) : log?.status === 'error' ? (
                        <AlertCircle size={14} className="text-red-500" />
                      ) : log?.status === 'running' ? (
                        <RefreshCw size={14} className="text-blue-500 animate-spin" />
                      ) : (
                        <Clock size={14} className="text-gray-400" />
                      )}
                      <span className="text-sm text-gray-700">{label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {log ? `${log.records_synced?.toLocaleString() || 0} records` : 'Not synced'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {log?.completed_at ? fmtAgo(log.completed_at) : '—'}
                      </p>
                      {log?.error_message && (
                        <p className="text-xs text-red-500 max-w-48 truncate">{log.error_message}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        {!conn && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">Setup Guide</h2>
            <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
              <li>Go to <a href="https://developer.intuit.com" target="_blank" rel="noreferrer" className="text-blue-600 underline">developer.intuit.com</a> and create a QuickBooks app</li>
              <li>Set redirect URI to <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/qbo/callback</code></li>
              <li>Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">QBO_CLIENT_ID</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">QBO_CLIENT_SECRET</code>, <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">QBO_REDIRECT_URI</code> to your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">.env.local</code></li>
              <li>Click "Connect QuickBooks Online" above</li>
              <li>After connecting, run a full sync to pull all your data</li>
            </ol>
          </div>
        )}
      </main>
    </div>
  )
}
