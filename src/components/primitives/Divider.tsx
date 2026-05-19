import React from 'react';
import { View, type ViewProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export function Divider({ style, ...rest }: ViewProps) {
  const t = useTheme();
  return <View style={[{ height: 1, backgroundColor: t.border }, style]} {...rest} />;
}
