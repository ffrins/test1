/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        rebar: '#b22222',
        concrete: '#cfcfc8',
      },
    },
  },
  plugins: [],
};
