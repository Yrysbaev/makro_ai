import { NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/qbo/client'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect('/login')

  const state = Buffer.from(JSON.stringify({ userId: user.id, ts: Date.now() })).toString('base64')
  const url = getAuthorizationUrl(state)
  return NextResponse.redirect(url)
}
