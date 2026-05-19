/**
 * Locale management — H1–H2. The base dictionary stays English; other
 * languages override individual keys. Missing keys fall back to English.
 *
 * Number/date format toggles — H3, H4 — stored as locale flags.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type Locale = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'bn' | 'gu';

export type LocalePrefs = {
  language: Locale;
  numberFormat: 'indian' | 'international';
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
};

const DEFAULTS: LocalePrefs = {
  language: 'en',
  numberFormat: 'indian',
  dateFormat: 'DD/MM/YYYY',
};

export async function getLocalePrefs(): Promise<LocalePrefs> {
  const v = await getSetting<Partial<LocalePrefs>>('locale.prefs');
  return { ...DEFAULTS, ...(v ?? {}) };
}

export async function setLocalePrefs(patch: Partial<LocalePrefs>): Promise<LocalePrefs> {
  const cur = await getLocalePrefs();
  const next = { ...cur, ...patch };
  await setSetting('locale.prefs', next);
  return next;
}

export const LANGUAGE_LABELS: Record<Locale, string> = {
  en: 'English',
  hi: 'हिंदी',
  mr: 'मराठी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
};
