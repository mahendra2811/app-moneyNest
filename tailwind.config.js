const { palette } = require('./src/brand/colors');
const { radius } = require('./src/brand/radius');
const { spacing } = require('./src/brand/spacing');

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: palette,
      borderRadius: radius,
      spacing,
    },
  },
  plugins: [],
};
