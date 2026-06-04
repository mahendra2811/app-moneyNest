export interface NotificationsService {
  requestPermission(): Promise<boolean>;
  scheduleLocal(opts: {
    id?: string;
    title: string;
    body: string;
    triggerAtIso?: string;
  }): Promise<string>;
  cancel(id: string): Promise<void>;
  cancelAll(): Promise<void>;
}
