/**
 * Audit log — NEW-51. Records what data the app reads/writes.
 * NEVER stores amounts, notes, or payees.
 */
import { db } from '../client';
import { auditLog, type AuditEntry } from '../schema';
import { desc } from 'drizzle-orm';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

export type AuditAction = 'read' | 'write' | 'export' | 'restore' | 'delete' | 'login';
export type AuditScope = 'transactions' | 'accounts' | 'categories' | 'budgets' | 'recurring' | 'settings' | 'backup' | 'reports' | 'security';

export async function audit(action: AuditAction, scope: AuditScope, detail?: string): Promise<void> {
  await db.insert(auditLog).values({
    id: uuidv7(),
    at: now(),
    action,
    scope,
    detail: detail ?? null,
  });
}

export async function listAudit(limit = 200): Promise<AuditEntry[]> {
  return db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(limit);
}
