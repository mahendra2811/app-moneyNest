import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Chip, Switch, Input } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  getUiPrefs,
  setUiPrefs,
  THEME_VARIANTS,
  type Density,
  type ThemeVariant,
} from '@/lib/ui-prefs';

const DENSITIES: Density[] = ['compact', 'comfortable', 'spacious'];
const VARIANTS: ThemeVariant[] = ['default', 'sunset', 'forest', 'ink', 'material-you'];

export default function UiPrefsScreen() {
  const [density, setDensity] = useState<Density>('comfortable');
  const [variant, setVariant] = useState<ThemeVariant>('default');
  const [fontScale, setFontScale] = useState('1.0');
  const [oneHand, setOneHand] = useState(false);
  const [colorWash, setColorWash] = useState(false);
  const [smart, setSmart] = useState(true);
  const [aod, setAod] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await getUiPrefs();
      setDensity(p.density);
      setVariant(p.themeVariant);
      setFontScale(p.fontScale.toFixed(2));
      setOneHand(p.oneHandedMode);
      setColorWash(p.perAccountColorWash);
      setSmart(p.smartDefaults);
      setAod(p.aodSpend);
    })();
  }, []);

  return (
    <AppShell>
      <ScreenHeader title="Display" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">Density</Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
            {DENSITIES.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={d === density}
                onPress={() => {
                  setDensity(d);
                  setUiPrefs({ density: d });
                }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Theme variant</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['3'] }}>
            {VARIANTS.map((v) => (
              <Chip
                key={v}
                label={v}
                selected={v === variant}
                onPress={() => {
                  setVariant(v);
                  setUiPrefs({ themeVariant: v });
                }}
              />
            ))}
          </View>
          <Text variant="caption" tone="muted" style={{ marginTop: spacing['3'] }}>
            Accent preview: {THEME_VARIANTS[variant].accent}
          </Text>
        </Card>

        <Card>
          <Text variant="h3">Type scale</Text>
          <Text variant="small" tone="muted">1.0 default, max 1.6.</Text>
          <View style={{ height: spacing['3'] }} />
          <Input
            value={fontScale}
            onChangeText={(v) => {
              setFontScale(v);
              const n = Math.min(1.6, Math.max(1, Number(v) || 1));
              setUiPrefs({ fontScale: n });
            }}
            keyboardType="decimal-pad"
          />
        </Card>

        <Card>
          <Text variant="h3">Layout flags</Text>
          <View style={{ height: spacing['3'] }} />
          <Row label="One-handed mode">
            <Switch
              value={oneHand}
              onValueChange={(v) => {
                setOneHand(v);
                setUiPrefs({ oneHandedMode: v });
              }}
            />
          </Row>
          <View style={{ height: spacing['3'] }} />
          <Row label="Per-account color wash on rows">
            <Switch
              value={colorWash}
              onValueChange={(v) => {
                setColorWash(v);
                setUiPrefs({ perAccountColorWash: v });
              }}
            />
          </Row>
          <View style={{ height: spacing['3'] }} />
          <Row label="Smart defaults (last-used)">
            <Switch
              value={smart}
              onValueChange={(v) => {
                setSmart(v);
                setUiPrefs({ smartDefaults: v });
              }}
            />
          </Row>
          <View style={{ height: spacing['3'] }} />
          <Row label="Today's spend on AOD">
            <Switch
              value={aod}
              onValueChange={(v) => {
                setAod(v);
                setUiPrefs({ aodSpend: v });
              }}
            />
          </Row>
        </Card>
      </ScrollView>
    </AppShell>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Text variant="bodyMed" style={{ flex: 1, paddingRight: spacing['4'] }}>
        {label}
      </Text>
      {children}
    </View>
  );
}
