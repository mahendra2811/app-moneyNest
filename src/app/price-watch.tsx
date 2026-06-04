/**
 * NEW-33 — recurring price-change feed.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { AppShell } from '@/components/layout/AppShell';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Card, Text, EmptyState, Icon } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { detectPriceChanges, type PriceChange } from '@/lib/price-watch';

export default function PriceWatch() {
  const [items, setItems] = useState<PriceChange[]>([]);
  useEffect(() => { detectPriceChanges().then(setItems); }, []);
  return (
    <AppShell>
      <ScreenHeader title="Price changes" />
      <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['3'] }}>
        {items.length === 0 ? (
          <EmptyState icon="trending-up" title="No price changes" body="Log a few months of payments to a payee, and price hikes show up here." />
        ) : (
          items.map((p) => (
            <Card key={p.payee}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}>
                <Icon name={p.changePct > 0 ? 'arrow-up' : 'arrow-down'} tone={p.changePct > 0 ? 'expense' : 'income'} />
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMed">{p.payee}</Text>
                  <Text variant="caption" tone={p.changePct > 0 ? 'expense' : 'income'}>{p.message}</Text>
                </View>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </AppShell>
  );
}
