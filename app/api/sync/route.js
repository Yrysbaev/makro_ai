import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { runSync } from '@/lib/qbo/sync'

export async function POST(request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const incremental = body.incremental !== false

  try {
    const admin = createAdminClient()
    const results = await runSync(admin, user.id, incremental)
    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
