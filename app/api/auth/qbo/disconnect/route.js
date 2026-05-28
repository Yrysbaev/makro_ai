import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()

  const { data: conn } = await admin
    .from('qbo_connections')
    .select('realm_id')
    .eq('user_id', user.id)
    .single()

  if (conn?.realm_id) {
    await Promise.all([
      admin.from('invoice_lines').delete().in('invoice_id',
        admin.from('invoices').select('id').eq('realm_id', conn.realm_id)
      ),
      admin.from('sales_receipt_lines').delete().in('sales_receipt_id',
        admin.from('sales_receipts').select('id').eq('realm_id', conn.realm_id)
      ),
    ])
    await Promise.all([
      admin.from('invoices').delete().eq('realm_id', conn.realm_id),
      admin.from('sales_receipts').delete().eq('realm_id', conn.realm_id),
      admin.from('payments').delete().eq('realm_id', conn.realm_id),
    ])
    await Promise.all([
      admin.from('customers').delete().eq('realm_id', conn.realm_id),
      admin.from('items').delete().eq('realm_id', conn.realm_id),
      admin.from('sync_log').delete().eq('realm_id', conn.realm_id),
    ])
    await admin.from('qbo_connections').delete().eq('user_id', user.id)
  }

  return NextResponse.json({ ok: true })
}
