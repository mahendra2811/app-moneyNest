import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { spacing } from '@/brand/spacing';
import { Text, IconButton } from '@/components/primitives';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, showBack = true, right }: ScreenHeaderProps) {
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing['4'],
        paddingVertical: spacing['3'],
        gap: spacing['2'],
      }}
    >
      {showBack ? (
        <IconButton name="arrow-left" accessibilityLabel="Back" onPress={() => router.back()} />
      ) : null}
      <View style={{ flex: 1 }}>
        <Text variant="h2">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
