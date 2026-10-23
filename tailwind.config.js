/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        alabaster: {
          DEFAULT: "#F8FAF6",
          soft: "#F3F4F0",
          card: "#FFFFFF",
          muted: "#EAECE7",
          border: "#E2E6DF",
        },
        charcoal: {
          DEFAULT: "#1F2421",
          soft: "#2D332F",
          muted: "#5A625C",
          faint: "#7E8780",
        },
        sage: {
          50: "#F4F7F4",
          100: "#EAF0EC",
          200: "#D8E3DC",
          300: "#B8C9BF",
          400: "#8FA899",
          500: "#5B7065", // Primary soothing muted sage green
          600: "#485950",
          700: "#38453E",
          800: "#2B3530",
          900: "#1E2522",
        },
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "DM Sans", "-apple-system", "sans-serif"],
        grotesk: ["Space Grotesk", "Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
