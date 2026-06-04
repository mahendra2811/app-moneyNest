/**
 * NEW-45 — nominee / will tracker.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, IconButton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { getSetting, setSetting } from '@/db/queries/settings';
import { uuidv7 } from '@/lib/id';

type Nominee = {
  id: string;
  name: string;
  relation: string;
  assetKind: 'bank' | 'investment' | 'insurance' | 'property' | 'other';
  assetDescription: string;
  pctShare: number;
};

export default function NomineeScreen() {
  const [items, setItems] = useState<Nominee[]>([]);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [assetDesc, setAssetDesc] = useState('');

  const load = async () => setItems((await getSetting<Nominee[]>('nominees.list')) ?? []);
  useEffect(() => { load(); }, []);

  const onAdd = async () => {
    if (!name.trim() || !relation.trim()) return;
    const next = [...items, {
      id: uuidv7(),
      name: name.trim(),
      relation: relation.trim(),
      assetKind: 'bank' as const,
      assetDescription: assetDesc.trim(),
      pctShare: 100,
    }];
    await setSetting('nominees.list', next);
    setItems(next);
    setName('');
    setRelation('');
    setAssetDesc('');
  };

  const onDelete = async (id: string) => {
    const next = items.filter((n) => n.id !== id);
    await setSetting('nominees.list', next);
    setItems(next);
  };

  return (
    <AppShell>
      <ScreenHeader title="Nominees" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">
            A private list of who inherits what. Stored only on this device.
          </Text>
        </Card>
        <Card>
          <Text variant="h3">Add nominee</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Name" value={name} onChangeText={setName} />
          <View style={{ height: spacing['2'] }} />
          <Input label="Relation" value={relation} onChangeText={setRelation} placeholder="Spouse, child, parent" />
          <View style={{ height: spacing['2'] }} />
          <Input label="Asset (e.g. HDFC savings xx1234)" value={assetDesc} onChangeText={setAssetDesc} />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {items.length === 0 ? (
          <EmptyState icon="user-check" title="No nominees yet" />
        ) : (
          items.map((n) => (
            <Card key={n.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{n.name} · {n.relation}</Text>
                  <Text variant="caption" tone="muted">{n.assetDescription}</Text>
                </View>
                <IconButton name="trash-2" accessibilityLabel="Delete" onPress={() => onDelete(n.id)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
