/**
 * Salary breakup + PF/EPF/NPS tracker — C13 + C19.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type SalaryBreakup = {
  basicPaise: number;
  hraPaise: number;
  specialAllowancePaise: number;
  otherPaise: number;
  effectiveFrom: string;
};

export type RetirementAccount = {
  id: string;
  kind: 'epf' | 'ppf' | 'nps';
  balancePaise: number;
  asOf: string;
  contributionsThisFyPaise: number;
};

export async function getSalary(): Promise<SalaryBreakup | null> {
  return (await getSetting<SalaryBreakup>('salary.breakup')) ?? null;
}
export async function setSalary(s: SalaryBreakup): Promise<void> {
  await setSetting('salary.breakup', s);
}

export async function listRetirementAccounts(): Promise<RetirementAccount[]> {
  return (await getSetting<RetirementAccount[]>('retirement.accounts')) ?? [];
}
export async function upsertRetirement(r: RetirementAccount): Promise<void> {
  const all = await listRetirementAccounts();
  await setSetting('retirement.accounts', [...all.filter((x) => x.id !== r.id), r]);
}
