/**
 * NEW-29 — net worth history line chart.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listSnapshots, takeSnapshot } from '@/db/queries/snapshots';
import { formatINRShort } from '@/lib/money';
import { useTheme } from '@/theme';

export default function NetWorthHistory() {
  const t = useTheme();
  const [snaps, setSnaps] = useState<Awaited<ReturnType<typeof listSnapshots>>>([]);

  const reload = async () => setSnaps(await listSnapshots());
  useEffect(() => { reload(); }, []);

  const points = snaps.map((s) => ({
    value: Math.round(s.netWorthPaise / 100),
    label: s.takenAt.slice(5, 10),
  }));
  const latest = snaps[snaps.length - 1];

  return (
    <AppShell>
      <ScreenHeader title="Net worth history" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="caption" tone="muted">LATEST</Text>
          <Text variant="display" tabular>{latest ? formatINRShort(latest.netWorthPaise) : '—'}</Text>
        </Card>
        <Card>
          {points.length < 2 ? (
            <Text variant="small" tone="muted">Need at least two snapshots to draw a line.</Text>
          ) : (
            <LineChart
              data={points}
              height={180}
              color1={t.accent}
              thickness={2}
              curved
              hideRules
              yAxisColor={t.border}
              xAxisColor={t.border}
              yAxisTextStyle={{ color: t.textFaint, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: t.textFaint, fontSize: 10 }}
            />
          )}
        </Card>
        <Button
          label="Snapshot now"
          iconLeft="camera"
          onPress={async () => {
            await takeSnapshot();
            reload();
          }}
          fullWidth
        />
      </ScrollView>
    </AppShell>
  );
}
