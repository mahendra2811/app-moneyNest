/**
 * NEW-51 — audit log viewer.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listAudit } from '@/db/queries/audit';
import type { AuditEntry } from '@/db/schema';
import { formatRelativeDay, formatTime } from '@/lib/date';

export default function AuditLogScreen() {
  const [items, setItems] = useState<AuditEntry[]>([]);
  useEffect(() => { listAudit(300).then(setItems); }, []);
  return (
    <AppShell>
      <ScreenHeader title="Audit log" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['2'] }}>
        <Card>
          <Text variant="small" tone="muted">
            Records what the app reads and writes. No PII (amounts/notes/payees) is logged.
          </Text>
        </Card>
        {items.length === 0 ? (
          <EmptyState icon="list" title="No events yet" />
        ) : (
          items.map((e) => (
            <View key={e.id} style={{ paddingVertical: spacing['2'], borderBottomWidth: 1, borderColor: '#E2E8F0' }}>
              <Text variant="bodyMed">{e.action} · {e.scope}</Text>
              <Text variant="caption" tone="muted">
                {formatRelativeDay(e.at)} {formatTime(e.at)} · {e.detail ?? ''}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
