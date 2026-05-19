export const glass = {
  blur: {
    soft: 20,
    medium: 40,
    strong: 60,
    extreme: 80,
  },
  tint: {
    light: 0.55,
    dark: 0.4,
  },
  noise: {
    none: 0,
    subtle: 0.04,
    visible: 0.08,
  },
  refraction: {
    off: 0,
    soft: 0.06,
    medium: 0.12,
    strong: 0.2,
  },
  edge: {
    off: 0,
    subtle: 0.3,
    visible: 0.55,
  },
  chroma: {
    off: 0,
    hint: 0.15,
    visible: 0.3,
  },
} as const;

export type GlassIntensity = 'soft' | 'medium' | 'strong' | 'extreme';
