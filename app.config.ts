import 'dotenv/config';
import type { ExpoConfig, ConfigContext } from 'expo/config';

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

const scheme = (k: string) => requireEnv(k);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: requireEnv('EXPO_PUBLIC_APP_NAME'),
  slug: requireEnv('EXPO_PUBLIC_APP_SLUG'),
  scheme: scheme('EXPO_PUBLIC_SCHEME'),
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
      monochromeImage: './assets/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    permissions: [
      'RECORD_AUDIO',
      'USE_BIOMETRIC',
      'USE_FINGERPRINT',
      'POST_NOTIFICATIONS',
      'VIBRATE',
      'FOREGROUND_SERVICE',
    ],
    intentFilters: [
      // A5 share-sheet target
      {
        action: 'SEND',
        category: ['DEFAULT'],
        data: [{ mimeType: 'text/plain' }],
      },
      {
        action: 'SEND',
        category: ['DEFAULT'],
        data: [{ mimeType: 'image/*' }],
      },
      // A6 Tasker / shortcuts: ACTION=com.pooniya.moneynest.ADD
      {
        action: 'com.pooniya.moneynest.ADD',
        category: ['DEFAULT'],
      },
    ],
  },
  ios: {
    supportsTablet: true,
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
