/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand': '#bd342b', // 赤心红
        'brand-dark': '#8a2be2', // 紫色系作为点缀？或者深红
        'ink': '#1a1a1a',
      }
    },
  },
  plugins: [],
}