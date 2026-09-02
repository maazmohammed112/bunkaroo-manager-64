import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ["'Plus Jakarta Sans'", "'Manrope'", "sans-serif"],
				display: ["'Outfit'", "'Plus Jakarta Sans'", "sans-serif"],
				handwriting: ["'Caveat'", "cursive"],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				brand: {
					DEFAULT: '#7467E8',
					hover: '#6658DF',
					light: '#E8E4FF',
					dark: '#8276F5',
				},
				pastel: {
					lavender: '#E8E4FF',
					violet: '#DCD8FF',
					pink: '#F7DDE9',
					mint: '#DDEDEA',
					blue: '#DEE7F6',
				},
			},
			boxShadow: {
				'soft': '0 2px 14px rgba(0, 0, 0, 0.04)',
				'card': '0 4px 24px rgba(0, 0, 0, 0.04)',
				'card-hover': '0 8px 30px rgba(116, 103, 232, 0.08)',
				'floating': '0 16px 40px rgba(0, 0, 0, 0.22)',
				'liquid': '0 20px 50px rgba(116, 103, 232, 0.14), inset 0 1.5px 1px rgba(255, 255, 255, 0.95)',
				'liquid-dark': '0 24px 60px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.18)',
			},
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'Manrope', 'sans-serif'],
				display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
				handwriting: ['Caveat', 'cursive'],
			},
			borderRadius: {
				'4xl': '2rem',
				'3xl': '1.5rem',
				'2.5xl': '1.25rem',
				'2xl': '1rem',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
