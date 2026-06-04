import { create } from 'zustand';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'moneynest.session' });

type SessionState = {
  lastAccountId: string | null;
  lastExpenseCategoryId: string | null;
  lastIncomeCategoryId: string | null;
  lastTxType: 'expense' | 'income' | 'transfer';
  setLastAccountId: (id: string) => void;
  setLastExpenseCategoryId: (id: string) => void;
  setLastIncomeCategoryId: (id: string) => void;
  setLastTxType: (t: 'expense' | 'income' | 'transfer') => void;
};

const readStr = (key: string): string | null => storage.getString(key) ?? null;

export const useSessionStore = create<SessionState>((set) => ({
  lastAccountId: readStr('session.lastAccountId'),
  lastExpenseCategoryId: readStr('session.lastExpenseCategoryId'),
  lastIncomeCategoryId: readStr('session.lastIncomeCategoryId'),
  lastTxType: (storage.getString('session.lastTxType') as
    | 'expense'
    | 'income'
    | 'transfer'
    | undefined) ?? 'expense',
  setLastAccountId: (id) => {
    storage.set('session.lastAccountId', id);
    set({ lastAccountId: id });
  },
  setLastExpenseCategoryId: (id) => {
    storage.set('session.lastExpenseCategoryId', id);
    set({ lastExpenseCategoryId: id });
  },
  setLastIncomeCategoryId: (id) => {
    storage.set('session.lastIncomeCategoryId', id);
    set({ lastIncomeCategoryId: id });
  },
  setLastTxType: (t) => {
    storage.set('session.lastTxType', t);
    set({ lastTxType: t });
  },
}));
