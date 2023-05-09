/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    fontSize: {
      xs: '10px',
      sm: '12px',
      base: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '28px',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      bold: 700,
    },
    colors: {
      red: '#ff4264',
      yellow: '#eeb113',
      blue: '#3e9aff',
      green: '#05c168',
      black: {
        100: '#000000',
      },
      white: {
        100: '#ffffff',
        200: '#f7f7f7',
      },
      gray: {
        100: '#050505',
        200: '#141414',
        300: '#1f1f1f',
        400: '#8d8d8d',
        500: '#363636',
        600: '#313131',
        700: '#050505',
        800: '#dcdcdc',
        900: '#2c2c2c',
      },
    },
    width: {
      icon: {
        xs: '14px',
        sm: '16px',
        md: '18px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        xxxl: '34px',
      },
    },
  },
}
