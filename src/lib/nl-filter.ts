/**
 * Natural-language → filter — NEW-11.
 *
 * Reuses our voice-parser bag of patterns to interpret short queries like
 *   "food > 500 last month"
 *   "swiggy this year"
 *   "rent above ₹5000"
 *   "transfers"
 *
 * Returns a partial ListOpts the existing search uses.
 */
import type { ListOpts } from '@/db/queries/transactions';
import { parseAmountToPaise } from './voice-parser-numbers';
import { SYNONYMS } from './voice-parser-synonyms';
import dayjs from 'dayjs';

export function interpret(query: string): ListOpts {
  const q = query.trim().toLowerCase();
  const out: ListOpts = {};

  // Type
  if (/\b(income|salary|received|credit)\b/.test(q)) out.type = 'income';
  else if (/\btransfer(red|s)?\b/.test(q)) out.type = 'transfer';
  else if (/\b(expense|spent|paid|debit)\b/.test(q)) out.type = 'expense';

  // Period
  const today = dayjs();
  if (/\blast month\b/.test(q)) {
    const ref = today.subtract(1, 'month');
    out.startDate = ref.startOf('month').toISOString();
    out.endDate = ref.endOf('month').toISOString();
  } else if (/\bthis month\b/.test(q)) {
    out.startDate = today.startOf('month').toISOString();
    out.endDate = today.endOf('month').toISOString();
  } else if (/\blast (\d+) days?\b/.test(q)) {
    const m = q.match(/\blast (\d+) days?\b/);
    if (m && m[1]) out.startDate = today.subtract(Number(m[1]), 'day').toISOString();
  } else if (/\bthis year\b/.test(q)) {
    out.startDate = today.startOf('year').toISOString();
  } else if (/\blast year\b/.test(q)) {
    const ref = today.subtract(1, 'year');
    out.startDate = ref.startOf('year').toISOString();
    out.endDate = ref.endOf('year').toISOString();
  }

  // Amount comparators
  const gt = q.match(/(?:>|above|over|more than)\s*([0-9,.]+|\w+ \w+|\w+)/);
  if (gt && gt[1]) {
    const p = parseAmountToPaise(gt[1]);
    if (p !== null) out.minAmount = p;
  }
  const lt = q.match(/(?:<|below|under|less than)\s*([0-9,.]+|\w+ \w+|\w+)/);
  if (lt && lt[1]) {
    const p = parseAmountToPaise(lt[1]);
    if (p !== null) out.maxAmount = p;
  }

  // Free-text search: pick the first synonym word OR pass the whole query as search
  for (const tok of q.split(/\s+/)) {
    if (tok in SYNONYMS) {
      out.search = tok;
      break;
    }
  }
  if (!out.search && !out.type && q.length > 0 && !/\b(month|year|day|days|above|below|over|under|more than|less than|this|last)\b/.test(q)) {
    out.search = q;
  }
  return out;
}
