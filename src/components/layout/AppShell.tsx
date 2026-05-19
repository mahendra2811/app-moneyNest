import React from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '@/components/primitives';

export type AppShellProps = ViewProps & {
  children: React.ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
};

export function AppShell({ children, edges = ['top'], style, ...rest }: AppShellProps) {
  return (
    <GradientBackground>
      <SafeAreaView edges={edges} style={{ flex: 1 }}>
        <View style={[{ flex: 1 }, style]} {...rest}>
          {children}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
}
