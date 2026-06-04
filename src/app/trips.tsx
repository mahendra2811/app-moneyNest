/**
 * NEW-41 — travel mode.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listTrips, upsertTrip, deleteTrip, type Trip } from '@/lib/trips';
import { parseToPaise } from '@/lib/money';
import { useUiStore } from '@/stores/ui';

export default function Trips() {
  const showToast = useUiStore((s) => s.showToast);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [name, setName] = useState('');
  const [dest, setDest] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [budget, setBudget] = useState('5000');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const reload = async () => setTrips(await listTrips());
  useEffect(() => { reload(); }, []);

  const onAdd = async () => {
    const p = parseToPaise(budget);
    if (!name.trim() || !start || !end || !p) {
      showToast({ tone: 'error', text: 'Name, dates, budget required' });
      return;
    }
    await upsertTrip({
      name: name.trim(),
      ...(dest.trim() ? { destination: dest.trim() } : {}),
      currency,
      dailyBudgetPaise: p,
      startDate: start,
      endDate: end,
    });
    reload();
    setName(''); setDest(''); setBudget('5000'); setStart(''); setEnd('');
  };

  return (
    <AppShell>
      <ScreenHeader title="Trips" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New trip</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Name" value={name} onChangeText={setName} placeholder="Goa weekend" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Destination (optional)" value={dest} onChangeText={setDest} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Currency (ISO 4217)" value={currency} onChangeText={(v) => setCurrency(v.toUpperCase())} autoCapitalize="characters" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Daily budget (in that currency)" value={budget} onChangeText={setBudget} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Start (YYYY-MM-DD)" value={start} onChangeText={setStart} />
          <View style={{ height: spacing['2'] }} />
          <Input label="End (YYYY-MM-DD)" value={end} onChangeText={setEnd} />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add trip" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {trips.map((t) => (
          <Card key={t.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{t.name}{t.destination ? ` · ${t.destination}` : ''}</Text>
                <Text variant="caption" tone="muted">
                  {t.startDate} → {t.endDate} · daily {t.currency} {(t.dailyBudgetPaise / 100).toFixed(2)}
                </Text>
              </View>
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deleteTrip(t.id); reload(); }} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
