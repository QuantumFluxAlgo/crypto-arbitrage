/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B3948",
        surface: "#D0CDD7",
        text: "#ACB0BD",
        primary: "#416165",
        success: "#00C8A0",
        error: "#FF5C5C",
      },
    },
  },
  plugins: [],
};

