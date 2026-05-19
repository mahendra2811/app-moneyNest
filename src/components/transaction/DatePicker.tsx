import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { spacing } from '@/brand/spacing';
import { radius } from '@/brand/radius';
import { Text, Icon, Sheet } from '@/components/primitives';
import { addDays, formatRelativeDay, now } from '@/lib/date';

export type DatePickerProps = {
  valueIso: string;
  onChange: (iso: string) => void;
};

const PRESETS: { offset: number; label: string }[] = [
  { offset: 0, label: 'Today' },
  { offset: -1, label: 'Yesterday' },
  { offset: -2, label: '2 days ago' },
  { offset: -3, label: '3 days ago' },
  { offset: -7, label: '1 week ago' },
];

export function DatePicker({ valueIso, onChange }: DatePickerProps) {
  const t = useTheme();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel="Change date"
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['3'],
          backgroundColor: t.surfaceMuted,
          borderRadius: radius.md,
          padding: spacing['4'],
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Icon name="calendar" size="sm" tone="muted" />
        <Text variant="body">{formatRelativeDay(valueIso)}</Text>
      </Pressable>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <Text variant="h3">Pick date</Text>
        <View style={{ height: spacing['3'] }} />
        {PRESETS.map((p) => (
          <Pressable
            key={p.label}
            onPress={() => {
              onChange(addDays(now(), p.offset));
              setOpen(false);
            }}
            style={({ pressed }) => ({
              paddingVertical: spacing['3'],
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text variant="body">{p.label}</Text>
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}
