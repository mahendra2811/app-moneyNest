import { env } from '@/config/env';

export const brand = {
  name: env.EXPO_PUBLIC_APP_NAME,
  slug: env.EXPO_PUBLIC_APP_SLUG,
  packageId: env.EXPO_PUBLIC_PACKAGE_ID,
  scheme: env.EXPO_PUBLIC_SCHEME,
  tagline: env.EXPO_PUBLIC_TAGLINE,
  supportEmail: env.EXPO_PUBLIC_SUPPORT_EMAIL,
  privacyUrl: env.EXPO_PUBLIC_PRIVACY_URL,
} as const;
