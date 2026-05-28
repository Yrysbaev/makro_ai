import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

export async function POST() {
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
  const ago90 = new Date(now.getTime() - 90 * 86400000).toISOString().split('T')[0]
  const today = now.toISOString().split('T')[0]

  const [mtdInv, lastMthInv, overdueInv, topCust, topItems, inactive] = await Promise.all([
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', monthStart),
    supabase.from('invoices').select('total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', lastMonthStart).lte('txn_date', lastMonthEnd),
    supabase.from('invoices').select('balance, customer_name').eq('realm_id', rid).gt('balance', 0).lt('due_date', today).neq('status', 'Void'),
    supabase.from('invoices').select('customer_id, customer_name, total_amount').eq('realm_id', rid).neq('status', 'Void').gte('txn_date', ago90),
    supabase.from('invoice_lines').select('item_name, amount, invoice_id'),
    supabase.from('customers').select('id, display_name').eq('realm_id', rid).eq('active', true),
  ])

  const sum = arr => (arr || []).reduce((s, r) => s + Number(r.total_amount || 0), 0)
  const revMTD = sum(mtdInv.data)
  const revLast = sum(lastMthInv.data)
  const overdueTotal = (overdueInv.data || []).reduce((s, r) => s + Number(r.balance || 0), 0)

  // Top customers
  const custMap = {}
  for (const inv of topCust.data || []) {
    if (!custMap[inv.customer_id]) custMap[inv.customer_id] = { name: inv.customer_name, rev: 0 }
    custMap[inv.customer_id].rev += Number(inv.total_amount || 0)
  }
  const top5Cust = Object.values(custMap).sort((a, b) => b.rev - a.rev).slice(0, 5)

  // Top items
  const invIds90 = new Set((topCust.data || []).map(i => i.id))
  const itemMap = {}
  for (const line of topItems.data || []) {
    if (!line.item_name) continue
    if (!itemMap[line.item_name]) itemMap[line.item_name] = 0
    itemMap[line.item_name] += Number(line.amount || 0)
  }
  const top5Items = Object.entries(itemMap).sort(([, a], [, b]) => b - a).slice(0, 5)

  const context = `
Company: ${conn.company_name || 'Makro'}
Date: ${today}

REVENUE:
- This month (MTD): $${Math.round(revMTD).toLocaleString()}
- Last month: $${Math.round(revLast).toLocaleString()}
- Growth: ${revLast > 0 ? (((revMTD - revLast) / revLast) * 100).toFixed(1) : 'N/A'}%
- Total overdue AR: $${Math.round(overdueTotal).toLocaleString()} across ${overdueInv.data?.length || 0} invoices

TOP 5 CUSTOMERS (last 90 days by revenue):
${top5Cust.map((c, i) => `${i + 1}. ${c.name}: $${Math.round(c.rev).toLocaleString()}`).join('\n')}

TOP 5 PRODUCTS (last 90 days by revenue):
${top5Items.map(([n, r], i) => `${i + 1}. ${n}: $${Math.round(r).toLocaleString()}`).join('\n')}

Total active customers: ${inactive.data?.length || 0}
`

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({
      summary: `Weekly Summary for ${conn.company_name || 'your business'}:\n\nMTD Revenue: $${Math.round(revMTD).toLocaleString()}. Overdue AR: $${Math.round(overdueTotal).toLocaleString()}.\n\nSet OPENAI_API_KEY to get AI-powered insights.`,
      calls: null,
    })
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const [summaryRes, callsRes] = await Promise.all([
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a business analyst for a wholesale food distributor. Write clear, concise summaries for non-technical managers. Use plain English, no jargon. Focus on what matters most.' },
        { role: 'user', content: `Write a weekly business summary based on this data. Keep it to 3-4 short paragraphs. Highlight wins, risks, and one key action to take.\n\n${context}` },
      ],
      max_tokens: 500,
      temperature: 0.5,
    }),
    openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a sales coach for a wholesale food distributor. Give practical, specific advice.' },
        { role: 'user', content: `Based on this business data, who should the sales team call this week and why? List 3-5 specific recommendations.\n\n${context}` },
      ],
      max_tokens: 400,
      temperature: 0.5,
    }),
  ])

  return NextResponse.json({
    summary: summaryRes.choices[0].message.content,
    calls: callsRes.choices[0].message.content,
  })
}
