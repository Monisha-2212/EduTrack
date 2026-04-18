/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#4F46E5',
          50: '#EEEDFD',
          100: '#D4D2FB',
          200: '#A9A5F7',
          300: '#7E78F3',
          400: '#534BEF',
          500: '#4F46E5',
          600: '#3730C1',
          700: '#2A2490',
          800: '#1C185F',
          900: '#0E0C2F',
        },
      },
    },
  },
  plugins: [],
};
