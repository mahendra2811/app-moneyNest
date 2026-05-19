import { db } from '@/db/client';
import {
  accounts as accountsTbl,
  categories as categoriesTbl,
  transactions as txTbl,
  budgets as budgetsTbl,
  recurring as recurringTbl,
  settings as settingsTbl,
  backupLog as backupLogTbl,
} from '@/db/schema';
import * as SecureStore from 'expo-secure-store';
import { MMKV } from 'react-native-mmkv';
import { seedIfEmpty } from '@/db/seed';

const SECRET_KEYS = ['passphrase.canary', 'biometric.secret'];

export async function wipeAllData(): Promise<void> {
  await db.delete(txTbl);
  await db.delete(budgetsTbl);
  await db.delete(recurringTbl);
  await db.delete(categoriesTbl);
  await db.delete(accountsTbl);
  await db.delete(settingsTbl);
  await db.delete(backupLogTbl);

  // MMKV stores
  for (const id of ['moneynest.settings', 'moneynest.session']) {
    try {
      const mmkv = new MMKV({ id });
      mmkv.clearAll();
    } catch {
      /* ignore */
    }
  }
  for (const key of SECRET_KEYS) {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  }

  // Re-seed defaults so the next launch lands in a sane state.
  await seedIfEmpty();
}
