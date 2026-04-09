/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb'
        },
        darkPrimary: '#0F0F0F',
        darkSecondary: '#1A1A2E',
        darkTertiary: '#1c0f00',
        darkQuaternary: '#2a1200',
        goldPrimary: '#FFCBA4',
        goldSecondary: '#F5A97F',
        amberStart: '#F59E0B',
        amberEnd: '#F97316',
        emeraldStart: '#10B981',
        tealEnd: '#14B8A6',
        slateLight: '#F1F5F9',
        slateText: '#6B7280'
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #110f0c, #18120d, #24160f)',
        'amber-gradient': 'linear-gradient(to right, #F59E0B, #F97316)',
        'emerald-gradient': 'linear-gradient(to right, #10B981, #14B8A6)',
        'gold-gradient': 'linear-gradient(to right, #FFCBA4, #F5A97F)'
      }
    }
  },
  plugins: []
};
