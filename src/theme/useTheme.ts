import { useContext } from 'react';
import { ThemeContext, type ThemeContextValue } from './ThemeProvider';

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be inside ThemeProvider');
  return ctx;
}

export function useTheme() {
  return useThemeContext().tokens;
}
