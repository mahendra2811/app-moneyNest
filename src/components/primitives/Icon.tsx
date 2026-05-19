import React from 'react';
import * as Lucide from 'lucide-react-native';
import { iconSize, iconStrokeWidth, type IconSizeKey } from '@/brand/icons';
import { useTheme } from '@/theme/useTheme';

type LucideComponent = React.ComponentType<{
  size?: number;
  color?: string;
  strokeWidth?: number;
}>;

export type IconProps = {
  name: string;
  size?: IconSizeKey | number;
  color?: string;
  tone?: 'default' | 'muted' | 'accent' | 'expense' | 'income';
};

const ICONS = Lucide as unknown as Record<string, LucideComponent>;

/** Convert kebab-case lucide name to PascalCase, e.g. "heart-pulse" → "HeartPulse". */
function toPascal(name: string): string {
  if (/^[A-Z]/.test(name)) return name;
  return name
    .split('-')
    .map((p) => (p.length === 0 ? '' : p[0]!.toUpperCase() + p.slice(1)))
    .join('');
}

export function Icon({ name, size = 'md', color, tone = 'default' }: IconProps) {
  const t = useTheme();
  const numericSize = typeof size === 'number' ? size : iconSize[size];
  const tokenColor =
    tone === 'muted' ? t.textMuted :
    tone === 'accent' ? t.accent :
    tone === 'expense' ? t.expense :
    tone === 'income' ? t.income :
    t.text;
  const Cmp = ICONS[toPascal(name)] ?? ICONS.HelpCircle;
  if (!Cmp) return null;
  return <Cmp size={numericSize} color={color ?? tokenColor} strokeWidth={iconStrokeWidth} />;
}
