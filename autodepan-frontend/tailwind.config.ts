import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f97316',
          dark:    '#ea580c',
          light:   '#fb923c',
        },
        surface: {
          DEFAULT: '#1e293b',
          raised:  '#273549',
          overlay: '#2d3f55',
        },
        brand: {
          bg:      '#0f172a',
          border:  '#334155',
          muted:   '#94a3b8',
          text:    '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'ping-slow':  'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'slide-up':   'slideUp 0.3s ease-out',
        'fade-in':    'fadeIn 0.2s ease-out',
        'truck-move': 'truckMove 1.5s ease-in-out infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to:   { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        truckMove: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%':      { transform: 'translateX(4px)' },
        },
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(249, 115, 22, 0.4)',
        'glow-green':  '0 0 20px rgba(34, 197, 94, 0.4)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} satisfies Config;
