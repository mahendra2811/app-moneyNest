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
          <LinkRow icon="trending-up" label="Finance hub" onPress={() => router.push('/finance' as never)} />
          <LinkRow icon="award" label={`Recap ${new Date().getUTCFullYear()}`} onPress={() => router.push(`/recap/${new Date().getUTCFullYear()}` as never)} />
          <LinkRow icon="users" label="Splits" onPress={() => router.push('/splits' as never)} />
          <LinkRow icon="qr-code" label="UPI request" onPress={() => router.push('/upi-request' as never)} />
          <LinkRow icon="share-2" label="Share monthly report" onPress={() => router.push('/share-report' as never)} />
          <LinkRow icon="archive" label="Backup history" onPress={() => router.push('/backup-history' as never)} />
          <LinkRow icon="trash" label="Trash" onPress={() => router.push('/trash' as never)} />
          <LinkRow icon="settings-2" label="Cleanup (aliases, merge)" onPress={() => router.push('/admin' as never)} />
          <LinkRow icon="palette" label="Display" onPress={() => router.push('/ui-prefs' as never)} />
          <LinkRow icon="shield" label="Security" onPress={() => router.push('/security' as never)} />
          <LinkRow icon="globe" label="Language & format" onPress={() => router.push('/locale' as never)} />
          <LinkRow icon="star" label="moneyNest Plus" onPress={() => router.push('/premium' as never)} />
        </Card>

        <Card>
          <Text variant="h3">Smart finance</Text>
          <View style={{ height: spacing['3'] }} />
          <LinkRow icon="link" label="Account Aggregator" onPress={() => router.push('/aa' as never)} />
          <LinkRow icon="gauge" label="Credit score" onPress={() => router.push('/credit-score' as never)} />
          <LinkRow icon="zap" label="Smart rules" onPress={() => router.push('/smart-rules' as never)} />
          <LinkRow icon="piggy-bank" label="Pay yourself first" onPress={() => router.push('/pyf' as never)} />
          <LinkRow icon="calculator" label="What-if" onPress={() => router.push('/what-if' as never)} />
          <LinkRow icon="trending-up" label="Forecast" onPress={() => router.push('/forecast' as never)} />
          <LinkRow icon="search" label="Ask in plain language" onPress={() => router.push('/nl-search' as never)} />
          <LinkRow icon="calendar-check" label="Monthly close" onPress={() => router.push('/monthly-close' as never)} />
          <LinkRow icon="line-chart" label="Net worth history" onPress={() => router.push('/net-worth-history' as never)} />
          <LinkRow icon="calendar" label="Calendar view" onPress={() => router.push('/transactions/calendar' as never)} />
          <LinkRow icon="banknote" label="EMI prepay" onPress={() => router.push('/emi-prepay' as never)} />
          <LinkRow icon="arrow-up-down" label="Price changes" onPress={() => router.push('/price-watch' as never)} />
          <LinkRow icon="hand-coins" label="Bill negotiation" onPress={() => router.push('/bill-negotiation' as never)} />
        </Card>

        <Card>
          <Text variant="h3">Life events</Text>
          <View style={{ height: spacing['3'] }} />
          <LinkRow icon="party-popper" label="Festival pots" onPress={() => router.push('/festivals' as never)} />
          <LinkRow icon="heart-handshake" label="Zakat / charity" onPress={() => router.push('/zakat' as never)} />
          <LinkRow icon="user-cog" label="Profiles" onPress={() => router.push('/profiles' as never)} />
          <LinkRow icon="plane" label="Trips" onPress={() => router.push('/trips' as never)} />
          <LinkRow icon="baby" label="Family" onPress={() => router.push('/family' as never)} />
          <LinkRow icon="folder-lock" label="Document vault" onPress={() => router.push('/vault' as never)} />
          <LinkRow icon="shield" label="Warranties" onPress={() => router.push('/warranty' as never)} />
          <LinkRow icon="scroll" label="Nominees" onPress={() => router.push('/nominee' as never)} />
        </Card>

        <Card>
          <Text variant="h3">Power</Text>
          <View style={{ height: spacing['3'] }} />
          <LinkRow icon="inbox" label="Review queue" onPress={() => router.push('/review-queue' as never)} />
          <LinkRow icon="file-clock" label="Audit log" onPress={() => router.push('/audit-log' as never)} />
          <LinkRow icon="layout-dashboard" label="Customise home" onPress={() => router.push('/dashboard-customize' as never)} />
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
