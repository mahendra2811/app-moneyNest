/**
 * Net worth history — NEW-29.
 * Snapshots once per local day.
 */
import { db } from '../client';
import { snapshots, type Snapshot } from '../schema';
import { asc, desc, eq, gte } from 'drizzle-orm';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';
import dayjs from 'dayjs';

import { getAccountBalance, getAllAccounts } from './accounts';
import { listInvestments, listLoans } from './goals';

export async function takeSnapshot(): Promise<Snapshot> {
  const accounts = await getAllAccounts();
  let accountTotal = 0;
  for (const a of accounts) accountTotal += await getAccountBalance(a.id);
  const invs = await listInvestments();
  const investmentTotal = invs.reduce((s, i) => s + i.currentValuePaise, 0);
  const loans = await listLoans();
  const loanTotal = loans.reduce((s, l) => s + l.outstandingPaise, 0);

  const row = {
    id: uuidv7(),
    takenAt: now(),
    accountTotalPaise: accountTotal,
    investmentTotalPaise: investmentTotal,
    loanTotalPaise: loanTotal,
    netWorthPaise: accountTotal + investmentTotal - loanTotal,
  } satisfies Snapshot;
  await db.insert(snapshots).values(row);
  return row;
}

export async function maybeDailySnapshot(): Promise<void> {
  const latest = await db.select().from(snapshots).orderBy(desc(snapshots.takenAt)).limit(1);
  const last = latest[0];
  if (last && dayjs(last.takenAt).isSame(dayjs(), 'day')) return;
  await takeSnapshot();
}

export async function listSnapshots(sinceIso?: string): Promise<Snapshot[]> {
  if (sinceIso) {
    return db.select().from(snapshots).where(gte(snapshots.takenAt, sinceIso)).orderBy(asc(snapshots.takenAt));
  }
  return db.select().from(snapshots).orderBy(asc(snapshots.takenAt));
}

export async function deleteAllSnapshots(): Promise<void> {
  await db.delete(snapshots);
}
export { eq };
