/**
 * Bill due-date tracker — C18.
 *
 * Maintains an extra "due-date" view on top of recurring entries that the
 * user marks as bills. The flag is stored on the recurring row's template
 * as `{ "kind": "bill" }`.
 */
import { db } from '@/db/client';
import { recurring } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { notificationsService } from '@/platform/notifications';
import dayjs from 'dayjs';
import { getSetting, setSetting } from '@/db/queries/settings';

export async function fireBillReminders(): Promise<void> {
  const rows = await db.select().from(recurring).where(eq(recurring.isActive, true));
  for (const r of rows) {
    let tpl: { kind?: string; payee?: string; amountPaise?: number };
    try {
      tpl = JSON.parse(r.templateJson);
    } catch {
      continue;
    }
    if (tpl.kind !== 'bill') continue;
    const due = dayjs(r.nextRunAt);
    const today = dayjs();
    const daysUntil = due.diff(today, 'day');
    if (daysUntil < 0 || daysUntil > 2) continue;
    const key = `bill.notified.${r.id}.${due.format('YYYY-MM-DD')}`;
    const already = await getSetting<boolean>(key);
    if (already) continue;
    await notificationsService.scheduleLocal({
      title: `Bill due in ${daysUntil}d`,
      body: `${tpl.payee ?? 'Bill'} · ${tpl.amountPaise ? `₹${(tpl.amountPaise / 100).toFixed(0)}` : ''}`,
    });
    await setSetting(key, true);
  }
}
