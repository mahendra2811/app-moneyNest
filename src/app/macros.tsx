import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { uuidv7 } from '@/lib/id';
import { parseToPaise, formatINR } from '@/lib/money';
import { listMacros, saveMacro, deleteMacro, type Macro } from '@/lib/macros';
import { useUiStore } from '@/stores/ui';
import { useTheme } from '@/theme';

export default function MacrosScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const t = useTheme();
  const [macros, setMacros] = useState<Macro[]>([]);
  const [phrase, setPhrase] = useState('');
  const [amount, setAmount] = useState('');

  const reload = async () => setMacros(await listMacros());
  useEffect(() => {
    reload();
  }, []);

  const onSave = async () => {
    const p = parseToPaise(amount || '0');
    if (!p || !phrase.trim()) {
      showToast({ tone: 'error', text: 'Phrase and amount required' });
      return;
    }
    await saveMacro({
      id: uuidv7(),
      phrase: phrase.trim(),
      amountPaise: p,
      type: 'expense',
      categorySlug: null,
      accountId: null,
      payee: null,
      note: null,
    });
    setPhrase('');
    setAmount('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Voice macros" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New macro</Text>
          <Text variant="small" tone="muted">
            Say the phrase → that transaction gets logged.
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Phrase" value={phrase} onChangeText={setPhrase} placeholder="daily chai" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onSave} fullWidth />
        </Card>
        {macros.map((m) => (
          <View
            key={m.id}
            style={{
              backgroundColor: t.surface,
              borderColor: t.border,
              borderWidth: 1,
              borderRadius: 16,
              padding: spacing['4'],
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['3'],
            }}
          >
            <View style={{ flex: 1 }}>
              <Text variant="bodyMed">"{m.phrase}"</Text>
              <Text variant="caption" tone="muted">
                {formatINR(m.amountPaise)} · {m.type}
              </Text>
            </View>
            <IconButton
              name="trash-2"
              accessibilityLabel="Delete macro"
              onPress={async () => {
                await deleteMacro(m.id);
                reload();
              }}
            />
          </View>
        ))}
      </ScrollView>
    </AppShell>
  );
}
