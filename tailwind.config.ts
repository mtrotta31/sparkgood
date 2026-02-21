import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // SparkGood Brand Colors
        spark: {
          DEFAULT: "#F59E0B", // Primary amber/gold
          50: "#FFFBEB",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        accent: {
          DEFAULT: "#F97316", // Warm orange
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        charcoal: {
          DEFAULT: "#1C1412", // Deep charcoal/brown (main background)
          light: "#2A2220",
          dark: "#0F0B09", // Darkest background
        },
        warmwhite: {
          DEFAULT: "#F5F0EB", // Primary text
          muted: "#D4CBC4", // Secondary text
          dim: "#A39A93", // Tertiary/muted text
        },
        success: "#22C55E",
        warning: "#EAB308",
        error: "#EF4444",
        // CSS variable fallbacks
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Light theme colors for resource directory
        cream: {
          DEFAULT: "#FAFAF8", // Primary background
          dark: "#F5F3F0", // Slightly darker for cards/sections
          warm: "#FBF9F6", // Warmest cream
        },
        slate: {
          dark: "#1E293B", // Dark text on light backgrounds
        },
        // Category accent colors
        directory: {
          grant: "#166534", // Forest green
          coworking: "#1D4ED8", // Warm blue
          accelerator: "#C2410C", // Burnt orange
          sba: "#991B1B", // Brick red
        },
      },
      boxShadow: {
        // Warm shadows for light theme
        "warm-sm": "0 1px 2px 0 rgba(120, 90, 60, 0.05)",
        "warm": "0 4px 6px -1px rgba(120, 90, 60, 0.08), 0 2px 4px -2px rgba(120, 90, 60, 0.05)",
        "warm-md": "0 6px 12px -2px rgba(120, 90, 60, 0.10), 0 3px 6px -3px rgba(120, 90, 60, 0.06)",
        "warm-lg": "0 10px 20px -3px rgba(120, 90, 60, 0.12), 0 4px 8px -4px rgba(120, 90, 60, 0.08)",
        "warm-xl": "0 20px 40px -4px rgba(120, 90, 60, 0.15), 0 8px 16px -6px rgba(120, 90, 60, 0.10)",
      },
      fontFamily: {
        display: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out forwards",
        "slide-up": "slideUp 0.5s ease-out forwards",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
