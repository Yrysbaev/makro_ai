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
  const today = now.toISOString().split('T')[0]
  const ago30 = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]
  const ago60 = new Date(now.getTime() - 60 * 86400000).toISOString().split('T')[0]
  const ago90 = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]

  const [overdueInv, customers, recentInvoices, slowItems] = await Promise.all([
    supabase.from('invoices').select('balance, customer_name, due_date').eq('realm_id', rid).gt('balance', 0).lt('due_date', today).neq('status', 'Void').order('balance', { ascending: false }),
    supabase.from('customers').select('id, display_name, balance, sales_rep').eq('realm_id', rid).eq('active', true),
    supabase.from('invoices').select('customer_id, txn_date').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', ago90),
    supabase.from('items').select('id, name').eq('realm_id', rid).eq('active', true).neq('type', 'Service'),
  ])

  const riskAlerts = []

  // Overdue invoices alert
  const overdueRows = overdueInv.data || []
  if (overdueRows.length > 0) {
    const overdueTotal = overdueRows.reduce((s, r) => s + Number(r.balance || 0), 0)
    const overdue30 = overdueRows.filter(r => {
      const days = Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000)
      return days > 30
    })
    riskAlerts.push({
      message: `${overdueRows.length} invoices overdue totaling $${Math.round(overdueTotal).toLocaleString()}`,
      severity: overdueTotal > 10000 ? 'high' : 'medium',
    })
    if (overdue30.length > 0) {
      riskAlerts.push({
        message: `${overdue30.length} invoices are 30+ days overdue — urgent collections needed`,
        severity: 'high',
      })
    }
  }

  // Inactive customers (no order in 60 days)
  const recentCustIds = new Set((recentInvoices.data || []).filter(i => i.txn_date >= ago60).map(i => i.customer_id))
  const inactive60 = (customers.data || []).filter(c => !recentCustIds.has(c.id))
  if (inactive60.length > 0) {
    riskAlerts.push({
      message: `${inactive60.length} customers haven't ordered in 60+ days`,
      severity: inactive60.length > 10 ? 'medium' : 'low',
    })
  }

  // Call recommendations: customers with overdue balance OR inactive 30 days
  const recentCustIds30 = new Set((recentInvoices.data || []).filter(i => i.txn_date >= ago30).map(i => i.customer_id))
  const callRecs = (customers.data || [])
    .filter(c => c.balance > 0 || !recentCustIds30.has(c.id))
    .slice(0, 15)
    .map(c => ({
      customer: c.display_name,
      balance: c.balance,
      reason: c.balance > 0 ? `Outstanding balance of $${Number(c.balance).toLocaleString()}` : 'No order in 30+ days',
      rep: c.sales_rep,
    }))
    .sort((a, b) => Number(b.balance || 0) - Number(a.balance || 0))

  // Slow-moving product promotions (very basic)
  const { data: allLines } = await supabase
    .from('invoice_lines')
    .select('item_id, invoice_id')
    .not('item_id', 'is', null)

  const { data: allInvoices } = await supabase
    .from('invoices')
    .select('id, txn_date')
    .eq('realm_id', rid)
    .neq('status', 'Void')

  const invDate = Object.fromEntries((allInvoices || []).map(i => [i.id, i.txn_date]))
  const lastOrdered = {}
  for (const line of allLines || []) {
    const d = invDate[line.invoice_id]
    if (!d) continue
    if (!lastOrdered[line.item_id] || d > lastOrdered[line.item_id]) lastOrdered[line.item_id] = d
  }

  const promotions = (slowItems.data || [])
    .map(item => ({ ...item, last_ordered: lastOrdered[item.id] || null }))
    .filter(item => !item.last_ordered || item.last_ordered < ago60)
    .slice(0, 6)
    .map(item => ({
      name: item.name,
      reason: item.last_ordered
        ? `Last ordered ${Math.floor((Date.now() - new Date(item.last_ordered).getTime()) / 86400000)} days ago`
        : 'Never ordered',
    }))

  return NextResponse.json({ riskAlerts, callRecs, promotions })
}
