import React from 'react';
import { View } from 'react-native';
import { spacing } from '@/brand/spacing';
import { Text } from './Text';
import { Icon } from './Icon';
import { useTheme } from '@/theme/useTheme';

export type EmptyStateProps = {
  icon?: string;
  title: string;
  body?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'inbox', title, body, action }: EmptyStateProps) {
  const t = useTheme();
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing['12'],
        paddingHorizontal: spacing['6'],
        gap: spacing['3'],
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: t.surfaceMuted,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size="lg" tone="muted" />
      </View>
      <Text variant="h3" style={{ textAlign: 'center' }}>
        {title}
      </Text>
      {body ? (
        <Text variant="small" tone="muted" style={{ textAlign: 'center' }}>
          {body}
        </Text>
      ) : null}
      {action ? <View style={{ marginTop: spacing['4'] }}>{action}</View> : null}
    </View>
  );
}
