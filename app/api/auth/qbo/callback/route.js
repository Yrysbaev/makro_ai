import { NextResponse } from 'next/server'
import { exchangeCodeForTokens, getCompanyInfo } from '@/lib/qbo/client'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const realmId = searchParams.get('realmId')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(new URL('/settings?error=qbo_denied', request.url))
  }

  if (!code || !realmId) {
    return NextResponse.redirect(new URL('/settings?error=qbo_missing_params', request.url))
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const tokens = await exchangeCodeForTokens(code)
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    let companyName = null
    try {
      const info = await getCompanyInfo(realmId, tokens.access_token)
      companyName = info?.CompanyName || null
    } catch {}

    const admin = createAdminClient()
    await admin.from('qbo_connections').upsert({
      user_id: user.id,
      realm_id: realmId,
      company_name: companyName,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    return NextResponse.redirect(new URL('/settings?connected=1', request.url))
  } catch (err) {
    console.error('QBO callback error:', err)
    return NextResponse.redirect(new URL('/settings?error=qbo_token_failed', request.url))
  }
}
