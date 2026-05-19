/**
 * Smart category / payee rules — NEW-20.
 *
 * IF (payee matches "swiggy" AND amount < 500) THEN category="Food"
 *
 * Pure evaluator + persistence; the apply hook lives in
 * src/lib/smart-rules-apply.ts (which imports the DB).
 */

export type RuleCondition =
  | { kind: 'payee_contains'; value: string }
  | { kind: 'note_contains'; value: string }
  | { kind: 'amount_lt'; value: number }       // paise
  | { kind: 'amount_gt'; value: number }
  | { kind: 'type_is'; value: 'expense' | 'income' | 'transfer' }
  | { kind: 'account_is'; value: string };

export type RuleAction =
  | { kind: 'set_category'; categoryId: string }
  | { kind: 'set_payee'; value: string }
  | { kind: 'add_note_tag'; value: string }    // e.g. "#80C"
  | { kind: 'mark_state'; value: 'pending' | 'cleared' };

export type SmartRule = {
  id: string;
  name: string;
  conditions: RuleCondition[];
  actions: RuleAction[];
  enabled: boolean;
  createdAt: string;
};

export type TxLike = {
  payee: string | null;
  note: string | null;
  amountPaise: number;
  type: 'expense' | 'income' | 'transfer';
  accountId: string;
};

export function matches(rule: SmartRule, tx: TxLike): boolean {
  if (!rule.enabled) return false;
  for (const c of rule.conditions) {
    switch (c.kind) {
      case 'payee_contains':
        if (!tx.payee || !tx.payee.toLowerCase().includes(c.value.toLowerCase())) return false;
        break;
      case 'note_contains':
        if (!tx.note || !tx.note.toLowerCase().includes(c.value.toLowerCase())) return false;
        break;
      case 'amount_lt':
        if (!(tx.amountPaise < c.value)) return false;
        break;
      case 'amount_gt':
        if (!(tx.amountPaise > c.value)) return false;
        break;
      case 'type_is':
        if (tx.type !== c.value) return false;
        break;
      case 'account_is':
        if (tx.accountId !== c.value) return false;
        break;
    }
  }
  return true;
}

export type AppliedRule = {
  categoryId?: string;
  payee?: string;
  noteAppend?: string;
  state?: 'pending' | 'cleared';
};

export function applyActions(rule: SmartRule): AppliedRule {
  const out: AppliedRule = {};
  for (const a of rule.actions) {
    if (a.kind === 'set_category') out.categoryId = a.categoryId;
    else if (a.kind === 'set_payee') out.payee = a.value;
    else if (a.kind === 'add_note_tag') out.noteAppend = (out.noteAppend ?? '') + ' ' + a.value;
    else if (a.kind === 'mark_state') out.state = a.value;
  }
  return out;
}
