import React, { createContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Appearance, type ColorSchemeName } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { resolveTokens, type ThemeMode, type ResolvedTheme, type ThemeTokens } from './tokens';

const storage = new MMKV({ id: 'moneynest.settings' });
const THEME_KEY = 'theme.mode';
const GLASS_KEY = 'theme.glass';

export type ThemeContextValue = {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  glassEnabled: boolean;
  tokens: ThemeTokens;
  setMode: (m: ThemeMode) => void;
  setGlassEnabled: (b: boolean) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

function readMode(): ThemeMode {
  const v = storage.getString(THEME_KEY);
  if (v === 'light' || v === 'dark' || v === 'system') return v;
  return 'system';
}
function readGlass(): boolean {
  const v = storage.getBoolean(GLASS_KEY);
  return v ?? true;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readMode());
  const [glassEnabled, setGlassState] = useState<boolean>(() => readGlass());
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme(),
  );

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme),
    );
    return () => sub.remove();
  }, []);

  const resolved: ResolvedTheme = useMemo(() => {
    if (mode === 'system') return systemScheme === 'dark' ? 'dark' : 'light';
    return mode;
  }, [mode, systemScheme]);

  const tokens = useMemo(
    () => resolveTokens(resolved, glassEnabled),
    [resolved, glassEnabled],
  );

  const setMode = useCallback((m: ThemeMode) => {
    storage.set(THEME_KEY, m);
    setModeState(m);
  }, []);
  const setGlassEnabled = useCallback((b: boolean) => {
    storage.set(GLASS_KEY, b);
    setGlassState(b);
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, resolved, glassEnabled, tokens, setMode, setGlassEnabled }),
    [mode, resolved, glassEnabled, tokens, setMode, setGlassEnabled],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
