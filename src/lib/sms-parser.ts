/**
 * Bank/UPI SMS parser — A1.
 *
 * We do NOT read SMS automatically (SMS_READ is Play Console restricted
 * and requires a special grant). Instead, the user pastes a single SMS
 * into the import screen and we parse it. Same parser, no permission.
 *
 * Patterns cover the most common Indian bank and UPI app templates:
 *   HDFC: "Spent Rs.250 on UPI to swiggy on 2026-05-19. Avl bal Rs.18,200."
 *   SBI:  "Dear SBI User, Your A/c xx1234 - debited by 250.00 on 19May26 ..."
 *   ICICI/Axis/Kotak: variants of the above
 *   PhonePe: "Paid Rs 250 to Swiggy from HDFC Bank using PhonePe."
 *   GPay:    "Paid Rs.250 to Zomato. UPI Ref ..."
 */
import type { TxType } from '@/db/queries/transactions';

export type SmsParseResult = {
  amountPaise: number;
  type: TxType;
  payee: string | null;
  bankHint: string | null;
  source: 'sms';
  raw: string;
  confidence: number;
};

const DEBIT_KEYWORDS = [/\bspent\b/i, /\bdebited\b/i, /\bpaid\b/i, /\bpurchase\b/i, /\bwithdrawn\b/i];
const CREDIT_KEYWORDS = [/\bcredited\b/i, /\bdeposit\b/i, /\bsalary\b/i, /\breceived\b/i, /\brefund\b/i];

const AMOUNT_RE = /(?:rs\.?|inr|₹)\s*([0-9][0-9,]*(?:\.\d{1,2})?)/i;
const PAYEE_PATTERNS: RegExp[] = [
  /\bto\s+([A-Za-z][A-Za-z0-9 .&-]{2,40}?)(?:\s+(?:on|from|using|via|ref|using)\b|\.|$)/i,
  /\bat\s+([A-Za-z][A-Za-z0-9 .&-]{2,40}?)(?:\s+(?:on|from|using|via|ref)\b|\.|$)/i,
];
const BANK_RE = /\b(HDFC|SBI|ICICI|Axis|Kotak|IDBI|BOB|PNB|Canara|Union|Yes|RBL|IndusInd|Federal|Citi|HSBC|Standard|Paytm|PhonePe|GPay|Google Pay|BHIM)\b/i;

function parseAmount(text: string): number | null {
  const m = text.match(AMOUNT_RE);
  if (!m || !m[1]) return null;
  const cleaned = m[1].replace(/,/g, '');
  const rupees = Number(cleaned);
  if (!Number.isFinite(rupees) || rupees <= 0) return null;
  return Math.round(rupees * 100);
}

function detectType(text: string): TxType {
  for (const re of CREDIT_KEYWORDS) if (re.test(text)) return 'income';
  for (const re of DEBIT_KEYWORDS) if (re.test(text)) return 'expense';
  return 'expense';
}

function detectPayee(text: string): string | null {
  for (const re of PAYEE_PATTERNS) {
    const m = text.match(re);
    if (m && m[1]) {
      return m[1].trim().replace(/\s+/g, ' ');
    }
  }
  return null;
}

function detectBank(text: string): string | null {
  const m = text.match(BANK_RE);
  return m?.[1] ?? null;
}

export function parseSms(raw: string): SmsParseResult | null {
  if (!raw || raw.trim() === '') return null;
  const amountPaise = parseAmount(raw);
  if (amountPaise === null) return null;
  const type = detectType(raw);
  const payee = detectPayee(raw);
  const bankHint = detectBank(raw);

  let confidence = 0.4;
  if (payee) confidence += 0.3;
  if (bankHint) confidence += 0.15;
  if (CREDIT_KEYWORDS.some((re) => re.test(raw)) || DEBIT_KEYWORDS.some((re) => re.test(raw))) {
    confidence += 0.15;
  }
  confidence = Math.min(1, confidence);

  return {
    amountPaise,
    type,
    payee,
    bankHint,
    source: 'sms',
    raw,
    confidence,
  };
}
