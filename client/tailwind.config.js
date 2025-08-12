/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",  // ← app/ 포함
  ],
  theme: { extend: {} },
  plugins: [require("daisyui")],       // ← daisyUI 활성화
  // optional: daisyUI 테마 고정 원하면
  // daisyui: { themes: ["light"] },
};
