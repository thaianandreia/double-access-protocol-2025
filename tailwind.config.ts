import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // ADICIONE ISTO AQUI PARA AS ANIMAÇÕES
      animation: {
        'shine': 'shine 1s linear infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        shine: {
          '0%': { left: '-100%' },
          '100%': { left: '200%' },
        },
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        },
        scan: {
          '0%': { top: '-100%' },
          '100%': { top: '100%' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
