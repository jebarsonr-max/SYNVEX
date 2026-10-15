/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#070707',
          secondary: '#0D0D0D',
        },
        surface: {
          card: '#111111',
          elevated: '#171717',
        },
        gold: {
          primary: '#D4AF62',
          champagne: '#F4D995',
          muted: '#8C7139',
          border: 'rgba(212, 175, 98, 0.18)',
        },
        text: {
          main: '#F5F5F5',
          secondary: '#A7A7A7',
          muted: '#727272',
        },
        risk: {
          high: '#EF4444',
          warning: '#F59E0B',
          success: '#10B981',
          inconclusive: '#8C7139',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px -5px rgba(212, 175, 98, 0.25)',
        'gold-subtle': '0 0 15px -3px rgba(212, 175, 98, 0.12)',
      }
    },
  },
  plugins: [],
}
