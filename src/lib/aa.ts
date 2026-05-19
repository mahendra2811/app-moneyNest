/**
 * Account Aggregator (AA) contract — NEW-1.
 *
 * RBI-regulated, consent-based bank-data API. We define the contract so
 * the rest of the app codes against `AAProvider`. The real provider
 * (Setu, OneMoney, Anumati) plugs in via a future config — V1 ships a
 * mock provider that returns demo data so the screens render.
 */

export type FIType = 'DEPOSIT' | 'TERM_DEPOSIT' | 'RECURRING_DEPOSIT' | 'MUTUAL_FUNDS' | 'EQUITIES' | 'INSURANCE_POLICIES' | 'NPS';

export type AAConsentRequest = {
  purpose: string;
  fiTypes: FIType[];
  fromIso: string;
  toIso: string;
};

export type AAAccount = {
  fiType: FIType;
  fipName: string;          // e.g. "HDFC Bank"
  maskedNumber: string;     // "XXXXXX1234"
  currency: string;
  balancePaise: number;
};

export type AATransaction = {
  fipAccountId: string;
  amountPaise: number;
  type: 'CREDIT' | 'DEBIT';
  occurredAt: string;
  narration: string;
  reference?: string;
};

export interface AAProvider {
  isAvailable(): Promise<boolean>;
  /** Returns a consent handle (a URL or token the user authenticates with). */
  requestConsent(req: AAConsentRequest): Promise<{ consentHandle: string; url?: string }>;
  /** Poll consent status. */
  checkConsent(consentHandle: string): Promise<'PENDING' | 'ACTIVE' | 'REJECTED' | 'EXPIRED'>;
  fetchAccounts(consentHandle: string): Promise<AAAccount[]>;
  fetchTransactions(consentHandle: string, accountKey: string): Promise<AATransaction[]>;
  revoke(consentHandle: string): Promise<void>;
}

/**
 * Mock provider. Always available, returns small canned dataset, gets used
 * until the user plugs in a real provider in the integration screen.
 */
export const mockAAProvider: AAProvider = {
  async isAvailable() {
    return true;
  },
  async requestConsent(_req: AAConsentRequest) {
    return { consentHandle: `mock-${Date.now()}`, url: 'about:blank' };
  },
  async checkConsent() {
    return 'ACTIVE';
  },
  async fetchAccounts() {
    return [
      { fiType: 'DEPOSIT', fipName: 'HDFC Bank', maskedNumber: 'XXXXXX1234', currency: 'INR', balancePaise: 5_42_00_00 },
      { fiType: 'DEPOSIT', fipName: 'ICICI Bank', maskedNumber: 'XXXXXX5678', currency: 'INR', balancePaise: 1_28_50_00 },
    ];
  },
  async fetchTransactions() {
    return [];
  },
  async revoke() {
    return;
  },
};
