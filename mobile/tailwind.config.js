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
        // Ocean Breeze (V4 — Stitch UI). Primary blue scale around #00658E.
        primary: {
          50:  '#e2f2fb',
          100: '#c7e7ff',
          200: '#7fcdff',
          300: '#52b6ef',
          400: '#1f93cf',
          500: '#0093c4',
          600: '#00658e',
          700: '#00577b',
          800: '#004c6c',
          900: '#003049',
        },
        // Indigo tertiary accent.
        accent: {
          50:  '#eef0ff',
          100: '#dfe0ff',
          200: '#bac0ff',
          300: '#9ba3ff',
          400: '#6f78e8',
          500: '#4552c3',
          600: '#3744b4',
          700: '#2b38aa',
          800: '#202a8a',
          900: '#161d66',
        },
        ink: '#1a1c1e',
        positive: '#16A34A',
        negative: '#BA1A1A',
        warning:  '#F59E0B',
        info:     '#00658E',
      },
      borderRadius: {
        '2xl': 16,
        '3xl': 24,
      },
      fontFamily: {
        sans:    ['Inter_400Regular', 'System'],
        display: ['Inter_700Bold', 'System'],
      },
    },
  },
  plugins: [],
}
