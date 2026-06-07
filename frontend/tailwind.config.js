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
        // Primary: Forest Green — brand identity, nav, hero sections, avatars
        primary: {
          50:  '#f0fdf6',
          100: '#d1fae5',
          200: '#a3e9c8',
          300: '#6bcba4',
          400: '#3aad81',
          500: '#2d7a57',
          600: '#1B4332',
          700: '#163829',
          800: '#112d21',
          900: '#0d221a',
        },
        // Accent: Orange — primary CTA buttons ("Split Bill", "Add Expense", "Settle Up")
        accent: {
          50:  '#fff7f3',
          100: '#ffede4',
          200: '#ffc9ae',
          300: '#ffa07a',
          400: '#ff7a4d',
          500: '#FF6B35',
          600: '#e55a25',
          700: '#cc4d1f',
          800: '#a83d18',
          900: '#8a3012',
        },
        ink: '#111111',
        positive: '#22C55E',
        negative: '#EF4444',
        warning:  '#F59E0B',
        info:     '#2D7A57',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        soft:   '0 4px 24px rgba(0, 0, 0, 0.06)',
        card:   '0 2px 12px rgba(0, 0, 0, 0.08)',
        button: '0 8px 20px rgba(255, 107, 53, 0.35)',
        green:  '0 8px 20px rgba(27, 67, 50, 0.25)',
      },
      fontFamily: {
        sans:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'ui-serif', 'Georgia', 'serif'],
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
