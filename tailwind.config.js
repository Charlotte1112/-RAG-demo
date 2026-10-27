/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
          400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
          800: '#1e40af', 900: '#1e3a8a',
        },
        gov: {
          50: '#f0f7ff', 100: '#e0effe', 200: '#bae0fd', 300: '#7cc6fb',
          400: '#36a9f6', 500: '#0c8ee7', 600: '#006fc5', 700: '#01589f',
          800: '#064a83', 900: '#0b3f6d',
        }
      }
    },
  },
  plugins: [],
}
