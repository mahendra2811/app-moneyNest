export const features = {
  premium: false,
  cloudSync: false,
  smsParse: false,
  receiptOcr: false,
  multiCurrency: false,
} as const;

export type FeatureKey = keyof typeof features;
