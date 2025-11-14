/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'gauvendi-blue': '#1e40af',
        'gauvendi-light': '#dbeafe',
        // Bold accent colors for minimalist design
        'accent-electric': '#6366f1', // Electric indigo
        'accent-bold': '#ef4444', // Bold red
        'accent-vibrant': '#8b5cf6', // Vibrant purple
        'accent-energy': '#f59e0b', // Energy amber
        // Neutral palette with high contrast
        'neutral-50': '#fafafa',
        'neutral-900': '#0a0a0a',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Bold, oversized typography scale
        'display-xl': ['5.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-lg': ['4.5rem', { lineHeight: '1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-md': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-sm': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
      },
      spacing: {
        // Extended spacing for generous white space
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
