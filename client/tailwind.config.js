/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'], // Dynamic dark mode
  theme: {
    extend: {
      colors: {
        // Map dynamic HSL color variables
        primary: {
          DEFAULT: "hsl(var(--color-primary) / <alpha-value>)",
          light: "hsl(var(--color-primary-hue) 93% 60%)",
          dark: "hsl(var(--color-primary-hue) 93% 35%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--color-secondary) / <alpha-value>)",
          light: "hsl(var(--color-secondary-hue) 100% 65%)",
          dark: "hsl(var(--color-secondary-hue) 100% 40%)",
        },
        bg: {
          primary: "hsl(var(--bg-primary) / <alpha-value>)",
          secondary: "hsl(var(--bg-secondary) / <alpha-value>)",
        },
        text: {
          main: "hsl(var(--text-main) / <alpha-value>)",
          muted: "hsl(var(--text-muted) / <alpha-value>)",
        },
        border: "hsl(var(--border-color) / <alpha-value>)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
}
