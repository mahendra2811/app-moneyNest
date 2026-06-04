import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, EmptyState, IconButton } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listGoals, type SavingsGoal } from '@/db/queries/goals';
import { BudgetProgressBar } from '@/components/budget/BudgetProgressBar';
import { formatINR } from '@/lib/money';

export default function GoalsIndex() {
  const router = useRouter();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  useEffect(() => {
    listGoals().then(setGoals);
  }, []);

  return (
    <AppShell>
      <ScreenHeader
        title="Goals"
        right={<IconButton name="plus" accessibilityLabel="Add goal" onPress={() => router.push('/goals/new' as never)} />}
      />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {goals.length === 0 ? (
          <EmptyState icon="target" title="No goals yet" body="Save for a laptop, a trip, anything." />
        ) : (
          goals.map((g) => (
            <Card key={g.id}>
              <Text variant="bodyMed">{g.name}</Text>
              {g.dueDate ? (
                <Text variant="caption" tone="muted">
                  by {g.dueDate.slice(0, 10)}
                </Text>
              ) : null}
              <View style={{ height: spacing['3'] }} />
              <BudgetProgressBar spent={g.currentPaise} total={g.targetPaise} />
              <View style={{ height: spacing['1'] }} />
              <Text variant="caption" tone="muted">
                {formatINR(g.currentPaise)} of {formatINR(g.targetPaise)}
              </Text>
            </Card>
          ))
        )}
        <Button label="New goal" iconLeft="plus" onPress={() => router.push('/goals/new' as never)} fullWidth />
      </ScrollView>
    </AppShell>
  );
}
