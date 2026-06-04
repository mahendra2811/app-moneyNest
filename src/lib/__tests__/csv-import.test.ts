import { describe, it, expect } from 'vitest';
import { parseCsv } from '../csv-import';

describe('parseCsv', () => {
  it('parses our own export format', () => {
    const text = `date,time,type,amount_inr,category,account,to_account,payee,note,source,id
2026-05-19,10:00,expense,250.00,Food,Cash,,Swiggy,Lunch,manual,abc
2026-05-20,11:00,income,5000.00,Salary,HDFC,,,Pay,manual,def`;
    const out = parseCsv(text);
    expect(out.rows.length).toBe(2);
    expect(out.rows[0]!.amountPaise).toBe(25000);
    expect(out.rows[0]!.type).toBe('expense');
    expect(out.rows[1]!.type).toBe('income');
  });

  it('handles debit/credit columns', () => {
    const text = `Date,Debit,Credit,Description
19/05/2026,250,,Swiggy
20/05/2026,,5000,Salary`;
    const out = parseCsv(text);
    expect(out.rows.length).toBe(2);
    expect(out.rows[0]!.type).toBe('expense');
    expect(out.rows[1]!.type).toBe('income');
  });

  it('reports invalid date error', () => {
    const text = `date,amount\nnot-a-date,100`;
    const out = parseCsv(text);
    expect(out.rows.length).toBe(0);
    expect(out.errors.length).toBe(1);
  });
});
