export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;

export const iconStrokeWidth = 1.75;

export type IconSizeKey = keyof typeof iconSize;
