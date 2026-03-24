/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1D9E75', dark: '#0F6E56', light: '#E1F5EE' },
        secondary: { DEFAULT: '#185FA5', dark: '#0C447C', light: '#E6F1FB' },
      },
      fontFamily: { sans: ['Inter', 'sans-serif'] },
    },
  },
  plugins: [],
};
