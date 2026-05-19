import React, { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Switch, Input, Button } from '@/components/primitives';
import { AccountPicker } from '@/components/transaction/AccountPicker';
import { spacing } from '@/brand/spacing';
import { getSetting, setSetting } from '@/db/queries/settings';
import { useUiStore } from '@/stores/ui';

export default function RoundUpScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [enabled, setEnabled] = useState(false);
  const [unit, setUnit] = useState('10');
  const [savingsId, setSavingsId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setEnabled((await getSetting<boolean>('roundup.enabled')) ?? false);
      setUnit(String((await getSetting<number>('roundup.unitRupees')) ?? 10));
      setSavingsId((await getSetting<string>('roundup.savingsAccountId')) ?? null);
    })();
  }, []);

  const onSave = async () => {
    await setSetting('roundup.enabled', enabled);
    await setSetting('roundup.unitRupees', Number(unit) || 10);
    if (savingsId) await setSetting('roundup.savingsAccountId', savingsId);
    showToast({ tone: 'success', text: 'Saved' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Round-up savings" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="body" tone="muted">
            Every expense rounds up to the next multiple of ₹{unit}, and the difference is
            auto-transferred to a savings account.
          </Text>
          <View style={{ height: spacing['4'] }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyMed">Enabled</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Round-up unit (₹)" value={unit} onChangeText={setUnit} keyboardType="number-pad" />
          <View style={{ height: spacing['3'] }} />
          <Text variant="small" tone="muted">
            Savings account
          </Text>
          <View style={{ height: spacing['2'] }} />
          <AccountPicker value={savingsId} onChange={setSavingsId} />
        </Card>
        <Button label="Save" fullWidth size="lg" onPress={onSave} />
      </ScrollView>
    </AppShell>
  );
}
