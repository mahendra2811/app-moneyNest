/**
 * C5 — subscriptions view. Reframes existing recurring expenses as
 * subscriptions when the user has tagged them.
 */
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useRecurring } from '@/hooks/use-recurring';
import { formatRelativeDay } from '@/lib/date';
import { formatINR } from '@/lib/money';

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { data } = useRecurring();
  const subs = (data ?? []).filter((r) => r.frequency === 'monthly' || r.frequency === 'yearly');
  const monthly = subs.reduce((sum, r) => {
    try {
      const tpl = JSON.parse(r.templateJson) as { amountPaise?: number };
      if (typeof tpl.amountPaise !== 'number') return sum;
      const factor = r.frequency === 'monthly' ? 1 : 1 / 12;
      return sum + tpl.amountPaise * factor;
    } catch {
      return sum;
    }
  }, 0);

  return (
    <AppShell>
      <ScreenHeader title="Subscriptions" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="caption" tone="muted">MONTHLY BURN</Text>
          <Text variant="h1" tabular>{formatINR(Math.round(monthly))}</Text>
          <Text variant="caption" tone="muted">
            {subs.length} active · normalized to monthly
          </Text>
        </Card>
        {subs.length === 0 ? (
          <EmptyState
            icon="repeat"
            title="No subscriptions yet"
            body="Add a recurring monthly entry for Netflix, Prime, gym, rent — they show up here."
          />
        ) : (
          subs.map((r) => {
            const tpl = JSON.parse(r.templateJson) as { amountPaise: number; payee?: string };
            return (
              <Card key={r.id} onTouchEnd={() => router.push(`/recurring/${r.id}` as never)}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMed">{tpl.payee ?? 'Subscription'}</Text>
                    <Text variant="caption" tone="muted">
                      Renews {formatRelativeDay(r.nextRunAt)} · {r.frequency}
                    </Text>
                  </View>
                  <Text variant="bodyMed" tabular>{formatINR(tpl.amountPaise)}</Text>
                </View>
              </Card>
            );
          })
        )}
      </ScrollView>
    </AppShell>
  );
}
