import { lightTheme } from './light';
import type { ThemeTokens } from './light';

export const glassLightTheme: ThemeTokens = {
  ...lightTheme,
  glassTint: 'rgba(255, 255, 255, 0.40)',
  glassBorder: 'rgba(255, 255, 255, 0.55)',
  glassGlow: 'rgba(255, 255, 255, 0.65)',
};
