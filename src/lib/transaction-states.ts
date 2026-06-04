/**
 * Extended transaction states — NEW-16 (refunds), NEW-17 (holds),
 * NEW-19 (cashback link), NEW-2 (CLUPI), NEW-3 (BNPL), NEW-7 (CBDC).
 *
 * Stored as metadata JSON on the transaction's note OR in a parallel
 * `tx_meta.<id>` settings key. We pick the settings approach to avoid
 * a schema migration.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type TxState = 'posted' | 'pending' | 'authorized' | 'cleared' | 'refunded' | 'returned';

export type ExtendedSource =
  | 'manual'
  | 'voice'
  | 'widget'
  | 'recurring'
  | 'sms'
  | 'csv'
  | 'aa'                // NEW-1 Account Aggregator
  | 'upi'
  | 'clupi'             // NEW-2 Credit Line on UPI
  | 'bnpl'              // NEW-3 Buy Now Pay Later
  | 'cbdc';             // NEW-7 CBDC / e-Rupee

export type TxMeta = {
  state?: TxState;
  refundOfTxId?: string;
  cashbackOfTxId?: string;
  bnplProvider?: 'lazypay' | 'simpl' | 'slice' | 'zest' | 'klarna' | 'other';
  bnplDueDateIso?: string;
  bnplInstalmentNumber?: number;
  bnplInstalmentTotal?: number;
  cluPiBank?: string;
  virtualOfAccountId?: string;
  source?: ExtendedSource;
};

export async function getTxMeta(txId: string): Promise<TxMeta | null> {
  return (await getSetting<TxMeta>(`tx_meta.${txId}`)) ?? null;
}
export async function setTxMeta(txId: string, meta: TxMeta): Promise<void> {
  await setSetting(`tx_meta.${txId}`, meta);
}
export async function patchTxMeta(txId: string, patch: Partial<TxMeta>): Promise<void> {
  const cur = (await getTxMeta(txId)) ?? {};
  await setTxMeta(txId, { ...cur, ...patch });
}
