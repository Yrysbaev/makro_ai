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
  const ago60 = new Date(Date.now() - 60 * 86400000).toISOString().split('T')[0]

  // Get invoice lines joined to recent invoices
  const { data: lines } = await supabase
    .from('invoice_lines')
    .select('item_id, item_name, quantity, amount, invoice_id')
    .not('item_id', 'is', null)

  // Get all invoices in last 90 days for this realm
  const { data: recentInvoices } = await supabase
    .from('invoices')
    .select('id, txn_date')
    .eq('realm_id', rid)
    .neq('status', 'Void')
    .gte('txn_date', ago90)

  const recentIds = new Set((recentInvoices || []).map(i => i.id))
  const invDateById = Object.fromEntries((recentInvoices || []).map(i => [i.id, i.txn_date]))

  // Best sellers: aggregate lines for recent invoices
  const itemStats = {}
  for (const line of lines || []) {
    if (!recentIds.has(line.invoice_id)) continue
    if (!itemStats[line.item_id]) {
      itemStats[line.item_id] = {
        item_id: line.item_id,
        item_name: line.item_name,
        revenue: 0,
        total_quantity: 0,
        order_count: 0,
        last_ordered: null,
      }
    }
    const s = itemStats[line.item_id]
    s.revenue += Number(line.amount || 0)
    s.total_quantity += Number(line.quantity || 0)
    s.order_count++
    const d = invDateById[line.invoice_id]
    if (d && (!s.last_ordered || d > s.last_ordered)) s.last_ordered = d
  }

  const best = Object.values(itemStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 30)

  // Slow movers: active items with no order in 60+ days
  const { data: allItems } = await supabase
    .from('items')
    .select('id, name, type')
    .eq('realm_id', rid)
    .eq('active', true)
    .neq('type', 'Service')

  // Get last order date for each item across all invoices
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
    if (!lastOrdered[line.item_id] || d > lastOrdered[line.item_id]) {
      lastOrdered[line.item_id] = d
    }
  }

  const slow = (allItems || [])
    .map(item => ({ ...item, last_ordered: lastOrdered[item.id] || null }))
    .filter(item => !item.last_ordered || item.last_ordered < ago60)
    .sort((a, b) => (a.last_ordered || '').localeCompare(b.last_ordered || ''))
    .slice(0, 30)

  return NextResponse.json({ best, slow })
}
