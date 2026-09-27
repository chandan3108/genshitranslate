/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        japan: {
          crimson: '#BC002D',
          indigo: '#1C2938',
          slate: '#2C3E50',
          paper: '#FDFBF7',
          cherry: '#FFB7C5',
          gold: '#C5A059',
          card: '#1E2530',
          border: '#333D4F'
        }
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        japanese: ['"Hiragino Sans"', '"Meiryo"', '"Yu Gothic"', '"Noto Sans JP"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
