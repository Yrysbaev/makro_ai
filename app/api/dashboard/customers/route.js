import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase.from('qbo_connections').select('realm_id').eq('user_id', user.id).single()
  if (!conn) return NextResponse.json({ error: 'NO_CONNECTION' })

  const rid = conn.realm_id
  const now = new Date()
  const ago90  = new Date(now.getTime() - 90  * 86400000).toISOString().split('T')[0]
  const ago30  = new Date(now.getTime() - 30  * 86400000).toISOString().split('T')[0]
  const ago180 = new Date(now.getTime() - 180 * 86400000).toISOString().split('T')[0]

  // Get all invoices for the last 180 days
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, customer_id, customer_name, txn_date, total_amount, balance')
    .eq('realm_id', rid)
    .neq('status', 'Void')
    .gte('txn_date', ago180)
    .order('txn_date', { ascending: false })

  // Get all customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, display_name, company_name, email, billing_city, balance, sales_rep, active, qbo_created_at')
    .eq('realm_id', rid)
    .eq('active', true)

  const custById = Object.fromEntries((customers || []).map(c => [c.id, c]))

  // Build per-customer stats
  const stats = {}
  for (const inv of invoices || []) {
    if (!inv.customer_id) continue
    if (!stats[inv.customer_id]) {
      stats[inv.customer_id] = {
        ...(custById[inv.customer_id] || { id: inv.customer_id, display_name: inv.customer_name }),
        revenue_90: 0,
        revenue_30: 0,
        last_order: null,
        first_order: null,
        invoice_count: 0,
      }
    }
    const s = stats[inv.customer_id]
    if (inv.txn_date >= ago90) s.revenue_90 += Number(inv.total_amount || 0)
    if (inv.txn_date >= ago30) s.revenue_30 += Number(inv.total_amount || 0)
    if (!s.last_order || inv.txn_date > s.last_order) s.last_order = inv.txn_date
    if (!s.first_order || inv.txn_date < s.first_order) s.first_order = inv.txn_date
    s.invoice_count++
  }

  const all = Object.values(stats)

  // Segments
  const top = all
    .filter(c => c.revenue_90 > 0)
    .sort((a, b) => b.revenue_90 - a.revenue_90)
    .slice(0, 50)
    .map(c => ({ ...c, revenue: c.revenue_90 }))

  const growing = all
    .filter(c => c.revenue_30 > 0 && c.revenue_90 > 0)
    .filter(c => c.revenue_30 / (c.revenue_90 / 3) > 1.3) // 30% faster in last 30d
    .sort((a, b) => b.revenue_30 - a.revenue_30)
    .map(c => ({ ...c, revenue: c.revenue_90 }))

  const newCustomers = (customers || [])
    .filter(c => c.qbo_created_at && c.qbo_created_at.slice(0, 10) >= ago30)
    .map(c => ({ ...c, revenue: stats[c.id]?.revenue_90 || 0, last_order: stats[c.id]?.last_order || null }))
    .sort((a, b) => (b.qbo_created_at || '').localeCompare(a.qbo_created_at || ''))

  const activeIds = new Set(all.filter(c => c.last_order >= ago90).map(c => c.id))
  const inactive = (customers || [])
    .filter(c => !activeIds.has(c.id))
    .map(c => ({ ...c, revenue: 0, last_order: stats[c.id]?.last_order || null }))
    .sort((a, b) => (a.last_order || '').localeCompare(b.last_order || ''))
    .slice(0, 50)

  const overdue = (customers || [])
    .filter(c => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .map(c => ({ ...c, revenue: stats[c.id]?.revenue_90 || 0, last_order: stats[c.id]?.last_order || null }))

  return NextResponse.json({
    totalActive: customers?.filter(c => activeIds.has(c.id)).length || 0,
    top,
    growing,
    new: newCustomers,
    inactive,
    overdue,
  })
}
