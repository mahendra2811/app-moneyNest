/**
 * Inline migration string. We avoid filesystem reads at runtime so the
 * bundler ships the SQL with the JS bundle. Keep this in sync with
 * 0000_init.sql.
 */
export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  starting_balance_paise integer DEFAULT 0 NOT NULL,
  currency text DEFAULT 'INR' NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  sort_order integer DEFAULT 0 NOT NULL,
  is_archived integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_accounts_archived ON accounts (is_archived);
CREATE INDEX IF NOT EXISTS idx_accounts_sort ON accounts (sort_order);

CREATE TABLE IF NOT EXISTS categories (
  id text PRIMARY KEY NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  parent_id text,
  slug text,
  sort_order integer DEFAULT 0 NOT NULL,
  is_archived integer DEFAULT 0 NOT NULL,
  is_default integer DEFAULT 0 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories (type);
CREATE INDEX IF NOT EXISTS idx_categories_archived ON categories (is_archived);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY NOT NULL,
  amount_paise integer NOT NULL,
  type text NOT NULL,
  account_id text NOT NULL,
  to_account_id text,
  category_id text,
  note text,
  payee text,
  occurred_at text NOT NULL,
  source text DEFAULT 'manual' NOT NULL,
  recurring_id text,
  created_at text NOT NULL,
  updated_at text NOT NULL,
  deleted_at text
);
CREATE INDEX IF NOT EXISTS idx_tx_occurred_at ON transactions (occurred_at);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions (account_id);
CREATE INDEX IF NOT EXISTS idx_tx_category ON transactions (category_id);
CREATE INDEX IF NOT EXISTS idx_tx_type ON transactions (type);
CREATE INDEX IF NOT EXISTS idx_tx_deleted ON transactions (deleted_at);
CREATE INDEX IF NOT EXISTS idx_tx_recurring ON transactions (recurring_id);
CREATE INDEX IF NOT EXISTS idx_tx_monthly_cat ON transactions (occurred_at, category_id, deleted_at);

CREATE TABLE IF NOT EXISTS budgets (
  id text PRIMARY KEY NOT NULL,
  category_id text NOT NULL,
  period text DEFAULT 'monthly' NOT NULL,
  amount_paise integer NOT NULL,
  rollover integer DEFAULT 0 NOT NULL,
  alert_at_80 integer DEFAULT 1 NOT NULL,
  alert_at_100 integer DEFAULT 1 NOT NULL,
  start_date text NOT NULL,
  is_active integer DEFAULT 1 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uidx_budget_category ON budgets (category_id);

CREATE TABLE IF NOT EXISTS recurring (
  id text PRIMARY KEY NOT NULL,
  template_json text NOT NULL,
  frequency text NOT NULL,
  interval_count integer DEFAULT 1 NOT NULL,
  day_of_month integer,
  day_of_week integer,
  start_date text NOT NULL,
  end_date text,
  next_run_at text NOT NULL,
  last_run_at text,
  is_active integer DEFAULT 1 NOT NULL,
  created_at text NOT NULL,
  updated_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rec_next_run ON recurring (next_run_at, is_active);

CREATE TABLE IF NOT EXISTS settings (
  key text PRIMARY KEY NOT NULL,
  value text NOT NULL,
  updated_at text NOT NULL
);

CREATE TABLE IF NOT EXISTS backup_log (
  id text PRIMARY KEY NOT NULL,
  file_path text NOT NULL,
  size_bytes integer NOT NULL,
  is_encrypted integer DEFAULT 1 NOT NULL,
  txn_count integer NOT NULL,
  created_at text NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_backup_created ON backup_log (created_at);

-- Phase 8 additions ---------------------------------------------------

-- Net worth snapshots (NEW-29)
CREATE TABLE IF NOT EXISTS snapshots (
  id text PRIMARY KEY NOT NULL,
  taken_at text NOT NULL,
  account_total_paise integer NOT NULL,
  investment_total_paise integer NOT NULL,
  loan_total_paise integer NOT NULL,
  net_worth_paise integer NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_snapshots_taken_at ON snapshots (taken_at);

-- Audit log (NEW-51)
CREATE TABLE IF NOT EXISTS audit_log (
  id text PRIMARY KEY NOT NULL,
  at text NOT NULL,
  action text NOT NULL,         -- e.g. 'read', 'write', 'export', 'restore'
  scope text NOT NULL,          -- e.g. 'transactions', 'backup', 'settings'
  detail text                   -- optional short text, never PII
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log (at);

-- Manual review queue (NEW-46)
CREATE TABLE IF NOT EXISTS review_queue (
  id text PRIMARY KEY NOT NULL,
  created_at text NOT NULL,
  source text NOT NULL,         -- 'sms' | 'csv' | 'ocr' | 'aa'
  payload_json text NOT NULL,
  confidence real NOT NULL,
  status text NOT NULL DEFAULT 'pending'   -- 'pending' | 'approved' | 'rejected'
);
CREATE INDEX IF NOT EXISTS idx_review_status ON review_queue (status, created_at);
`;
