/**
 * NEW-42 — family allowance tracker.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listMembers, upsertMember, deleteMember, type FamilyMember } from '@/lib/family';
import { parseToPaise, formatINR } from '@/lib/money';
import { useUiStore } from '@/stores/ui';

export default function Family() {
  const showToast = useUiStore((s) => s.showToast);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState<FamilyMember['relation']>('child');
  const [allowance, setAllowance] = useState('1000');

  const reload = async () => setMembers(await listMembers());
  useEffect(() => { reload(); }, []);

  const onAdd = async () => {
    const p = parseToPaise(allowance);
    if (!name.trim() || !p) {
      showToast({ tone: 'error', text: 'Name + allowance required' });
      return;
    }
    await upsertMember({ name: name.trim(), relation, monthlyAllowancePaise: p });
    setName('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Family" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">Add member</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Name" value={name} onChangeText={setName} />
          <View style={{ height: spacing['2'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
            {(['child', 'partner', 'parent', 'sibling', 'other'] as const).map((r) => (
              <Chip key={r} label={r} selected={r === relation} onPress={() => setRelation(r)} />
            ))}
          </View>
          <View style={{ height: spacing['2'] }} />
          <Input label="Monthly allowance (₹)" value={allowance} onChangeText={setAllowance} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {members.map((m) => (
          <Card key={m.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{m.name}</Text>
                <Text variant="caption" tone="muted">
                  {m.relation} · {formatINR(m.monthlyAllowancePaise)}/mo
                </Text>
              </View>
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deleteMember(m.id); reload(); }} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
