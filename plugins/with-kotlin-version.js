/**
 * with-kotlin-version — patches android/gradle.properties with two
 * extra properties Expo's templates don't write for us:
 *
 *  - kotlinVersion (un-prefixed) — the generated build.gradle uses
 *    `$kotlinVersion` interpolation. expo-build-properties writes the
 *    prefixed `android.kotlinVersion=...` only.
 *
 *  - android.enableJetifier=true — Jetifier converts legacy
 *    com.android.support:* libs (dragged in by @react-native-voice/voice)
 *    to AndroidX so the duplicate-class check passes.
 */
const { withGradleProperties } = require('expo/config-plugins');

const KOTLIN_VERSION = '2.0.21';

function setProperty(modResults, key, value) {
  const existing = modResults.find(
    (item) => item.type === 'property' && item.key === key,
  );
  if (existing) {
    existing.value = value;
  } else {
    modResults.push({ type: 'property', key, value });
  }
}

module.exports = function withKotlinVersion(config) {
  return withGradleProperties(config, (cfg) => {
    setProperty(cfg.modResults, 'kotlinVersion', KOTLIN_VERSION);
    setProperty(cfg.modResults, 'android.enableJetifier', 'true');
    return cfg;
  });
};
