import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Input } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { parseSms } from '@/lib/sms-parser';
import { parseCsv } from '@/lib/csv-import';
import { filesystemService } from '@/platform/filesystem';
import { useAccounts } from '@/hooks/use-accounts';
import { useUiStore } from '@/stores/ui';
import { useInvalidateStore } from '@/stores/invalidate';
import { createTransaction } from '@/db/queries/transactions';

function base64ToText(b64: string): string {
  try {
    if (typeof atob === 'function') return atob(b64);
  } catch {
    /* ignore */
  }
  return Buffer.from(b64, 'base64').toString('utf-8');
}

export default function ImportScreen() {
  const router = useRouter();
  const { data: accounts } = useAccounts();
  const showToast = useUiStore((s) => s.showToast);
  const bumpTx = useInvalidateStore((s) => s.bumpTransactions);
  const [sms, setSms] = useState('');

  const onSms = async () => {
    const r = parseSms(sms);
    if (!r) {
      showToast({ tone: 'error', text: 'Could not parse this SMS' });
      return;
    }
    if (!accounts || accounts.length === 0) return;
    await createTransaction({
      amountPaise: r.amountPaise,
      type: r.type,
      accountId: accounts[0]!.id,
      toAccountId: null,
      categoryId: null,
      occurredAt: new Date().toISOString(),
      note: `SMS: ${r.raw}`,
      payee: r.payee,
      source: 'manual',
      deletedAt: null,
      recurringId: null,
    });
    bumpTx();
    showToast({ tone: 'success', text: `Logged ${r.payee ?? 'transaction'}` });
    setSms('');
  };

  const onCsv = async () => {
    const file = await filesystemService.pickFile();
    if (!file) return;
    const text = base64ToText(file.base64);
    const parsed = parseCsv(text);
    if (parsed.rows.length === 0) {
      showToast({ tone: 'error', text: `0 rows imported. ${parsed.errors.length} errors.` });
      return;
    }
    if (!accounts || accounts.length === 0) return;
    let created = 0;
    for (const row of parsed.rows) {
      try {
        await createTransaction({
          amountPaise: row.amountPaise,
          type: row.type,
          accountId: accounts[0]!.id,
          toAccountId: null,
          categoryId: null,
          occurredAt: row.occurredAt,
          note: row.note ?? null,
          payee: row.payee ?? null,
          source: 'manual',
          deletedAt: null,
          recurringId: null,
        });
        created++;
      } catch {
        /* skip */
      }
    }
    bumpTx();
    showToast({ tone: 'success', text: `Imported ${created} of ${parsed.rows.length}` });
    router.back();
  };

  return (
    <AppShell>
      <ScreenHeader title="Import" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="h3">Paste a bank/UPI SMS</Text>
          <Text variant="small" tone="muted">
            We parse on-device. SMS read permission is intentionally not used.
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Input
            value={sms}
            onChangeText={setSms}
            placeholder='e.g. "Paid Rs.250 to Swiggy from HDFC Bank using PhonePe"'
            multiline
            numberOfLines={4}
          />
          <View style={{ height: spacing['3'] }} />
          <Button label="Log from SMS" iconLeft="message-square" onPress={onSms} fullWidth />
        </Card>

        <Card>
          <Text variant="h3">Import CSV</Text>
          <Text variant="small" tone="muted">
            Bank statement or any CSV with date + amount columns.
          </Text>
          <View style={{ height: spacing['3'] }} />
          <Button label="Choose CSV file" iconLeft="upload" onPress={onCsv} fullWidth />
        </Card>
      </ScrollView>
    </AppShell>
  );
}
