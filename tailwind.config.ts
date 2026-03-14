import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terra: {
          DEFAULT: "#C8522A",
          50:  "#FFF0EB",
          100: "#FFD9CC",
          200: "#FFB399",
          300: "#FF8C66",
          400: "#E8896A",
          500: "#C8522A",
          600: "#A8431F",
          700: "#9E3E1C",
          800: "#7A2E12",
          900: "#561F0A",
        },
        green: {
          DEFAULT: "#2D5A3D",
          50:  "#EAF2EC",
          100: "#C8E6D2",
          200: "#A0CFB4",
          300: "#78B896",
          400: "#4A8C62",
          500: "#2D5A3D",
          600: "#244A31",
          700: "#1B3A26",
          800: "#122A1B",
          900: "#091A10",
        },
        cream: "#FAF6F0",
        sand: "#F0E8DC",
        ink: {
          DEFAULT: "#1C1814",
          muted: "#5C5248",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "slide-in": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        "fade-in": { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "slide-up": { from: { opacity: "0", transform: "translateY(16px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        "pop-in": { "0%": { opacity: "0", transform: "scale(0.92)" }, "60%": { transform: "scale(1.02)" }, "100%": { opacity: "1", transform: "scale(1)" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "fade-in": "fade-in 0.4s ease-out",
        "slide-up": "slide-up 0.35s cubic-bezier(0.16,1,0.3,1)",
        "pop-in": "pop-in 0.3s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
