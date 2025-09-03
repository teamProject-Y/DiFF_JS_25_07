/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss");
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // ← app/ 포함
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
      require("daisyui")
]};
