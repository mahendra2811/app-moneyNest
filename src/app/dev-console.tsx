/**
 * SQL console in dev mode — I4. Available only when __DEV__.
 */
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, Button, Text, Card } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { db } from '@/db/client';
import { sql } from 'drizzle-orm';

export default function DevConsole() {
  const [q, setQ] = useState('SELECT COUNT(*) FROM transactions');
  const [out, setOut] = useState<string>('');

  if (!__DEV__) {
    return (
      <AppShell>
        <ScreenHeader title="Dev console" />
        <Card>
          <Text variant="body">Available only in dev builds.</Text>
        </Card>
      </AppShell>
    );
  }

  const run = async () => {
    try {
      const rows = await db.all(sql.raw(q));
      setOut(JSON.stringify(rows, null, 2));
    } catch (e) {
      setOut(`Error: ${(e as Error).message}`);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="Dev console" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Input value={q} onChangeText={setQ} multiline numberOfLines={4} autoCapitalize="none" autoCorrect={false} />
        <Button label="Run" iconLeft="play" onPress={run} fullWidth />
        <Card>
          <Text variant="caption" tone="muted">RESULT</Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="small" style={{ fontFamily: 'monospace' }}>{out || '—'}</Text>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
