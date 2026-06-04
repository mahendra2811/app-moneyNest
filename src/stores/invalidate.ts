import { create } from 'zustand';

/**
 * Lightweight invalidation bus. Bump a counter; hooks subscribe via
 * useInvalidate(key) and re-run their queries when it changes.
 */
type InvalidateState = {
  accounts: number;
  categories: number;
  transactions: number;
  budgets: number;
  recurring: number;
  settings: number;
  bumpAccounts: () => void;
  bumpCategories: () => void;
  bumpTransactions: () => void;
  bumpBudgets: () => void;
  bumpRecurring: () => void;
  bumpSettings: () => void;
  bumpAll: () => void;
};

export const useInvalidateStore = create<InvalidateState>((set) => ({
  accounts: 0,
  categories: 0,
  transactions: 0,
  budgets: 0,
  recurring: 0,
  settings: 0,
  bumpAccounts: () => set((s) => ({ accounts: s.accounts + 1 })),
  bumpCategories: () => set((s) => ({ categories: s.categories + 1 })),
  bumpTransactions: () =>
    set((s) => ({
      transactions: s.transactions + 1,
      budgets: s.budgets + 1,
      accounts: s.accounts + 1,
    })),
  bumpBudgets: () => set((s) => ({ budgets: s.budgets + 1 })),
  bumpRecurring: () => set((s) => ({ recurring: s.recurring + 1 })),
  bumpSettings: () => set((s) => ({ settings: s.settings + 1 })),
  bumpAll: () =>
    set((s) => ({
      accounts: s.accounts + 1,
      categories: s.categories + 1,
      transactions: s.transactions + 1,
      budgets: s.budgets + 1,
      recurring: s.recurring + 1,
      settings: s.settings + 1,
    })),
}));
