/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clinic: {
          navy: '#183B46',
          teal: '#2F6F6D',
          ivory: '#F8F6F0',
          gold: '#AA915C',
          ink: '#25363A',
          muted: '#718083',
          line: '#E4E8E4',
          success: '#3F795C',
          pending: '#A8752A',
          danger: '#A84E4E',
          neutral: '#737B7E',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 32px rgba(24, 59, 70, 0.07)',
      },
    },
  },
  plugins: [],
}
