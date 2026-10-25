import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef8f8",
          100: "#d5edee",
          200: "#aedbde",
          300: "#7cc1c8",
          400: "#45a1ac",
          500: "#2a8591",
          600: "#1a5f7a",
          700: "#175064",
          800: "#164354",
          900: "#143947",
          950: "#0a2430",
        },
        teal: {
          50: "#eefaf8",
          100: "#d4f3ee",
          200: "#ace7df",
          300: "#76d4c8",
          400: "#57c5b6",
          500: "#159895",
          600: "#0f7d7b",
          700: "#106462",
          800: "#114f4e",
          900: "#124241",
          950: "#052928",
        },
        gold: {
          50: "#fbf7ea",
          100: "#f5ebc8",
          200: "#ead48f",
          300: "#ddb84f",
          400: "#d0a22b",
          500: "#c9a227",
          600: "#a87f1f",
          700: "#855e1c",
          800: "#6f4c1d",
          900: "#5f401d",
        },
        ink: "#16262b",
        surface: "#f5f9f9",
        "surface-2": "#eef5f5",
        line: "#e1ebec",
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans TC",
          "Noto Sans SC",
          "PingFang TC",
          "Microsoft JhengHei",
          "system-ui",
          "sans-serif",
        ],
        display: [
          "Inter",
          "Noto Sans TC",
          "Noto Sans SC",
          "PingFang TC",
          "Microsoft JhengHei",
          "system-ui",
          "sans-serif",
        ],
        mono: ["SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10, 36, 48, 0.04), 0 8px 24px -16px rgba(10, 36, 48, 0.18)",
        lift: "0 2px 4px rgba(10, 36, 48, 0.05), 0 18px 40px -20px rgba(10, 36, 48, 0.28)",
        sidebar: "18px 0 50px -30px rgba(5, 41, 40, 0.65)",
        ring: "0 0 0 3px rgba(21, 152, 149, 0.18)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.97)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "slide-up": "slide-up 0.45s cubic-bezier(0.22, 1, 0.36, 1) both",
        "scale-in": "scale-in 0.2s ease-out both",
        "slide-in-right": "slide-in-right 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #0a2430 0%, #164354 55%, #159895 100%)",
        "mint-glow":
          "radial-gradient(circle at 20% 20%, rgba(87, 197, 182, 0.22), transparent 55%)",
        "gold-glow":
          "radial-gradient(circle at 80% 10%, rgba(201, 162, 39, 0.18), transparent 50%)",
        "grid-faint":
          "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "36px 36px",
      },
    },
  },
  plugins: [],
};

export default config;
