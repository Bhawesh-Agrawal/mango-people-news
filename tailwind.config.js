/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Barlow Condensed — display headlines ONLY
        display: ['Barlow Condensed', 'sans-serif'],
        // DM Sans — all UI, body, labels, buttons
        body:    ['DM Sans', 'sans-serif'],
        // Lora — article subtitles, pull quotes, editorial accents
        serif:   ['Lora', 'serif'],
      },

      fontSize: {
        // Display scale — Barlow Condensed only
        // These sizes only make sense in font-display
        'display-2xl': ['3.5rem',  { lineHeight: '1.0',  letterSpacing: '-0.015em', fontWeight: '700' }],
        'display-xl':  ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.01em',  fontWeight: '700' }],
        'display-lg':  ['2.25rem', { lineHeight: '1.1',  letterSpacing: '-0.005em', fontWeight: '700' }],
        'display-md':  ['1.75rem', { lineHeight: '1.15', letterSpacing: '0',        fontWeight: '700' }],
        'display-sm':  ['1.375rem',{ lineHeight: '1.2',  letterSpacing: '0',        fontWeight: '600' }],

        // UI text scale — DM Sans
        'ui-xs':  ['11px', { lineHeight: '1.4', fontWeight: '400' }],
        'ui-sm':  ['13px', { lineHeight: '1.5', fontWeight: '400' }],
        'ui-base':['15px', { lineHeight: '1.6', fontWeight: '400' }],
        'ui-lg':  ['17px', { lineHeight: '1.6', fontWeight: '400' }],
      },

      colors: {
        // Category colours — matches backend seed exactly
        cat: {
          markets:  '#DC2626',
          business: '#EA580C',
          economy:  '#D97706',
          finance:  '#16A34A',
          tech:     '#4F46E5',
          investing:'#7C3AED',
        },
      },

      spacing: {
        // Consistent section gaps
        'section':    '64px',
        'section-sm': '40px',
      },

      borderRadius: {
        'card': '8px',
        'pill': '999px',
      },

      boxShadow: {
        'card':      '0 1px 4px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'elevated':  '0 8px 32px rgba(0,0,0,0.10)',
        'navbar':    '0 1px 0 rgba(0,0,0,0.08)',
      },

      animation: {
        'fade-up':  'fadeUp 0.4s ease forwards',
        'fade-in':  'fadeIn 0.3s ease forwards',
        'ticker':   'tickerScroll 40s linear infinite',
      },

      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        tickerScroll: {
          '0%':   { transform: 'translateX(0)'    },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}