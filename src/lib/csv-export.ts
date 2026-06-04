import type { TransactionWithJoins } from '@/db/queries/transactions';
import { formatDate, formatTime } from './date';
import { paiseToRupees } from './money';

function csvEscape(v: string | null | undefined): string {
  if (v === null || v === undefined) return '';
  if (/[",\n]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

export function transactionsToCsv(items: TransactionWithJoins[]): string {
  const header = [
    'date',
    'time',
    'type',
    'amount_inr',
    'category',
    'account',
    'to_account',
    'payee',
    'note',
    'source',
    'id',
  ].join(',');
  const rows = items.map((it) =>
    [
      formatDate(it.occurredAt, 'YYYY-MM-DD'),
      formatTime(it.occurredAt),
      it.type,
      paiseToRupees(it.amountPaise).toFixed(2),
      csvEscape(it.category?.name ?? ''),
      csvEscape(it.account?.name ?? ''),
      csvEscape(it.toAccount?.name ?? ''),
      csvEscape(it.payee ?? ''),
      csvEscape(it.note ?? ''),
      it.source,
      it.id,
    ].join(','),
  );
  return [header, ...rows].join('\n');
}
