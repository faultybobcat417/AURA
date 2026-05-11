/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aura: {
          base: '#0B0E14',
          surface: '#1A1D29',
          surfaceHighlight: '#23273A',
          border: 'rgba(255,255,255,0.06)',
          textPrimary: '#F0F2F5',
          textSecondary: '#8B93A7',
          textMuted: '#5A6275',
          green: '#00C853',
          greenGlow: 'rgba(0,200,83,0.15)',
          red: '#FF3D00',
          redGlow: 'rgba(255,61,0,0.15)',
          amber: '#FFB300',
          amberGlow: 'rgba(255,179,0,0.15)',
          blue: '#2979FF',
          blueGlow: 'rgba(41,121,255,0.15)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      borderRadius: {
        'xs': '2px',
      },
      animation: {
        'pulse-dot': 'pulse-dot 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ticker-scroll': 'ticker-scroll 30s linear infinite',
      },
      keyframes: {
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'ticker-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
