/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* --------------  Design System Colors -------------- */
      colors: {
        // Electric Blue (10% of palette)
        electric: {
          DEFAULT: '#3B82F6',
          500: '#3B82F6',
          600: '#2563EB',
        },
        // Charcoal/Slate (30% of palette)
        charcoal: {
          DEFAULT: '#1F2937',
          700: '#1F2937', // Deep Charcoal - Headings
          600: '#374151', // Medium Gray - Body Text
          500: '#4B5563',
          400: '#6B7280', // Light Gray - Subtext/Captions
        },
        // White variants (60% of palette)
        white: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFBFC',
          muted: '#F5F7FA',
        },
        // Legacy support - keeping for backward compatibility during migration
        primary: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        brand: {
          warm: '#FAFBFC',
          ink: '#1F2937',
          electric: '#3B82F6',
          muted: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },

      /* --------------  NEW : blob animations -------------- */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',

        /* the four classes used in AuthLayout */
        'gradient-flow': 'gradientFlow 30s ease infinite',
        'voice-pulse': 'voicePulse 22s ease-in-out infinite',
        'drift-slow': 'driftSlow 35s ease-in-out infinite',
        'drift-fast': 'driftFast 26s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },

        /* blob keyframes */
        gradientFlow: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        voicePulse: {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08) translate(30px, 20px)', opacity: '1' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-40px, 60px)' },
        },
        driftFast: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(50px, -40px)' },
        },
      },
    },
  },
  plugins: [],
};
