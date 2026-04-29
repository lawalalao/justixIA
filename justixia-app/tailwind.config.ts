import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand — aligné JustiXia, accent juridique plus sobre.
        primary: { DEFAULT: '#0E7C66', hover: '#0A5E4D', soft: '#E5F2EE', on: '#FFFFFF' },
        secondary: { DEFAULT: '#FF2D78', hover: '#E81E68', soft: '#FFE8EF', on: '#FFFFFF' },
        ink: { DEFAULT: '#14201E', muted: '#5F6B6E', subtle: '#8A9396' },
        surface: { DEFAULT: '#FFFFFF', alt: '#F4F4EE', inverted: '#14201E', bg: '#FAFAF7' },
        line: { DEFAULT: '#E5E7EB', strong: '#C9CDD3' },
        success: { DEFAULT: '#15803D', soft: '#E6F4EA' },
        danger: { DEFAULT: '#B91C1C', soft: '#FCE8E8' },
        warning: { DEFAULT: '#B45309', soft: '#FDF3E2' },
        // Tribunal-specific accent (un peu plus profond, ton "robe")
        tribunal: { DEFAULT: '#1F2A4D', accent: '#C8A24A' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: { sm: '8px', md: '12px', lg: '16px', pill: '9999px' },
      boxShadow: {
        sm: '0 1px 2px rgba(15, 23, 25, 0.04)',
        md: '0 2px 12px rgba(15, 23, 25, 0.06)',
        lg: '0 8px 28px rgba(15, 23, 25, 0.10)',
      },
      maxWidth: { container: '1200px' },
    },
  },
  plugins: [],
};

export default config;
