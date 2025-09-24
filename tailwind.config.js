/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // scan project files for Tailwind usage
  ],
  theme: {
    extend: {
      screens: {
        xs: '475px', // Extra small devices (phones, 475px and up)
      },
      colors: {
        primary: '#your-school-primary-color', // custom primary color
        secondary: '#your-school-secondary-color', // custom secondary color
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out', // smooth popup fade
        marquee: 'marquee 15s linear infinite', // left-to-right scroll
        'marquee-reverse': 'marquee-reverse 15s linear infinite', // right-to-left scroll
      },
      keyframes: {
        fadeIn: {
          '0%': {opacity: 0, transform: 'scale(0.95)'},
          '100%': {opacity: 1, transform: 'scale(1)'},
        },
        marquee: {
          '0%': {transform: 'translateX(-300px)'},
          '100%': {transform: 'translateX(100vw)'},
        },
        'marquee-reverse': {
          '0%': {transform: 'translateX(100vw)'},
          '100%': {transform: 'translateX(-300px)'},
        },
      },
    },
  },
  plugins: [],
};
