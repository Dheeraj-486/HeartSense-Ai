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
        brand: {
          50: '#f4f6fc',
          100: '#e8ecf9',
          200: '#d5def4',
          300: '#b3c5eb',
          400: '#8ca7df',
          500: '#6385d2',
          600: '#4b6ac5',
          700: '#3e58b3',
          800: '#344793',
          900: '#2c3c78',
        },
        accent: {
          500: '#2563eb', // Blue
          600: '#1d4ed8',
        },
        cardiac: {
          red: '#ef4444',
          amber: '#f59e0b',
          green: '#10b981',
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
