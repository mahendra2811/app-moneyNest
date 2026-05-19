import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import {
  getAllBudgets,
  getBudgetForCategory,
  getBudgetTotals,
} from '@/db/queries/budgets';

export function useBudgets() {
  const counter = useInvalidateStore((s) => s.budgets);
  return useAsyncQuery(() => getAllBudgets(), [counter]);
}

export function useBudgetForCategory(categoryId: string | undefined) {
  const counter = useInvalidateStore((s) => s.budgets);
  return useAsyncQuery(
    () => (categoryId ? getBudgetForCategory(categoryId) : Promise.resolve(null)),
    [counter, categoryId],
  );
}

export function useBudgetTotals() {
  const counter = useInvalidateStore((s) => s.budgets);
  return useAsyncQuery(() => getBudgetTotals(), [counter]);
}
