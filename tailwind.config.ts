import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // Les dégradés de catégorie du blog sont construits dynamiquement
  // (`bg-gradient-to-br ${cat.color}`), donc invisibles au scan de Tailwind.
  // Sans safelist ils sont purgés → fond transparent → texte blanc illisible.
  safelist: [
    'from-sky-500', 'to-cyan-600',
    'from-emerald-500', 'to-teal-600',
    'from-blue-500', 'to-indigo-600',
    'from-amber-500', 'to-orange-600',
    'from-violet-500', 'to-purple-600',
    'from-rose-500', 'to-pink-600',
    'from-green-500', 'to-lime-600',
    'from-slate-500', 'to-gray-700',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
