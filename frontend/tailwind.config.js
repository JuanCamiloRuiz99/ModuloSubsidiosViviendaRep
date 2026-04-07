/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        alcaldia: {
          blue:      '#125CA2', // Azul principal  C:93 M:63 Y:6 K:0
          dark:      '#1D3867', // Azul oscuro complementario C:100 M:82 Y:30 K:19
          yellow:    '#FBE035', // Amarillo principal C:3 M:7 Y:89 K:0
          'yellow-light': '#F9ED68', // Amarillo suave complementario C:6 M:0 Y:70 K:0
        },
      },
    },
  },
  plugins: [],
};
