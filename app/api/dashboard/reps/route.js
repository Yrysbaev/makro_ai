import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase.from('qbo_connections').select('realm_id').eq('user_id', user.id).single()
  if (!conn) return NextResponse.json({ error: 'NO_CONNECTION' })

  const rid = conn.realm_id
  const ago90 = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]
  const ago30 = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

  const { data: customers } = await supabase
    .from('customers')
    .select('id, display_name, sales_rep, balance, active')
    .eq('realm_id', rid)
    .eq('active', true)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('customer_id, total_amount, txn_date')
    .eq('realm_id', rid)
    .neq('status', 'Void')
    .gte('txn_date', ago90)

  const custById = Object.fromEntries((customers || []).map(c => [c.id, c]))

  // Per-rep aggregation
  const repStats = {}
  for (const inv of invoices || []) {
    const cust = custById[inv.customer_id]
    if (!cust?.sales_rep) continue
    const rep = cust.sales_rep
    if (!repStats[rep]) {
      repStats[rep] = { sales_rep: rep, revenue: 0, customer_count: 0, invoice_count: 0, customers: new Set() }
    }
    const s = repStats[rep]
    s.revenue += Number(inv.total_amount || 0)
    s.invoice_count++
    s.customers.add(inv.customer_id)
  }

  const reps = Object.values(repStats)
    .map(r => ({ ...r, customer_count: r.customers.size, customers: undefined }))
    .sort((a, b) => b.revenue - a.revenue)

  // Follow-ups: customers with no invoice in 30 days
  const recentCustIds = new Set(
    (invoices || []).filter(i => i.txn_date >= ago30).map(i => i.customer_id)
  )

  // Last order per customer
  const lastOrder = {}
  for (const inv of invoices || []) {
    if (!lastOrder[inv.customer_id] || inv.txn_date > lastOrder[inv.customer_id]) {
      lastOrder[inv.customer_id] = inv.txn_date
    }
  }

  // Count follow-ups per rep
  const followupCustIds = (customers || [])
    .filter(c => !recentCustIds.has(c.id))
    .map(c => c.id)

  for (const rep of reps) {
    const followupCount = followupCustIds.filter(id => custById[id]?.sales_rep === rep.sales_rep).length
    rep.followup_count = followupCount
  }

  const followups = (customers || [])
    .filter(c => !recentCustIds.has(c.id) && c.sales_rep)
    .map(c => ({
      id: c.id,
      display_name: c.display_name,
      sales_rep: c.sales_rep,
      balance: c.balance,
      days_since: lastOrder[c.id]
        ? Math.floor((Date.now() - new Date(lastOrder[c.id]).getTime()) / 86400000)
        : null,
    }))
    .sort((a, b) => (b.days_since || 0) - (a.days_since || 0))
    .slice(0, 20)

  return NextResponse.json({ reps, followups })
}
