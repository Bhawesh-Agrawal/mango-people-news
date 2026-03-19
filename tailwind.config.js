/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display:  ['Barlow Condensed', 'sans-serif'],
        body:     ['DM Sans', 'sans-serif'],
        serif:    ['Playfair Display', 'serif'],
      },
      colors: {
        ink: '#0D0D0D',
        cat: {
          markets:  '#DC2626',
          business: '#EA580C',
          economy:  '#D97706',
          finance:  '#16A34A',
          tech:     '#4F46E5',
          investing:'#7C3AED',
        },
      },
      animation: {
        'fade-up':   'fadeUp 0.45s ease forwards',
        'fade-in':   'fadeIn 0.3s ease forwards',
        'pulse-dot': 'pulseDot 1.4s ease-in-out infinite',
        'ticker':    'ticker 40s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.35', transform: 'scale(0.75)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}