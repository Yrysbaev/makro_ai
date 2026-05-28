import { qboQuery, refreshAccessToken } from './client'

const PAGE_SIZE = 100

async function ensureValidToken(supabase, userId) {
  const { data: conn, error } = await supabase
    .from('qbo_connections')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !conn) throw new Error('No QuickBooks connection found')

  const expiresAt = new Date(conn.token_expires_at).getTime()
  const buffer = 5 * 60 * 1000

  if (Date.now() + buffer >= expiresAt) {
    const tokens = await refreshAccessToken(conn.refresh_token)
    const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
    await supabase
      .from('qbo_connections')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: newExpiry,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
    return { token: tokens.access_token, realmId: conn.realm_id }
  }

  return { token: conn.access_token, realmId: conn.realm_id }
}

async function setLog(supabase, realmId, entity, status, records = 0, errMsg = null) {
  await supabase.from('sync_log').upsert(
    {
      realm_id: realmId,
      entity_type: entity,
      started_at: status === 'running' ? new Date().toISOString() : undefined,
      completed_at: status !== 'running' ? new Date().toISOString() : null,
      records_synced: records,
      status,
      error_message: errMsg,
    },
    { onConflict: 'realm_id,entity_type' }
  )
}

async function syncItems(supabase, token, realmId, since) {
  let pos = 1
  let total = 0
  while (true) {
    const where = since
      ? `WHERE Active IN (true, false) AND MetaData.LastUpdatedTime > '${since}'`
      : `WHERE Active IN (true, false)`
    const data = await qboQuery(realmId, token, `SELECT * FROM Item ${where} MAXRESULTS ${PAGE_SIZE} STARTPOSITION ${pos}`)
    const items = data.QueryResponse?.Item || []
    if (!items.length) break
    await supabase.from('items').upsert(
      items.map(i => ({
        id: i.Id,
        realm_id: realmId,
        name: i.Name,
        description: i.Description,
        type: i.Type,
        unit_price: i.UnitPrice,
        active: i.Active,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )
    total += items.length
    if (items.length < PAGE_SIZE) break
    pos += PAGE_SIZE
  }
  return total
}

async function syncCustomers(supabase, token, realmId, since) {
  let pos = 1
  let total = 0
  while (true) {
    const where = since
      ? `WHERE Active IN (true, false) AND MetaData.LastUpdatedTime > '${since}'`
      : `WHERE Active IN (true, false)`
    const data = await qboQuery(realmId, token, `SELECT * FROM Customer ${where} MAXRESULTS ${PAGE_SIZE} STARTPOSITION ${pos}`)
    const customers = data.QueryResponse?.Customer || []
    if (!customers.length) break

    await supabase.from('customers').upsert(
      customers.map(c => {
        const repField = c.CustomField?.find(f =>
          f.Name?.toLowerCase().includes('rep') || f.Name?.toLowerCase().includes('sales')
        )
        return {
          id: c.Id,
          realm_id: realmId,
          display_name: c.DisplayName,
          company_name: c.CompanyName,
          email: c.PrimaryEmailAddr?.Address,
          phone: c.PrimaryPhone?.FreeFormNumber,
          billing_city: c.BillAddr?.City,
          billing_state: c.BillAddr?.CountrySubDivisionCode,
          billing_country: c.BillAddr?.Country,
          balance: c.Balance || 0,
          sales_rep: repField?.StringValue || null,
          active: c.Active,
          qbo_created_at: c.MetaData?.CreateTime,
          synced_at: new Date().toISOString(),
        }
      }),
      { onConflict: 'id' }
    )
    total += customers.length
    if (customers.length < PAGE_SIZE) break
    pos += PAGE_SIZE
  }
  return total
}

async function syncInvoices(supabase, token, realmId, since) {
  let pos = 1
  let total = 0
  const today = new Date().toISOString().split('T')[0]

  while (true) {
    const where = since ? `WHERE MetaData.LastUpdatedTime > '${since}'` : ''
    const data = await qboQuery(realmId, token, `SELECT * FROM Invoice ${where} MAXRESULTS ${PAGE_SIZE} STARTPOSITION ${pos}`)
    const invoices = data.QueryResponse?.Invoice || []
    if (!invoices.length) break

    await supabase.from('invoices').upsert(
      invoices.map(inv => ({
        id: inv.Id,
        realm_id: realmId,
        customer_id: inv.CustomerRef?.value,
        customer_name: inv.CustomerRef?.name,
        doc_number: inv.DocNumber,
        txn_date: inv.TxnDate,
        due_date: inv.DueDate,
        total_amount: inv.TotalAmt,
        balance: inv.Balance,
        status: inv.Balance === 0 ? 'Paid' : (inv.DueDate && inv.DueDate < today ? 'Overdue' : 'Open'),
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )

    const lineRows = []
    for (const inv of invoices) {
      if (!inv.Line?.length) continue
      await supabase.from('invoice_lines').delete().eq('invoice_id', inv.Id)
      for (const line of inv.Line) {
        if (line.DetailType !== 'SalesItemLineDetail') continue
        const d = line.SalesItemLineDetail
        if (!d) continue
        lineRows.push({
          invoice_id: inv.Id,
          item_id: d.ItemRef?.value,
          item_name: d.ItemRef?.name,
          description: line.Description,
          quantity: d.Qty,
          unit_price: d.UnitPrice,
          amount: line.Amount,
        })
      }
    }
    if (lineRows.length) await supabase.from('invoice_lines').insert(lineRows)

    total += invoices.length
    if (invoices.length < PAGE_SIZE) break
    pos += PAGE_SIZE
  }
  return total
}

async function syncPayments(supabase, token, realmId, since) {
  let pos = 1
  let total = 0
  while (true) {
    const where = since ? `WHERE MetaData.LastUpdatedTime > '${since}'` : ''
    const data = await qboQuery(realmId, token, `SELECT * FROM Payment ${where} MAXRESULTS ${PAGE_SIZE} STARTPOSITION ${pos}`)
    const payments = data.QueryResponse?.Payment || []
    if (!payments.length) break
    await supabase.from('payments').upsert(
      payments.map(p => ({
        id: p.Id,
        realm_id: realmId,
        customer_id: p.CustomerRef?.value,
        customer_name: p.CustomerRef?.name,
        txn_date: p.TxnDate,
        total_amount: p.TotalAmt,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )
    total += payments.length
    if (payments.length < PAGE_SIZE) break
    pos += PAGE_SIZE
  }
  return total
}

async function syncSalesReceipts(supabase, token, realmId, since) {
  let pos = 1
  let total = 0
  while (true) {
    const where = since ? `WHERE MetaData.LastUpdatedTime > '${since}'` : ''
    const data = await qboQuery(realmId, token, `SELECT * FROM SalesReceipt ${where} MAXRESULTS ${PAGE_SIZE} STARTPOSITION ${pos}`)
    const receipts = data.QueryResponse?.SalesReceipt || []
    if (!receipts.length) break

    await supabase.from('sales_receipts').upsert(
      receipts.map(sr => ({
        id: sr.Id,
        realm_id: realmId,
        customer_id: sr.CustomerRef?.value,
        customer_name: sr.CustomerRef?.name,
        txn_date: sr.TxnDate,
        total_amount: sr.TotalAmt,
        synced_at: new Date().toISOString(),
      })),
      { onConflict: 'id' }
    )

    const lineRows = []
    for (const sr of receipts) {
      if (!sr.Line?.length) continue
      await supabase.from('sales_receipt_lines').delete().eq('sales_receipt_id', sr.Id)
      for (const line of sr.Line) {
        if (line.DetailType !== 'SalesItemLineDetail') continue
        const d = line.SalesItemLineDetail
        if (!d) continue
        lineRows.push({
          sales_receipt_id: sr.Id,
          item_id: d.ItemRef?.value,
          item_name: d.ItemRef?.name,
          description: line.Description,
          quantity: d.Qty,
          unit_price: d.UnitPrice,
          amount: line.Amount,
        })
      }
    }
    if (lineRows.length) await supabase.from('sales_receipt_lines').insert(lineRows)

    total += receipts.length
    if (receipts.length < PAGE_SIZE) break
    pos += PAGE_SIZE
  }
  return total
}

export async function runSync(supabase, userId, incremental = false) {
  const { token, realmId } = await ensureValidToken(supabase, userId)

  let since = null
  if (incremental) {
    const { data: log } = await supabase
      .from('sync_log')
      .select('completed_at')
      .eq('realm_id', realmId)
      .eq('entity_type', 'invoices')
      .eq('status', 'success')
      .single()
    if (log?.completed_at) {
      since = new Date(log.completed_at).toISOString().replace('T', ' ').split('.')[0]
    }
  }

  const entities = [
    { name: 'items', fn: syncItems },
    { name: 'customers', fn: syncCustomers },
    { name: 'invoices', fn: syncInvoices },
    { name: 'payments', fn: syncPayments },
    { name: 'sales_receipts', fn: syncSalesReceipts },
  ]

  const results = {}
  for (const { name, fn } of entities) {
    await setLog(supabase, realmId, name, 'running')
    try {
      const count = await fn(supabase, token, realmId, since)
      await setLog(supabase, realmId, name, 'success', count)
      results[name] = { status: 'success', count }
    } catch (err) {
      await setLog(supabase, realmId, name, 'error', 0, err.message)
      results[name] = { status: 'error', error: err.message }
    }
  }
  return results
}
