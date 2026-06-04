import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, GlassCard, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { mockAAProvider, type AAAccount } from '@/lib/aa';
import { formatINR } from '@/lib/money';
import { useUiStore } from '@/stores/ui';

export default function AaScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [accounts, setAccounts] = useState<AAAccount[]>([]);
  const [busy, setBusy] = useState(false);

  const onConnect = async () => {
    setBusy(true);
    try {
      const r = await mockAAProvider.requestConsent({
        purpose: 'Budgeting and cash-flow analytics',
        fiTypes: ['DEPOSIT'],
        fromIso: new Date(Date.now() - 30 * 86400000).toISOString(),
        toIso: new Date().toISOString(),
      });
      await mockAAProvider.checkConsent(r.consentHandle);
      const a = await mockAAProvider.fetchAccounts(r.consentHandle);
      setAccounts(a);
      showToast({ tone: 'success', text: `Linked ${a.length} accounts (mock)` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="Account Aggregator" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="medium">
          <Text variant="body" tone="muted">
            RBI-regulated, consent-based bank-data sharing. Replaces SMS pasting with a one-tap
            link to your bank accounts. **Mock provider** is wired in V1 — swap with Setu / OneMoney /
            Anumati after onboarding with a TSP.
          </Text>
        </GlassCard>
        <Button label={busy ? '…' : 'Link bank accounts (mock)'} iconLeft="link" onPress={onConnect} fullWidth size="lg" />
        {accounts.map((a) => (
          <Card key={`${a.fipName}-${a.maskedNumber}`}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
              <Icon name="landmark" tone="accent" />
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{a.fipName} · {a.maskedNumber}</Text>
                <Text variant="caption" tone="muted">{a.fiType}</Text>
              </View>
              <Text variant="bodyMed" tabular>{formatINR(a.balancePaise)}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </AppShell>
  );
}
