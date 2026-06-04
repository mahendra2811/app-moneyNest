import React, { useEffect } from 'react';
import { type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type SkeletonProps = {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 14, style }: SkeletonProps) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const v = useSharedValue(0.5);

  useEffect(() => {
    if (reduce) return;
    v.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [reduce, v]);

  const animated = useAnimatedStyle(() => ({ opacity: v.value }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: t.border,
          borderRadius: radius.sm,
        },
        animated,
        style,
      ]}
    />
  );
}
