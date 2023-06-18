/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "primary": {
          '50': '#e6e9ec',
          '100': '#c0c8d0',
          '200': '#97a3b1',
          '300': '#6d7e92',
          '400': '#4d637a',
          '500': '#2e4763',
          '600': '#29405b',
          '700': '#233751',
          '800': '#1d2f47',
          '900': '#122035',
          'A100': '#74a7ff',
          'A200': '#4186ff',
          'A400': '#0e66ff',
          'A700': '#0059f3',
        },
        /*"primary": {
          300: "#5a7291",
          500: "#2e4763",
          900: "#002039"
        }*/
      }
    },
  },
  plugins: [],
}

