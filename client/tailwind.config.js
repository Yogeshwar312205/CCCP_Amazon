/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amazon: {
          light_blue: '#232f3e',
          blue: '#131921',
          yellow: '#febd69',
          orange: '#f08804',
          gold: '#ffa41c',
          background: '#eaeded',
        },
      },
    },
  },
  plugins: [],
}
