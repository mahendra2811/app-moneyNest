/**
 * NEW-49 — custom dashboard cards.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Chip, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { ALL_CARDS, getDashCards, setDashCards, type DashCard } from '@/lib/dashboard-prefs';
import { useUiStore } from '@/stores/ui';

export default function DashboardCustomize() {
  const showToast = useUiStore((s) => s.showToast);
  const [selected, setSelected] = useState<DashCard[]>([]);

  useEffect(() => { getDashCards().then(setSelected); }, []);

  const toggle = (id: DashCard) => {
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  };

  const onSave = async () => {
    await setDashCards(selected);
    showToast({ tone: 'success', text: 'Saved' });
  };

  return (
    <AppShell>
      <ScreenHeader title="Customise home" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">Tap to add or remove cards from the home screen.</Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {ALL_CARDS.map((c) => (
              <Chip key={c.id} label={c.label} selected={selected.includes(c.id)} onPress={() => toggle(c.id)} />
            ))}
          </View>
        </Card>
        <Button label="Save" fullWidth size="lg" onPress={onSave} />
      </ScrollView>
    </AppShell>
  );
}
