import React, { useMemo } from 'react';
import { View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { spacing } from '@/brand/spacing';
import { Text } from '@/components/primitives';
import { formatRelativeDay } from '@/lib/date';
import { formatINR } from '@/lib/money';
import { TransactionRow } from './TransactionRow';
import type { TransactionWithJoins } from '@/db/queries/transactions';

type Item =
  | { kind: 'header'; key: string; label: string; total: number }
  | { kind: 'row'; key: string; tx: TransactionWithJoins };

export type TransactionListProps = {
  items: TransactionWithJoins[];
  onPressRow?: (id: string) => void;
  ListEmptyComponent?: React.ReactElement;
  ListHeaderComponent?: React.ReactElement;
  onEndReached?: () => void;
};

export function TransactionList({
  items,
  onPressRow,
  ListEmptyComponent,
  ListHeaderComponent,
  onEndReached,
}: TransactionListProps) {
  const flatItems = useMemo<Item[]>(() => {
    const out: Item[] = [];
    let currentDay = '';
    let currentTotal = 0;
    let lastHeaderIdx = -1;
    for (const tx of items) {
      const day = tx.occurredAt.slice(0, 10);
      if (day !== currentDay) {
        if (lastHeaderIdx >= 0) {
          (out[lastHeaderIdx] as { kind: 'header'; total: number }).total = currentTotal;
        }
        currentDay = day;
        currentTotal = 0;
        out.push({
          kind: 'header',
          key: `h-${day}`,
          label: formatRelativeDay(tx.occurredAt),
          total: 0,
        });
        lastHeaderIdx = out.length - 1;
      }
      if (tx.type === 'expense') currentTotal -= tx.amountPaise;
      else if (tx.type === 'income') currentTotal += tx.amountPaise;
      out.push({ kind: 'row', key: tx.id, tx });
    }
    if (lastHeaderIdx >= 0) {
      (out[lastHeaderIdx] as { kind: 'header'; total: number }).total = currentTotal;
    }
    return out;
  }, [items]);

  return (
    <FlashList
      data={flatItems}
      keyExtractor={(it) => it.key}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      getItemType={(it) => it.kind}
      contentContainerStyle={{ paddingHorizontal: spacing['4'], paddingBottom: spacing['12'] }}
      renderItem={({ item }) => {
        if (item.kind === 'header') {
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: spacing['4'],
                paddingBottom: spacing['2'],
              }}
            >
              <Text variant="caption" tone="muted">
                {item.label.toUpperCase()}
              </Text>
              <Text variant="caption" tone="faint" tabular>
                {item.total === 0 ? '' : formatINR(item.total)}
              </Text>
            </View>
          );
        }
        return <TransactionRow tx={item.tx} onPress={onPressRow} />;
      }}
      ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
    />
  );
}
