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
        // White Palette (60%)
        white: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFBFC',
          light: '#F5F7FA',
        },
        // Charcoal/Slate Palette (30%)
        charcoal: {
          DEFAULT: '#1F2937',  // Deep Charcoal - Headings
          medium: '#374151',    // Medium Gray - Body text
          muted: '#4B5563',     // Muted Gray
          light: '#6B7280',     // Light Gray - Subtext
        },
        // Electric Blue (10%)
        blue: {
          electric: '#3B82F6',  // Primary Electric Blue
          dark: '#2563EB',      // Darker variant for hover
        },
        // Legacy support - map to new colors
        primary: {
          50: '#F5F7FA',
          100: '#FAFBFC',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#1F2937',
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