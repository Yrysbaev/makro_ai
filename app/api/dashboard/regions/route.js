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

  const { data: invoices } = await supabase
    .from('invoices')
    .select('customer_id, total_amount')
    .eq('realm_id', rid)
    .neq('status', 'Void')
    .gte('txn_date', ago90)

  const { data: customers } = await supabase
    .from('customers')
    .select('id, billing_city, billing_state')
    .eq('realm_id', rid)

  const custById = Object.fromEntries((customers || []).map(c => [c.id, c]))

  const cityStats = {}
  for (const inv of invoices || []) {
    const cust = custById[inv.customer_id]
    if (!cust?.billing_city) continue
    const key = `${cust.billing_city}|${cust.billing_state || ''}`
    if (!cityStats[key]) {
      cityStats[key] = {
        billing_city: cust.billing_city,
        billing_state: cust.billing_state,
        revenue: 0,
        customer_count: 0,
        invoice_count: 0,
        customers: new Set(),
      }
    }
    cityStats[key].revenue += Number(inv.total_amount || 0)
    cityStats[key].invoice_count++
    cityStats[key].customers.add(inv.customer_id)
  }

  const cities = Object.values(cityStats)
    .map(c => ({ ...c, customer_count: c.customers.size, customers: undefined }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 30)

  const topCity = cities[0]
  const summary = {
    city_count: cities.length,
    top_city: topCity?.billing_city || null,
    top_city_revenue: topCity?.revenue || 0,
    total_customers: new Set(Object.values(cityStats).flatMap(c => [...c.customers])).size,
  }

  return NextResponse.json({ cities, summary })
}
