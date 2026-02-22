import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Professional Gold & Burgundy Branding
        gold: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#D4AF37',
          600: '#B8860B',
          700: '#996515',
          800: '#7A4F00',
          900: '#5C3D00',
        },
        burgundy: {
          50: '#FFF0F3',
          100: '#FFE4E9',
          200: '#FECDD6',
          300: '#FDA4B5',
          400: '#FB7185',
          500: '#800020',
          600: '#9B2335',
          700: '#6B0F1A',
          800: '#4A0A12',
          900: '#2D060A',
        },
        // System colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { opacity: "1", boxShadow: "0 0 20px rgba(212, 175, 55, 0.5)" },
          "50%": { opacity: ".8", boxShadow: "0 0 40px rgba(212, 175, 55, 0.8)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      backgroundImage: {
        'gradient-gold': 'linear-gradient(135deg, #D4AF37 0%, #FCD34D 50%, #B8860B 100%)',
        'gradient-burgundy': 'linear-gradient(135deg, #800020 0%, #9B2335 50%, #6B0F1A 100%)',
        'gradient-royal': 'linear-gradient(135deg, #800020 0%, #D4AF37 100%)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
