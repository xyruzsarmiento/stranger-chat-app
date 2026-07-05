import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#6C63FF",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#0F172A",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#22D3EE",
          pink: "#F472B6",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        violet: { 400: "#a78bfa", 500: "#8B5CF6", 600: "#6C63FF" },
        cyan: { 400: "#22D3EE" },
        pink: { 400: "#F472B6" },
        slate: {
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "0.3" },
          "50%": { opacity: "0.8" },
        },
        "spin-slow": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "particle-move": {
          "0%": { transform: "translateY(0) translateX(0)", opacity: "0" },
          "10%": { opacity: "1" },
          "90%": { opacity: "1" },
          "100%": { transform: "translateY(-100vh) translateX(50px)", opacity: "0" },
        },
        "typing": {
          "0%, 60%, 100%": { transform: "translateY(0)" },
          "30%": { transform: "translateY(-10px)" },
        },
        "blob": {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 2s infinite",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        "spin-slow": "spin-slow 20s linear infinite",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "particle-move": "particle-move 8s ease-in infinite",
        "typing": "typing 1.4s ease-in-out infinite",
        "blob": "blob 7s infinite",
        "blob-delayed": "blob 7s 2s infinite",
        "blob-delayed2": "blob 7s 4s infinite",
      },
      backgroundSize: {
        "200%": "200% 200%",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
