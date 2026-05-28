-- Run this in your Supabase SQL editor

-- QuickBooks OAuth connections (one per user)
CREATE TABLE IF NOT EXISTS qbo_connections (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES auth.users NOT NULL UNIQUE,
  realm_id         TEXT NOT NULL UNIQUE,
  company_name     TEXT,
  access_token     TEXT NOT NULL,
  refresh_token    TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id              TEXT PRIMARY KEY,
  realm_id        TEXT NOT NULL,
  display_name    TEXT,
  company_name    TEXT,
  email           TEXT,
  phone           TEXT,
  billing_city    TEXT,
  billing_state   TEXT,
  billing_country TEXT,
  balance         NUMERIC(12,2) DEFAULT 0,
  sales_rep       TEXT,
  active          BOOLEAN DEFAULT true,
  qbo_created_at  TIMESTAMPTZ,
  synced_at       TIMESTAMPTZ DEFAULT now()
);

-- Invoice headers
CREATE TABLE IF NOT EXISTS invoices (
  id            TEXT PRIMARY KEY,
  realm_id      TEXT NOT NULL,
  customer_id   TEXT REFERENCES customers(id),
  customer_name TEXT,
  doc_number    TEXT,
  txn_date      DATE,
  due_date      DATE,
  total_amount  NUMERIC(12,2),
  balance       NUMERIC(12,2),
  status        TEXT,
  synced_at     TIMESTAMPTZ DEFAULT now()
);

-- Invoice line items
CREATE TABLE IF NOT EXISTS invoice_lines (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id  TEXT REFERENCES invoices(id) ON DELETE CASCADE,
  item_id     TEXT,
  item_name   TEXT,
  description TEXT,
  quantity    NUMERIC(12,4),
  unit_price  NUMERIC(12,4),
  amount      NUMERIC(12,2)
);

-- Products / Items
CREATE TABLE IF NOT EXISTS items (
  id          TEXT PRIMARY KEY,
  realm_id    TEXT NOT NULL,
  name        TEXT,
  description TEXT,
  type        TEXT,
  unit_price  NUMERIC(12,4),
  active      BOOLEAN DEFAULT true,
  synced_at   TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id            TEXT PRIMARY KEY,
  realm_id      TEXT NOT NULL,
  customer_id   TEXT REFERENCES customers(id),
  customer_name TEXT,
  txn_date      DATE,
  total_amount  NUMERIC(12,2),
  synced_at     TIMESTAMPTZ DEFAULT now()
);

-- Sales receipts
CREATE TABLE IF NOT EXISTS sales_receipts (
  id            TEXT PRIMARY KEY,
  realm_id      TEXT NOT NULL,
  customer_id   TEXT,
  customer_name TEXT,
  txn_date      DATE,
  total_amount  NUMERIC(12,2),
  synced_at     TIMESTAMPTZ DEFAULT now()
);

-- Sales receipt line items
CREATE TABLE IF NOT EXISTS sales_receipt_lines (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_receipt_id TEXT REFERENCES sales_receipts(id) ON DELETE CASCADE,
  item_id          TEXT,
  item_name        TEXT,
  description      TEXT,
  quantity         NUMERIC(12,4),
  unit_price       NUMERIC(12,4),
  amount           NUMERIC(12,2)
);

-- Sync state tracking
CREATE TABLE IF NOT EXISTS sync_log (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realm_id       TEXT NOT NULL,
  entity_type    TEXT NOT NULL,
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  records_synced INTEGER DEFAULT 0,
  status         TEXT,
  error_message  TEXT,
  UNIQUE(realm_id, entity_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_realm_txn ON invoices(realm_id, txn_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(realm_id, status);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice ON invoice_lines(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_item ON invoice_lines(item_id);
CREATE INDEX IF NOT EXISTS idx_customers_realm ON customers(realm_id);
CREATE INDEX IF NOT EXISTS idx_payments_realm_txn ON payments(realm_id, txn_date DESC);

-- Row Level Security
ALTER TABLE qbo_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_receipt_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policy helper: users see only their realm
CREATE OR REPLACE FUNCTION get_user_realm_id()
RETURNS TEXT AS $$
  SELECT realm_id FROM qbo_connections WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Policies (own connection)
CREATE POLICY "users_own_connection" ON qbo_connections
  FOR ALL USING (user_id = auth.uid());

-- Policies (data tied to realm)
CREATE POLICY "realm_customers" ON customers
  FOR ALL USING (realm_id = get_user_realm_id());
CREATE POLICY "realm_invoices" ON invoices
  FOR ALL USING (realm_id = get_user_realm_id());
CREATE POLICY "realm_invoice_lines" ON invoice_lines
  FOR ALL USING (invoice_id IN (SELECT id FROM invoices WHERE realm_id = get_user_realm_id()));
CREATE POLICY "realm_items" ON items
  FOR ALL USING (realm_id = get_user_realm_id());
CREATE POLICY "realm_payments" ON payments
  FOR ALL USING (realm_id = get_user_realm_id());
CREATE POLICY "realm_sales_receipts" ON sales_receipts
  FOR ALL USING (realm_id = get_user_realm_id());
CREATE POLICY "realm_sales_receipt_lines" ON sales_receipt_lines
  FOR ALL USING (sales_receipt_id IN (SELECT id FROM sales_receipts WHERE realm_id = get_user_realm_id()));
CREATE POLICY "realm_sync_log" ON sync_log
  FOR ALL USING (realm_id = get_user_realm_id());
