const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Android-only project — skip web bundling so we don't hit
// "Cannot resolve react-native-web/dist/index" warnings while running
// pnpm start / expo run:android.
config.resolver.platforms = ['android', 'ios', 'native'];

module.exports = withNativeWind(config, { input: './global.css' });
