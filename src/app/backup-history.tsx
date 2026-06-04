import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listBackupLogs } from '@/db/queries/backup-log';
import { formatRelativeDay, formatTime } from '@/lib/date';

export default function BackupHistory() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof listBackupLogs>>>([]);
  useEffect(() => {
    listBackupLogs().then(setItems);
  }, []);
  return (
    <AppShell>
      <ScreenHeader title="Backup history" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {items.length === 0 ? (
          <EmptyState icon="archive" title="No backups yet" />
        ) : (
          items.map((b) => (
            <Card key={b.id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{formatRelativeDay(b.createdAt)} {formatTime(b.createdAt)}</Text>
                  <Text variant="caption" tone="muted">
                    {(b.sizeBytes / 1024).toFixed(1)} KB · {b.txnCount} transactions
                  </Text>
                </View>
                <Text variant="caption" tone={b.isEncrypted ? 'income' : 'expense'}>
                  {b.isEncrypted ? 'encrypted' : 'plain'}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
