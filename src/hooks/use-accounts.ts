import { useInvalidateStore } from '@/stores/invalidate';
import { useAsyncQuery } from './use-async-query';
import {
  getAllAccounts,
  getAccountById,
  getAccountBalance,
} from '@/db/queries/accounts';

export function useAccounts(opts?: { includeArchived?: boolean }) {
  const counter = useInvalidateStore((s) => s.accounts);
  const key = opts?.includeArchived ? 1 : 0;
  return useAsyncQuery(() => getAllAccounts(opts), [counter, key]);
}

export function useAccount(id: string | undefined) {
  const counter = useInvalidateStore((s) => s.accounts);
  return useAsyncQuery(
    () => (id ? getAccountById(id) : Promise.resolve(null)),
    [counter, id],
  );
}

export function useAccountBalance(id: string | undefined) {
  const counter = useInvalidateStore((s) => s.accounts);
  return useAsyncQuery(
    () => (id ? getAccountBalance(id) : Promise.resolve(0)),
    [counter, id],
  );
}
