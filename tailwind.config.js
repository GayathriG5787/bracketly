/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A",   // Dark Royal Blue (main)
          light: "#3B5BDB",     // lighter shade
          dark: "#172554",      // deeper shade
        },
        success: {
          DEFAULT: "#059669",
          light: "#D1FAE5",
        },
        border: "#E5E7EB",
        muted: "#6B7280",
        background: "#F9FAFB",
      },
      borderRadius: {
        lg: "0.75rem",
        xl: "1rem",
      },
      boxShadow: {
        card: "0 4px 12px rgba(0,0,0,0.05)",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}