/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class', // Enable dark mode using class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8fbfb',
          100: '#e8f4f4',
          200: '#d8edee',
          300: '#c8e7e8',
          400: '#a8dae0',
          500: '#3d5a5a',
          600: '#3a5555',
          700: '#375050',
          800: '#344b4b',
          900: '#314646',
        },
        secondary: {
          50: '#f8f4f0',
          100: '#f0e8e0',
          200: '#e8dcc0',
          300: '#e0d0a0',
          400: '#d8c480',
          500: '#c5a98e',
          600: '#b89c81',
          700: '#aa8f74',
          800: '#9c8267',
          900: '#8e755a',
        }
      }
    },
  },
  plugins: [],
}