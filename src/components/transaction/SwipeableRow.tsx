import React from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Icon, Text } from '@/components/primitives';

export type SwipeableRowProps = {
  onDelete: () => void;
  children: React.ReactNode;
};

export function SwipeableRow({ onDelete, children }: SwipeableRowProps) {
  const t = useTheme();
  return (
    <Swipeable
      friction={2}
      rightThreshold={64}
      onSwipeableOpen={(direction) => {
        if (direction === 'right') onDelete();
      }}
      renderRightActions={() => (
        <View
          accessibilityRole="button"
          accessibilityLabel="Delete"
          style={{
            backgroundColor: t.expense,
            borderRadius: radius.lg,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: spacing['6'],
            marginVertical: spacing['1'],
          }}
        >
          <Icon name="trash-2" size="md" color={t.textOnAccent} />
          <Text variant="caption" style={{ color: t.textOnAccent }}>
            Delete
          </Text>
        </View>
      )}
    >
      {children}
    </Swipeable>
  );
}
