/**
 * UI preferences — F6, F7, F8, F19, F20.
 *
 * Density (compact/comfortable/spacious), tab order, one-handed mode,
 * font scale, theme variant. Persisted in MMKV-backed settings table.
 */
import { getSetting, setSetting } from '@/db/queries/settings';

export type Density = 'compact' | 'comfortable' | 'spacious';
export type ThemeVariant = 'default' | 'sunset' | 'forest' | 'ink' | 'material-you';
export type TabId = 'index' | 'transactions' | 'reports' | 'settings';

export type UiPrefs = {
  density: Density;
  themeVariant: ThemeVariant;
  fontScale: number;             // 1.0 default; 1.0–1.6
  oneHandedMode: boolean;
  tabOrder: TabId[];
  hiddenTabs: TabId[];
  perAccountColorWash: boolean;
  smartDefaults: boolean;        // F10 — learn last-used pairing
  aodSpend: boolean;             // F11 — flag for AOD tile registration
};

const DEFAULTS: UiPrefs = {
  density: 'comfortable',
  themeVariant: 'default',
  fontScale: 1,
  oneHandedMode: false,
  tabOrder: ['index', 'transactions', 'reports', 'settings'],
  hiddenTabs: [],
  perAccountColorWash: false,
  smartDefaults: true,
  aodSpend: false,
};

export async function getUiPrefs(): Promise<UiPrefs> {
  const v = await getSetting<Partial<UiPrefs>>('ui.prefs');
  return { ...DEFAULTS, ...(v ?? {}) };
}

export async function setUiPrefs(patch: Partial<UiPrefs>): Promise<UiPrefs> {
  const cur = await getUiPrefs();
  const next = { ...cur, ...patch };
  await setSetting('ui.prefs', next);
  return next;
}

export const THEME_VARIANTS: Record<ThemeVariant, { accent: string; gradient: [string, string, string] }> = {
  default:        { accent: '#16A34A', gradient: ['#DBEAFE', '#EDE9FE', '#FCE7F3'] },
  sunset:         { accent: '#F97316', gradient: ['#FEF3C7', '#FED7AA', '#FECACA'] },
  forest:         { accent: '#15803D', gradient: ['#D1FAE5', '#A7F3D0', '#86EFAC'] },
  ink:            { accent: '#0F172A', gradient: ['#E2E8F0', '#CBD5E1', '#94A3B8'] },
  'material-you': { accent: '#16A34A', gradient: ['#DBEAFE', '#EDE9FE', '#FCE7F3'] }, // wallpaper accent comes from native on Android 12+
};
