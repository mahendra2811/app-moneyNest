import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground, EmptyState } from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';

export default function ReportsScreen() {
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, padding: spacing['4'] }}>
          <EmptyState
            icon="pie-chart"
            title={t('emptyStates.reportsTitle')}
            body={t('emptyStates.reportsBody')}
          />
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
