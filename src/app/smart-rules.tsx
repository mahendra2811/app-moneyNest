/**
 * NEW-20 — smart rules manager.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, Switch, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from '@/lib/id';
import { now } from '@/lib/date';
import { useCategories } from '@/hooks/use-categories';
import { parseToPaise, formatINR } from '@/lib/money';
import type { SmartRule } from '@/lib/smart-rules';
import { useUiStore } from '@/stores/ui';

export default function SmartRulesScreen() {
  const { data: cats } = useCategories({ type: 'expense' });
  const showToast = useUiStore((s) => s.showToast);
  const [rules, setRules] = useState<SmartRule[]>([]);
  const [payeeContains, setPayeeContains] = useState('');
  const [amountLt, setAmountLt] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);

  const load = async () => setRules((await getSetting<SmartRule[]>('rules.list')) ?? []);
  useEffect(() => { load(); }, []);

  const onCreate = async () => {
    if (!payeeContains.trim() || !categoryId) {
      showToast({ tone: 'error', text: 'Payee and category required' });
      return;
    }
    const r: SmartRule = {
      id: uuidv7(),
      name: `${payeeContains} → ${cats?.find((c) => c.id === categoryId)?.name ?? ''}`,
      enabled: true,
      createdAt: now(),
      conditions: [{ kind: 'payee_contains', value: payeeContains.trim() }],
      actions: [{ kind: 'set_category', categoryId }],
    };
    if (amountLt) {
      const p = parseToPaise(amountLt);
      if (p) r.conditions.push({ kind: 'amount_lt', value: p });
    }
    const next = [...rules, r];
    await setSetting('rules.list', next);
    setRules(next);
    setPayeeContains('');
    setAmountLt('');
    setCategoryId(null);
  };

  const onToggle = async (id: string) => {
    const next = rules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    await setSetting('rules.list', next);
    setRules(next);
  };

  const onDelete = async (id: string) => {
    const next = rules.filter((r) => r.id !== id);
    await setSetting('rules.list', next);
    setRules(next);
  };

  return (
    <AppShell>
      <ScreenHeader title="Smart rules" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New rule</Text>
          <Text variant="small" tone="muted">IF payee contains … AND amount &lt; … THEN set category.</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Payee contains" value={payeeContains} onChangeText={setPayeeContains} placeholder="swiggy" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Amount less than (₹) — optional" value={amountLt} onChangeText={setAmountLt} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Text variant="small" tone="muted">Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['2'] }}>
            {(cats ?? []).map((c) => (
              <Chip key={c.id} label={c.name} iconLeft={c.icon} selected={c.id === categoryId} onPress={() => setCategoryId(c.id)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Create rule" iconLeft="plus" onPress={onCreate} fullWidth />
        </Card>
        {rules.map((r) => (
          <Card key={r.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{r.name}</Text>
                <Text variant="caption" tone="muted">
                  {r.conditions.map((c) =>
                    c.kind === 'payee_contains' ? `payee~"${c.value}"` :
                    c.kind === 'amount_lt' ? `amt<${formatINR(c.value)}` :
                    c.kind === 'amount_gt' ? `amt>${formatINR(c.value)}` :
                    c.kind === 'type_is' ? `type=${c.value}` :
                    c.kind === 'account_is' ? `acc=${c.value}` :
                    c.kind === 'note_contains' ? `note~"${c.value}"` : ''
                  ).join(' · ')}
                </Text>
              </View>
              <Switch value={r.enabled} onValueChange={() => onToggle(r.id)} />
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={() => onDelete(r.id)} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
