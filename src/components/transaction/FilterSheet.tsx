import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Sheet, Text, Chip, Button, Input } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import type { TxType, ListOpts } from '@/db/queries/transactions';
import { parseToPaise } from '@/lib/money';

export type FilterValue = ListOpts;

export type FilterSheetProps = {
  open: boolean;
  onClose: () => void;
  initial: FilterValue;
  onApply: (next: FilterValue) => void;
};

const DATE_PRESETS: { label: string; days: number | null }[] = [
  { label: 'All', days: null },
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '365d', days: 365 },
];

const TYPES: { key: TxType; label: string }[] = [
  { key: 'expense', label: 'Expense' },
  { key: 'income', label: 'Income' },
  { key: 'transfer', label: 'Transfer' },
];

export function FilterSheet({ open, onClose, initial, onApply }: FilterSheetProps) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const [accountIds, setAccountIds] = useState<string[]>(initial.accountIds ?? []);
  const [categoryIds, setCategoryIds] = useState<string[]>(initial.categoryIds ?? []);
  const [type, setType] = useState<TxType | null>(initial.type ?? null);
  const [days, setDays] = useState<number | null>(null);
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');

  const apply = () => {
    const next: FilterValue = {};
    if (initial.limit !== undefined) next.limit = initial.limit;
    if (accountIds.length > 0) next.accountIds = accountIds;
    if (categoryIds.length > 0) next.categoryIds = categoryIds;
    if (type) next.type = type;
    if (days !== null) {
      next.startDate = new Date(Date.now() - days * 86400000).toISOString();
    }
    const minP = parseToPaise(minAmt || '');
    const maxP = parseToPaise(maxAmt || '');
    if (minP !== null) next.minAmount = minP;
    if (maxP !== null) next.maxAmount = maxP;
    onApply(next);
    onClose();
  };

  const reset = () => {
    setAccountIds([]);
    setCategoryIds([]);
    setType(null);
    setDays(null);
    setMinAmt('');
    setMaxAmt('');
  };

  const toggleIn = (arr: string[], setArr: (a: string[]) => void, id: string) => {
    if (arr.includes(id)) setArr(arr.filter((x) => x !== id));
    else setArr([...arr, id]);
  };

  return (
    <Sheet open={open} onClose={onClose} fullScreen>
      <ScrollView contentContainerStyle={{ gap: spacing['3'], paddingBottom: spacing['4'] }}>
        <Text variant="h3">Filter</Text>
        <Text variant="small" tone="muted">Date range</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
          {DATE_PRESETS.map((p) => (
            <Chip key={p.label} label={p.label} selected={days === p.days} onPress={() => setDays(p.days)} />
          ))}
        </View>
        <Text variant="small" tone="muted">Type</Text>
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          {TYPES.map((tp) => (
            <Chip
              key={tp.key}
              label={tp.label}
              selected={type === tp.key}
              onPress={() => setType(type === tp.key ? null : tp.key)}
            />
          ))}
        </View>
        <Text variant="small" tone="muted">Accounts</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
          {(accounts ?? []).map((a) => (
            <Chip
              key={a.id}
              label={a.name}
              iconLeft={a.icon}
              selected={accountIds.includes(a.id)}
              onPress={() => toggleIn(accountIds, setAccountIds, a.id)}
            />
          ))}
        </View>
        <Text variant="small" tone="muted">Categories</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
          {(categories ?? []).map((c) => (
            <Chip
              key={c.id}
              label={c.name}
              iconLeft={c.icon}
              selected={categoryIds.includes(c.id)}
              onPress={() => toggleIn(categoryIds, setCategoryIds, c.id)}
            />
          ))}
        </View>
        <Text variant="small" tone="muted">Amount range (₹)</Text>
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          <View style={{ flex: 1 }}>
            <Input value={minAmt} onChangeText={setMinAmt} placeholder="Min" keyboardType="decimal-pad" />
          </View>
          <View style={{ flex: 1 }}>
            <Input value={maxAmt} onChangeText={setMaxAmt} placeholder="Max" keyboardType="decimal-pad" />
          </View>
        </View>
        <View style={{ height: spacing['4'] }} />
        <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
          <Button label="Reset" variant="ghost" onPress={reset} />
          <Button label="Apply" fullWidth onPress={apply} />
        </View>
      </ScrollView>
    </Sheet>
  );
}
