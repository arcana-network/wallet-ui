/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{vue,js,ts,jsx,tsx,css}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontSize: {
        'display-1': ['3.5rem', '4rem'],
        'display-2': ['2.75rem', '3.25rem'],
        'display-3': ['2.25rem', '2.75rem'],
        'headline-1': ['2rem', '2.5rem'],
        'headline-2': ['1.75rem', '2.25rem'],
        'headline-3': [
          '1.5rem',
          {
            lineHeight: '2rem',
            fontWeight: 600,
          },
        ],
        'headline-4': ['1.5rem', '2rem'],
        'headline-5': [
          '1.25rem',
          {
            lineHeight: '1.5rem',
            fontWeight: 600,
          },
        ],
        'headline-6': [
          '1rem',
          {
            lineHeight: '1.5rem',
            fontWeight: 500,
          },
        ],
        'title-1': [
          '1rem',
          {
            lineHeight: '1.5rem',
            fontWeight: 600,
          },
        ],
        'title-2': [
          '0.75rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 700,
          },
        ],
        'title-3': [
          '0.75rem',
          {
            lineHeight: '1rem',
            fontWeight: 600,
          },
        ],
        'title-4': [
          '0.625rem',
          {
            lineHeight: '1rem',
            fontWeight: 600,
          },
        ],
        'label-1': [
          '0.875rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 600,
          },
        ],
        'label-2': ['0.875rem', '1.25rem'],
        'label-3': [
          '0.75rem',
          {
            lineHeight: '1rem',
            fontWeight: 500,
          },
        ],
        'label-4': ['0.75rem', '1rem'],
        'label-5': [
          '0.625rem',
          {
            fontWeight: 600,
          },
        ],
        'label-6': '0.625rem',
        'label-7': '0.5rem',
        'body-1': [
          '1.75rem',
          {
            lineHeight: '2.25rem',
            fontWeight: 600,
          },
        ],
        'body-2': [
          '1rem',
          {
            lineHeight: '1.5rem',
            fontWeight: 600,
          },
        ],
        'body-3': [
          '1rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 500,
          },
        ],
        'body-4': [
          '0.875rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 600,
          },
        ],
        'body-5': [
          '0.875rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 500,
          },
        ],
        'body-6': [
          '0.75rem',
          {
            lineHeight: '1rem',
            fontWeight: 600,
          },
        ],
        'body-7': ['0.75rem', '1rem'],
        'body-8': [
          '0.625rem',
          {
            lineHeight: '1rem',
            fontWeight: 700,
          },
        ],
        'body-9': [
          '0.625rem',
          {
            lineHeight: '1rem',
            fontWeight: 500,
          },
        ],
        'body-10': ['0.625rem', '1rem'],
        'body-11': [
          '0.5rem',
          {
            lineHeight: '1.25rem',
            fontWeight: 500,
          },
        ],
      },
      fontFamily: {
        nohemi: '"Nohemi", sans-serif',
        inter: '"Inter", sans-serif',
      },
      colors: {
        'brilliant-rose': '#ff4e9f',
        'white-mist': '#f7f7f7',
        firefly: '#1d2a31',
        'black-haze': '#13171a',
        nuetral: {
          100: '#e2e4e5',
          200: '#d4d7d8',
          300: '#8e9498',
          400: '#555f64',
          500: '#39444a',
          600: '#2d363b',
        },
        system: {
          yellow: '#f6d319',
          orange: '#fa7a49',
          blue: '#487de3',
          green: '#24ad29',
          red: '#e73232',
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
