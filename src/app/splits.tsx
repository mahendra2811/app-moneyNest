import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Input, IconButton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { newSplit, computeBalances, type Split } from '@/lib/splits';
import { listSplits, upsertSplit, deleteSplit } from '@/lib/splits-io';
import { formatINR } from '@/lib/money';
import { uuidv7 } from '@/lib/id';

export default function SplitsScreen() {
  const [splits, setSplits] = useState<Split[]>([]);
  const [title, setTitle] = useState('');
  const [names, setNames] = useState('Me, Friend A, Friend B');

  const reload = async () => setSplits(await listSplits());
  useEffect(() => {
    reload();
  }, []);

  const onAdd = async () => {
    if (!title.trim()) return;
    const participants = names
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean)
      .map((n) => ({ id: uuidv7(), name: n }));
    await upsertSplit(newSplit(title.trim(), participants));
    setTitle('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Splits" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New split</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Title" value={title} onChangeText={setTitle} placeholder="Goa trip" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Participants (comma-separated)" value={names} onChangeText={setNames} />
          <View style={{ height: spacing['3'] }} />
          <Button label="Create" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {splits.length === 0 ? (
          <EmptyState icon="users" title="No splits" body="Track group expenses (trips, dinners)." />
        ) : (
          splits.map((s) => {
            const balances = computeBalances(s);
            return (
              <Card key={s.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text variant="bodyMed" style={{ flex: 1 }}>{s.title}</Text>
                  <IconButton
                    name="trash-2"
                    accessibilityLabel="Delete"
                    onPress={async () => {
                      await deleteSplit(s.id);
                      reload();
                    }}
                  />
                </View>
                <View style={{ height: spacing['2'] }} />
                {s.participants.map((p) => (
                  <View key={p.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 }}>
                    <Text variant="small">{p.name}</Text>
                    <Text variant="smallMed" tabular tone={(balances[p.id] ?? 0) >= 0 ? 'income' : 'expense'}>
                      {(balances[p.id] ?? 0) >= 0 ? '+' : ''}{formatINR(balances[p.id] ?? 0)}
                    </Text>
                  </View>
                ))}
                <Text variant="caption" tone="muted">
                  {s.charges.length} charge{s.charges.length === 1 ? '' : 's'}
                </Text>
              </Card>
            );
          })
        )}
      </ScrollView>
    </AppShell>
  );
}
