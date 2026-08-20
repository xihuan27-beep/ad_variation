import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#070C1A',
          surface: '#0F1729',
          card: '#162038',
          elevated: '#1E2D4A',
        },
        border: {
          subtle: '#1E3050',
          DEFAULT: '#273D60',
          strong: '#35527A',
        },
        accent: {
          DEFAULT: '#5B6EF5',
          hover: '#4A5DE4',
          muted: 'rgba(91,110,245,0.15)',
        },
        warn: {
          DEFAULT: '#F59E0B',
          muted: 'rgba(245,158,11,0.15)',
          text: '#FCD34D',
        },
        danger: {
          DEFAULT: '#EF4444',
          muted: 'rgba(239,68,68,0.12)',
        },
        success: {
          DEFAULT: '#10B981',
          muted: 'rgba(16,185,129,0.12)',
          text: '#6EE7B7',
        },
        text: {
          primary: '#EEF2FF',
          secondary: '#8B9EC7',
          muted: '#4C6591',
        },
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'accent-glow': 'radial-gradient(ellipse at top, rgba(91,110,245,0.15) 0%, transparent 60%)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
      },
      keyframes: {
        slideUp: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
