import { z } from 'zod';
import { parseAmountToPaise } from './voice-parser-numbers';
import { SYNONYMS, brandToPayee } from './voice-parser-synonyms';

export const ParseResultSchema = z.object({
  raw: z.string(),
  amountPaise: z.number().int().positive().nullable(),
  type: z.enum(['expense', 'income', 'transfer']),
  categorySlug: z.string().nullable(),
  payee: z.string().nullable(),
  accountHint: z.string().nullable(),
  toAccountHint: z.string().nullable(),
  dateHint: z.enum(['today', 'yesterday', 'parso']).nullable(),
  confidence: z.number().min(0).max(1),
  unparsedTokens: z.array(z.string()),
});
export type ParseResult = z.infer<typeof ParseResultSchema>;

const INCOME_HINTS = new Set([
  'got', 'received', 'earned', 'mila', 'milgaya', 'mili', 'aayi', 'aaya', 'salary', 'refund', 'income', 'credit',
]);
const TRANSFER_HINTS = new Set([
  'transfer', 'transferred', 'moved', 'bheja', 'bhej', 'sent',
]);
const EXPENSE_HINTS = new Set([
  'spent', 'paid', 'pay', 'bought', 'kharcha', 'diya', 'lagaya', 'expense',
]);

const DATE_HINTS: Record<string, 'today' | 'yesterday' | 'parso'> = {
  today: 'today',
  aaj: 'today',
  yesterday: 'yesterday',
  kal: 'yesterday',
  parso: 'parso',
};

const TRANSFER_SEP = new Set(['to', 'into', 'me', 'mein', 'ko', 'se']);

function detectType(tokens: string[]): {
  type: 'expense' | 'income' | 'transfer';
  hit: boolean;
} {
  let income = false;
  let transfer = false;
  let expense = false;
  for (const tk of tokens) {
    if (INCOME_HINTS.has(tk)) income = true;
    if (TRANSFER_HINTS.has(tk)) transfer = true;
    if (EXPENSE_HINTS.has(tk)) expense = true;
  }
  if (transfer) return { type: 'transfer', hit: true };
  if (income) return { type: 'income', hit: true };
  if (expense) return { type: 'expense', hit: true };
  return { type: 'expense', hit: false };
}

function detectCategorySlug(tokens: string[]): string | null {
  for (const tk of tokens) {
    const s = SYNONYMS[tk];
    if (s) return s;
  }
  return null;
}

function detectPayee(tokens: string[]): string | null {
  for (const tk of tokens) {
    const p = brandToPayee(tk);
    if (p) return p;
  }
  // Try "at X" or "from X" / "to X" pattern (capture next token)
  for (let i = 0; i < tokens.length - 1; i++) {
    if (['at', 'from'].includes(tokens[i]!)) {
      const next = tokens[i + 1]!;
      if (!SYNONYMS[next] && !/^\d/.test(next)) {
        return next.charAt(0).toUpperCase() + next.slice(1);
      }
    }
  }
  return null;
}

function detectDate(tokens: string[]): 'today' | 'yesterday' | 'parso' | null {
  for (const tk of tokens) {
    if (DATE_HINTS[tk]) return DATE_HINTS[tk];
  }
  return null;
}

function detectTransferAccounts(tokens: string[]): {
  account: string | null;
  toAccount: string | null;
} {
  // Look for "X to Y" or "X se Y" or "X ko Y"
  for (let i = 1; i < tokens.length - 1; i++) {
    if (TRANSFER_SEP.has(tokens[i]!)) {
      const left = tokens[i - 1]!;
      const right = tokens[i + 1]!;
      // Skip if left is a number
      if (!/^\d/.test(left) && !SYNONYMS[left] && !/^\d/.test(right)) {
        return { account: capitalize(left), toAccount: capitalize(right) };
      }
    }
  }
  // Just "to X" without source
  for (let i = 0; i < tokens.length - 1; i++) {
    if (tokens[i] === 'to') {
      const right = tokens[i + 1]!;
      if (!/^\d/.test(right)) return { account: null, toAccount: capitalize(right) };
    }
  }
  return { account: null, toAccount: null };
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function tokenize(raw: string): string[] {
  return raw
    .toLowerCase()
    .replace(/[₹,.]/g, (m) => (m === '.' ? '.' : ' '))
    .split(/\s+/)
    .filter(Boolean);
}

export function parseUtterance(raw: string): ParseResult {
  if (!raw || raw.trim() === '') {
    return makeFallback(raw);
  }
  const tokens = tokenize(raw);
  const amountPaise = parseAmountToPaise(raw);
  const { type, hit: typeHit } = detectType(tokens);
  const transferType = type === 'transfer';
  const transferAcc = transferType ? detectTransferAccounts(tokens) : { account: null, toAccount: null };
  const categorySlug = transferType ? null : detectCategorySlug(tokens);
  const payee = transferType ? null : detectPayee(tokens);
  const dateHint = detectDate(tokens);

  let confidence = 0;
  if (amountPaise !== null) confidence += 0.4;
  if (typeHit) confidence += 0.2;
  if (categorySlug) confidence += 0.2;
  if (payee) confidence += 0.1;
  if (dateHint) confidence += 0.1;
  if (transferAcc.account || transferAcc.toAccount) confidence += 0.05;

  const known = new Set([
    ...Object.keys(SYNONYMS),
    ...INCOME_HINTS,
    ...TRANSFER_HINTS,
    ...EXPENSE_HINTS,
    ...Object.keys(DATE_HINTS),
    'at', 'from', 'to', 'rs', 'rupees', 'rupee', 'rupaye', 'rupiya', 'inr',
    'ka', 'ki', 'ke', 'me', 'mein', 'for', 'of', 'a', 'an',
    'ek', 'do', 'teen', 'chaar', 'char', 'paanch', 'panch', 'chhe', 'che',
    'saat', 'aath', 'nau', 'das', 'sau', 'hazaar', 'hazar', 'lakh', 'lac',
    'crore', 'cr',
  ]);
  const unparsed = tokens.filter((tk) => !known.has(tk) && !/^\d+(\.\d+)?$/.test(tk));
  if (unparsed.length > 3) confidence -= 0.1;

  if (amountPaise === null) confidence = Math.min(confidence, 0.1);

  confidence = Math.max(0, Math.min(1, confidence));

  return {
    raw,
    amountPaise,
    type,
    categorySlug,
    payee,
    accountHint: transferType ? transferAcc.account : null,
    toAccountHint: transferType ? transferAcc.toAccount : null,
    dateHint,
    confidence,
    unparsedTokens: unparsed,
  };
}

function makeFallback(raw: string): ParseResult {
  return {
    raw,
    amountPaise: null,
    type: 'expense',
    categorySlug: null,
    payee: null,
    accountHint: null,
    toAccountHint: null,
    dateHint: null,
    confidence: 0,
    unparsedTokens: [],
  };
}
