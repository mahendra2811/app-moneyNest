import { common } from './en/common';
import { onboarding } from './en/onboarding';
import { home } from './en/home';
import { transactions } from './en/transactions';
import { voice } from './en/voice';
import { reports } from './en/reports';
import { settings } from './en/settings';
import { budgets } from './en/budgets';
import { recurring } from './en/recurring';
import { backup } from './en/backup';
import { errors } from './en/errors';
import { emptyStates } from './en/empty-states';

export const dictionary = {
  common,
  onboarding,
  home,
  transactions,
  voice,
  reports,
  settings,
  budgets,
  recurring,
  backup,
  errors,
  emptyStates,
} as const;

type Dict = typeof dictionary;

type DottedKeys<T, P extends string = ''> = {
  [K in keyof T & string]: T[K] extends string
    ? `${P}${K}`
    : T[K] extends Record<string, unknown>
      ? DottedKeys<T[K], `${P}${K}.`>
      : never;
}[keyof T & string];

export type CopyKey = DottedKeys<Dict>;

const lookup = (key: string): string | undefined => {
  const parts = key.split('.');
  let cur: unknown = dictionary;
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return undefined;
    }
  }
  return typeof cur === 'string' ? cur : undefined;
};

const interpolate = (
  template: string,
  params?: Record<string, string | number>,
): string => {
  if (!params) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, k: string) =>
    params[k] !== undefined ? String(params[k]) : `{{${k}}}`,
  );
};

export function t(key: CopyKey, params?: Record<string, string | number>): string {
  const v = lookup(key);
  if (v === undefined) {
    if (__DEV__) console.warn(`[copy] missing key: ${key}`);
    return key;
  }
  return interpolate(v, params);
}
