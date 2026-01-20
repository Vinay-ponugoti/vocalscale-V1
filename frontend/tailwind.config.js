/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			white: {
  				DEFAULT: '#FFFFFF',
  				soft: '#FAFBFC',
  				light: '#F5F7FA'
  			},
  			charcoal: {
  				DEFAULT: '#1F2937',
  				medium: '#374151',
  				muted: '#4B5563',
  				light: '#6B7280'
  			},
  			blue: {
  				electric: '#3B82F6',
  				dark: '#2563EB'
  			},
  			primary: {
  				'50': '#F5F7FA',
  				'100': '#FAFBFC',
  				'200': '#E5E7EB',
  				'300': '#D1D5DB',
  				'400': '#9CA3AF',
  				'500': '#6B7280',
  				'600': '#4B5563',
  				'700': '#374151',
  				'800': '#1F2937',
  				'900': '#1F2937',
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			brand: {
  				warm: '#FAFBFC',
  				ink: '#1F2937',
  				electric: '#3B82F6',
  				muted: '#6B7280'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Plus Jakarta Sans"',
  				'system-ui',
  				'sans-serif'
  			],
  			serif: [
  				'DM Serif Display',
  				'serif'
  			]
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.5s ease-out forwards',
  			'slide-up': 'slideUp 0.5s ease-out forwards',
  			'gradient-flow': 'gradientFlow 30s ease infinite',
  			'voice-pulse': 'voicePulse 22s ease-in-out infinite',
  			'drift-slow': 'driftSlow 35s ease-in-out infinite',
  			'drift-fast': 'driftFast 26s ease-in-out infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			slideUp: {
  				'0%': {
  					transform: 'translateY(20px)',
  					opacity: '0'
  				},
  				'100%': {
  					transform: 'translateY(0)',
  					opacity: '1'
  				}
  			},
  			gradientFlow: {
  				'0%, 100%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				}
  			},
  			voicePulse: {
  				'0%, 100%': {
  					transform: 'scale(1) translate(0, 0)',
  					opacity: '0.8'
  				},
  				'50%': {
  					transform: 'scale(1.08) translate(30px, 20px)',
  					opacity: '1'
  				}
  			},
  			driftSlow: {
  				'0%, 100%': {
  					transform: 'translate(0, 0)'
  				},
  				'50%': {
  					transform: 'translate(-40px, 60px)'
  				}
  			},
  			driftFast: {
  				'0%, 100%': {
  					transform: 'translate(0, 0)'
  				},
  				'50%': {
  					transform: 'translate(50px, -40px)'
  				}
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};