/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        scanlines: {
          '0%': { transform: 'translateY(0px)' },
          '100%': { transform: 'translateY(6px)' },
        },
        shine: {
          '0%': { transform: 'translateX(-140%) skewX(-16deg)' },
          '100%': { transform: 'translateX(240%) skewX(-16deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-6px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(6px)' },
        },
        caret: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
      },
      animation: {
        scanlines: 'scanlines 900ms linear infinite',
        shine: 'shine 1.6s ease-in-out infinite',
        shake: 'shake 420ms ease-in-out',
        caret: 'caret 1s steps(1, end) infinite',
      },
    },
  },
  plugins: [],
}
