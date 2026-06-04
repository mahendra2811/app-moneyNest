import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Input, IconButton, Chip, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listDebts, upsertDebt, deleteDebt, type Debt } from '@/db/queries/goals';
import { formatINR, parseToPaise } from '@/lib/money';
import { useUiStore } from '@/stores/ui';

export default function DebtsScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [direction, setDirection] = useState<'owed_to_me' | 'i_owe'>('owed_to_me');

  const reload = async () => setDebts(await listDebts());
  useEffect(() => {
    reload();
  }, []);

  const onAdd = async () => {
    const p = parseToPaise(amount || '0');
    if (!p || !person.trim()) {
      showToast({ tone: 'error', text: 'Person and amount required' });
      return;
    }
    await upsertDebt({ person: person.trim(), amountPaise: p, direction });
    setPerson('');
    setAmount('');
    reload();
  };

  const owedToMe = debts.filter((d) => d.direction === 'owed_to_me' && !d.settledAt).reduce((s, d) => s + d.amountPaise, 0);
  const iOwe = debts.filter((d) => d.direction === 'i_owe' && !d.settledAt).reduce((s, d) => s + d.amountPaise, 0);

  return (
    <AppShell>
      <ScreenHeader title="Debts" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">OWED TO ME</Text>
            <Text variant="h2" tabular tone="income">{formatINR(owedToMe)}</Text>
          </Card>
          <Card style={{ flex: 1 }}>
            <Text variant="caption" tone="muted">I OWE</Text>
            <Text variant="h2" tabular tone="expense">{formatINR(iOwe)}</Text>
          </Card>
        </View>

        <Card>
          <Text variant="h3">Add entry</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Person" value={person} onChangeText={setPerson} placeholder="Karthik" autoCapitalize="words" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            <Chip label="Owed to me" selected={direction === 'owed_to_me'} onPress={() => setDirection('owed_to_me')} />
            <Chip label="I owe" selected={direction === 'i_owe'} onPress={() => setDirection('i_owe')} />
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>

        {debts.length === 0 ? (
          <EmptyState icon="users" title="No debts logged" />
        ) : (
          debts.map((d) => (
            <Card key={d.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{d.person}</Text>
                  <Text variant="caption" tone={d.direction === 'owed_to_me' ? 'income' : 'expense'}>
                    {d.direction === 'owed_to_me' ? 'owes you' : 'you owe'} {formatINR(d.amountPaise)}
                  </Text>
                </View>
                <IconButton
                  name="check"
                  accessibilityLabel="Mark settled"
                  onPress={async () => {
                    await upsertDebt({ ...d, settledAt: new Date().toISOString() });
                    reload();
                  }}
                />
                <IconButton
                  name="trash-2"
                  accessibilityLabel="Delete"
                  onPress={async () => {
                    await deleteDebt(d.id);
                    reload();
                  }}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
