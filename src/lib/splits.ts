/**
 * Bill splitting — D1. Pure ledger logic (no DB imports → unit testable).
 *
 * The persistence layer lives in src/lib/splits-io.ts so the test can
 * import pure functions without pulling in expo-sqlite.
 */
import { uuidv7 } from '@/lib/id';
import { now } from './date';

export type Participant = { id: string; name: string };

export type Split = {
  id: string;
  title: string;
  createdAt: string;
  participants: Participant[];
  charges: Array<{
    id: string;
    paidById: string;
    amountPaise: number;
    splitWith: string[];        // participant ids (may include payer)
    note?: string;
    occurredAt: string;
  }>;
};

export function newSplit(title: string, participants: Participant[]): Split {
  return {
    id: uuidv7(),
    title,
    createdAt: now(),
    participants,
    charges: [],
  };
}

/**
 * Compute the net balance per participant. Positive = others owe them.
 */
export function computeBalances(split: Split): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of split.participants) out[p.id] = 0;
  for (const ch of split.charges) {
    const share = Math.round(ch.amountPaise / Math.max(1, ch.splitWith.length));
    out[ch.paidById] = (out[ch.paidById] ?? 0) + ch.amountPaise;
    for (const id of ch.splitWith) {
      out[id] = (out[id] ?? 0) - share;
    }
  }
  return out;
}
