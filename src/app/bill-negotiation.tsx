/**
 * NEW-34 — bill negotiation tracker.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, IconButton, GlassCard } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  listNegotiations,
  upsertNegotiation,
  deleteNegotiation,
  lifetimeSavingsPaise,
  type Negotiation,
} from '@/lib/bill-negotiation';
import { formatINR, parseToPaise } from '@/lib/money';

export default function BillNegotiation() {
  const [items, setItems] = useState<Negotiation[]>([]);
  const [payee, setPayee] = useState('');
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');
  const [freq, setFreq] = useState<Negotiation['frequency']>('monthly');
  const [savings, setSavings] = useState(0);

  const reload = async () => {
    setItems(await listNegotiations());
    setSavings(await lifetimeSavingsPaise());
  };
  useEffect(() => { reload(); }, []);

  const onAdd = async () => {
    const b = parseToPaise(before);
    const a = parseToPaise(after);
    if (!payee.trim() || !b || !a) return;
    await upsertNegotiation({ payee: payee.trim(), beforePaise: b, afterPaise: a, frequency: freq });
    setPayee(''); setBefore(''); setAfter('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Bill negotiation" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <GlassCard intensity="medium">
          <Text variant="caption" tone="muted">LIFETIME SAVINGS</Text>
          <Text variant="display" tabular tone="income">{formatINR(savings)}</Text>
        </GlassCard>
        <Card>
          <Text variant="h3">Add</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Payee" value={payee} onChangeText={setPayee} placeholder="ACT Internet" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Before (₹)" value={before} onChangeText={setBefore} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <Input label="After (₹)" value={after} onChangeText={setAfter} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            {(['monthly', 'yearly', 'one-off'] as const).map((f) => (
              <Chip key={f} label={f} selected={f === freq} onPress={() => setFreq(f)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Save" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {items.map((n) => (
          <Card key={n.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{n.payee}</Text>
                <Text variant="caption" tone="income">
                  {formatINR(n.beforePaise)} → {formatINR(n.afterPaise)} · saving {formatINR(n.beforePaise - n.afterPaise)}/{n.frequency}
                </Text>
              </View>
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deleteNegotiation(n.id); reload(); }} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
