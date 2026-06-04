/**
 * NEW-46 — manual review queue.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listPending, approve, reject } from '@/db/queries/review-queue';
import { useAccounts } from '@/hooks/use-accounts';
import { createTransaction } from '@/db/queries/transactions';
import { formatINR } from '@/lib/money';
import { useInvalidateStore } from '@/stores/invalidate';

export default function ReviewQueueScreen() {
  const { data: accounts } = useAccounts();
  const bumpTx = useInvalidateStore((s) => s.bumpTransactions);
  const [items, setItems] = useState<Awaited<ReturnType<typeof listPending>>>([]);

  const reload = async () => setItems(await listPending());
  useEffect(() => { reload(); }, []);

  const onApprove = async (id: string, payload: (typeof items)[number]['payload']) => {
    if (!accounts || accounts.length === 0) return;
    await createTransaction({
      amountPaise: payload.amountPaise,
      type: payload.type,
      accountId: payload.accountId ?? accounts[0]!.id,
      toAccountId: null,
      categoryId: payload.categoryId ?? null,
      occurredAt: payload.occurredAt,
      note: payload.note ?? payload.rawText ?? null,
      payee: payload.payee ?? null,
      source: 'manual',
      deletedAt: null,
      recurringId: null,
    });
    await approve(id);
    bumpTx();
    reload();
  };

  return (
    <AppShell>
      <ScreenHeader title="Review queue" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {items.length === 0 ? (
          <EmptyState icon="inbox" title="Nothing to review" body="Uncertain SMS / CSV / OCR imports show up here." />
        ) : (
          items.map((it) => (
            <Card key={it.id}>
              <Text variant="bodyMed">
                {formatINR(it.payload.amountPaise)} · {it.payload.type} · {it.source}
              </Text>
              <Text variant="caption" tone="muted">
                Confidence {it.confidence}% · {it.payload.payee ?? '—'}
              </Text>
              {it.payload.rawText ? (
                <Text variant="caption" tone="faint" numberOfLines={2}>
                  "{it.payload.rawText}"
                </Text>
              ) : null}
              <View style={{ height: spacing['3'] }} />
              <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                <Button label="Approve" onPress={() => onApprove(it.id, it.payload)} fullWidth />
                <Button label="Reject" variant="ghost" onPress={async () => { await reject(it.id); reload(); }} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
