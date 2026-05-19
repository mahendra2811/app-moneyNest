/**
 * NEW-39 — multi-profile picker.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  listProfiles,
  upsertProfile,
  deleteProfile,
  getActiveProfileId,
  setActiveProfileId,
  type Profile,
} from '@/lib/profiles';
import { useUiStore } from '@/stores/ui';

export default function Profiles() {
  const showToast = useUiStore((s) => s.showToast);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [kind, setKind] = useState<Profile['kind']>('personal');

  const reload = async () => {
    setProfiles(await listProfiles());
    setActive(await getActiveProfileId());
  };
  useEffect(() => { reload(); }, []);

  const onAdd = async () => {
    if (!name.trim()) return;
    await upsertProfile({ name: name.trim(), kind });
    setName('');
    reload();
  };

  const onSwitch = async (id: string) => {
    await setActiveProfileId(id);
    setActive(id);
    showToast({ tone: 'success', text: 'Profile switched' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Profiles" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="h3">New profile</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Name" value={name} onChangeText={setName} placeholder="Business" />
          <View style={{ height: spacing['2'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
            {(['personal', 'business', 'family', 'other'] as const).map((k) => (
              <Chip key={k} label={k} selected={kind === k} onPress={() => setKind(k)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" iconLeft="plus" onPress={onAdd} fullWidth />
        </Card>
        {profiles.map((p) => (
          <Card key={p.id}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{p.name}</Text>
                <Text variant="caption" tone="muted">{p.kind}</Text>
              </View>
              {active === p.id ? (
                <Chip label="Active" selected onPress={() => undefined} />
              ) : (
                <Button label="Switch" variant="secondary" size="sm" onPress={() => onSwitch(p.id)} />
              )}
              <IconButton name="trash-2" accessibilityLabel="Delete" onPress={async () => { await deleteProfile(p.id); reload(); }} />
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
