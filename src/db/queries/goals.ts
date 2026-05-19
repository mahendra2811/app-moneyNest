/**
 * Savings goals — C1.
 * Net worth ledger — C2.
 * Investments — C3.
 * Loans / EMI — C4.
 * Debts / lending — C6.
 * Insurance — C21.
 *
 * Common shape: settings-backed JSON arrays. Same simple persistence model
 * as voice macros — no schema migration required, easy to evolve.
 */
import { getSetting, setSetting } from './settings';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';

// ───────────────────────────── Goals (C1) ─────────────────────────────
export type SavingsGoal = {
  id: string;
  name: string;
  targetPaise: number;
  currentPaise: number;
  dueDate?: string;
  accountId?: string;
  createdAt: string;
};
export async function listGoals(): Promise<SavingsGoal[]> {
  return (await getSetting<SavingsGoal[]>('goals.list')) ?? [];
}
export async function upsertGoal(g: Omit<SavingsGoal, 'id' | 'createdAt'> & { id?: string }): Promise<SavingsGoal> {
  const all = await listGoals();
  const id = g.id ?? uuidv7();
  const next: SavingsGoal = {
    id,
    name: g.name,
    targetPaise: g.targetPaise,
    currentPaise: g.currentPaise,
    ...(g.dueDate ? { dueDate: g.dueDate } : {}),
    ...(g.accountId ? { accountId: g.accountId } : {}),
    createdAt: all.find((x) => x.id === id)?.createdAt ?? now(),
  };
  await setSetting('goals.list', [...all.filter((x) => x.id !== id), next]);
  return next;
}
export async function deleteGoal(id: string): Promise<void> {
  const all = await listGoals();
  await setSetting('goals.list', all.filter((g) => g.id !== id));
}

// ─────────────────────────── Investments (C3) ─────────────────────────
export type Investment = {
  id: string;
  name: string;
  kind: 'stock' | 'mutual_fund' | 'fd' | 'gold' | 'other';
  unitsOrPaise: number;
  costPaise: number;
  currentValuePaise: number;
  notes?: string;
};
export async function listInvestments(): Promise<Investment[]> {
  return (await getSetting<Investment[]>('investments.list')) ?? [];
}
export async function upsertInvestment(inv: Investment): Promise<void> {
  const all = await listInvestments();
  await setSetting('investments.list', [...all.filter((x) => x.id !== inv.id), inv]);
}
export async function deleteInvestment(id: string): Promise<void> {
  const all = await listInvestments();
  await setSetting('investments.list', all.filter((x) => x.id !== id));
}

// ─────────────────────────────── Loans (C4) ───────────────────────────
export type Loan = {
  id: string;
  name: string;
  principalPaise: number;
  outstandingPaise: number;
  apr: number;
  monthlyEmiPaise: number;
  startDate: string;
  termMonths: number;
};
export async function listLoans(): Promise<Loan[]> {
  return (await getSetting<Loan[]>('loans.list')) ?? [];
}
export async function upsertLoan(loan: Loan): Promise<void> {
  const all = await listLoans();
  await setSetting('loans.list', [...all.filter((x) => x.id !== loan.id), loan]);
}
export async function deleteLoan(id: string): Promise<void> {
  const all = await listLoans();
  await setSetting('loans.list', all.filter((x) => x.id !== id));
}

// ────────────────────────────── Debts (C6) ────────────────────────────
export type Debt = {
  id: string;
  person: string;
  amountPaise: number;
  direction: 'owed_to_me' | 'i_owe';
  note?: string;
  createdAt: string;
  settledAt?: string;
};
export async function listDebts(): Promise<Debt[]> {
  return (await getSetting<Debt[]>('debts.list')) ?? [];
}
export async function upsertDebt(d: Omit<Debt, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<Debt> {
  const all = await listDebts();
  const id = d.id ?? uuidv7();
  const next: Debt = {
    id,
    person: d.person,
    amountPaise: d.amountPaise,
    direction: d.direction,
    ...(d.note ? { note: d.note } : {}),
    createdAt: d.createdAt ?? now(),
    ...(d.settledAt ? { settledAt: d.settledAt } : {}),
  };
  await setSetting('debts.list', [...all.filter((x) => x.id !== id), next]);
  return next;
}
export async function deleteDebt(id: string): Promise<void> {
  const all = await listDebts();
  await setSetting('debts.list', all.filter((x) => x.id !== id));
}

// ──────────────────────────── Insurance (C21) ─────────────────────────
export type Insurance = {
  id: string;
  policyName: string;
  provider: string;
  premiumPaise: number;
  renewalDate: string;
  sumAssuredPaise?: number;
  type: 'health' | 'life' | 'vehicle' | 'home' | 'other';
};
export async function listInsurance(): Promise<Insurance[]> {
  return (await getSetting<Insurance[]>('insurance.list')) ?? [];
}
export async function upsertInsurance(i: Insurance): Promise<void> {
  const all = await listInsurance();
  await setSetting('insurance.list', [...all.filter((x) => x.id !== i.id), i]);
}
export async function deleteInsurance(id: string): Promise<void> {
  const all = await listInsurance();
  await setSetting('insurance.list', all.filter((x) => x.id !== id));
}
