/**
 * Template-based anomaly explanations — NEW-14.
 *
 * Given an anomaly z-score + context, produce a one-line human reason.
 */
import { formatINR } from './money';
import type { Anomaly } from './anomaly';

export function explainAnomaly(opts: {
  amountPaise: number;
  payee?: string | null;
  categoryName?: string | null;
  anomaly: Anomaly;
}): string {
  const subj = opts.payee ?? opts.categoryName ?? 'this';
  const x = opts.anomaly.multiple;
  if (x >= 3) return `${x.toFixed(1)}× your usual at ${subj} (avg ${formatINR(Math.round(opts.anomaly.mean))})`;
  if (x >= 2) return `${x.toFixed(1)}× the average for ${subj}`;
  return `Higher than usual for ${subj}`;
}
