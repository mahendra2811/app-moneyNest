import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { GlassCard, Text, Card } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { useAccounts } from '@/hooks/use-accounts';
import { getAccountBalance } from '@/db/queries/accounts';
import { listInvestments, listLoans, type Investment, type Loan } from '@/db/queries/goals';
import { formatINR, formatINRShort } from '@/lib/money';

export default function NetWorthScreen() {
  const { data: accounts } = useAccounts();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [accountTotal, setAccountTotal] = useState(0);

  useEffect(() => {
    listInvestments().then(setInvestments);
    listLoans().then(setLoans);
  }, []);

  useEffect(() => {
    (async () => {
      if (!accounts) return;
      let sum = 0;
      for (const a of accounts) sum += await getAccountBalance(a.id);
      setAccountTotal(sum);
    })();
  }, [accounts]);

  const investmentValue = investments.reduce((s, i) => s + i.currentValuePaise, 0);
  const loanOutstanding = loans.reduce((s, l) => s + l.outstandingPaise, 0);

  return (
    <AppShell>
      <ScreenHeader title="Net worth" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="strong" radius="xl">
          <Text variant="caption" tone="muted">NET WORTH</Text>
          <Text variant="display" tabular>
            {formatINRShort(accountTotal + investmentValue - loanOutstanding)}
          </Text>
          <View style={{ height: spacing['2'] }} />
          <Text variant="caption" tone="muted">
            Accounts {formatINRShort(accountTotal)} + Investments {formatINRShort(investmentValue)} − Loans {formatINRShort(loanOutstanding)}
          </Text>
        </GlassCard>
        <Card>
          <Text variant="h3">Investments</Text>
          <View style={{ height: spacing['2'] }} />
          {investments.length === 0 ? (
            <Text variant="small" tone="muted">No investments tracked.</Text>
          ) : (
            investments.map((i) => (
              <View key={i.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{i.name}</Text>
                  <Text variant="caption" tone="muted">{i.kind}</Text>
                </View>
                <Text variant="bodyMed" tabular>{formatINR(i.currentValuePaise)}</Text>
              </View>
            ))
          )}
        </Card>
        <Card>
          <Text variant="h3">Loans</Text>
          <View style={{ height: spacing['2'] }} />
          {loans.length === 0 ? (
            <Text variant="small" tone="muted">No loans tracked.</Text>
          ) : (
            loans.map((l) => (
              <View key={l.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{l.name}</Text>
                  <Text variant="caption" tone="muted">EMI {formatINR(l.monthlyEmiPaise)} · {l.apr}%</Text>
                </View>
                <Text variant="bodyMed" tabular tone="expense">{formatINR(l.outstandingPaise)}</Text>
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </AppShell>
  );
}
