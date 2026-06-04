export const typography = {
  family: {
    sans: 'Inter',
    mono: 'JetBrainsMono',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  scale: {
    display: { size: 36, lineHeight: 44, weight: '700' },
    h1: { size: 28, lineHeight: 36, weight: '700' },
    h2: { size: 22, lineHeight: 30, weight: '600' },
    h3: { size: 18, lineHeight: 26, weight: '600' },
    body: { size: 16, lineHeight: 24, weight: '400' },
    bodyMed: { size: 16, lineHeight: 24, weight: '500' },
    small: { size: 14, lineHeight: 20, weight: '400' },
    smallMed: { size: 14, lineHeight: 20, weight: '500' },
    caption: { size: 12, lineHeight: 16, weight: '500' },
    mono: { size: 14, lineHeight: 20, weight: '500' },
  },
} as const;

export type TypographyVariant = keyof typeof typography.scale;
