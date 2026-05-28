'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Users, Package, UserCheck, MapPin, Sparkles, Settings, TrendingUp
} from 'lucide-react'

const nav = [
  { href: '/',          label: 'Revenue',    icon: TrendingUp },
  { href: '/customers', label: 'Customers',  icon: Users },
  { href: '/products',  label: 'Products',   icon: Package },
  { href: '/reps',      label: 'Sales Reps', icon: UserCheck },
  { href: '/regions',   label: 'Regions',    icon: MapPin },
  { href: '/ai',        label: 'AI Insights',icon: Sparkles },
  { href: '/settings',  label: 'Settings',   icon: Settings },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col z-20">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 size={16} className="text-white" />
        </div>
        <div>
          <div className="font-bold text-gray-900 text-sm leading-tight">Makro Sales</div>
          <div className="text-xs text-gray-500">Intelligence</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon size={16} className={active ? 'text-blue-600' : 'text-gray-400'} />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-3 border-t border-gray-200">
        <p className="text-xs text-gray-400 text-center">QuickBooks Online</p>
      </div>
    </aside>
  )
}
