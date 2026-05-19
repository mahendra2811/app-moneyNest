import React, { useEffect, useState } from 'react';
import { ScrollView, View, Linking } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, Button, Chip, GlassCard, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import {
  getEntitlement,
  PREMIUM_FEATURES,
  DONATION_AMOUNTS,
  type Tier,
} from '@/lib/monetization';
import { brand } from '@/brand/name';
import { buildUpiUri } from '@/lib/upi-link';

const TIERS: { id: Tier; label: string; price: string }[] = [
  { id: 'plus_monthly', label: 'Plus monthly', price: '₹99/mo' },
  { id: 'plus_yearly', label: 'Plus yearly', price: '₹799/yr' },
  { id: 'lifetime', label: 'Lifetime', price: '₹2,999' },
  { id: 'family', label: 'Family (up to 5)', price: '₹1,499/yr' },
];

export default function PremiumScreen() {
  const [tier, setTier] = useState<Tier>('free');
  useEffect(() => {
    getEntitlement().then((e) => setTier(e.tier));
  }, []);

  const onDonate = async (rupees: number) => {
    const uri = buildUpiUri({
      payeeUpiId: 'mahendra@upi',
      payeeName: brand.name,
      amountRupees: rupees,
      note: 'moneyNest tip',
    });
    try {
      await Linking.openURL(uri);
    } catch {
      /* user can copy the upi id */
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="moneyNest Plus" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
        <GlassCard intensity="strong" radius="xl">
          <Text variant="caption" tone="muted">YOUR PLAN</Text>
          <Text variant="display" style={{ textTransform: 'capitalize' }}>
            {tier === 'free' ? 'Free' : tier.replace('_', ' ')}
          </Text>
        </GlassCard>

        <Card>
          <Text variant="h3">What's in Plus</Text>
          <View style={{ height: spacing['2'] }} />
          {PREMIUM_FEATURES.map((f) => (
            <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'], paddingVertical: spacing['2'] }}>
              <Icon name="sparkles" size="sm" tone="accent" />
              <Text variant="body" style={{ flex: 1, textTransform: 'capitalize' }}>
                {f.replace(/_/g, ' ')}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text variant="h3">Choose a plan</Text>
          <View style={{ height: spacing['3'] }} />
          {TIERS.map((tp) => (
            <View key={tp.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing['2'] }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{tp.label}</Text>
                <Text variant="caption" tone="muted">{tp.price}</Text>
              </View>
              <Button label="Pay" variant="secondary" onPress={() => onDonate(Number(tp.price.replace(/[^\d]/g, '')) || 99)} />
            </View>
          ))}
          <Text variant="caption" tone="muted">
            Payment via UPI. RevenueCat IAP wiring lands when needed.
          </Text>
        </Card>

        <Card>
          <Text variant="h3">Or just tip</Text>
          <Text variant="small" tone="muted">If Plus is overkill, drop a one-time tip.</Text>
          <View style={{ height: spacing['3'] }} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
            {DONATION_AMOUNTS.map((r) => (
              <Chip key={r} label={`₹${r}`} onPress={() => onDonate(r)} />
            ))}
          </View>
        </Card>
      </ScrollView>
    </AppShell>
  );
}
