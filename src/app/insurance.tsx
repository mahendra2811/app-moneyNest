import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Input, IconButton, Chip, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listInsurance, upsertInsurance, deleteInsurance, type Insurance } from '@/db/queries/goals';
import { formatINR, parseToPaise } from '@/lib/money';
import { uuidv7 } from '@/lib/id';
import { useUiStore } from '@/stores/ui';
import { formatRelativeDay } from '@/lib/date';

const TYPES: Insurance['type'][] = ['health', 'life', 'vehicle', 'home', 'other'];

export default function InsuranceScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [items, setItems] = useState<Insurance[]>([]);
  const [policyName, setPolicyName] = useState('');
  const [provider, setProvider] = useState('');
  const [premium, setPremium] = useState('');
  const [renewal, setRenewal] = useState('');
  const [type, setType] = useState<Insurance['type']>('health');

  const reload = async () => setItems(await listInsurance());
  useEffect(() => {
    reload();
  }, []);

  const onAdd = async () => {
    const p = parseToPaise(premium || '0');
    if (!p || !policyName.trim() || !renewal.trim()) {
      showToast({ tone: 'error', text: 'Name, premium, renewal required' });
      return;
    }
    await upsertInsurance({
      id: uuidv7(),
      policyName: policyName.trim(),
      provider: provider.trim(),
      premiumPaise: p,
      renewalDate: renewal.trim(),
      type,
    });
    setPolicyName('');
    setProvider('');
    setPremium('');
    setRenewal('');
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Insurance" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">Add policy</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Policy name" value={policyName} onChangeText={setPolicyName} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Provider" value={provider} onChangeText={setProvider} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Annual premium (₹)" value={premium} onChangeText={setPremium} keyboardType="decimal-pad" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Renewal date (YYYY-MM-DD)" value={renewal} onChangeText={setRenewal} />
          <View style={{ height: spacing['2'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
            {TYPES.map((tp) => (
              <Chip key={tp} label={tp} selected={tp === type} onPress={() => setType(tp)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>

        {items.length === 0 ? (
          <EmptyState icon="shield" title="No policies" />
        ) : (
          items.map((i) => (
            <Card key={i.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{i.policyName}</Text>
                  <Text variant="caption" tone="muted">
                    {i.provider} · {i.type}
                  </Text>
                  <Text variant="caption" tone="muted">
                    Renews {formatRelativeDay(i.renewalDate)} · {formatINR(i.premiumPaise)}/yr
                  </Text>
                </View>
                <IconButton
                  name="trash-2"
                  accessibilityLabel="Delete"
                  onPress={async () => {
                    await deleteInsurance(i.id);
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
