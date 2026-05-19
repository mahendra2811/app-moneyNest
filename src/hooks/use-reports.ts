import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import { getDailySeries, getTopPayees, getMonthlyTotalsLastN } from '@/db/queries/reports';

export function useDailySeries(monthRef?: string) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getDailySeries(monthRef), [counter, monthRef]);
}

export function useTopPayees(monthRef?: string) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getTopPayees(monthRef), [counter, monthRef]);
}

export function useMonthlyTotalsLastN(months = 6) {
  const counter = useInvalidateStore((s) => s.transactions);
  return useAsyncQuery(() => getMonthlyTotalsLastN(months), [counter, months]);
}
