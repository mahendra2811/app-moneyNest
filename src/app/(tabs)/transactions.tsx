import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, EmptyState, Skeleton } from '@/components/primitives';
import { TransactionList } from '@/components/transaction/TransactionList';
import { FAB } from '@/components/layout/FAB';
import { spacing } from '@/brand/spacing';
import { useTransactionsList } from '@/hooks/use-transactions';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { t } from '@/copy';

export default function TransactionsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const debounced = useDebouncedValue(query, 300);
  const opts = useMemo(
    () => ({ ...(debounced ? { search: debounced } : {}), limit: 200 }),
    [debounced],
  );
  const { data, loading } = useTransactionsList(opts);

  return (
    <AppShell>
      <ScreenHeader title={t('transactions.title')} showBack={false} />
      <View style={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['3'] }}>
        <Input
          placeholder={t('transactions.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>
      {loading ? (
        <View style={{ paddingHorizontal: spacing['4'], gap: spacing['2'] }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} height={72} />
          ))}
        </View>
      ) : (
        <TransactionList
          items={data?.items ?? []}
          onPressRow={(id) => router.push(`/transaction/${id}` as never)}
          ListEmptyComponent={
            <EmptyState
              icon="inbox"
              title={t('transactions.emptyTitle')}
              body={t('transactions.emptyBody')}
            />
          }
        />
      )}
      <FAB
        accessibilityLabel="Add transaction"
        onPress={() => router.push('/transaction/new' as never)}
        onLongPress={() => router.push('/transaction/voice' as never)}
      />
    </AppShell>
  );
}
