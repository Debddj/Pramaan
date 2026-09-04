/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pramaan: {
          dark: "#091e42",
          navy: "#0c2d6b",
          blue: "#1e3a8a",
          amber: "#f59e0b",
          emerald: "#10b981",
          rose: "#e11d48",
          slate: "#0f172a"
        }
      }
    },
  },
  plugins: [],
}
