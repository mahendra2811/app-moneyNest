import * as Notifications from 'expo-notifications';
import type { NotificationsService } from './types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationsService: NotificationsService = {
  async requestPermission() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  },
  async scheduleLocal({ id, title, body, triggerAtIso }) {
    const trigger = triggerAtIso ? { date: new Date(triggerAtIso) } : null;
    const request: Parameters<typeof Notifications.scheduleNotificationAsync>[0] = {
      content: { title, body },
      trigger: trigger as Notifications.NotificationTriggerInput | null,
    };
    if (id) request.identifier = id;
    return Notifications.scheduleNotificationAsync(request);
  },
  async cancel(id: string) {
    await Notifications.cancelScheduledNotificationAsync(id);
  },
  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
