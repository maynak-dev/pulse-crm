/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '"Inter"', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef4ff',
          100: '#dbe6ff',
          200: '#bdd0ff',
          300: '#93b1ff',
          400: '#6688ff',
          500: '#4361ff',
          600: '#2f42f5',
          700: '#2632d8',
          800: '#222daa',
          900: '#1f2986',
        },
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)',
        card: '0 4px 24px -8px rgba(31,41,134,.10), 0 2px 6px -2px rgba(16,24,40,.04)',
        glow: '0 10px 40px -12px rgba(67,97,255,.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #4361ff 0%, #6d6bff 50%, #a06bff 100%)',
        'mesh': 'radial-gradient(at 10% 0%, rgba(99,127,255,.18) 0, transparent 45%), radial-gradient(at 90% 10%, rgba(160,107,255,.18) 0, transparent 45%), radial-gradient(at 50% 100%, rgba(67,224,255,.15) 0, transparent 45%)',
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        'pop-in': { '0%': { opacity: 0, transform: 'scale(.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in .35s ease-out both',
        'pop-in': 'pop-in .25s ease-out both',
      },
    },
  },
  plugins: [],
};
