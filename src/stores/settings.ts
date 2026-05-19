import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'moneynest.settings' });

type SettingsState = {
  lockEnabled: boolean;
  analyticsOptIn: boolean;
  crashesOptIn: boolean;
  budgetAlerts: boolean;
  recurringReminders: boolean;
  setLockEnabled: (b: boolean) => void;
  setAnalyticsOptIn: (b: boolean) => void;
  setCrashesOptIn: (b: boolean) => void;
  setBudgetAlerts: (b: boolean) => void;
  setRecurringReminders: (b: boolean) => void;
};

const readBool = (key: string, fallback: boolean): boolean =>
  storage.getBoolean(key) ?? fallback;

const writeBool = (key: string, v: boolean) => storage.set(key, v);

export const useSettingsStore = create<SettingsState>((set) => ({
  lockEnabled: readBool('lock.enabled', false),
  analyticsOptIn: readBool('analytics.optIn', false),
  crashesOptIn: readBool('crashes.optIn', false),
  budgetAlerts: readBool('budget.alerts', true),
  recurringReminders: readBool('recurring.reminders', true),
  setLockEnabled: (b) => {
    writeBool('lock.enabled', b);
    set({ lockEnabled: b });
  },
  setAnalyticsOptIn: (b) => {
    writeBool('analytics.optIn', b);
    set({ analyticsOptIn: b });
  },
  setCrashesOptIn: (b) => {
    writeBool('crashes.optIn', b);
    set({ crashesOptIn: b });
  },
  setBudgetAlerts: (b) => {
    writeBool('budget.alerts', b);
    set({ budgetAlerts: b });
  },
  setRecurringReminders: (b) => {
    writeBool('recurring.reminders', b);
    set({ recurringReminders: b });
  },
}));
