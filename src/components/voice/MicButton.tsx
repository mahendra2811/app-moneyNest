import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { Icon } from '@/components/primitives';
import { radius } from '@/brand/radius';
import { shadows } from '@/brand/shadows';
import { useReduceMotion } from '@/hooks/use-reduce-motion';

export type MicButtonProps = {
  listening: boolean;
  onPressIn: () => void;
  onPressOut: () => void;
};

export function MicButton({ listening, onPressIn, onPressOut }: MicButtonProps) {
  const t = useTheme();
  const reduce = useReduceMotion();
  const scale = useSharedValue(1);
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (listening && !reduce) {
      scale.value = withRepeat(
        withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        true,
      );
      pulse.value = withRepeat(withTiming(1, { duration: 1500 }), -1, false);
    } else {
      scale.value = withTiming(1);
      pulse.value = 0;
    }
  }, [listening, reduce, scale, pulse]);

  const aMic = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const aRing = useAnimatedStyle(() => ({
    opacity: 0.4 * (1 - pulse.value),
    transform: [{ scale: 1 + 0.4 * pulse.value }],
  }));

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 120,
            height: 120,
            borderRadius: radius.full,
            backgroundColor: t.accent,
          },
          aRing,
        ]}
        pointerEvents="none"
      />
      <Animated.View style={aMic}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Listening, release to stop' : 'Start voice input'}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={{
            width: 100,
            height: 100,
            borderRadius: radius.full,
            backgroundColor: listening ? t.expense : t.accent,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.lg,
          }}
        >
          <Icon name={listening ? 'mic-off' : 'mic'} size="lg" color={t.textOnAccent} />
        </Pressable>
      </Animated.View>
    </View>
  );
}
