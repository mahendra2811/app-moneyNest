module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    // Expo SDK 54 + Reanimated split worklets into their own package.
    // The worklets plugin MUST come last among plugins.
    plugins: ['react-native-worklets/plugin'],
  };
};
