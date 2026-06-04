import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { radius } from '@/brand/radius';
import { spacing } from '@/brand/spacing';

export type CardProps = ViewProps & {
  padded?: boolean;
  bordered?: boolean;
};

export function Card({ padded = true, bordered = true, style, children, ...rest }: CardProps) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.lg,
          padding: padded ? spacing['5'] : 0,
          borderColor: t.border,
          borderWidth: bordered ? 1 : 0,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
