/**
 * Persistent quick-add notification — A3.
 *
 * Posts a low-priority, ongoing notification that taps through to the
 * /transaction/new screen. On Android 14+, ongoing notifications can
 * still be dismissed; that's fine, the user can re-toggle from Settings.
 */
import * as Notifications from 'expo-notifications';

const ID = 'quick-add-persistent';

export async function enablePersistentQuickAdd(): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    identifier: ID,
    content: {
      title: 'moneyNest — quick add',
      body: 'Tap to add a transaction',
      sticky: true,
      autoDismiss: false,
      data: { deepLink: '/transaction/new' },
      categoryIdentifier: 'quick-add',
    },
    trigger: null,
  });
}

export async function disablePersistentQuickAdd(): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(ID);
  await Notifications.dismissNotificationAsync(ID);
}
