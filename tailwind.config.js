/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3f0',
          100: '#fde4d9',
          200: '#fbc9b3',
          300: '#f8a382',
          400: '#f5734f',
          500: '#e3672a', // rgb(227, 103, 42)
          600: '#c4551f',
          700: '#a3441a',
          800: '#85381a',
          900: '#6d3019',
        },
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
