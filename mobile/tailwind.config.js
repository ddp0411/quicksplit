/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
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
        '2xl': 16,
        '3xl': 24,
      },
      fontFamily: {
        sans:    ['Inter_400Regular', 'System'],
        display: ['PlayfairDisplay_700Bold', 'Georgia'],
      },
    },
  },
  plugins: [],
}
