/**
 * NEW-4 — credit score (manual entry + history). Real bureau fetch is
 * out of V1 (needs network); user enters their current score each month.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, Chip } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { getSetting, setSetting } from '@/db/queries/settings';
import { now } from '@/lib/date';
import { useTheme } from '@/theme';

type ScoreEntry = { atIso: string; score: number; bureau: 'cibil' | 'experian' | 'equifax' | 'crif' };

export default function CreditScore() {
  const t = useTheme();
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [score, setScore] = useState('');
  const [bureau, setBureau] = useState<ScoreEntry['bureau']>('cibil');

  const load = async () => setEntries((await getSetting<ScoreEntry[]>('credit.score.history')) ?? []);
  useEffect(() => { load(); }, []);

  const onAdd = async () => {
    const n = Number(score);
    if (!Number.isFinite(n) || n < 300 || n > 900) return;
    const next = [...entries, { atIso: now(), score: n, bureau }];
    await setSetting('credit.score.history', next);
    setEntries(next);
    setScore('');
  };

  const latest = entries[entries.length - 1];

  return (
    <AppShell>
      <ScreenHeader title="Credit score" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="caption" tone="muted">CURRENT</Text>
          <Text variant="display" tabular style={{ color: latest && latest.score >= 750 ? t.income : latest && latest.score >= 650 ? t.warning : t.expense }}>
            {latest?.score ?? '—'}
          </Text>
          {latest ? <Text variant="caption" tone="muted">{latest.bureau.toUpperCase()} · {latest.atIso.slice(0, 10)}</Text> : null}
        </Card>
        <Card>
          <Text variant="h3">Log a new score</Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
            {(['cibil', 'experian', 'equifax', 'crif'] as const).map((b) => (
              <Chip key={b} label={b.toUpperCase()} selected={b === bureau} onPress={() => setBureau(b)} />
            ))}
          </View>
          <View style={{ height: spacing['3'] }} />
          <Input label="Score (300–900)" value={score} onChangeText={setScore} keyboardType="number-pad" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Add" onPress={onAdd} fullWidth />
        </Card>
        <Card>
          <Text variant="h3">History</Text>
          <View style={{ height: spacing['2'] }} />
          {entries.length === 0 ? (
            <Text variant="small" tone="muted">No entries yet.</Text>
          ) : (
            entries.slice().reverse().map((e) => (
              <View key={e.atIso} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                <Text variant="body">{e.atIso.slice(0, 10)} · {e.bureau}</Text>
                <Text variant="bodyMed" tabular>{e.score}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </AppShell>
  );
}
