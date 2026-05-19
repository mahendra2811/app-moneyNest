export const motion = {
  duration: {
    instant: 100,
    fast: 180,
    medium: 280,
    slow: 420,
    glacial: 600,
  },
  easing: {
    standard: [0.4, 0.0, 0.2, 1] as [number, number, number, number],
    decelerate: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
    accelerate: [0.4, 0.0, 1.0, 1.0] as [number, number, number, number],
    emphasized: [0.2, 0.0, 0.0, 1.0] as [number, number, number, number],
  },
  spring: {
    gentle: { damping: 15, stiffness: 120 },
    bouncy: { damping: 10, stiffness: 180 },
    snappy: { damping: 20, stiffness: 250 },
  },
} as const;
