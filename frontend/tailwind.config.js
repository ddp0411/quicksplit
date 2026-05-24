/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f2ff',
          100: '#ede7ff',
          200: '#d8cbff',
          300: '#b89eff',
          400: '#9367ff',
          500: '#7243f2',
          600: '#5b34cd',
          700: '#482aa4',
          800: '#38237e',
          900: '#281a59',
        },
        ink: '#101225',
      },
      boxShadow: {
        soft: '0 14px 40px rgba(36, 31, 78, 0.08)',
        button: '0 10px 22px rgba(91, 52, 205, 0.26)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
