import { lightTheme } from './light';
import { darkTheme } from './dark';
import { glassLightTheme } from './glass-light';
import { glassDarkTheme } from './glass-dark';
import type { ThemeTokens } from './light';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function resolveTokens(
  mode: ResolvedTheme,
  glassEnabled: boolean,
): ThemeTokens {
  if (glassEnabled) {
    return mode === 'dark' ? glassDarkTheme : glassLightTheme;
  }
  return mode === 'dark' ? darkTheme : lightTheme;
}

export type { ThemeTokens };
