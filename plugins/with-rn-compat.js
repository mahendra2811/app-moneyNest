/**
 * with-rn-compat — patches the generated android/app/build.gradle
 * to remove options that Expo SDK 54's template injects but that
 * React Native 0.76 doesn't expose yet (we're on RN 0.76, Expo's
 * template targets RN 0.81+).
 *
 * Specifically: strips the `enableBundleCompression = ...` line from
 * the `react { ... }` block.
 */
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withRnCompat(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = cfg.modResults.contents.replace(
      /^\s*enableBundleCompression\s*=.*$/gm,
      '    // enableBundleCompression removed by plugin (RN 0.76 incompat)',
    );
    return cfg;
  });
};
