/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Inter', 'sans-serif'],
			display: ['Inter', 'system-ui', 'sans-serif'],
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			spendscope: {
  				400: '#F7A35C',
  				500: '#F38020',
  				600: '#E55A1B'
  			},
  			border: 'hsl(var(--border))',
  			ring: 'hsl(var(--ring))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		boxShadow: {
  			soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  			glow: '0 0 25px -5px rgba(243, 128, 32, 0.4)',
  			glass: '0 8px 32px 0 rgba(0, 0, 0, 0.05)'
  		},
  		keyframes: {
  			'float-gentle': {
  				'0%, 100%': { transform: 'translateY(0px)' },
  				'50%': { transform: 'translateY(-6px)' }
  			},
  			'shake-subtle': {
  				'0%, 100%': { transform: 'rotate(0deg)' },
  				'25%': { transform: 'rotate(1deg)' },
  				'75%': { transform: 'rotate(-1deg)' }
  			}
  		},
  		animation: {
  			'float-gentle': 'float-gentle 4s ease-in-out infinite',
  			'shake-subtle': 'shake-subtle 0.3s ease-in-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")]
}