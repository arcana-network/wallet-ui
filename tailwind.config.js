/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    screens: {
      sm: { max: '235px' },
      lg: '236px',
    },
    extend: {},
  },
  plugins: [],
}
