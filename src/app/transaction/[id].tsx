import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { TransactionForm } from '@/components/transaction/TransactionForm';
import { Skeleton } from '@/components/primitives';
import { useTransaction } from '@/hooks/use-transactions';
import { t } from '@/copy';
import { View } from 'react-native';
import { spacing } from '@/brand/spacing';

export default function EditTransaction() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, loading } = useTransaction(typeof id === 'string' ? id : undefined);

  return (
    <AppShell>
      <ScreenHeader title={t('transactions.editTitle')} />
      {loading ? (
        <View style={{ padding: spacing['4'], gap: spacing['3'] }}>
          <Skeleton height={56} />
          <Skeleton height={120} />
          <Skeleton height={56} />
        </View>
      ) : (
        <TransactionForm existing={data ?? null} />
      )}
    </AppShell>
  );
}
