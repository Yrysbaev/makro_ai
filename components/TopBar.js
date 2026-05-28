'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, RefreshCw, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function TopBar({ title, companyName, userEmail, syncing, onSync }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-base font-semibold text-gray-900">{title}</h1>
        {companyName && <p className="text-xs text-gray-400">{companyName}</p>}
      </div>
      <div className="flex items-center gap-3">
        {onSync && (
          <button
            onClick={onSync}
            disabled={syncing}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
            {syncing ? 'Syncing…' : 'Sync'}
          </button>
        )}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-xs">
              {userEmail?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block max-w-32 truncate">{userEmail}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>
          {open && (
            <div className="absolute right-0 top-9 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-30 py-1">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
