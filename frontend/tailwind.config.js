// ponytail: requiring the .ts token file needs Node >= 22.18. After editing tokens run `npx expo start -c`.
const { wuzyColors } = require('./constants/wuzy-theme.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        wuzy: wuzyColors,
      },
    },
  },
  plugins: [],
};
