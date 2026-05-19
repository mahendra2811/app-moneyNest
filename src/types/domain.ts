export type TxType = 'expense' | 'income' | 'transfer';
export type TxSource = 'manual' | 'voice' | 'widget' | 'recurring';
export type CategoryType = 'expense' | 'income';
export type AccountType = 'cash' | 'bank' | 'upi' | 'wallet' | 'credit_card';
export type ThemeMode = 'light' | 'dark' | 'system';

export type {
  Account,
  NewAccount,
  Category,
  NewCategory,
  Transaction,
  NewTransaction,
  Budget,
  NewBudget,
  Recurring,
  NewRecurring,
  Setting,
  BackupLogEntry,
} from '@/db/schema';
