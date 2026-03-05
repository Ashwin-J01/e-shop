/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* Backgrounds */
        bg: "#F7FAFC",
        bgSecondary: "#F1F5F9",
        card: "#FFFFFF",
        border: "#E2E8F0",

        /* Primary */
        primary: {
          300: "#3E566E",
          400: "#2C3F52",
          500: "#1C2B3A",
          600: "#15212E",
          700: "#0F1924",
        },
        primaryHover: "#2C3F52",
        neon: "#00D1FF",

        /* Accent */
        accent: {
          400: "#FF5A84",
          500: "#FF3C6D",
          600: "#E92C5C",
        },
        accentHover: "#FF5A84",

        /* Text */
        textPrimary: "#0F172A",
        textSecondary: "#334155",
        textMuted: "#64748B",
        disabledText: "#94A3B8",

        /* Status */
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#38BDF8",

        /* Dark scale */
        dark: {
          600: "#CBD5E1",
          700: "#94A3B8",
          800: "#475569",
          900: "#0F172A",
        },
      },

      /* Gradients */
      backgroundImage: {
        "primary-gradient": "linear-gradient(135deg, #1C2B3A, #00D1FF)",
      },

      /* Container */
      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
          xl: "2.5rem",
          "2xl": "3rem",
        },
      },

      /* Animations */
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
