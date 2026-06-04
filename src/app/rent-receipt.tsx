import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Input, Button } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { renderRentReceiptHtml } from '@/lib/hra-receipt';
import { parseToPaise } from '@/lib/money';
import { filesystemService } from '@/platform/filesystem';
import { useUiStore } from '@/stores/ui';
import { uuidv7 } from '@/lib/id';

function toBase64(s: string): string {
  try {
    if (typeof btoa === 'function') return btoa(unescape(encodeURIComponent(s)));
  } catch { /* fallthrough */ }
  return Buffer.from(s, 'utf-8').toString('base64');
}

export default function RentReceiptScreen() {
  const showToast = useUiStore((s) => s.showToast);
  const [tenantName, setTenant] = useState('');
  const [landlord, setLandlord] = useState('');
  const [pan, setPan] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [fromDate, setFrom] = useState('');
  const [toDate, setTo] = useState('');

  const onGenerate = async () => {
    const p = parseToPaise(amount || '0');
    if (!p) {
      showToast({ tone: 'error', text: 'Invalid amount' });
      return;
    }
    const html = renderRentReceiptHtml({
      tenantName,
      landlordName: landlord,
      ...(pan ? { landlordPan: pan } : {}),
      propertyAddress: address,
      amountPaise: p,
      fromIsoDate: fromDate,
      toIsoDate: toDate,
      receiptNumber: uuidv7().slice(0, 8).toUpperCase(),
    });
    await filesystemService.saveFile({
      suggestedName: 'rent-receipt.html',
      base64: toBase64(html),
      mimeType: 'text/html',
    });
    showToast({ tone: 'success', text: 'Rent receipt saved' });
  };

  return (
    <AppShell>
      <ScreenHeader title="HRA rent receipt" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        <Card>
          <Text variant="small" tone="muted">
            Generates a printable rent receipt as HTML (your phone's share dialog can save as PDF).
          </Text>
        </Card>
        <Input label="Tenant name" value={tenantName} onChangeText={setTenant} />
        <Input label="Landlord name" value={landlord} onChangeText={setLandlord} />
        <Input label="Landlord PAN (optional)" value={pan} onChangeText={setPan} autoCapitalize="characters" />
        <Input label="Property address" value={address} onChangeText={setAddress} multiline />
        <Input label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" />
        <Input label="From (YYYY-MM-DD)" value={fromDate} onChangeText={setFrom} />
        <Input label="To (YYYY-MM-DD)" value={toDate} onChangeText={setTo} />
        <Button label="Generate" iconLeft="file-down" onPress={onGenerate} fullWidth size="lg" />
      </ScrollView>
    </AppShell>
  );
}
