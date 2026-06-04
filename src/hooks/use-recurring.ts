import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import { getAllRecurring, getRecurringById } from '@/db/queries/recurring';

export function useRecurring(opts?: { includeInactive?: boolean }) {
  const counter = useInvalidateStore((s) => s.recurring);
  const key = opts?.includeInactive ? 1 : 0;
  return useAsyncQuery(() => getAllRecurring(opts), [counter, key]);
}

export function useRecurringById(id: string | undefined) {
  const counter = useInvalidateStore((s) => s.recurring);
  return useAsyncQuery(
    () => (id ? getRecurringById(id) : Promise.resolve(null)),
    [counter, id],
  );
}
