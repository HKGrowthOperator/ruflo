import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b1bac8',
          400: '#8694a9',
          500: '#67778f',
          600: '#525f76',
          700: '#434d60',
          800: '#3a4251',
          900: '#343a46',
          950: '#22262e',
        },
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec5ff',
          400: '#59a4ff',
          500: '#3380fc',
          600: '#1c60f1',
          700: '#154bde',
          800: '#183eb4',
          900: '#19398e',
          950: '#142456',
        },
      },
    },
  },
  plugins: [],
};

export default config;
