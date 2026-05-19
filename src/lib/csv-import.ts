/**
 * CSV bulk import — A12.
 *
 * Parses our own CSV export format AND common bank-statement formats.
 * Required columns (any order, case-insensitive):
 *   date, amount (or debit/credit columns), description (or narration)
 */
import type { TxType } from '@/db/queries/transactions';
import { parseToPaise } from './money';
import { now } from './date';

export type ImportedRow = {
  amountPaise: number;
  type: TxType;
  occurredAt: string;
  note: string | null;
  payee: string | null;
};

export type CsvParseResult = {
  rows: ImportedRow[];
  errors: { line: number; message: string }[];
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

function findHeaderIndex(header: string[], names: string[]): number {
  const lower = header.map((h) => h.toLowerCase());
  for (const n of names) {
    const i = lower.indexOf(n.toLowerCase());
    if (i >= 0) return i;
  }
  return -1;
}

function parseDate(input: string): string | null {
  if (!input) return null;
  // ISO direct
  if (/^\d{4}-\d{2}-\d{2}/.test(input)) {
    const d = new Date(input);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  // DD/MM/YYYY or DD-MM-YYYY
  const m = input.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
  if (m) {
    const dd = m[1]!.padStart(2, '0');
    const mm = m[2]!.padStart(2, '0');
    let yyyy = m[3]!;
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    const d = new Date(`${yyyy}-${mm}-${dd}T12:00:00.000Z`);
    if (!Number.isNaN(d.getTime())) return d.toISOString();
  }
  return null;
}

export function parseCsv(text: string): CsvParseResult {
  const out: CsvParseResult = { rows: [], errors: [] };
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return out;
  const header = splitCsvLine(lines[0]!);
  const idxDate = findHeaderIndex(header, ['date', 'transaction date', 'txn date', 'value date']);
  const idxAmt = findHeaderIndex(header, ['amount', 'amount_inr', 'amt', 'value']);
  const idxDebit = findHeaderIndex(header, ['debit', 'withdrawal']);
  const idxCredit = findHeaderIndex(header, ['credit', 'deposit']);
  const idxNote = findHeaderIndex(header, ['note', 'description', 'narration', 'particulars', 'details']);
  const idxPayee = findHeaderIndex(header, ['payee', 'merchant', 'beneficiary']);
  const idxType = findHeaderIndex(header, ['type']);

  if (idxDate < 0) {
    out.errors.push({ line: 1, message: 'No date column found' });
    return out;
  }

  for (let li = 1; li < lines.length; li++) {
    const cells = splitCsvLine(lines[li]!);
    const dateStr = cells[idxDate] ?? '';
    const date = parseDate(dateStr);
    if (!date) {
      out.errors.push({ line: li + 1, message: `Invalid date: ${dateStr}` });
      continue;
    }

    let paise: number | null = null;
    let type: TxType = 'expense';
    if (idxAmt >= 0) {
      const raw = cells[idxAmt] ?? '';
      const isNeg = raw.trim().startsWith('-');
      paise = parseToPaise(raw.replace(/^-/, ''));
      if (paise === null) {
        out.errors.push({ line: li + 1, message: `Invalid amount: ${raw}` });
        continue;
      }
      type = isNeg ? 'expense' : type;
      if (idxType >= 0) {
        const t = (cells[idxType] ?? '').toLowerCase();
        if (t === 'income' || t === 'cr' || t === 'credit') type = 'income';
        else if (t === 'transfer') type = 'transfer';
        else type = 'expense';
      }
    } else if (idxDebit >= 0 || idxCredit >= 0) {
      const debit = idxDebit >= 0 ? parseToPaise(cells[idxDebit] ?? '0') ?? 0 : 0;
      const credit = idxCredit >= 0 ? parseToPaise(cells[idxCredit] ?? '0') ?? 0 : 0;
      if (debit > 0) {
        paise = debit;
        type = 'expense';
      } else if (credit > 0) {
        paise = credit;
        type = 'income';
      } else {
        out.errors.push({ line: li + 1, message: 'Both debit and credit are zero' });
        continue;
      }
    } else {
      out.errors.push({ line: li + 1, message: 'No amount column found' });
      continue;
    }

    out.rows.push({
      amountPaise: paise,
      type,
      occurredAt: date,
      note: idxNote >= 0 ? cells[idxNote] || null : null,
      payee: idxPayee >= 0 ? cells[idxPayee] || null : null,
    });
  }
  return out;
}

export function makeNowDate(): string {
  return now();
}
