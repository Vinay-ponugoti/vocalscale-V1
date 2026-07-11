/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      /* ========================================
         COLOR SYSTEM - Premium Palette
         60% White / 30% Charcoal / 10% Electric Blue
         ======================================== */
      colors: {
        /* Palettes below resolve through --twc-* vars (src/theme-vibe.css):
           stock Tailwind values at :root, dark "Vibe Coded SaaS" values
           inside .vs-dark (the post-login dashboard shell). */
        white: { DEFAULT: 'rgb(var(--twc-white) / <alpha-value>)', soft: '#F8FAFC', light: '#F1F5F9' },
        slate: { 50: 'rgb(var(--twc-slate-50) / <alpha-value>)', 100: 'rgb(var(--twc-slate-100) / <alpha-value>)', 200: 'rgb(var(--twc-slate-200) / <alpha-value>)', 300: 'rgb(var(--twc-slate-300) / <alpha-value>)', 400: 'rgb(var(--twc-slate-400) / <alpha-value>)', 500: 'rgb(var(--twc-slate-500) / <alpha-value>)', 600: 'rgb(var(--twc-slate-600) / <alpha-value>)', 700: 'rgb(var(--twc-slate-700) / <alpha-value>)', 800: 'rgb(var(--twc-slate-800) / <alpha-value>)', 900: 'rgb(var(--twc-slate-900) / <alpha-value>)', 950: 'rgb(var(--twc-slate-950) / <alpha-value>)' },
        gray: { 50: 'rgb(var(--twc-gray-50) / <alpha-value>)', 100: 'rgb(var(--twc-gray-100) / <alpha-value>)', 200: 'rgb(var(--twc-gray-200) / <alpha-value>)', 300: 'rgb(var(--twc-gray-300) / <alpha-value>)', 400: 'rgb(var(--twc-gray-400) / <alpha-value>)', 500: 'rgb(var(--twc-gray-500) / <alpha-value>)', 600: 'rgb(var(--twc-gray-600) / <alpha-value>)', 700: 'rgb(var(--twc-gray-700) / <alpha-value>)', 800: 'rgb(var(--twc-gray-800) / <alpha-value>)', 900: 'rgb(var(--twc-gray-900) / <alpha-value>)', 950: 'rgb(var(--twc-gray-950) / <alpha-value>)' },
        zinc: { 50: 'rgb(var(--twc-zinc-50) / <alpha-value>)', 100: 'rgb(var(--twc-zinc-100) / <alpha-value>)', 200: 'rgb(var(--twc-zinc-200) / <alpha-value>)', 300: 'rgb(var(--twc-zinc-300) / <alpha-value>)', 400: 'rgb(var(--twc-zinc-400) / <alpha-value>)', 500: 'rgb(var(--twc-zinc-500) / <alpha-value>)', 600: 'rgb(var(--twc-zinc-600) / <alpha-value>)', 700: 'rgb(var(--twc-zinc-700) / <alpha-value>)', 800: 'rgb(var(--twc-zinc-800) / <alpha-value>)', 900: 'rgb(var(--twc-zinc-900) / <alpha-value>)', 950: 'rgb(var(--twc-zinc-950) / <alpha-value>)' },
        blue: { 50: 'rgb(var(--twc-blue-50) / <alpha-value>)', 100: 'rgb(var(--twc-blue-100) / <alpha-value>)', 200: 'rgb(var(--twc-blue-200) / <alpha-value>)', 300: 'rgb(var(--twc-blue-300) / <alpha-value>)', 400: 'rgb(var(--twc-blue-400) / <alpha-value>)', 500: 'rgb(var(--twc-blue-500) / <alpha-value>)', 600: 'rgb(var(--twc-blue-600) / <alpha-value>)', 700: 'rgb(var(--twc-blue-700) / <alpha-value>)', 800: 'rgb(var(--twc-blue-800) / <alpha-value>)', 900: 'rgb(var(--twc-blue-900) / <alpha-value>)', 950: 'rgb(var(--twc-blue-950) / <alpha-value>)', electric: '#3B82F6', dark: '#2563EB', darker: '#1D4ED8', light: '#60A5FA', muted: '#DBEAFE' },
        cyan: { 50: 'rgb(var(--twc-cyan-50) / <alpha-value>)', 100: 'rgb(var(--twc-cyan-100) / <alpha-value>)', 200: 'rgb(var(--twc-cyan-200) / <alpha-value>)', 300: 'rgb(var(--twc-cyan-300) / <alpha-value>)', 400: 'rgb(var(--twc-cyan-400) / <alpha-value>)', 500: 'rgb(var(--twc-cyan-500) / <alpha-value>)', 600: 'rgb(var(--twc-cyan-600) / <alpha-value>)', 700: 'rgb(var(--twc-cyan-700) / <alpha-value>)', 800: 'rgb(var(--twc-cyan-800) / <alpha-value>)', 900: 'rgb(var(--twc-cyan-900) / <alpha-value>)', 950: 'rgb(var(--twc-cyan-950) / <alpha-value>)' },
        indigo: { 50: 'rgb(var(--twc-indigo-50) / <alpha-value>)', 100: 'rgb(var(--twc-indigo-100) / <alpha-value>)', 200: 'rgb(var(--twc-indigo-200) / <alpha-value>)', 300: 'rgb(var(--twc-indigo-300) / <alpha-value>)', 400: 'rgb(var(--twc-indigo-400) / <alpha-value>)', 500: 'rgb(var(--twc-indigo-500) / <alpha-value>)', 600: 'rgb(var(--twc-indigo-600) / <alpha-value>)', 700: 'rgb(var(--twc-indigo-700) / <alpha-value>)', 800: 'rgb(var(--twc-indigo-800) / <alpha-value>)', 900: 'rgb(var(--twc-indigo-900) / <alpha-value>)', 950: 'rgb(var(--twc-indigo-950) / <alpha-value>)' },
        violet: { 50: 'rgb(var(--twc-violet-50) / <alpha-value>)', 100: 'rgb(var(--twc-violet-100) / <alpha-value>)', 200: 'rgb(var(--twc-violet-200) / <alpha-value>)', 300: 'rgb(var(--twc-violet-300) / <alpha-value>)', 400: 'rgb(var(--twc-violet-400) / <alpha-value>)', 500: 'rgb(var(--twc-violet-500) / <alpha-value>)', 600: 'rgb(var(--twc-violet-600) / <alpha-value>)', 700: 'rgb(var(--twc-violet-700) / <alpha-value>)', 800: 'rgb(var(--twc-violet-800) / <alpha-value>)', 900: 'rgb(var(--twc-violet-900) / <alpha-value>)', 950: 'rgb(var(--twc-violet-950) / <alpha-value>)' },
        purple: { 50: 'rgb(var(--twc-purple-50) / <alpha-value>)', 100: 'rgb(var(--twc-purple-100) / <alpha-value>)', 200: 'rgb(var(--twc-purple-200) / <alpha-value>)', 300: 'rgb(var(--twc-purple-300) / <alpha-value>)', 400: 'rgb(var(--twc-purple-400) / <alpha-value>)', 500: 'rgb(var(--twc-purple-500) / <alpha-value>)', 600: 'rgb(var(--twc-purple-600) / <alpha-value>)', 700: 'rgb(var(--twc-purple-700) / <alpha-value>)', 800: 'rgb(var(--twc-purple-800) / <alpha-value>)', 900: 'rgb(var(--twc-purple-900) / <alpha-value>)', 950: 'rgb(var(--twc-purple-950) / <alpha-value>)' },
        emerald: { 50: 'rgb(var(--twc-emerald-50) / <alpha-value>)', 100: 'rgb(var(--twc-emerald-100) / <alpha-value>)', 200: 'rgb(var(--twc-emerald-200) / <alpha-value>)', 300: 'rgb(var(--twc-emerald-300) / <alpha-value>)', 400: 'rgb(var(--twc-emerald-400) / <alpha-value>)', 500: 'rgb(var(--twc-emerald-500) / <alpha-value>)', 600: 'rgb(var(--twc-emerald-600) / <alpha-value>)', 700: 'rgb(var(--twc-emerald-700) / <alpha-value>)', 800: 'rgb(var(--twc-emerald-800) / <alpha-value>)', 900: 'rgb(var(--twc-emerald-900) / <alpha-value>)', 950: 'rgb(var(--twc-emerald-950) / <alpha-value>)' },
        green: { 50: 'rgb(var(--twc-green-50) / <alpha-value>)', 100: 'rgb(var(--twc-green-100) / <alpha-value>)', 200: 'rgb(var(--twc-green-200) / <alpha-value>)', 300: 'rgb(var(--twc-green-300) / <alpha-value>)', 400: 'rgb(var(--twc-green-400) / <alpha-value>)', 500: 'rgb(var(--twc-green-500) / <alpha-value>)', 600: 'rgb(var(--twc-green-600) / <alpha-value>)', 700: 'rgb(var(--twc-green-700) / <alpha-value>)', 800: 'rgb(var(--twc-green-800) / <alpha-value>)', 900: 'rgb(var(--twc-green-900) / <alpha-value>)', 950: 'rgb(var(--twc-green-950) / <alpha-value>)' },
        red: { 50: 'rgb(var(--twc-red-50) / <alpha-value>)', 100: 'rgb(var(--twc-red-100) / <alpha-value>)', 200: 'rgb(var(--twc-red-200) / <alpha-value>)', 300: 'rgb(var(--twc-red-300) / <alpha-value>)', 400: 'rgb(var(--twc-red-400) / <alpha-value>)', 500: 'rgb(var(--twc-red-500) / <alpha-value>)', 600: 'rgb(var(--twc-red-600) / <alpha-value>)', 700: 'rgb(var(--twc-red-700) / <alpha-value>)', 800: 'rgb(var(--twc-red-800) / <alpha-value>)', 900: 'rgb(var(--twc-red-900) / <alpha-value>)', 950: 'rgb(var(--twc-red-950) / <alpha-value>)' },
        rose: { 50: 'rgb(var(--twc-rose-50) / <alpha-value>)', 100: 'rgb(var(--twc-rose-100) / <alpha-value>)', 200: 'rgb(var(--twc-rose-200) / <alpha-value>)', 300: 'rgb(var(--twc-rose-300) / <alpha-value>)', 400: 'rgb(var(--twc-rose-400) / <alpha-value>)', 500: 'rgb(var(--twc-rose-500) / <alpha-value>)', 600: 'rgb(var(--twc-rose-600) / <alpha-value>)', 700: 'rgb(var(--twc-rose-700) / <alpha-value>)', 800: 'rgb(var(--twc-rose-800) / <alpha-value>)', 900: 'rgb(var(--twc-rose-900) / <alpha-value>)', 950: 'rgb(var(--twc-rose-950) / <alpha-value>)' },
        amber: { 50: 'rgb(var(--twc-amber-50) / <alpha-value>)', 100: 'rgb(var(--twc-amber-100) / <alpha-value>)', 200: 'rgb(var(--twc-amber-200) / <alpha-value>)', 300: 'rgb(var(--twc-amber-300) / <alpha-value>)', 400: 'rgb(var(--twc-amber-400) / <alpha-value>)', 500: 'rgb(var(--twc-amber-500) / <alpha-value>)', 600: 'rgb(var(--twc-amber-600) / <alpha-value>)', 700: 'rgb(var(--twc-amber-700) / <alpha-value>)', 800: 'rgb(var(--twc-amber-800) / <alpha-value>)', 900: 'rgb(var(--twc-amber-900) / <alpha-value>)', 950: 'rgb(var(--twc-amber-950) / <alpha-value>)' },
        orange: { 50: 'rgb(var(--twc-orange-50) / <alpha-value>)', 100: 'rgb(var(--twc-orange-100) / <alpha-value>)', 200: 'rgb(var(--twc-orange-200) / <alpha-value>)', 300: 'rgb(var(--twc-orange-300) / <alpha-value>)', 400: 'rgb(var(--twc-orange-400) / <alpha-value>)', 500: 'rgb(var(--twc-orange-500) / <alpha-value>)', 600: 'rgb(var(--twc-orange-600) / <alpha-value>)', 700: 'rgb(var(--twc-orange-700) / <alpha-value>)', 800: 'rgb(var(--twc-orange-800) / <alpha-value>)', 900: 'rgb(var(--twc-orange-900) / <alpha-value>)', 950: 'rgb(var(--twc-orange-950) / <alpha-value>)' },

        /* Charcoal/Slate Palette (static, landing) */
        charcoal: {
          DEFAULT: '#1E293B',  /* Slate 800 */
          dark: '#0F172A',     /* Slate 900 */
          medium: '#334155',   /* Slate 700 */
          muted: '#475569',    /* Slate 600 */
          light: '#64748B',    /* Slate 500 */
        },

        /* Brand Shorthand */
        brand: {
          primary: '#3B82F6',
          'primary-hover': '#2563EB',
          'primary-active': '#1D4ED8',
          ink: '#1E293B',
          muted: '#64748B',
        },

        /* shadcn/ui compatible semantic colors */
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',

        /* Chart Colors */
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },

      /* ========================================
         TYPOGRAPHY
         ======================================== */
      fontFamily: {
        sans: [
          'Inter',
          'Plus Jakarta Sans',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          'DM Serif Display',
          'Georgia',
          'Cambria',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },

      /* ========================================
         BORDER RADIUS - Premium rounded
         ======================================== */
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)',
        '2xl': 'calc(var(--radius) + 8px)',
      },

      /* ========================================
         BOX SHADOWS - Premium depth
         ======================================== */
      boxShadow: {
        'premium-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'premium': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'premium-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'premium-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'premium-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        'glow-blue': '0 4px 14px 0 rgb(59 130 246 / 0.25)',
        'glow-blue-lg': '0 10px 25px -3px rgb(59 130 246 / 0.3)',
      },

      /* ========================================
         ANIMATIONS - Smooth & Premium
         ======================================== */
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.2s ease-out forwards',
        'gradient-flow': 'gradientFlow 30s ease infinite',
        'voice-pulse': 'voicePulse 22s ease-in-out infinite',
        'drift-slow': 'driftSlow 35s ease-in-out infinite',
        'drift-fast': 'driftFast 26s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
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
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        blob1: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: '0.3' },
          '50%': { transform: 'translate(50px, 30px) scale(1.1)', opacity: '0.4' },
        },
        blob2: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1.1)', opacity: '0.3' },
          '50%': { transform: 'translate(-50px, -30px) scale(1)', opacity: '0.4' },
        },
        blob3: {
          '0%, 100%': { transform: 'translate(20px, 20px)', opacity: '0.2' },
          '50%': { transform: 'translate(-20px, -20px)', opacity: '0.3' },
        },
        'sound-bar-alt': {
          '0%, 100%': { height: '6px' },
          '50%': { height: '100%' },
        },
      },

      /* ========================================
         SPACING EXTENSIONS
         ======================================== */
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },

      /* ========================================
         TRANSITIONS
         ======================================== */
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
