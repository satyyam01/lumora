/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#a18aff', // lilac
          light: '#e0d7fa',
          dark: '#5f4bb6',
          accent: '#f7c8e0', // blush
          indigo: '#4f378b',
          lavender: '#b4aee8',
        },
        background: {
          light: '#f8f9fb',
          dark: '#181825',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', 'Quicksand', 'Nunito', 'sans-serif'],
        heading: ['DM Sans', 'Quicksand', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.5rem',
      },
      boxShadow: {
        'dreamy': '0 4px 32px 0 rgba(161,138,255,0.12)',
      },
    },
  },
  plugins: [],
}

