/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#121412',
        primary: '#c4f1d5',
        'on-primary': '#0c3825',
        'primary-container': '#a8d5ba',
        'on-primary-container': '#345d48',
        secondary: '#6bdba2',
        'secondary-container': '#2ca470',
        'on-secondary-container': '#00311d',
        'deep-forest': '#0B301B',
        'surface-dark': '#16442C',
        'accent-gold': '#FFB800',
        'on-surface': '#e2e3df',
        'on-surface-variant': '#c1c8c1',
        outline: '#8b938c',
        'outline-variant': '#414943',
        // Support original colors mappings so we don't break existing classes
        accent: '#FFB800',
        'accent-fg': '#0B301B',
      },
      fontFamily: {
        sans: ['Lexend', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
        body: ['Lexend', 'sans-serif'],
      },
      spacing: {
        gutter: '16px',
        'margin-mobile': '24px',
        'margin-desktop': '64px',
        'touch-target': '64px',
        'section-gap': '48px',
        'element-gap': '16px',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1.0rem',
        xl: '1.5rem',
      },
      minHeight: {
        'touch': '64px',
      }
    },
  },
  plugins: [],
}
