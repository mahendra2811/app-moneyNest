import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import {
  getAllCategories,
  getCategoryById,
  type CategoryType,
} from '@/db/queries/categories';

export function useCategories(opts?: {
  type?: CategoryType;
  includeArchived?: boolean;
}) {
  const counter = useInvalidateStore((s) => s.categories);
  const key = `${opts?.type ?? 'all'}-${opts?.includeArchived ? 1 : 0}`;
  return useAsyncQuery(() => getAllCategories(opts), [counter, key]);
}

export function useCategory(id: string | undefined) {
  const counter = useInvalidateStore((s) => s.categories);
  return useAsyncQuery(
    () => (id ? getCategoryById(id) : Promise.resolve(null)),
    [counter, id],
  );
}
