import { palette } from '@/brand/colors';

export type ResolvedThemeMode = 'light' | 'dark';
export type StatusBarStyle = 'light' | 'dark';

export type ThemeTokens = {
  mode: ResolvedThemeMode;
  bg: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textFaint: string;
  textOnAccent: string;
  accent: string;
  accentSoft: string;
  accentStrong: string;
  expense: string;
  expenseSoft: string;
  income: string;
  transfer: string;
  transferSoft: string;
  warning: string;
  warningSoft: string;
  glassTint: string;
  glassBorder: string;
  glassGlow: string;
  gradient: readonly [string, string, string];
  statusBar: StatusBarStyle;
};

export const lightTheme: ThemeTokens = {
  mode: 'light',
  bg: palette.surfaceAlt,
  surface: palette.surface,
  surfaceMuted: palette.surfaceAlt,
  border: palette.border,
  borderStrong: palette.borderStrong,
  text: palette.ink,
  textMuted: palette.inkSoft,
  textFaint: palette.inkMute,
  textOnAccent: palette.white,
  accent: palette.primary,
  accentSoft: palette.primaryLight,
  accentStrong: palette.primaryDark,
  expense: palette.danger,
  expenseSoft: palette.dangerLight,
  income: palette.primary,
  transfer: palette.info,
  transferSoft: palette.infoLight,
  warning: palette.warning,
  warningSoft: palette.warningLight,
  glassTint: 'rgba(255, 255, 255, 0.55)',
  glassBorder: 'rgba(255, 255, 255, 0.30)',
  glassGlow: 'rgba(255, 255, 255, 0.40)',
  gradient: [palette.gradLight1, palette.gradLight2, palette.gradLight3],
  statusBar: 'dark',
};
