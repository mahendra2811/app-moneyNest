/**
 * Travel mode — NEW-41. A trip is a named, dated range; transactions in
 * that range can be auto-tagged. Foreign currency stored verbatim;
 * conversion at view time via src/lib/currency.ts.
 */
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from './id';
import { now } from './date';

export type Trip = {
  id: string;
  name: string;
  destination?: string;
  currency: string;            // ISO 4217, e.g. 'JPY'
  dailyBudgetPaise: number;    // in destination currency * 100
  startDate: string;
  endDate: string;
  createdAt: string;
};

export async function listTrips(): Promise<Trip[]> {
  return (await getSetting<Trip[]>('trips.list')) ?? [];
}

export async function upsertTrip(t: Omit<Trip, 'id' | 'createdAt'> & { id?: string }): Promise<Trip> {
  const all = await listTrips();
  const id = t.id ?? uuidv7();
  const next: Trip = {
    id,
    name: t.name,
    ...(t.destination ? { destination: t.destination } : {}),
    currency: t.currency,
    dailyBudgetPaise: t.dailyBudgetPaise,
    startDate: t.startDate,
    endDate: t.endDate,
    createdAt: all.find((x) => x.id === id)?.createdAt ?? now(),
  };
  await setSetting('trips.list', [...all.filter((x) => x.id !== id), next]);
  return next;
}

export async function deleteTrip(id: string): Promise<void> {
  const all = await listTrips();
  await setSetting('trips.list', all.filter((x) => x.id !== id));
}
