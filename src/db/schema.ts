import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';

export const accounts = sqliteTable(
  'accounts',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type', {
      enum: ['cash', 'bank', 'upi', 'wallet', 'credit_card'],
    }).notNull(),
    startingBalancePaise: integer('starting_balance_paise').notNull().default(0),
    currency: text('currency').notNull().default('INR'),
    icon: text('icon').notNull(),
    color: text('color').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    idxArchived: index('idx_accounts_archived').on(table.isArchived),
    idxSort: index('idx_accounts_sort').on(table.sortOrder),
  }),
);

export const categories = sqliteTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type', { enum: ['expense', 'income'] }).notNull(),
    icon: text('icon').notNull(),
    color: text('color').notNull(),
    parentId: text('parent_id'),
    slug: text('slug'),
    sortOrder: integer('sort_order').notNull().default(0),
    isArchived: integer('is_archived', { mode: 'boolean' }).notNull().default(false),
    isDefault: integer('is_default', { mode: 'boolean' }).notNull().default(false),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    idxType: index('idx_categories_type').on(table.type),
    idxArchived: index('idx_categories_archived').on(table.isArchived),
    idxParent: index('idx_categories_parent').on(table.parentId),
    idxSort: index('idx_categories_sort').on(table.sortOrder),
    idxSlug: index('idx_categories_slug').on(table.slug),
  }),
);

export const transactions = sqliteTable(
  'transactions',
  {
    id: text('id').primaryKey(),
    amountPaise: integer('amount_paise').notNull(),
    type: text('type', { enum: ['expense', 'income', 'transfer'] }).notNull(),
    accountId: text('account_id').notNull(),
    toAccountId: text('to_account_id'),
    categoryId: text('category_id'),
    note: text('note'),
    payee: text('payee'),
    occurredAt: text('occurred_at').notNull(),
    source: text('source', {
      enum: ['manual', 'voice', 'widget', 'recurring'],
    }).notNull().default('manual'),
    recurringId: text('recurring_id'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    deletedAt: text('deleted_at'),
  },
  (table) => ({
    idxOccurredAt: index('idx_tx_occurred_at').on(table.occurredAt),
    idxAccount: index('idx_tx_account').on(table.accountId),
    idxCategory: index('idx_tx_category').on(table.categoryId),
    idxType: index('idx_tx_type').on(table.type),
    idxDeleted: index('idx_tx_deleted').on(table.deletedAt),
    idxRecurring: index('idx_tx_recurring').on(table.recurringId),
    idxMonthlyByCategory: index('idx_tx_monthly_cat').on(
      table.occurredAt,
      table.categoryId,
      table.deletedAt,
    ),
  }),
);

export const budgets = sqliteTable(
  'budgets',
  {
    id: text('id').primaryKey(),
    categoryId: text('category_id').notNull(),
    period: text('period', { enum: ['monthly'] }).notNull().default('monthly'),
    amountPaise: integer('amount_paise').notNull(),
    rollover: integer('rollover', { mode: 'boolean' }).notNull().default(false),
    alertAt80: integer('alert_at_80', { mode: 'boolean' }).notNull().default(true),
    alertAt100: integer('alert_at_100', { mode: 'boolean' }).notNull().default(true),
    startDate: text('start_date').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    idxCategory: uniqueIndex('uidx_budget_category').on(table.categoryId),
  }),
);

export const recurring = sqliteTable(
  'recurring',
  {
    id: text('id').primaryKey(),
    templateJson: text('template_json').notNull(),
    frequency: text('frequency', {
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
    }).notNull(),
    intervalCount: integer('interval_count').notNull().default(1),
    dayOfMonth: integer('day_of_month'),
    dayOfWeek: integer('day_of_week'),
    startDate: text('start_date').notNull(),
    endDate: text('end_date'),
    nextRunAt: text('next_run_at').notNull(),
    lastRunAt: text('last_run_at'),
    isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => ({
    idxNextRun: index('idx_rec_next_run').on(table.nextRunAt, table.isActive),
  }),
);

export const settings = sqliteTable('settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const backupLog = sqliteTable(
  'backup_log',
  {
    id: text('id').primaryKey(),
    filePath: text('file_path').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    isEncrypted: integer('is_encrypted', { mode: 'boolean' }).notNull().default(true),
    txnCount: integer('txn_count').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => ({
    idxCreatedAt: index('idx_backup_created').on(table.createdAt),
  }),
);

// Phase 8 additions ---------------------------------------------------

export const snapshots = sqliteTable(
  'snapshots',
  {
    id: text('id').primaryKey(),
    takenAt: text('taken_at').notNull(),
    accountTotalPaise: integer('account_total_paise').notNull(),
    investmentTotalPaise: integer('investment_total_paise').notNull(),
    loanTotalPaise: integer('loan_total_paise').notNull(),
    netWorthPaise: integer('net_worth_paise').notNull(),
  },
  (t) => ({ idxTakenAt: index('idx_snapshots_taken_at').on(t.takenAt) }),
);

export const auditLog = sqliteTable(
  'audit_log',
  {
    id: text('id').primaryKey(),
    at: text('at').notNull(),
    action: text('action').notNull(),
    scope: text('scope').notNull(),
    detail: text('detail'),
  },
  (t) => ({ idxAt: index('idx_audit_at').on(t.at) }),
);

export const reviewQueue = sqliteTable(
  'review_queue',
  {
    id: text('id').primaryKey(),
    createdAt: text('created_at').notNull(),
    source: text('source').notNull(),
    payloadJson: text('payload_json').notNull(),
    confidence: integer('confidence').notNull(),
    status: text('status').notNull().default('pending'),
  },
  (t) => ({ idxStatus: index('idx_review_status').on(t.status, t.createdAt) }),
);

export type Snapshot = typeof snapshots.$inferSelect;
export type NewSnapshot = typeof snapshots.$inferInsert;
export type AuditEntry = typeof auditLog.$inferSelect;
export type NewAuditEntry = typeof auditLog.$inferInsert;
export type ReviewItem = typeof reviewQueue.$inferSelect;
export type NewReviewItem = typeof reviewQueue.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type Recurring = typeof recurring.$inferSelect;
export type NewRecurring = typeof recurring.$inferInsert;
export type Setting = typeof settings.$inferSelect;
export type BackupLogEntry = typeof backupLog.$inferSelect;
