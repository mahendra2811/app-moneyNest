import React from 'react';
import { Switch as RNSwitch, type SwitchProps as RNSwitchProps } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export type SwitchProps = RNSwitchProps;

export function Switch(props: SwitchProps) {
  const t = useTheme();
  return (
    <RNSwitch
      {...props}
      trackColor={{ false: t.border, true: t.accent }}
      thumbColor={props.value ? t.surface : t.surface}
      ios_backgroundColor={t.border}
    />
  );
}
