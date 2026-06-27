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
        // Primary: Atlantic Blue — brand identity, nav, hero sections, avatars.
        // 600 is the main brand shade (most used); 900 anchors dark heroes/footers.
        primary: {
          50:  '#E8F3FA',
          100: '#C4DFEF',
          200: '#8BBFD9',
          300: '#4D96BE',
          400: '#2170A0',
          500: '#14587F',
          600: '#0F4B70',
          700: '#0A3858',
          800: '#072741',
          900: '#04192B',
        },
        // Accent: Bright Blue — primary CTA buttons (Split Bill / Add Expense / Settle Up).
        accent: {
          50:  '#E8F1FF',
          100: '#C9DDF7',
          200: '#93BBEF',
          300: '#5D98E6',
          400: '#2A77D6',
          500: '#0466C8',
          600: '#0353A4',
          700: '#023E7D',
          800: '#002855',
          900: '#001845',
        },
        // Soft Sky Blue — highlights, active chips, AI accents.
        sky: {
          50:  '#F0FEFF',
          100: '#C4F8FF',
          200: '#8EEEF8',
          300: '#52E0F0',
          400: '#1FCCE0',
          500: '#0AAFC2',
          600: '#0789A0',
        },
        ink: '#04192B',
        positive: '#22C55E',
        negative: '#EF4444',
        warning:  '#F59E0B',
        info:     '#0466C8',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(0, 0, 0, 0.06)',
        card:   '0 2px 12px rgba(0, 0, 0, 0.08)',
        button: '0 8px 20px rgba(4, 102, 200, 0.35)',
        green:  '0 8px 20px rgba(15, 75, 112, 0.25)',
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
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
