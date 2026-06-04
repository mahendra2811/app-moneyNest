import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, EmptyState, Skeleton, IconButton, Chip } from '@/components/primitives';
import { TransactionList } from '@/components/transaction/TransactionList';
import { FilterSheet, type FilterValue } from '@/components/transaction/FilterSheet';
import { FAB } from '@/components/layout/FAB';
import { spacing } from '@/brand/spacing';
import { useTransactionsList } from '@/hooks/use-transactions';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { t } from '@/copy';

export default function TransactionsScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>({ limit: 200 });
  const [filterOpen, setFilterOpen] = useState(false);
  const debounced = useDebouncedValue(query, 300);
  const opts = useMemo(
    () => ({ ...filter, ...(debounced ? { search: debounced } : {}) }),
    [filter, debounced],
  );
  const { data, loading } = useTransactionsList(opts);

  const activeFilters: string[] = [];
  if (filter.type) activeFilters.push(filter.type);
  if (filter.accountIds && filter.accountIds.length > 0)
    activeFilters.push(`${filter.accountIds.length} acc`);
  if (filter.categoryIds && filter.categoryIds.length > 0)
    activeFilters.push(`${filter.categoryIds.length} cat`);
  if (filter.startDate) activeFilters.push('date');
  if (filter.minAmount || filter.maxAmount) activeFilters.push('₹ range');

  return (
    <AppShell>
      <ScreenHeader
        title={t('transactions.title')}
        showBack={false}
        right={<IconButton name="filter" accessibilityLabel="Filter" onPress={() => setFilterOpen(true)} />}
      />
      <View style={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['3'] }}>
        <Input
          placeholder={t('transactions.searchPlaceholder')}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {activeFilters.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['2'] }}>
            {activeFilters.map((f) => (
              <Chip key={f} label={f} onPress={() => setFilter({ limit: 200 })} />
            ))}
            <Chip label="Clear" onPress={() => setFilter({ limit: 200 })} />
          </View>
        ) : null}
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
      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        initial={filter}
        onApply={setFilter}
      />
    </AppShell>
  );
}
