import '../../global.css';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useThemeContext } from '@/theme';
import { ToastHost } from '@/components/primitives';
import { runMigrations } from '@/db/client';
import { seedIfEmpty } from '@/db/seed';
import { getSetting } from '@/db/queries/settings';
import { materializeDueRecurring } from '@/lib/recurring-materializer';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { maybeFireBackupReminder } from '@/lib/backup-reminder';
import { maybeFireWeeklyDigest } from '@/lib/digest';
import { ensureFts } from '@/db/queries/search';
import { maybeRunScheduledBackup } from '@/lib/scheduled-backup';
import { fireBillReminders } from '@/lib/bills';
import { maybeDailySnapshot } from '@/db/queries/snapshots';
import { audit } from '@/db/queries/audit';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function StatusBarBinding() {
  const { tokens } = useThemeContext();
  return <StatusBar style={tokens.statusBar === 'dark' ? 'dark' : 'light'} />;
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const completedAt = await getSetting<string>('onboarding.completedAt');
        const inOnboarding = segments[0] === '(onboarding)';
        if (!completedAt && !inOnboarding) {
          router.replace('/(onboarding)/welcome');
        }
      } catch (e) {
        if (__DEV__) console.warn('onboarding gate', e);
      } finally {
        setChecked(true);
      }
    })();
  }, [router, segments]);

  if (!checked) return null;
  return <>{children}</>;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
        await seedIfEmpty();
        await materializeDueRecurring();
        await ensureFts().catch(() => undefined);
        await checkBudgetAlerts().catch(() => undefined);
        await maybeFireBackupReminder().catch(() => undefined);
        await maybeFireWeeklyDigest().catch(() => undefined);
        await fireBillReminders().catch(() => undefined);
        await maybeRunScheduledBackup().catch(() => undefined);
        await maybeDailySnapshot().catch(() => undefined);
        await audit('login', 'settings', 'cold-start').catch(() => undefined);
      } catch (e) {
        if (__DEV__) console.warn('init failed', e);
      } finally {
        setReady(true);
        SplashScreen.hideAsync().catch(() => undefined);
      }
    })();
  }, []);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <StatusBarBinding />
        <OnboardingGate>
          <Stack
            screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}
          />
        </OnboardingGate>
        <ToastHost />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
