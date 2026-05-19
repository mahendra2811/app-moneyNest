/**
 * NEW-35 — EMI prepayment optimizer.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { listLoans, type Loan } from '@/db/queries/goals';
import { allocatePrepay, type PrepayAllocation } from '@/lib/emi-prepay';
import { parseToPaise, formatINR } from '@/lib/money';

export default function EmiPrepay() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [lumpSum, setLumpSum] = useState('100000');
  const [allocations, setAllocations] = useState<PrepayAllocation[]>([]);

  useEffect(() => { listLoans().then(setLoans); }, []);

  const onCompute = () => {
    const p = parseToPaise(lumpSum);
    if (!p) return;
    setAllocations(allocatePrepay(loans, p));
  };

  return (
    <AppShell>
      <ScreenHeader title="EMI prepayment" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">Avalanche strategy: pay down highest-APR loan first. Pure math.</Text>
        </Card>
        <Card>
          <Text variant="h3">Surplus amount</Text>
          <View style={{ height: spacing['3'] }} />
          <Input label="Lump sum (₹)" value={lumpSum} onChangeText={setLumpSum} keyboardType="decimal-pad" />
          <View style={{ height: spacing['3'] }} />
          <Button label="Compute" iconLeft="calculator" onPress={onCompute} fullWidth />
        </Card>
        {loans.length === 0 ? (
          <EmptyState icon="banknote" title="No loans" body="Add loans in Finance → Net worth → Loans." />
        ) : allocations.length === 0 ? (
          <Card>
            <Text variant="small" tone="muted">Tap Compute to see allocation.</Text>
          </Card>
        ) : (
          allocations.map((a) => (
            <Card key={a.loanId}>
              <Text variant="bodyMed">{a.loanName}</Text>
              <Text variant="caption" tone="muted">Prepay {formatINR(a.prepayPaise)}</Text>
              <Text variant="caption" tone="income">Saves {formatINR(a.interestSavedPaise)} interest · {a.monthsShortened} months shorter</Text>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
