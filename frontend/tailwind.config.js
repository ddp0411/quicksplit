/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdfb',
          100: '#ccfbf5',
          200: '#99f6eb',
          300: '#5eead9',
          400: '#2dd4c2',
          500: '#14b8a9',
          600: '#0F9D94',
          700: '#087F75',
          800: '#0a615a',
          900: '#0c4f49',
        },
        ink: '#111111',
        positive: '#2BB673',
        negative: '#E74C3C',
        warning: '#F4A300',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(0, 0, 0, 0.06)',
        card:   '0 2px 12px rgba(0, 0, 0, 0.08)',
        button: '0 8px 20px rgba(15, 157, 148, 0.30)',
      },
      fontFamily: {
        sans:    ['Urbanist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Urbanist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow':   'spin 3s linear infinite',
        'pulse-soft':  'pulse 2.5s cubic-bezier(0.4,0,0.6,1) infinite',
        'slide-up':    'slideUp 0.3s ease-out',
        'fade-in':     'fadeIn 0.25s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
