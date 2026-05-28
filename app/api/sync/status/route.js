import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: connection } = await supabase
    .from('qbo_connections')
    .select('realm_id, company_name, updated_at')
    .eq('user_id', user.id)
    .single()

  if (!connection) {
    return NextResponse.json({ connection: null, log: [] })
  }

  const { data: log } = await supabase
    .from('sync_log')
    .select('*')
    .eq('realm_id', connection.realm_id)
    .order('entity_type')

  return NextResponse.json({ connection, log: log || [] })
}
