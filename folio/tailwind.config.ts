import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './src/renderer/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        branding: ["'Sansita'", "sans-serif"],
        heading: ["'Play'", "serif"],
        body: ["'Barlow'", "sans-serif"],
        ui: ["'M PLUS Rounded 1c'", "sans-serif"],
      },
      colors: {
        base: {
          bg: "#F7FAFB",
          surface: "#FFFFFF",
          surfaceAlt: "#F1F6F8",
          border: "#D8E2E6"
        },
        primary: {
          50: "#FFF1E8",
          100: "#FFD7C2",
          200: "#FFB38F",
          300: "#FF8F5C",
          400: "#FF5B04",
          500: "#E24E00",
          600: "#C54300"
        },
        accent: {
          teal: "#075056",
          lavender: "#ECD0DE",
          plum: "#A25166",
          moss: "#606B1C",
          sand: "#D2CF7E"
        },
        dark: {
          base: "#16232B",
          muted: "#2C3E45"
        },
        neutral: {
          100: "#E4EEF0",
          200: "#DADEE0",
          300: "#D7EBF4"
        },
        success: {
          soft: "#DFF4E8",
          text: "#2D7A4E"
        },
        warning: {
          soft: "#FFF4DA",
          text: "#8A6B1F"
        },
        error: {
          soft: "#FCE8EC",
          text: "#8B3A4A"
        }
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FF8F5C 0%, #FF5B04 100%)',
        'gradient-surface': 'linear-gradient(180deg, #FFFFFF 0%, #F1F6F8 100%)',
        'gradient-soft-accent': 'linear-gradient(135deg, #ECD0DE 0%, #D7EBF4 100%)'
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem'
      }
    }
  },
  plugins: [],
} satisfies Config