import React from 'react';
import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  GradientBackground,
  Card,
  Text,
  Switch,
  Divider,
} from '@/components/primitives';
import { spacing } from '@/brand/spacing';
import { t } from '@/copy';
import { useThemeContext } from '@/theme';

export default function SettingsScreen() {
  const { mode, setMode, glassEnabled, setGlassEnabled } = useThemeContext();
  return (
    <GradientBackground>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: spacing['4'], gap: spacing['4'] }}>
          <Text variant="h1">{t('settings.title')}</Text>

          <Card>
            <Text variant="h3">{t('settings.appearance')}</Text>
            <View style={{ height: spacing['4'] }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text variant="bodyMed">{t('settings.theme')}</Text>
                <Text variant="caption" tone="muted">
                  {mode === 'system' ? t('settings.themeSystem') : mode === 'dark' ? t('settings.themeDark') : t('settings.themeLight')}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing['2'] }}>
                <ThemeButton current={mode === 'light'} onPress={() => setMode('light')} label={t('settings.themeLight')} />
                <ThemeButton current={mode === 'dark'} onPress={() => setMode('dark')} label={t('settings.themeDark')} />
                <ThemeButton current={mode === 'system'} onPress={() => setMode('system')} label={t('settings.themeSystem')} />
              </View>
            </View>
            <Divider style={{ marginVertical: spacing['4'] }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, paddingRight: spacing['4'] }}>
                <Text variant="bodyMed">{t('settings.glassEnabled')}</Text>
                <Text variant="caption" tone="muted">{t('settings.glassEnabledBody')}</Text>
              </View>
              <Switch value={glassEnabled} onValueChange={setGlassEnabled} />
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
}

import { Pressable } from 'react-native';
import { radius } from '@/brand/radius';
import { useTheme } from '@/theme';

function ThemeButton({
  current,
  onPress,
  label,
}: {
  current: boolean;
  onPress: () => void;
  label: string;
}) {
  const tt = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        paddingHorizontal: spacing['3'],
        paddingVertical: spacing['2'],
        borderRadius: radius.sm,
        borderColor: current ? tt.accent : tt.border,
        borderWidth: 1,
        backgroundColor: current ? tt.accentSoft : 'transparent',
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <Text variant="caption" style={{ color: current ? tt.accent : tt.textMuted }}>
        {label}
      </Text>
    </Pressable>
  );
}
