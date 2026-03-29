import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f8f7',
          100: '#e6efeb',
          200: '#c2d5cc',
          300: '#97baa8',
          400: '#62937d',
          500: '#32715d',
          600: '#0d6b5c',
          700: '#085046',
          800: '#073b33',
          900: '#05251f'
        }
      },
      boxShadow: {
        soft: '0 20px 60px rgba(5, 37, 31, 0.12)'
      }
    }
  },
  plugins: []
} satisfies Config;
