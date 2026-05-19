/**
 * NEW-11 — natural-language filter input.
 */
import React, { useState, useMemo } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Input, Skeleton, EmptyState, Chip } from '@/components/primitives';
import { TransactionList } from '@/components/transaction/TransactionList';
import { spacing } from '@/brand/spacing';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { interpret } from '@/lib/nl-filter';
import { useTransactionsList } from '@/hooks/use-transactions';

export default function NlSearch() {
  const router = useRouter();
  const [q, setQ] = useState('food > 500 last month');
  const debounced = useDebouncedValue(q, 250);
  const opts = useMemo(() => interpret(debounced), [debounced]);
  const { data, loading } = useTransactionsList({ ...opts, limit: 100 });

  return (
    <AppShell>
      <ScreenHeader title="Ask in plain language" />
      <View style={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['3'] }}>
        <Input value={q} onChangeText={setQ} placeholder='"food > 500 last month"' autoCorrect={false} autoCapitalize="none" />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'], marginTop: spacing['2'] }}>
          {opts.type ? <Chip label={`type=${opts.type}`} onPress={() => undefined} selected /> : null}
          {opts.minAmount ? <Chip label={`>₹${opts.minAmount / 100}`} onPress={() => undefined} selected /> : null}
          {opts.maxAmount ? <Chip label={`<₹${opts.maxAmount / 100}`} onPress={() => undefined} selected /> : null}
          {opts.startDate ? <Chip label="dated" onPress={() => undefined} selected /> : null}
          {opts.search ? <Chip label={`"${opts.search}"`} onPress={() => undefined} selected /> : null}
        </View>
      </View>
      {loading ? (
        <View style={{ padding: spacing['4'], gap: spacing['2'] }}>
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} height={72} />)}
        </View>
      ) : (
        <TransactionList
          items={data?.items ?? []}
          onPressRow={(id) => router.push(`/transaction/${id}` as never)}
          ListEmptyComponent={<EmptyState icon="search" title="No matches" />}
        />
      )}
    </AppShell>
  );
}
