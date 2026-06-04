import { darkTheme } from './dark';
import type { ThemeTokens } from './light';

export const glassDarkTheme: ThemeTokens = {
  ...darkTheme,
  glassTint: 'rgba(30, 41, 59, 0.45)',
  glassBorder: 'rgba(255, 255, 255, 0.10)',
  glassGlow: 'rgba(255, 255, 255, 0.18)',
};
