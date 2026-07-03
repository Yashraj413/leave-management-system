/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f4f6fe',
          100: '#e8ecfc',
          200: '#d5dcfa',
          300: '#b6c4f7',
          400: '#90a4f2',
          500: '#637bec',
          600: '#4e62e1',
          700: '#3f4ecc',
          800: '#3640aa',
          900: '#2f3788',
          950: '#202453',
        },
      },
    },
  },
  plugins: [],
};
