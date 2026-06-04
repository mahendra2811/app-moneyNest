import React, { useState } from 'react';
import { ScrollView, Linking } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { buildUpiUri } from '@/lib/upi-link';
import { useUiStore } from '@/stores/ui';

export default function UpiRequest() {
  const showToast = useUiStore((s) => s.showToast);
  const [upi, setUpi] = useState('');
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const onOpen = async () => {
    if (!upi.trim() || !name.trim()) {
      showToast({ tone: 'error', text: 'UPI ID and name required' });
      return;
    }
    const uri = buildUpiUri({
      payeeUpiId: upi.trim(),
      payeeName: name.trim(),
      ...(amount ? { amountRupees: Number(amount) } : {}),
      ...(note ? { note } : {}),
    });
    try {
      await Linking.openURL(uri);
    } catch {
      showToast({ tone: 'error', text: 'No UPI app installed?' });
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="UPI request" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <Card>
          <Text variant="small" tone="muted">
            Builds a standard UPI URI. Any installed UPI app (GPay, PhonePe, Paytm, BHIM) handles it.
          </Text>
        </Card>
        <Input label="UPI ID" value={upi} onChangeText={setUpi} placeholder="name@bank" autoCapitalize="none" autoCorrect={false} />
        <Input label="Payee name" value={name} onChangeText={setName} />
        <Input label="Amount (₹) — optional" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Input label="Note — optional" value={note} onChangeText={setNote} />
        <Button label="Open in UPI app" iconLeft="external-link" onPress={onOpen} fullWidth size="lg" />
      </ScrollView>
    </AppShell>
  );
}
