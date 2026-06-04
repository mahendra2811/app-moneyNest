import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Card, Button, IconButton, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listTrash, restoreFromTrash, purgeTrash } from '@/db/queries/trash';
import { formatINR } from '@/lib/money';
import { formatRelativeDay } from '@/lib/date';
import { useInvalidateStore } from '@/stores/invalidate';
import { useUiStore } from '@/stores/ui';
import type { Transaction } from '@/db/schema';

export default function TrashScreen() {
  const [items, setItems] = useState<Transaction[]>([]);
  const bumpTx = useInvalidateStore((s) => s.bumpTransactions);
  const showToast = useUiStore((s) => s.showToast);

  const reload = async () => setItems(await listTrash());
  useEffect(() => {
    reload();
  }, []);

  return (
    <AppShell>
      <ScreenHeader title="Trash" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {items.length === 0 ? (
          <EmptyState icon="trash-2" title="Trash is empty" />
        ) : (
          <>
            {items.map((tx) => (
              <Card key={tx.id}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMed">{formatINR(tx.amountPaise)} · {tx.type}</Text>
                    <Text variant="caption" tone="muted">
                      Deleted {tx.deletedAt ? formatRelativeDay(tx.deletedAt) : ''}
                    </Text>
                  </View>
                  <IconButton
                    name="rotate-ccw"
                    accessibilityLabel="Restore"
                    onPress={async () => {
                      await restoreFromTrash(tx.id);
                      bumpTx();
                      reload();
                    }}
                  />
                </View>
              </Card>
            ))}
            <Button
              label={`Empty trash (${items.length})`}
              variant="danger"
              fullWidth
              onPress={async () => {
                const n = await purgeTrash();
                bumpTx();
                showToast({ tone: 'info', text: `Purged ${n}` });
                reload();
              }}
            />
          </>
        )}
      </ScrollView>
    </AppShell>
  );
}
