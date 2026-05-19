import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  getLocalePrefs,
  setLocalePrefs,
  LANGUAGE_LABELS,
  type Locale,
} from '@/copy/locale';

const LANGUAGES: Locale[] = ['en', 'hi', 'mr', 'ta', 'te', 'bn', 'gu'];
const NUMBER_FORMATS = ['indian', 'international'] as const;
const DATE_FORMATS = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'] as const;

export default function LocaleScreen() {
  const [lang, setLang] = useState<Locale>('en');
  const [nf, setNf] = useState<(typeof NUMBER_FORMATS)[number]>('indian');
  const [df, setDf] = useState<(typeof DATE_FORMATS)[number]>('DD/MM/YYYY');

  useEffect(() => {
    (async () => {
      const p = await getLocalePrefs();
      setLang(p.language);
      setNf(p.numberFormat);
      setDf(p.dateFormat);
    })();
  }, []);

  return (
    <AppShell>
      <ScreenHeader title="Language & format" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">Language</Text>
          <Text variant="small" tone="muted">
            Hindi has the most coverage. Other languages fall back to English where strings are missing.
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['3'] }}>
            {LANGUAGES.map((l) => (
              <Chip
                key={l}
                label={LANGUAGE_LABELS[l]}
                selected={l === lang}
                onPress={() => {
                  setLang(l);
                  setLocalePrefs({ language: l });
                }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Number format</Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
            {NUMBER_FORMATS.map((n) => (
              <Chip
                key={n}
                label={n === 'indian' ? '12,34,567' : '1,234,567'}
                selected={n === nf}
                onPress={() => {
                  setNf(n);
                  setLocalePrefs({ numberFormat: n });
                }}
              />
            ))}
          </View>
        </Card>

        <Card>
          <Text variant="h3">Date format</Text>
          <View style={{ flexDirection: 'row', gap: spacing['2'], marginTop: spacing['3'] }}>
            {DATE_FORMATS.map((d) => (
              <Chip
                key={d}
                label={d}
                selected={d === df}
                onPress={() => {
                  setDf(d);
                  setLocalePrefs({ dateFormat: d });
                }}
              />
            ))}
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
