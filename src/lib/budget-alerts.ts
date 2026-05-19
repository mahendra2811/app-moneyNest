import { notificationsService } from '@/platform/notifications';
import { getAllBudgets } from '@/db/queries/budgets';
import { getSetting, setSetting } from '@/db/queries/settings';
import { formatINR } from './money';

/**
 * Check this-month budgets and fire local notifications for 80% / 100%
 * crossings. De-dupes via `budget.alerted.{budgetId}.{YYYY-MM}` settings keys.
 */
export async function checkBudgetAlerts(): Promise<void> {
  const budgets = await getAllBudgets();
  const ym = new Date().toISOString().slice(0, 7);
  for (const b of budgets) {
    if (b.amountPaise <= 0) continue;
    const ratio = b.spentPaise / b.amountPaise;
    const name = b.category?.name ?? 'Budget';
    if (ratio >= 1 && b.alertAt100) {
      const key = `budget.alerted.100.${b.id}.${ym}`;
      const alreadyFired = await getSetting<boolean>(key);
      if (!alreadyFired) {
        await notificationsService.scheduleLocal({
          title: `${name} over 100%`,
          body: `You're over budget by ${formatINR(b.spentPaise - b.amountPaise)}.`,
        });
        await setSetting(key, true);
      }
    } else if (ratio >= 0.8 && b.alertAt80) {
      const key = `budget.alerted.80.${b.id}.${ym}`;
      const alreadyFired = await getSetting<boolean>(key);
      if (!alreadyFired) {
        await notificationsService.scheduleLocal({
          title: `${name} at 80%`,
          body: `You've used ${formatINR(b.spentPaise)} of ${formatINR(b.amountPaise)}.`,
        });
        await setSetting(key, true);
      }
    }
  }
}
