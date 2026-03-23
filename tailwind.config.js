/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        base: 'rgb(var(--color-base) / <alpha-value>)',
        overlay: 'rgb(var(--color-overlay) / <alpha-value>)',
        text: 'rgb(var(--color-text) / <alpha-value>)',
        subtext: 'rgb(var(--color-subtext) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        green: 'rgb(var(--color-green) / <alpha-value>)',
        red: 'rgb(var(--color-red) / <alpha-value>)',
        yellow: 'rgb(var(--color-yellow) / <alpha-value>)',
        blue: 'rgb(var(--color-blue) / <alpha-value>)',
      },
    },
  },
  plugins: [],
}
