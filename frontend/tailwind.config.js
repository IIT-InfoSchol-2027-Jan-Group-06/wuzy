/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        wuzy: {
          bg: '#000811',
          yellow: '#FFE783',
          yellowSoft: '#FFF5CA',
          yellowDim: 'rgba(255, 231, 131, 0.2)',
          gold: '#D7B424',
          bronze: '#D6C169',
          olive: '#928753',
          gray: '#969696',
          white: '#FFFFFF',
        },
      },
      fontFamily: {
        display: ['BebasNeue', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        card: '31px',
      },
    },
  },
  plugins: [],
};