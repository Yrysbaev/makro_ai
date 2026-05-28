import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: conn } = await supabase
    .from('qbo_connections')
    .select('company_name')
    .eq('user_id', user?.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="pl-64 flex flex-col min-h-screen">
        <div
          data-company={conn?.company_name || ''}
          data-email={user?.email || ''}
          id="dashboard-meta"
          className="hidden"
        />
        {children}
      </div>
    </div>
  )
}
