export const palette = {
  // Brand greens — money is green
  primary: '#16A34A',
  primaryDark: '#15803D',
  primaryLight: '#DCFCE7',
  primaryGlow: '#22C55E',

  // Status
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutrals — light
  ink: '#0F172A',
  inkSoft: '#475569',
  inkMute: '#94A3B8',
  surface: '#FFFFFF',
  surfaceAlt: '#F8FAFC',
  border: '#E2E8F0',
  borderStrong: '#CBD5E1',

  // Neutrals — dark
  inkDark: '#F8FAFC',
  inkSoftDark: '#CBD5E1',
  inkMuteDark: '#64748B',
  surfaceDark: '#0F172A',
  surfaceAltDark: '#1E293B',
  borderDark: '#334155',
  borderStrongDark: '#475569',

  // Gradient seeds
  gradLight1: '#DBEAFE',
  gradLight2: '#EDE9FE',
  gradLight3: '#FCE7F3',
  gradDark1: '#1E3A8A',
  gradDark2: '#4C1D95',
  gradDark3: '#831843',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type PaletteKey = keyof typeof palette;
