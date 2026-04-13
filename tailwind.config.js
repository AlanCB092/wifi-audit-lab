/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyber-blue': '#00D4FF',
        'cyber-purple': '#7B61FF',
        'cyber-red': '#FF4D4D',
        'cyber-orange': '#FFA500',
        'cyber-green': '#2ECC71',
        'cyber-dark': '#0A0F1C',
        'cyber-card': '#0F1422',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
