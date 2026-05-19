/**
 * Full-text search — B1.
 *
 * Builds an FTS5 virtual table on transactions(note, payee) and keeps it
 * in sync via triggers. Falls back to LIKE when FTS5 is unavailable.
 */
import { db } from '../client';
import { sql } from 'drizzle-orm';

let ftsAvailable: boolean | null = null;

export async function ensureFts(): Promise<boolean> {
  if (ftsAvailable !== null) return ftsAvailable;
  try {
    await db.run(sql`
      CREATE VIRTUAL TABLE IF NOT EXISTS transactions_fts USING fts5(
        note, payee, content='transactions', content_rowid='rowid'
      )
    `);
    await db.run(sql`
      CREATE TRIGGER IF NOT EXISTS transactions_ai AFTER INSERT ON transactions BEGIN
        INSERT INTO transactions_fts(rowid, note, payee) VALUES (new.rowid, new.note, new.payee);
      END
    `);
    await db.run(sql`
      CREATE TRIGGER IF NOT EXISTS transactions_ad AFTER DELETE ON transactions BEGIN
        INSERT INTO transactions_fts(transactions_fts, rowid, note, payee) VALUES ('delete', old.rowid, old.note, old.payee);
      END
    `);
    await db.run(sql`
      CREATE TRIGGER IF NOT EXISTS transactions_au AFTER UPDATE ON transactions BEGIN
        INSERT INTO transactions_fts(transactions_fts, rowid, note, payee) VALUES ('delete', old.rowid, old.note, old.payee);
        INSERT INTO transactions_fts(rowid, note, payee) VALUES (new.rowid, new.note, new.payee);
      END
    `);
    // Backfill (cheap; FTS5 rebuild)
    await db.run(sql`
      INSERT INTO transactions_fts(transactions_fts) VALUES ('rebuild')
    `);
    ftsAvailable = true;
  } catch {
    ftsAvailable = false;
  }
  return ftsAvailable;
}

export async function searchTransactionIds(query: string, limit = 200): Promise<string[]> {
  const ok = await ensureFts();
  if (!ok) return [];
  const safe = query.replace(/[^a-z0-9 ]/gi, ' ').trim();
  if (!safe) return [];
  const rows = await db.all<{ id: string }>(sql`
    SELECT t.id AS id
    FROM transactions_fts f
    JOIN transactions t ON t.rowid = f.rowid
    WHERE transactions_fts MATCH ${`${safe}*`}
      AND t.deleted_at IS NULL
    ORDER BY t.occurred_at DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => r.id);
}
