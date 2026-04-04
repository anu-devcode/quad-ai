/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        'on-background': 'var(--on-background)',
        surface: 'var(--surface-container)',
        'surface-low': 'var(--surface-container-low)',
        'surface-high': 'var(--surface-container-high)',
        'surface-highest': 'var(--surface-container-highest)',
        'surface-lowest': 'var(--surface-container-lowest)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'on-inverse-surface': 'var(--on-inverse-surface)',
        'outline-variant': 'var(--outline-variant)',
        primary: 'var(--primary)',
        'primary-dim': 'var(--primary-dim)',
        tertiary: 'var(--tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'secondary-container': 'var(--secondary-container)',
        'on-secondary-container': 'var(--on-secondary-container)',
        error: 'var(--error)',
        'error-container': 'var(--error-container)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 8px 32px rgba(19, 27, 46, 0.04)',
        'premium-hover': '0 12px 48px rgba(19, 27, 46, 0.08)',
      },
      keyframes: {
        rise: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 460ms cubic-bezier(0.2, 0.65, 0.25, 1)',
      },
    },
  },
  plugins: [],
}

