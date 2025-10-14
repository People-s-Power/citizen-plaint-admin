/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        sm: { max: "700px" },
        md: "700px",
        lg: "1024px",
        xl: "1280px",
      },
      colors: {
        warning: "#FFC107",
        gold: "#C98821",
        white: "#FFFFFF",
        "primary-new": '#FDC332',
      }
    },
  },
  plugins: [],
}