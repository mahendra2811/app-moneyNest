const HINDI_DIGIT: Record<string, number> = {
  ek: 1,
  do: 2,
  teen: 3,
  chaar: 4,
  char: 4,
  paanch: 5,
  panch: 5,
  chhe: 6,
  che: 6,
  saat: 7,
  sath: 7,
  aath: 8,
  ath: 8,
  nau: 9,
  naw: 9,
  das: 10,
};

const MULTIPLIER: Record<string, number> = {
  sau: 100,
  hazaar: 1000,
  hazar: 1000,
  hajaar: 1000,
  hajar: 1000,
  thousand: 1000,
  k: 1000,
  lakh: 100000,
  lac: 100000,
  lakhs: 100000,
  crore: 10000000,
  cr: 10000000,
  crores: 10000000,
};

const FILLER = new Set([
  'rupees', 'rupee', 'rs', 'rupaye', 'rupiya', 'inr', '₹', 'ka', 'ki', 'ke', 'me', 'mein', 'for', 'of', 'a', 'an',
]);

const MAX_PAISE = 100_00_00_00_00_000;

/**
 * Parse a free-form numeric expression in mixed English + Hinglish.
 * Returns paise (integer) or null.
 *
 * Handles:
 *   - bare digits: "250", "1,200", "250.50"
 *   - Hindi words: "ek sau", "do hazaar", "paanch lakh"
 *   - Multipliers with prior word: "paanch sau" = 5*100, "do hazaar" = 2*1000
 *   - Mixed: "5 hazaar" = 5*1000
 */
export function parseAmountToPaise(text: string): number | null {
  const tokens = text
    .toLowerCase()
    .replace(/₹/g, ' ')
    .replace(/,/g, '') // 1,200 -> 1200; do NOT split on the comma
    .split(/\s+/)
    .filter(Boolean)
    .filter((tk) => !FILLER.has(tk));

  if (tokens.length === 0) return null;

  let rupees = 0;
  let pending = 0;
  let foundAny = false;

  for (const tk of tokens) {
    if (/^\d+(\.\d+)?$/.test(tk)) {
      foundAny = true;
      pending = (pending || 0) + Number(tk);
      continue;
    }

    if (tk in HINDI_DIGIT) {
      foundAny = true;
      pending = (pending || 0) + HINDI_DIGIT[tk]!;
      continue;
    }

    if (tk in MULTIPLIER) {
      foundAny = true;
      const m = MULTIPLIER[tk]!;
      if (pending === 0) pending = 1;
      rupees += pending * m;
      pending = 0;
      continue;
    }
  }

  if (pending > 0) rupees += pending;

  if (!foundAny || rupees <= 0) return null;
  const paise = Math.round(rupees * 100);
  if (paise <= 0 || paise > MAX_PAISE) return null;
  return paise;
}
