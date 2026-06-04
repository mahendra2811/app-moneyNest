import { useCallback } from 'react';
import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import {
  getRecentTransactions,
  listTransactions,
  getTransaction,
  getMonthTotals,
  getTodayTotals,
  getMonthSpendByCategory,
  type ListOpts,
} from '@/db/queries/transactions';

export function useRecentTransactions(limit = 10) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getRecentTransactions(limit), [counter, limit]);
}

export function useTransactionsList(opts: ListOpts) {
  const counter = useInvalidateStore((s) => s.transactions);
  const key = JSON.stringify(opts);
  return useAsyncQuery(() => listTransactions(opts), [counter, key]);
}

export function useTransaction(id: string | undefined) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => (id ? getTransaction(id) : Promise.resolve(null)), [counter, id]);
}

export function useMonthTotals(ref?: string) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getMonthTotals(ref), [counter, ref]);
}

export function useTodayTotals() {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getTodayTotals(), [counter]);
}

export function useMonthSpendByCategory(ref?: string) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getMonthSpendByCategory(ref), [counter, ref]);
}

export function useTransactionInvalidate() {
  const bump = useInvalidateStore((s) => s.bumpTransactions);
  return useCallback(() => bump(), [bump]);
}
