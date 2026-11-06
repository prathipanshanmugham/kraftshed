import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Kraftshed palette — warm studio neutrals, forest-green actions, logo terracotta as highlight only
        forest: { DEFAULT: '#2F5D50', dark: '#244A40', light: '#DCEAE4', 50: '#EEF5F2' },
        clay: { DEFAULT: '#C2593A', dark: '#A8482D', light: '#F3DED5', 50: '#FBF3EF' },
        sand: { DEFAULT: '#EDE6DA', dark: '#D9CFBE', light: '#F6F1E8' },
        paper: '#FDFBF7',
        ink: { DEFAULT: '#2B2A28', soft: '#6B665E' },
        // legacy aliases used in a few places
        brand: { DEFAULT: '#2F5D50', dark: '#244A40', light: '#DCEAE4', 50: '#EEF5F2' },
        navy: { DEFAULT: '#2B2A28', light: '#3E3C38', 50: '#F3F0EA' },
        cream: '#FDFBF7',
      },
      fontFamily: { sans: ['"Nunito Sans"', 'Inter', 'system-ui', 'sans-serif'], display: ['"Fraunces"', 'Georgia', 'serif'] },
      borderRadius: { xl: '14px', '2xl': '20px' },
      boxShadow: { card: '0 1px 2px rgba(43,42,40,0.06), 0 6px 20px rgba(43,42,40,0.05)' },
    },
  },
  plugins: [],
};
export default config;
