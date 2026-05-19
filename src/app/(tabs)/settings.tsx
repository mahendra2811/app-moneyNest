import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Switch, Divider, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { t } from '@/copy';
import { useThemeContext, useTheme } from '@/theme';
import { brand } from '@/brand/name';
import { useSettingsStore } from '@/stores/settings';

export default function SettingsScreen() {
  const router = useRouter();
  const { mode, setMode, glassEnabled, setGlassEnabled } = useThemeContext();
  const settings = useSettingsStore();
  return (
    <AppShell>
      <ScreenHeader title={t('settings.title')} showBack={false} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">{t('settings.appearance')}</Text>
          <View style={{ height: spacing['4'] }} />
          <Row label={t('settings.theme')}>
            <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
              <ThemeButton current={mode === 'light'} onPress={() => setMode('light')} label={t('settings.themeLight')} />
              <ThemeButton current={mode === 'dark'} onPress={() => setMode('dark')} label={t('settings.themeDark')} />
              <ThemeButton current={mode === 'system'} onPress={() => setMode('system')} label={t('settings.themeSystem')} />
            </View>
          </Row>
          <Divider style={{ marginVertical: spacing['4'] }} />
          <Row label={t('settings.glassEnabled')} sub={t('settings.glassEnabledBody')}>
            <Switch value={glassEnabled} onValueChange={setGlassEnabled} />
          </Row>
        </Card>

        <Card>
          <Text variant="h3">Manage</Text>
          <View style={{ height: spacing['3'] }} />
          <LinkRow icon="layers" label="Categories" onPress={() => router.push('/categories' as never)} />
          <LinkRow icon="wallet" label="Accounts" onPress={() => router.push('/accounts' as never)} />
          <LinkRow icon="target" label="Budgets" onPress={() => router.push('/budgets' as never)} />
          <LinkRow icon="repeat" label="Recurring" onPress={() => router.push('/recurring' as never)} />
          <LinkRow icon="shield-check" label="Backup" onPress={() => router.push('/backup' as never)} />
          <LinkRow icon="upload" label="Import (SMS / CSV)" onPress={() => router.push('/import' as never)} />
          <LinkRow icon="mic" label="Voice macros" onPress={() => router.push('/macros' as never)} />
          <LinkRow icon="sparkles" label="Round-up savings" onPress={() => router.push('/round-up' as never)} />
        </Card>

        <Card>
          <Text variant="h3">Notifications</Text>
          <View style={{ height: spacing['3'] }} />
          <Row label="Budget alerts">
            <Switch value={settings.budgetAlerts} onValueChange={settings.setBudgetAlerts} />
          </Row>
          <Divider style={{ marginVertical: spacing['3'] }} />
          <Row label="Recurring reminders">
            <Switch value={settings.recurringReminders} onValueChange={settings.setRecurringReminders} />
          </Row>
        </Card>

        <Card>
          <Text variant="h3">Privacy</Text>
          <View style={{ height: spacing['3'] }} />
          <Row label={t('settings.analytics')} sub={t('settings.analyticsBody')}>
            <Switch value={settings.analyticsOptIn} onValueChange={settings.setAnalyticsOptIn} />
          </Row>
          <Divider style={{ marginVertical: spacing['3'] }} />
          <Row label={t('settings.crashes')} sub={t('settings.crashesBody')}>
            <Switch value={settings.crashesOptIn} onValueChange={settings.setCrashesOptIn} />
          </Row>
          <Divider style={{ marginVertical: spacing['3'] }} />
          <Row label={t('settings.lock')} sub={t('settings.lockBody')}>
            <Switch value={settings.lockEnabled} onValueChange={settings.setLockEnabled} />
          </Row>
          <Divider style={{ marginVertical: spacing['3'] }} />
          <LinkRow icon="trash-2" label={t('settings.deleteAllData')} onPress={() => router.push('/danger-zone' as never)} />
        </Card>

        <Card>
          <Text variant="h3">{t('settings.about')}</Text>
          <View style={{ height: spacing['3'] }} />
          <Row label={t('settings.version')}>
            <Text variant="body" tone="muted">
              {brand.name} 1.0.0
            </Text>
          </Row>
        </Card>
      </ScrollView>
    </AppShell>
  );
}

function Row({
  label,
  sub,
  children,
}: {
  label: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flex: 1, paddingRight: spacing['4'] }}>
        <Text variant="bodyMed">{label}</Text>
        {sub ? (
          <Text variant="caption" tone="muted">
            {sub}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function LinkRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing['3'],
        paddingVertical: spacing['3'],
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Icon name={icon} size="sm" tone="muted" />
      <Text variant="body" style={{ flex: 1 }}>
        {label}
      </Text>
      <Icon name="chevron-right" size="sm" tone="muted" />
    </Pressable>
  );
}

function ThemeButton({
  current,
  onPress,
  label,
}: {
  current: boolean;
  onPress: () => void;
  label: string;
}) {
  const tt = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: spacing['3'],
        paddingVertical: spacing['2'],
        borderRadius: radius.sm,
        borderColor: current ? tt.accent : tt.border,
        borderWidth: 1,
        backgroundColor: current ? tt.accentSoft : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text variant="caption" style={{ color: current ? tt.accent : tt.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}
