import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import { AppShell } from '@/components/layout/AppShell';
import { FAB } from '@/components/layout/FAB';
import { GlassCard, Text, Skeleton, EmptyState, Card } from '@/components/primitives';
import { TransactionRow } from '@/components/transaction/TransactionRow';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { formatINR, formatINRShort } from '@/lib/money';
import {
  useMonthTotals,
  useRecentTransactions,
  useTodayTotals,
} from '@/hooks/use-transactions';
import { useBudgetTotals } from '@/hooks/use-budgets';
import { monthLabel } from '@/lib/date';
import { useTheme } from '@/theme';

export default function Home() {
  const router = useRouter();
  const t_ = useTheme();
  const monthRef = useMemo(() => new Date().toISOString(), []);

  const monthQ = useMonthTotals(monthRef);
  const todayQ = useTodayTotals();
  const recentQ = useRecentTransactions(15);
  const budgetsQ = useBudgetTotals();

  const todayTxns = useMemo(() => {
    const all = recentQ.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return all.filter((x) => x.occurredAt.startsWith(today)).slice(0, 5);
  }, [recentQ.data]);

  const recentTxns = useMemo(() => {
    const all = recentQ.data ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return all.filter((x) => !x.occurredAt.startsWith(today)).slice(0, 10);
  }, [recentQ.data]);

  return (
    <AppShell>
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'], paddingBottom: 120 }}>
        <View>
          <Text variant="caption" tone="muted">
            {monthLabel(monthRef).toUpperCase()}
          </Text>
          <Text variant="h1">{t('home.thisMonthTitle')}</Text>
        </View>

        <GlassCard intensity="strong" radius="xl">
          {monthQ.loading ? (
            <View style={{ gap: spacing['2'] }}>
              <Skeleton width={120} height={14} />
              <Skeleton width={200} height={36} />
              <Skeleton width={140} height={14} />
            </View>
          ) : (
            <>
              <Text variant="caption" tone="muted">
                {t('home.spentLabel').toUpperCase()}
              </Text>
              <Text variant="display" tabular>
                {formatINRShort(monthQ.data?.spentPaise ?? 0)}
              </Text>
              <View style={{ height: spacing['2'] }} />
              <View style={{ flexDirection: 'row', gap: spacing['4'] }}>
                <View>
                  <Text variant="caption" tone="muted">
                    {t('home.incomeLabel')}
                  </Text>
                  <Text variant="bodyMed" tabular tone="income">
                    {formatINRShort(monthQ.data?.incomePaise ?? 0)}
                  </Text>
                </View>
                <View>
                  <Text variant="caption" tone="muted">
                    {t('home.netLabel')}
                  </Text>
                  <Text variant="bodyMed" tabular>
                    {formatINRShort((monthQ.data?.incomePaise ?? 0) - (monthQ.data?.spentPaise ?? 0))}
                  </Text>
                </View>
              </View>
              {budgetsQ.data && budgetsQ.data.budgetTotal > 0 ? (
                <>
                  <View style={{ height: spacing['3'] }} />
                  <View
                    style={{
                      height: 6,
                      borderRadius: 6,
                      backgroundColor: t_.surfaceMuted,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, Math.round((budgetsQ.data.spentTotal / budgetsQ.data.budgetTotal) * 100))}%`,
                        height: '100%',
                        backgroundColor:
                          budgetsQ.data.spentTotal > budgetsQ.data.budgetTotal
                            ? t_.expense
                            : t_.accent,
                      }}
                    />
                  </View>
                  <View style={{ height: spacing['1'] }} />
                  <Text variant="caption" tone="muted">
                    {t('home.budgetPulse')}: {formatINR(budgetsQ.data.spentTotal)} of {formatINR(budgetsQ.data.budgetTotal)}
                  </Text>
                </>
              ) : null}
            </>
          )}
        </GlassCard>

        <View style={{ gap: spacing['2'] }}>
          <Text variant="h3">{t('home.todayTitle')}</Text>
          {todayQ.loading ? (
            <Skeleton height={60} />
          ) : todayTxns.length === 0 ? (
            <Card>
              <Text variant="small" tone="muted">
                {t('home.emptyToday')}
              </Text>
            </Card>
          ) : (
            <View>
              {todayTxns.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onPress={(id) => router.push(`/transaction/${id}` as never)} />
              ))}
            </View>
          )}
        </View>

        <View style={{ gap: spacing['2'] }}>
          <Text variant="h3">{t('home.recentTitle')}</Text>
          {recentQ.loading ? (
            <Skeleton height={180} />
          ) : recentTxns.length === 0 ? (
            <EmptyState
              icon="inbox"
              title={t('emptyStates.transactionsTitle')}
              body={t('emptyStates.transactionsBody')}
            />
          ) : (
            <View>
              {recentTxns.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} onPress={(id) => router.push(`/transaction/${id}` as never)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <FAB
        accessibilityLabel="Add transaction. Tap for manual, long-press for voice."
        onPress={() => router.push('/transaction/new' as never)}
        onLongPress={() => router.push('/transaction/voice' as never)}
      />
    </AppShell>
  );
}
