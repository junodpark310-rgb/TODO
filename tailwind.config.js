/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#6366f1',
        surface: '#1e1e2e',
        base: '#181825',
        overlay: '#313244',
        text: '#cdd6f4',
        subtext: '#a6adc8',
        muted: '#585b70',
        green: '#a6e3a1',
        red: '#f38ba8',
        yellow: '#f9e2af',
        blue: '#89b4fa',
      },
    },
  },
  plugins: [],
}
