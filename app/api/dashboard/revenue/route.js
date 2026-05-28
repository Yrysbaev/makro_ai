import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: conn } = await supabase
    .from('qbo_connections')
    .select('realm_id, company_name')
    .eq('user_id', user.id)
    .single()

  if (!conn) return NextResponse.json({ error: 'NO_CONNECTION' })

  const rid = conn.realm_id
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
  const ytdStart = `${now.getFullYear()}-01-01`
  const ago90 = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]
  const ago12m = new Date(now.getFullYear() - 1, now.getMonth(), 1).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  const [mtd, lastMth, ytd, aovPrev, openAR, topCust, trend] = await Promise.all([
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', monthStart),
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', lastMonthStart).lte('txn_date', lastMonthEnd),
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', ytdStart),
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', ago90).lt('txn_date', monthStart),
    supabase.from('invoices').select('balance, due_date').eq('realm_id', rid).gt('balance', 0).neq('status', 'Void'),
    supabase.rpc('top_customers_90d', { p_realm_id: rid }).limit(10).catch(() => ({ data: [] })),
    supabase.from('invoices').select('txn_date, total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', ago12m).order('txn_date'),
  ])

  const sum = arr => (arr || []).reduce((s, r) => s + Number(r.total_amount || 0), 0)
  const revMTD = sum(mtd.data)
  const revLast = sum(lastMth.data)
  const revenueGrowth = revLast > 0 ? ((revMTD - revLast) / revLast) * 100 : null

  const aov90 = sum(mtd.data) / Math.max(mtd.data?.length || 0, 1)
  const aovPrevVal = sum(aovPrev.data) / Math.max(aovPrev.data?.length || 0, 1)
  const aovGrowth = aovPrevVal > 0 ? ((aov90 - aovPrevVal) / aovPrevVal) * 100 : null

  const allAR = openAR.data || []
  const openTotal = allAR.reduce((s, r) => s + Number(r.balance || 0), 0)
  const overdueTotal = allAR.filter(r => r.due_date && r.due_date < today).reduce((s, r) => s + Number(r.balance || 0), 0)
  const overdueCount = allAR.filter(r => r.due_date && r.due_date < today).length

  // Build monthly trend
  const trendMap = {}
  for (const row of trend.data || []) {
    const month = row.txn_date?.slice(0, 7)
    if (!month) continue
    trendMap[month] = (trendMap[month] || 0) + Number(row.total_amount || 0)
  }
  const trendData = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month: month + '-01', revenue }))

  // Top customers fallback (direct query if RPC not available)
  let topCustomers = []
  try {
    const { data: invData } = await supabase
      .from('invoices')
      .select('customer_id, customer_name, total_amount')
      .eq('realm_id', rid)
      .neq('status', 'Void')
      .gte('txn_date', ago90)

    const custMap = {}
    for (const inv of invData || []) {
      if (!inv.customer_id) continue
      if (!custMap[inv.customer_id]) custMap[inv.customer_id] = { id: inv.customer_id, display_name: inv.customer_name, revenue: 0 }
      custMap[inv.customer_id].revenue += Number(inv.total_amount || 0)
    }
    topCustomers = Object.values(custMap).sort((a, b) => b.revenue - a.revenue).slice(0, 10)
  } catch {}

  // Rule-based alerts
  const alerts = []
  if (overdueTotal > 0) alerts.push({ message: `$${Math.round(overdueTotal).toLocaleString()} in overdue invoices (${overdueCount} invoices)`, severity: overdueTotal > 10000 ? 'high' : 'medium' })
  if (revenueGrowth != null && revenueGrowth < -15) alerts.push({ message: `Revenue is down ${Math.abs(revenueGrowth).toFixed(1)}% vs last month`, severity: 'medium' })

  return NextResponse.json({
    kpis: {
      revenueMTD: revMTD,
      revenueLast: revLast,
      revenueGrowth,
      revenueYTD: sum(ytd.data),
      aov: aov90,
      aovGrowth,
      openAR: openTotal,
      openCount: allAR.length,
      overdueAR: overdueTotal,
      overdueCount,
    },
    trend: trendData,
    topCustomers,
    alerts,
    companyName: conn.company_name,
  })
}
