/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    extend: {
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
        red: { 100: '#ff4264' },
        yellow: { 100: '#eeb113' },
        blue: { 100: '#3e9aff' },
        green: { 100: '#05c168' },
        black: {
          100: '#000000',
          200: '#1f1f1f',
          300: '#141414',
          400: '#050505',
          500: '#333333',
          600: '#252525',
        },
        white: {
          100: '#ffffff',
          200: '#f7f7f7',
          300: '#fcfcfc',
          400: '#eff1f3',
        },
        gray: {
          100: '#8d8d8d',
          200: '#363636',
          300: '#313131',
          400: '#dcdcdc',
          500: '#2c2c2c',
          600: '#3b3b3b',
          700: '#eeeeee',
          800: '#dbdbdb',
          900: '#f5f5f5',
        },
      },
      width: {
        xs: '14px',
        sm: '16px',
        md: '18px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        xxxl: '34px',
      },
      height: {
        xs: '14px',
        sm: '16px',
        md: '18px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        xxxl: '34px',
        fullxs: 'calc(100vh - 14px)',
      },
      borderWidth: {
        1: '1px',
        default: '1.5px',
      },
      borderRadius: {
        sm: '5px',
        md: '10px',
      },
      boxShadow: {
        sm: '0 0 8px 3px rgba(0, 0, 0, 0.05)',
        smLight: '0 0 8px 3px rgba(126, 126, 126, 0.25)',
      },
      boxShadowColor: {
        dark: {
          100: 'rgba(126, 126, 126, 0.25)',
        },
      },
      content: {
        blank: '""',
      },
    },
  },
}
