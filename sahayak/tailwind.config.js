/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        primary: 'var(--color-text)',
        accent: 'var(--color-accent)',
        'accent-fg': 'var(--color-accent-fg)',
      },
      minHeight: {
        'touch': 'var(--touch-target)',
      }
    },
  },
  plugins: [],
}
