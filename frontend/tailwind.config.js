/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0efff',
          200: '#b9d9ff',
          300: '#7cbdff',
          400: '#369dff',
          500: '#0a7cff',
          600: '#005de8',
          700: '#0049bb',
          800: '#003d9a',
          900: '#003480',
        }
      }
    }
  },
  plugins: [],
};
