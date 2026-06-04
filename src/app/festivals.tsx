/**
 * NEW-36 — festival pots.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listPots, upsertPot, deletePot, FESTIVAL_PRESETS, type FestivalPot } from '@/lib/festivals';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
import { formatINR, parseToPaise } from '@/lib/money';
import dayjs from 'dayjs';
import { useUiStore } from '@/stores/ui';

export default function Festivals() {
  const showToast = useUiStore((s) => s.showToast);
  const [pots, setPots] = useState<FestivalPot[]>([]);
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [start, setStart] = useState(dayjs().format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().add(7, 'day').format('YYYY-MM-DD'));

  const reload = async () => setPots(await listPots());
  useEffect(() => { reload(); }, []);

  const onPreset = (p: (typeof FESTIVAL_PRESETS)[number]) => {
    setName(p.name);
    setStart(dayjs().format('YYYY-MM-DD'));
    setEnd(dayjs().add(p.durationDays, 'day').format('YYYY-MM-DD'));
  };

  const onAdd = async () => {
    const p = parseToPaise(budget);
    if (!name.trim() || !p) {
      showToast({ tone: 'error', text: 'Name + budget required' });
      return;
    }
    await upsertPot({ name: name.trim(), budgetPaise: p, spentPaise: 0, startDate: start, endDate: end });
    reload();
    setName('');
    setBudget('');
  };

  return (
    <AppShell>
      <ScreenHeader title="Festival pots" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New pot</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['3'] }}>
            {FESTIVAL_PRESETS.map((p) => (
              <Chip key={p.name} label={p.name} onPress={() => onPreset(p)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Name" value={name} onChangeText={setName} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Budget (₹)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Start (YYYY-MM-DD)" value={start} onChangeText={setStart} />
          <View style={{ height: spacing['2'] }} />
          <Input label="End (YYYY-MM-DD)" value={end} onChangeText={setEnd} />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add pot" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {pots.map((p) => (
          <Card key={p.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{p.name}</Text>
                <Text variant="caption" tone="muted">
                  {p.startDate} → {p.endDate}
                </Text>
              </View>
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deletePot(p.id); reload(); }} />
            </View>
            <View style={{ height: spacing['3'] }} />
            <BudgetProgressBar spent={p.spentPaise} total={p.budgetPaise} />
            <View style={{ height: spacing['1'] }} />
            <Text variant="caption" tone="muted">{formatINR(p.spentPaise)} of {formatINR(p.budgetPaise)}</Text>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
