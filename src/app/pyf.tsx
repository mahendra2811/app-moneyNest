/**
 * NEW-23 — Pay yourself first config screen.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Switch } from '@/components/primitives';
import { AccountPicker } from '@/components/transaction/AccountPicker';
import { spacing } from '@/brand/spacing';
import { getConfig, setConfig } from '@/lib/pay-yourself-first';
import { useUiStore } from '@/stores/ui';
import { parseToPaise } from '@/lib/money';

export default function PYFScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [enabled, setEnabled] = useState(false);
  const [pct, setPct] = useState('20');
  const [savingsAccountId, setSavingsAccountId] = useState<string | null>(null);
  const [minIncome, setMinIncome] = useState('10000');

  useEffect(() => {
    (async () => {
      const c = await getConfig();
      setEnabled(c.enabled);
      setPct(String(c.percent));
      setSavingsAccountId(c.savingsAccountId);
      setMinIncome(String(c.minIncomePaise / 100));
    })();
  }, []);

  const onSave = async () => {
    const minP = parseToPaise(minIncome) ?? 0;
    await setConfig({
      enabled,
      percent: Math.max(0, Math.min(100, Number(pct) || 0)),
      savingsAccountId,
      minIncomePaise: minP,
    });
    showToast({ tone: 'success', text: 'Saved' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Pay yourself first" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="small" tone="muted">
            On every income above the threshold, auto-transfer this % to your savings account.
          </Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text variant="bodyMed">Enabled</Text>
            <Switch value={enabled} onValueChange={setEnabled} />
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Percent (0–100)" value={pct} onChangeText={setPct} keyboardType="number-pad" />
          <View style={{ height: spacing['3'] }} />
          <Input label="Min income to trigger (₹)" value={minIncome} onChangeText={setMinIncome} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Text variant="small" tone="muted">Savings account</Text>
          <View style={{ height: spacing['2'] }} />
          <AccountPicker value={savingsAccountId} onChange={setSavingsAccountId} />
        </Card>
        <Button label="Save" fullWidth size="lg" onPress={onSave} />
      </ScrollView>
    </AppShell>
  );
}
