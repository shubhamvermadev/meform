/** @type {import('tailwindcss').Config} */
const { PALETTE } = require("@meform/config");

module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: PALETTE.dark,
        accent: PALETTE.accent,
        accentSoft: PALETTE.accentSoft,
        backgroundSoft: PALETTE.backgroundSoft,
        info: PALETTE.info,
        gray: PALETTE.gray,
        lightGray: PALETTE.lightGray,
        hoverGray: PALETTE.hoverGray,
        white: PALETTE.white,
      },
      fontFamily: {
        sans: ['Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

