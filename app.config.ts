import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: requireEnv('EXPO_PUBLIC_APP_NAME'),
  slug: requireEnv('EXPO_PUBLIC_APP_SLUG'),
  scheme: requireEnv('EXPO_PUBLIC_SCHEME'),
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#FFFFFF',
  },
  assetBundlePatterns: ['**/*'],
  android: {
    package: requireEnv('EXPO_PUBLIC_PACKAGE_ID'),
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    edgeToEdgeEnabled: true,
    permissions: [
      'RECORD_AUDIO',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'POST_NOTIFICATIONS',
      'VIBRATE',
    ],
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: requireEnv('EXPO_PUBLIC_PACKAGE_ID'),
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    'expo-font',
    [
      'expo-build-properties',
      {
        android: {
          compileSdkVersion: 35,
          targetSdkVersion: 35,
          minSdkVersion: 26,
        },
      },
    ],
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
});
