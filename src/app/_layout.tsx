import '../../global.css';
import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { ThemeProvider, useThemeContext } from '@/theme';
import { ToastHost } from '@/components/primitives';
import { runMigrations } from '@/db/client';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function StatusBarBinding() {
  const { tokens } = useThemeContext();
  return <StatusBar style={tokens.statusBar === 'dark' ? 'dark' : 'light'} />;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    // System Inter on Android 12+; bundle later if needed
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
      } catch (e) {
        if (__DEV__) console.warn('migration failed', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => undefined);
      }
    })();
  }, []);

  if (!ready && !fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBarBinding />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }} />
        <ToastHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
