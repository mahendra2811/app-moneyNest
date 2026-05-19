import { eq } from 'drizzle-orm';
import { db } from '../client';
import { settings } from '../schema';
import { now } from '@/lib/date';

export type SettingsKey =
  | 'theme'
  | 'glass.enabled'
  | 'lock.enabled'
  | 'lock.requireOnLaunch'
  | 'lock.requireForBackup'
  | 'analytics.optIn'
  | 'crashes.optIn'
  | 'budget.alerts'
  | 'recurring.reminders'
  | 'backup.lastAt'
  | 'backup.reminderDays'
  | 'backup.canary'
  | 'onboarding.completedAt'
  | 'session.lastAccountId'
  | 'session.lastExpenseCategoryId'
  | 'session.lastIncomeCategoryId'
  | 'session.lastTxType'
  | 'recurring.lastChecked'
  | string;

export async function getSetting<T = unknown>(key: SettingsKey): Promise<T | null> {
  const rows = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  const row = rows[0];
  if (!row) return null;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return null;
  }
}

export async function setSetting<T = unknown>(key: SettingsKey, value: T): Promise<void> {
  const ts = now();
  const json = JSON.stringify(value);
  const existing = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  if (existing[0]) {
    await db.update(settings).set({ value: json, updatedAt: ts }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value: json, updatedAt: ts });
  }
}

export async function deleteSetting(key: SettingsKey): Promise<void> {
  await db.delete(settings).where(eq(settings.key, key));
}
