/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0E2A24',
        pine: '#14463B',
        leaf: '#1F6B58',
        mint: '#D5EBE0',
        chalk: '#F2F5F1',
        paper: '#FBFAF6',
        gold: { DEFAULT: '#E3A91B', soft: '#F6E2A6', deep: '#B8860B' },
        coral: '#CF4B3F',
        sky: '#2F6FB3',
        muted: '#6B7F78',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: { lift: '0 12px 32px -12px rgba(14,42,36,.3)' },
    },
  },
  plugins: [],
}
