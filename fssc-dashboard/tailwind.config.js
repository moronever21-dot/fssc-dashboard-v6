/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#080e1a',
        'bg-card': 'rgba(13,22,38,0.9)',
        'bg-card-ok': 'rgba(5,15,10,0.85)',
        'bg-card-warn': 'rgba(20,15,5,0.85)',
        'bg-card-alert': 'rgba(20,4,4,0.9)',
        cyan: {
          DEFAULT: '#06b6d4',
          50: '#ecfeff',
          100: '#cffafe',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', 'sans-serif'],
        mono: ['Consolas', 'Courier New', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'pulse-red': 'pulseRed 1.4s infinite',
        blink: 'blink 1s infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-in': 'slideIn 0.25s ease-out',
      },
      keyframes: {
        pulseRed: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(239,68,68,.5)' },
          '50%': { boxShadow: '0 0 0 10px rgba(239,68,68,0)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateX(-12px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
