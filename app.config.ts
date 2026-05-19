import { config as loadEnv } from 'dotenv';
import type { ExpoConfig, ConfigContext } from 'expo/config';

loadEnv({ path: '.env.local' });
loadEnv();

const easProjectId = 'd343a0a0-4f81-470d-8dfc-616fc9ff1d04';

const requireEnv = (key: string): string => {
  const v = process.env[key];
  if (!v) throw new Error(`Missing env var: ${key}`);
  return v;
};

const scheme = (k: string) => requireEnv(k);

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  owner: 'mahi0092',
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
          // Expo SDK 54's expo-root-project + KSP plugin require Kotlin 2.x.
          kotlinVersion: '2.0.21',
          // @react-native-voice/voice (deprecated) drags in the legacy
          // com.android.support libs; Jetifier converts them to AndroidX so
          // the duplicate-class check doesn't fail.
          enableJetifier: true,
        },
      },
    ],
    // The generated android/build.gradle references `$kotlinVersion`
    // without the `android.` prefix; this plugin adds the un-prefixed key
    // to gradle.properties so the interpolation resolves.
    './plugins/with-kotlin-version.js',
  ],
  experiments: { typedRoutes: true },
  extra: {
    eas: { projectId: easProjectId },
  },
});
