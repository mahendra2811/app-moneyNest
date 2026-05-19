/**
 * NEW-37 — Zakat / charity tracker.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { thisYearDonations, thisMonthDonations, zakatTarget } from '@/lib/zakat';
import { formatINR, parseToPaise } from '@/lib/money';

export default function Zakat() {
  const [yearTotal, setYearTotal] = useState(0);
  const [monthTotal, setMonthTotal] = useState(0);
  const [wealth, setWealth] = useState('500000');

  useEffect(() => {
    thisYearDonations().then(setYearTotal);
    thisMonthDonations().then(setMonthTotal);
  }, []);

  const wealthPaise = parseToPaise(wealth) ?? 0;
  const target = zakatTarget(wealthPaise);

  return (
    <AppShell>
      <ScreenHeader title="Zakat & charity" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">
            Tag any donation with #zakat, #donation, #charity, or #dharma in the note. We total them here.
          </Text>
        </Card>
        <Card>
          <Text variant="caption" tone="muted">THIS YEAR</Text>
          <Text variant="display" tabular>{formatINR(yearTotal)}</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="caption" tone="muted">THIS MONTH</Text>
          <Text variant="h2" tabular>{formatINR(monthTotal)}</Text>
        </Card>
        <Card>
          <Text variant="h3">Zakat target (2.5% on wealth)</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Net wealth (₹)" value={wealth} onChangeText={setWealth} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Text variant="caption" tone="muted">TARGET</Text>
          <Text variant="h2" tabular tone="accent">{formatINR(target)}</Text>
          <View style={{ height: spacing['1'] }} />
          <Text variant="caption" tone={yearTotal >= target ? 'income' : 'muted'}>
            {yearTotal >= target ? 'Target met for the year ✓' : `${formatINR(target - yearTotal)} to go`}
          </Text>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
