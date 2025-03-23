/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-purple': '#9d4edd',
        'cyber-blue': '#3a86ff',
        'cyber-teal': '#00f5d4',
        'cyber-black': '#0a0a0a',
        'cyber-gray': '#2a2a2a',
        'cyber-dark': '#121212',
        'cyber-highlight': '#00f5d4'
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
        'mono': ['Roboto Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}