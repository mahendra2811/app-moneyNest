import React from 'react';
import { AccessibilityInfo, View, type ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/theme/useTheme';
import { useThemeContext } from '@/theme/useTheme';
import { radius as radii } from '@/brand/radius';
import { glass, type GlassIntensity } from '@/brand/glass';
import { spacing } from '@/brand/spacing';

export type GlassCardProps = ViewProps & {
  intensity?: GlassIntensity;
  radius?: keyof typeof radii;
  padded?: boolean;
  borderTone?: 'subtle' | 'strong' | 'none';
};

/**
 * Liquid Glass card. Uses @uginy/react-native-liquid-glass when supported,
 * falls back to expo-blur otherwise. Solid fallback when Reduce Transparency
 * is on, or when the user disables glass in Settings.
 */
export function GlassCard({
  intensity = 'medium',
  radius = 'lg',
  padded = true,
  borderTone = 'subtle',
  style,
  children,
  ...rest
}: GlassCardProps) {
  const t = useTheme();
  const { glassEnabled } = useThemeContext();
  const [reduceTransparency, setReduceTransparency] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceTransparencyEnabled?.()
      .then((v) => active && setReduceTransparency(Boolean(v)))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const blurIntensity = glass.blur[intensity];
  const borderColor =
    borderTone === 'none'
      ? 'transparent'
      : borderTone === 'strong'
        ? t.glassBorder
        : t.glassBorder;

  const innerStyle = {
    padding: padded ? spacing['6'] : 0,
    borderRadius: radii[radius],
    overflow: 'hidden' as const,
    borderColor,
    borderWidth: borderTone === 'none' ? 0 : 1,
  };

  const useSolid = reduceTransparency || !glassEnabled;

  if (useSolid) {
    return (
      <View
        style={[
          {
            backgroundColor: t.surface,
            ...innerStyle,
          },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    );
  }

  // Use expo-blur for cross-version reliability. Liquid Glass refinement
  // happens in Phase 5; the contract here is what screens depend on.
  return (
    <BlurView
      intensity={blurIntensity}
      tint={t.mode === 'dark' ? 'dark' : 'light'}
      style={[innerStyle, { backgroundColor: t.glassTint }, style]}
      experimentalBlurMethod="dimezisBlurView"
    >
      {children}
    </BlurView>
  );
}
