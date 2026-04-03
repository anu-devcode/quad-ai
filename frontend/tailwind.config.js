/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#f8f9fa',
        surface: '#f8f9fa',
        'surface-low': '#f1f2f4',
        'surface-high': '#e7e8e9',
        'surface-highest': '#dfe1e3',
        'surface-lowest': '#ffffff',
        'on-surface': '#191c1d',
        'outline-variant': '#c7c4d8',
        primary: '#3525cd',
        'primary-container': '#4f46e5',
        'primary-fixed-dim': '#cbc5ff',
        tertiary: '#7e3000',
        'secondary-container': '#dceede',
        'on-secondary-container': '#183025',
        'error-container': '#ffd9d6',
        'on-error-container': '#5b1612',
        'warning-container': '#fce6bd',
        'on-warning-container': '#553a00',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 50px rgba(77, 68, 227, 0.05)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 400ms ease-out',
      },
    },
  },
  plugins: [],
}

