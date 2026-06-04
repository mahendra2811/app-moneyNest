import { notificationsService } from '@/platform/notifications';
import { getSetting, setSetting } from '@/db/queries/settings';
import dayjs from 'dayjs';

/**
 * Fire a local notification if backup is stale. Default cadence 14 days;
 * 0 disables. Tracks `backup.reminderFiredAt` to avoid repeat firings.
 */
export async function maybeFireBackupReminder(): Promise<void> {
  const cadenceDays = (await getSetting<number>('backup.reminderDays')) ?? 14;
  if (!cadenceDays || cadenceDays <= 0) return;

  const lastBackup = await getSetting<string>('backup.lastAt');
  const lastFired = await getSetting<string>('backup.reminderFiredAt');

  const ref = lastBackup ?? lastFired;
  if (!ref) {
    // Brand-new install — give the user a week before nagging
    await setSetting('backup.reminderFiredAt', new Date().toISOString());
    return;
  }
  const ageDays = dayjs().diff(dayjs(ref), 'day');
  if (ageDays < cadenceDays) return;

  await notificationsService.scheduleLocal({
    title: 'Time to back up',
    body: `It's been ${ageDays} days. Tap to back up your data.`,
  });
  await setSetting('backup.reminderFiredAt', new Date().toISOString());
}
