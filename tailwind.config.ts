import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4169E1", // Royal Blue
          hover: "#3558c5",
          light: "#E6ECFF",
        },
        success: {
          DEFAULT: "#059669", // Emerald (for winner/status)
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

export default config