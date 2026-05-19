import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Text, Button, EmptyState, Skeleton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useBudgets } from '@/hooks/use-budgets';
import { useCategories } from '@/hooks/use-categories';
import { BudgetCard } from '@/components/budget/BudgetCard';
import { t } from '@/copy';

export default function BudgetsIndex() {
  const router = useRouter();
  const { data: budgets, loading } = useBudgets();
  const { data: cats } = useCategories({ type: 'expense' });

  const budgetedCatIds = new Set((budgets ?? []).map((b) => b.categoryId));
  const unbudgeted = (cats ?? []).filter((c) => !budgetedCatIds.has(c.id));

  return (
    <AppShell>
      <ScreenHeader title={t('budgets.title')} />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {loading ? (
          <Skeleton height={120} />
        ) : (budgets ?? []).length === 0 ? (
          <EmptyState icon="target" title={t('budgets.noBudgets')} body={t('emptyStates.budgetsBody')} />
        ) : (
          (budgets ?? []).map((b) => (
            <BudgetCard key={b.id} budget={b} onPress={() => router.push(`/budgets/${b.categoryId}` as never)} />
          ))
        )}

        {unbudgeted.length > 0 ? (
          <>
            <View style={{ height: spacing['4'] }} />
            <Text variant="h3">More categories</Text>
            {unbudgeted.map((c) => (
              <Button
                key={c.id}
                variant="secondary"
                label={`Add budget for ${c.name}`}
                iconLeft="plus"
                fullWidth
                onPress={() => router.push(`/budgets/${c.id}` as never)}
              />
            ))}
          </>
        ) : null}
      </ScrollView>
    </AppShell>
  );
}
