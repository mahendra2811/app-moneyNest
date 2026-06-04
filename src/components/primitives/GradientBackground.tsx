import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/useTheme';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type GradientBackgroundProps = ViewProps & {
  children?: React.ReactNode;
};

export function GradientBackground({ children, style, ...rest }: GradientBackgroundProps) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const shift = useSharedValue(0);

  useEffect(() => {
    if (reduce) {
      shift.value = 0.5;
      return;
    }
    shift.value = withRepeat(withTiming(1, { duration: 12000 }), -1, true);
  }, [reduce, shift]);

  const aStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shift.value, [0, 1], [0.55, 0.85], Extrapolation.CLAMP),
  }));

  const [c1, c2, c3] = t.gradient;

  return (
    <View style={[{ flex: 1, backgroundColor: t.bg }, style]} {...rest}>
      <Animated.View style={[StyleSheet.absoluteFill, aStyle]} pointerEvents="none">
        <LinearGradient
          colors={[c1, c2, c3]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      {children}
    </View>
  );
}
